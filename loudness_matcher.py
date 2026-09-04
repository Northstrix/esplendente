"""
Bootleg Loudness Matcher
========================
Run this file directly (double-click on Windows, or `python loudness_matcher.py`).

What it does, in order:
  1. Pops up a normal Windows "Open file" dialog so YOU pick the reference
     sound. Nothing is hardcoded - the reference can live anywhere on disk,
     including inside or outside the Unprocessed folder.
  2. Reads every .wav file sitting in the "Unprocessed" folder next to this
     script (created automatically if missing) and matches each one to the
     reference using three separate algorithms:

       RMS       - matches average signal energy (a dBFS-style level).
       LUFS      - matches perceptual loudness, ITU-R BS.1770 / EBU R128
                   (the YouTube/Spotify "no volume jump" standard), via
                   pyloudnorm.
       Combined  - averages the RMS-matching gain and the LUFS-matching
                   gain.

     Clips shorter than the ~0.5s a reliable reading needs are extended
     first: the clip is repeated end-to-end (looped) purely in memory
     until it's long enough to measure, that reading is used to work out
     the gain, and then the gain is applied to the ORIGINAL, single-
     instance-length clip. Nothing looped/extended is ever written to
     disk - every exported file is exactly as long as its source file.

     A true-peak limiter (default ceiling -1 dBTP) pulls a file's gain
     back if matching loudness would otherwise clip it.

     The three output folders are named after the algorithms: Processed/
     RMS, Processed/LUFS, Processed/Combined. The reference file itself
     is NEVER written into any of these folders - only files that were
     actually sitting in Unprocessed get exported.

  3. Writes a CSV audit log (Processed/volume_adjustments_log.csv,
     appended to on every run) and a manifest.json the web review app
     reads from.

  4. Launches a local web app (and opens your browser to it) so you can
     review the results: pick a sound from the list, then either play
     [Reference -> RMS -> LUFS -> Combined] back to back, or play
     [Reference -> Original] to A/B the before/after, or just play any
     single stem. Playback goes through the Web Audio API the exact same
     way the reference Next.js app's word-audio path does (a
     BufferSourceNode connected straight to the destination, full
     volume, no gain node - that's only used there for UI blips).

Dependencies (no ffmpeg / no pydub needed - only real .wav files are
ever touched, so plain libsndfile via `soundfile` handles all reading
and writing):
    pip install numpy soundfile pyloudnorm scipy
tkinter ships with the standard python.org Windows installer, so the
file-picker dialog needs no extra install on a normal Windows setup.
"""

import os
import sys
import csv
import json
import math
import socket
import webbrowser
import http.server
import urllib.parse
from datetime import datetime

try:
    import numpy as np
    import soundfile as sf
    import pyloudnorm as pyln
    from scipy.signal import resample_poly
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    print("Install everything this script needs with:")
    print("    pip install numpy soundfile pyloudnorm scipy")
    sys.exit(1)


# ============================================================ settings ===
CEILING_DB = -1.0                    # true-peak ceiling (dBTP) - matches the
                                      # -1 dBTP most streaming platforms use
LIMITER_SAFETY_MARGIN_DB = 0.05      # extra headroom to absorb rounding on write
MIN_MEASURE_MS = 500                 # clips shorter than this get looped-in-memory
                                      # for measurement (BS.1770 needs ~400ms/gate)
DEFAULT_DELAY_MS = 500               # default gap between sounds in the web UI

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
UNPROCESSED_DIR = os.path.join(SCRIPT_DIR, "Unprocessed")
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "Processed")
RMS_DIR = os.path.join(PROCESSED_DIR, "RMS")
LUFS_DIR = os.path.join(PROCESSED_DIR, "LUFS")
COMBINED_DIR = os.path.join(PROCESSED_DIR, "Combined")
LOG_CSV = os.path.join(PROCESSED_DIR, "volume_adjustments_log.csv")
MANIFEST_JSON = os.path.join(PROCESSED_DIR, "manifest.json")


# ============================================================ audio math ===
def load_audio(path):
    """Read a wav file as normalized float64 samples in [-1, 1]."""
    data, rate = sf.read(path, dtype="float64", always_2d=False)
    return np.asarray(data, dtype=np.float64), rate


def get_subtype(path):
    """PCM_16 / PCM_24 / FLOAT / etc, so the exported file matches the source."""
    try:
        return sf.info(path).subtype
    except Exception:
        return "PCM_16"


def extend_for_measurement(data, rate, min_ms):
    """If `data` is shorter than min_ms, repeat it end-to-end (looping) until
    it's long enough for a reliable reading. Only ever used in memory for
    measurement - callers apply the resulting gain to the ORIGINAL data,
    never to this extended copy, so nothing looped is ever exported."""
    if data.size == 0 or rate <= 0:
        return data
    duration_ms = (data.shape[0] / rate) * 1000.0
    if duration_ms >= min_ms:
        return data
    reps = math.ceil(min_ms / duration_ms) + 1  # +1 so we're safely over the line
    return np.concatenate([data] * reps, axis=0)


def measure_rms_dbfs(data):
    """Plain RMS level in dB relative to full scale (pydub's dBFS concept)."""
    if data.size == 0:
        return None
    rms = math.sqrt(float(np.mean(np.square(data))))
    if rms <= 0:
        return None
    return 20.0 * math.log10(rms)


def measure_rms_dbfs_safe(data, rate, min_ms):
    """RMS is mathematically identical on a looped signal vs. one period of
    it, so extending doesn't change the number - this just keeps the RMS
    and LUFS measurement paths using the same, consistent logic."""
    work = extend_for_measurement(data, rate, min_ms)
    return measure_rms_dbfs(work)


def measure_lufs_safe(data, rate, min_ms):
    """Integrated LUFS (ITU-R BS.1770), extending short clips first so
    BS.1770's ~400ms gating block has enough material to work with.
    Returns None if it's still unmeasurable (true silence, or the signal
    is so quiet BS.1770's absolute gate throws everything out)."""
    if data.size == 0:
        return None
    work = extend_for_measurement(data, rate, min_ms)
    try:
        meter = pyln.Meter(rate)
        loudness = meter.integrated_loudness(work)
    except Exception:
        return None
    if math.isinf(loudness) or math.isnan(loudness):
        return None
    return float(loudness)


def apply_gain_db(data, gain_db):
    return data * (10.0 ** (gain_db / 20.0))


def estimate_true_peak(data, oversample=4):
    """4x-oversampled true peak so inter-sample peaks a plain sample-peak
    check would miss still get caught (the dBTP concept broadcast/
    streaming loudness standards use)."""
    if data.size == 0:
        return 0.0
    try:
        if data.ndim == 1:
            upsampled = resample_poly(data, oversample, 1)
        else:
            upsampled = np.stack(
                [resample_poly(data[:, ch], oversample, 1) for ch in range(data.shape[1])],
                axis=-1,
            )
        return float(np.max(np.abs(upsampled)))
    except Exception:
        return float(np.max(np.abs(data)))  # fall back to plain sample peak


def apply_gain_with_true_peak_limit(data, raw_gain_db, ceiling_db,
                                     safety_margin_db=LIMITER_SAFETY_MARGIN_DB):
    """Apply raw_gain_db to data; if that would push the true peak above
    ceiling_db, pull the gain back just enough to land on the ceiling
    instead of clipping. Returns (adjusted_data, final_gain_db, limiter_engaged)."""
    peak = estimate_true_peak(data)
    gain_db = raw_gain_db
    limiter_engaged = False
    if peak > 0:
        peak_db = 20.0 * math.log10(peak)
        effective_ceiling = ceiling_db - safety_margin_db
        projected_peak_db = peak_db + gain_db
        if projected_peak_db > effective_ceiling:
            gain_db -= (projected_peak_db - effective_ceiling)
            limiter_engaged = True
    return apply_gain_db(data, gain_db), gain_db, limiter_engaged


# ============================================================ reference picker ===
def select_reference_file():
    """Windows file-picker dialog for the reference sound. Falls back to a
    typed path if tkinter isn't available. Returns an absolute path, or
    None if the user cancelled."""
    try:
        from tkinter import Tk, filedialog
    except ImportError:
        print("[WARN] tkinter isn't available on this Python install.")
        typed = input("Type the full path to the reference .wav file: ").strip().strip('"')
        return os.path.abspath(typed) if typed else None

    root = Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    root.lift()
    initial_dir = UNPROCESSED_DIR if os.path.isdir(UNPROCESSED_DIR) else SCRIPT_DIR
    path = filedialog.askopenfilename(
        parent=root,
        title="Select the reference sound - every other file will be matched to its loudness",
        initialdir=initial_dir,
        filetypes=[("WAV audio", "*.wav *.wave"), ("All files", "*.*")],
    )
    root.destroy()
    return os.path.abspath(path) if path else None


# ============================================================ batch processing ===
def run_batch(ref_path):
    """Reads Unprocessed/, matches every file (except the reference itself)
    to ref_path with all 3 algorithms, writes Processed/{RMS,LUFS,Combined},
    the CSV log, and manifest.json. Returns the manifest dict (which may
    just contain an "error" key if something up front went wrong)."""

    if not os.path.isdir(UNPROCESSED_DIR):
        msg = f"'Unprocessed' folder not found next to the script:\n{UNPROCESSED_DIR}"
        print(f"[ERROR] {msg}")
        return {"error": msg}

    try:
        ref_data, ref_rate = load_audio(ref_path)
    except Exception as e:
        msg = f"Couldn't read the reference file:\n{ref_path}\n{e}"
        print(f"[ERROR] {msg}")
        return {"error": msg}

    ref_rms = measure_rms_dbfs_safe(ref_data, ref_rate, MIN_MEASURE_MS)
    if ref_rms is None:
        msg = f"Reference file is silent - can't use it as a loudness target:\n{ref_path}"
        print(f"[ERROR] {msg}")
        return {"error": msg}

    ref_lufs = measure_lufs_safe(ref_data, ref_rate, MIN_MEASURE_MS)
    if ref_lufs is None:
        ref_lufs = ref_rms  # extremely rare fallback - reference too odd to gate

    ref_basename = os.path.basename(ref_path)
    ref_desc = f"{ref_rms:.2f} dBFS / {ref_lufs:.2f} LUFS"
    print(f"=== Reference: {ref_basename}   {ref_desc} ===\n")

    for d in (RMS_DIR, LUFS_DIR, COMBINED_DIR):
        os.makedirs(d, exist_ok=True)

    run_started_at = datetime.now().isoformat(timespec="seconds")
    ref_abs_norm = os.path.normcase(os.path.abspath(ref_path))

    wav_files = sorted(f for f in os.listdir(UNPROCESSED_DIR) if f.lower().endswith((".wav", ".wave")))
    results = []
    log_entries = []
    csv_rows = []

    for filename in wav_files:
        src_path = os.path.join(UNPROCESSED_DIR, filename)
        src_abs_norm = os.path.normcase(os.path.abspath(src_path))

        # The reference is never processed or copied into the output folders,
        # even if it happens to physically live inside Unprocessed.
        if src_abs_norm == ref_abs_norm:
            print(f"[REFERENCE] {filename:33s} {ref_desc}  (excluded from RMS/LUFS/Combined output)")
            log_entries.append({"filename": filename, "status": "reference", "detail": ref_desc,
                                 "processed_at": run_started_at})
            csv_rows.append([filename, "reference", f"{ref_rms:.2f}", f"{ref_lufs:.2f}",
                              "", "", False, "", "", CEILING_DB, datetime.now().isoformat(),
                              ref_basename, f"{ref_rms:.2f}", f"{ref_lufs:.2f}"])
            continue

        try:
            data, rate = load_audio(src_path)
        except Exception as e:
            print(f"[SKIPPED - unreadable] {filename}: {e}")
            log_entries.append({"filename": filename, "status": "skipped_unreadable", "detail": str(e),
                                 "processed_at": run_started_at})
            continue

        original_rms = measure_rms_dbfs_safe(data, rate, MIN_MEASURE_MS)
        if original_rms is None:
            print(f"[SKIPPED - silent] {filename}")
            log_entries.append({"filename": filename, "status": "skipped_silent",
                                 "detail": "silent - nothing to normalize", "processed_at": run_started_at})
            continue

        original_lufs = measure_lufs_safe(data, rate, MIN_MEASURE_MS)
        lufs_is_fallback = original_lufs is None
        original_lufs_for_gain = original_rms if lufs_is_fallback else original_lufs

        gain_rms_raw = ref_rms - original_rms
        gain_lufs_raw = ref_lufs - original_lufs_for_gain
        gain_combined_raw = (gain_rms_raw + gain_lufs_raw) / 2.0

        lufs_print = (f" / {original_lufs:7.2f} LUFS" if not lufs_is_fallback
                      else " / LUFS n/a (too short/quiet even after looping - using RMS fallback)")
        print(f"{filename:33s} original {original_rms:7.2f} dBFS{lufs_print}")

        algo_results = {}
        for algo_name, raw_gain, out_dir in (
            ("rms", gain_rms_raw, RMS_DIR),
            ("lufs", gain_lufs_raw, LUFS_DIR),
            ("combined", gain_combined_raw, COMBINED_DIR),
        ):
            adjusted, final_gain, limited = apply_gain_with_true_peak_limit(data, raw_gain, CEILING_DB)

            out_path = os.path.join(out_dir, filename)
            sf.write(out_path, adjusted, rate, subtype=get_subtype(src_path))

            adjusted_rms = measure_rms_dbfs_safe(adjusted, rate, MIN_MEASURE_MS)
            adjusted_lufs = measure_lufs_safe(adjusted, rate, MIN_MEASURE_MS)

            tag = "  [limiter]" if limited else ""
            lufs_part = f" / {adjusted_lufs:7.2f} LUFS" if adjusted_lufs is not None else ""
            print(f"  [{algo_name.upper():8s}] gain {final_gain:+6.2f} dB{tag} "
                  f"-> {adjusted_rms:7.2f} dBFS{lufs_part}")

            algo_results[algo_name] = dict(
                raw_gain_db=raw_gain, final_gain_db=final_gain, limiter_engaged=limited,
                adjusted_dbfs=adjusted_rms, adjusted_lufs=adjusted_lufs
            )
            csv_rows.append([
                filename, algo_name, f"{original_rms:.2f}",
                (f"{original_lufs:.2f}" if not lufs_is_fallback else "n/a(fallback)"),
                f"{raw_gain:+.2f}", f"{final_gain:+.2f}", limited,
                (f"{adjusted_rms:.2f}" if adjusted_rms is not None else ""),
                (f"{adjusted_lufs:.2f}" if adjusted_lufs is not None else ""),
                CEILING_DB, datetime.now().isoformat(),
                ref_basename, f"{ref_rms:.2f}", f"{ref_lufs:.2f}"
            ])

        results.append(dict(
            filename=filename, original_dbfs=original_rms,
            original_lufs=(None if lufs_is_fallback else original_lufs),
            rms=algo_results["rms"], lufs=algo_results["lufs"], combined=algo_results["combined"],
            processed_at=run_started_at,
        ))
        log_entries.append({"filename": filename, "status": "processed", "detail": "3 versions written",
                             "processed_at": run_started_at})

    write_csv(csv_rows)
    manifest = {
        "reference": {"filename": ref_basename, "dbfs": ref_rms, "lufs": ref_lufs},
        "delay_ms_default": DEFAULT_DELAY_MS,
        "run_at": run_started_at,
        "files": [
            {
                "filename": r["filename"],
                "original": {"dbfs": r["original_dbfs"], "lufs": r["original_lufs"]},
                "rms": r["rms"], "lufs": r["lufs"], "combined": r["combined"],
                "processed_at": r["processed_at"],
            }
            for r in results
        ],
        "log": log_entries,
    }
    with open(MANIFEST_JSON, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n=== Finished. {len(results)} file(s) matched to {ref_basename}. "
          f"Saved to: {PROCESSED_DIR} ===")
    return manifest


def write_csv(rows):
    if not rows:
        return
    is_new = not os.path.exists(LOG_CSV)
    with open(LOG_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow([
                "filename", "algorithm", "original_dbfs", "original_lufs",
                "raw_gain_db", "final_gain_db", "limiter_engaged",
                "adjusted_dbfs", "adjusted_lufs", "ceiling_db", "timestamp",
                "reference_file", "reference_dbfs", "reference_lufs"
            ])
        writer.writerows(rows)


# ============================================================ web review ===
STYLE_CSS = """
:root {
  --bg: #000000;
  --panel: #0a0a0a;
  --border: #1a1a1a;
  --blue: #1177ED;
  --purple: #8711ED;
  --green: #11ED19;
  --red: #ED1911;
  --cyan: #11E5ED;
  --grey: #8A8A8A;
  --text: #FFFFFF;
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.topbar {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding: 26px 32px 16px; border-bottom: 1px solid var(--border);
  flex-wrap: wrap; gap: 16px;
}
.title-block h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; color: var(--blue); }
.title-block h1 span { color: var(--purple); }
.subtitle { margin: 6px 0 0; color: var(--grey); font-size: 14px; }
.mono { font-family: 'Consolas', 'SFMono-Regular', Menlo, monospace; color: var(--cyan); }
.controls { display: flex; align-items: center; gap: 18px; }
.btn {
  cursor: pointer; border-radius: 8px; padding: 10px 16px; font-size: 14px;
  font-weight: 600; border: 1px solid var(--green); background: transparent;
  color: var(--green); transition: background 0.15s, color 0.15s;
}
.btn:hover { background: var(--green); color: #000; }
.delay-label { font-size: 12px; color: var(--grey); display: flex; flex-direction: column; gap: 4px; }
.delay-label input {
  width: 90px; background: var(--panel); border: 1px solid var(--border);
  color: var(--text); border-radius: 6px; padding: 6px 8px; font-size: 14px;
}
.now-playing {
  margin: 16px 32px 0; padding: 12px 18px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--panel);
  font-family: 'Consolas', monospace; font-size: 13px; letter-spacing: 0.3px;
  transition: border-color 0.15s, color 0.15s;
}
.now-playing.idle { color: var(--grey); }
.now-playing.active { color: var(--text); font-weight: 600; }
.now-playing.stem-reference { border-color: var(--green); color: var(--green); }
.now-playing.stem-original { border-color: var(--grey); color: var(--grey); }
.now-playing.stem-rms { border-color: var(--purple); color: var(--purple); }
.now-playing.stem-lufs { border-color: var(--blue); color: var(--blue); }
.now-playing.stem-combined { border-color: var(--cyan); color: var(--cyan); }
main { display: flex; gap: 20px; padding: 20px 32px 16px; align-items: flex-start; }
.sound-list { flex: 2; min-width: 0; }
.row {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-bottom: 1px solid var(--border); border-radius: 8px; cursor: pointer;
  transition: background 0.12s; flex-wrap: wrap;
}
.row:hover { background: #0d0d0d; }
.row.selected { background: #0d1420; box-shadow: inset 3px 0 0 var(--blue); }
.play-icon-btn {
  flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%;
  border: 1px solid var(--blue); background: transparent; color: var(--blue);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}
.play-icon-btn svg { margin-left: 2px; }
.play-icon-btn:hover { background: var(--blue); color: #000; transform: scale(1.08); }
.play-icon-btn:active { transform: scale(0.94); }
.row-name {
  flex: 1 1 160px; min-width: 0; display: flex; flex-direction: column; gap: 2px; overflow: hidden;
}
.row-title {
  font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.row-time {
  font-size: 11px; color: var(--grey); font-family: 'Consolas', monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.mode-btn {
  font-size: 11px; font-weight: 700; letter-spacing: 0.3px; padding: 7px 11px;
  border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;
  background: transparent; transition: background 0.12s, color 0.12s; white-space: nowrap;
}
.mode-btn svg { flex-shrink: 0; }
.mode-all { border: 1px solid var(--blue); color: var(--blue); }
.mode-all:hover { background: var(--blue); color: #000; }
.mode-ab { border: 1px solid var(--green); color: var(--green); }
.mode-ab:hover { background: var(--green); color: #000; }
.row-buttons { display: flex; gap: 6px; flex-shrink: 0; }
.chip {
  font-size: 11px; font-weight: 700; letter-spacing: 0.4px; padding: 6px 10px;
  border-radius: 999px; background: transparent; cursor: pointer; transition: background 0.12s, color 0.12s;
}
.chip-orig { border: 1px solid var(--grey); color: var(--grey); }
.chip-orig:hover { background: var(--grey); color: #000; }
.chip-rms { border: 1px solid var(--purple); color: var(--purple); }
.chip-rms:hover { background: var(--purple); color: #000; }
.chip-lufs { border: 1px solid var(--blue); color: var(--blue); }
.chip-lufs:hover { background: var(--blue); color: #000; }
.chip-combined { border: 1px solid var(--cyan); color: var(--cyan); }
.chip-combined:hover { background: var(--cyan); color: #000; }
.detail-panel {
  flex: 1; position: sticky; top: 20px; background: var(--panel);
  border: 1px solid var(--border); border-radius: 12px; padding: 18px; min-width: 260px;
}
.detail-title { font-size: 15px; font-weight: 700; margin-bottom: 2px; word-break: break-word; }
.detail-meta { font-size: 11px; color: var(--grey); margin: 0 0 14px; }
.meter-row { margin-bottom: 12px; }
.meter-label { font-size: 11px; color: var(--grey); text-transform: uppercase; letter-spacing: 0.5px; }
.meter { height: 6px; background: #111; border-radius: 3px; overflow: hidden; margin: 4px 0; }
.meter-fill { height: 100%; border-radius: 3px; transition: width 0.2s; }
.meter-value { font-family: 'Consolas', monospace; font-size: 12px; color: var(--text); }
.empty { color: var(--grey); font-size: 13px; }
details.log-panel {
  margin: 0 32px 32px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--panel); padding: 4px 0;
}
details.log-panel summary {
  cursor: pointer; padding: 12px 18px; font-size: 13px; font-weight: 600; color: var(--grey);
  list-style: none;
}
details.log-panel summary::-webkit-details-marker { display: none; }
.log-list { padding: 0 18px 14px; }
.log-row {
  display: flex; align-items: center; gap: 12px; padding: 6px 0;
  border-bottom: 1px solid var(--border); font-size: 12px; font-family: 'Consolas', monospace;
}
.log-row:last-child { border-bottom: none; }
.log-row > span:first-child { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-time { color: var(--grey); flex-shrink: 0; font-size: 11px; }
.log-tag { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; flex-shrink: 0; }
.log-tag-reference { background: rgba(17,237,25,0.15); color: var(--green); }
.log-tag-processed { background: rgba(17,119,237,0.15); color: var(--blue); }
.log-tag-skipped_silent, .log-tag-skipped_unreadable, .log-tag-skipped_lufs_unmeasurable {
  background: rgba(237,25,17,0.15); color: var(--red);
}
.error-banner {
  margin: 32px; padding: 20px; border: 1px solid var(--red); border-radius: 10px;
  background: rgba(237,25,17,0.08); color: var(--red); font-size: 14px; white-space: pre-wrap;
}
"""

APP_JS = """
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.cache = new Map();
  }
  async initContext() {
    if (this.audioContext) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new Ctx();
    if (this.audioContext.state === 'suspended') {
      const resume = () => {
        this.audioContext.resume().catch(() => {});
        ['click', 'touchstart', 'keydown'].forEach(ev => window.removeEventListener(ev, resume));
      };
      ['click', 'touchstart', 'keydown'].forEach(ev => window.addEventListener(ev, resume, { once: true, passive: true }));
    }
  }
  async loadAudio(key, path) {
    await this.initContext();
    if (this.cache.has(key)) return;
    this.cache.set(key, 'loading');
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('fetch failed: ' + path);
      const buf = await res.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(buf);
      this.cache.set(key, audioBuffer);
    } catch (e) {
      console.error('Failed to load', path, e);
      this.cache.set(key, 'failed');
    }
  }
  playSound(key) {
    // Mirrors the Next.js AudioEngine's word-audio path: connect straight to
    // destination, full volume, no gain node (that path is only for UI sounds).
    return new Promise((resolve) => {
      const attempt = () => {
        if (!this.audioContext) { resolve(); return; }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
          setTimeout(attempt, 50);
          return;
        }
        const buf = this.cache.get(key);
        if (buf instanceof AudioBuffer) {
          const source = this.audioContext.createBufferSource();
          source.buffer = buf;
          source.connect(this.audioContext.destination);
          source.onended = () => resolve();
          source.start(0);
        } else if (buf === 'loading') {
          setTimeout(attempt, 100);
        } else {
          resolve();
        }
      };
      attempt();
    });
  }
}

const state = { manifest: null, currentFile: null, playing: false };
const engine = new AudioEngine();
const STEM_LABELS = { reference: 'Reference', original: 'Original', rms: 'RMS', lufs: 'LUFS', combined: 'Combined' };

function $(sel) { return document.querySelector(sel); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function clampPercent(db, min = -60, max = 0) {
  return Math.max(0, Math.min(100, ((db - min) / (max - min)) * 100));
}
function gainText(a, showLufs) {
  let t = 'gain ' + (a.final_gain_db >= 0 ? '+' : '') + a.final_gain_db.toFixed(2) + 'dB';
  if (a.limiter_engaged) t += ' \u00b7 limiter';
  if (showLufs && a.adjusted_lufs !== null && a.adjusted_lufs !== undefined) {
    t += ' \u00b7 ' + a.adjusted_lufs.toFixed(2) + ' LUFS';
  }
  return t;
}

function urlFor(filename, stem) {
  const enc = encodeURIComponent(filename || '');
  if (stem === 'reference') return '/audio/reference';
  if (stem === 'original') return '/audio/unprocessed/' + enc;
  if (stem === 'rms') return '/audio/rms/' + enc;
  if (stem === 'lufs') return '/audio/lufs/' + enc;
  if (stem === 'combined') return '/audio/combined/' + enc;
}

function setNowPlaying(filename, stem) {
  const el = $('#now-playing');
  if (!filename) {
    el.textContent = 'Nothing playing';
    el.className = 'now-playing idle';
    return;
  }
  el.textContent = 'Playing: ' + filename + ' \u2014 ' + STEM_LABELS[stem];
  el.className = 'now-playing active stem-' + stem;
}

async function playStem(filename, stem) {
  const displayName = stem === 'reference' ? state.manifest.reference.filename : filename;
  setNowPlaying(displayName, stem);
  const key = stem === 'reference' ? 'reference' : (stem + ':' + filename);
  await engine.loadAudio(key, urlFor(filename, stem));
  await engine.playSound(key);
  setNowPlaying(null);
}

// Mode 1: Reference + all 3 processed versions
async function playAllProcessed(filename) {
  if (state.playing) return;
  state.playing = true;
  const delay = parseInt($('#delay-input').value, 10) || 0;
  try {
    await playStem(filename, 'reference');
    await sleep(delay);
    await playStem(filename, 'rms');
    await sleep(delay);
    await playStem(filename, 'lufs');
    await sleep(delay);
    await playStem(filename, 'combined');
  } finally {
    state.playing = false;
  }
}

// Mode 2: Reference + original (unprocessed) - before/after compare
async function playReferenceAndOriginal(filename) {
  if (state.playing) return;
  state.playing = true;
  const delay = parseInt($('#delay-input').value, 10) || 0;
  try {
    await playStem(filename, 'reference');
    await sleep(delay);
    await playStem(filename, 'original');
  } finally {
    state.playing = false;
  }
}

function meterRow(label, db, colorVar, extra) {
  const has = db !== null && db !== undefined;
  const pct = has ? clampPercent(db) : 0;
  const dbText = has ? db.toFixed(2) + ' dBFS' : '\u2014';
  return '<div class="meter-row">' +
    '<span class="meter-label">' + label + '</span>' +
    '<div class="meter"><div class="meter-fill" style="width:' + pct + '%;background:var(' + colorVar + ')"></div></div>' +
    '<span class="meter-value">' + dbText + (extra ? ' \u00b7 ' + extra : '') + '</span>' +
    '</div>';
}

function renderDetail(f) {
  const panel = $('#detail-panel');
  if (!f) { panel.innerHTML = '<div class="empty">Select a sound to see its numbers.</div>'; return; }
  const ref = state.manifest.reference;
  panel.innerHTML =
    '<div class="detail-title">' + f.filename + '</div>' +
    (f.processed_at ? '<div class="detail-meta">Processed ' + formatTime(f.processed_at) + '</div>' : '') +
    meterRow('Reference', ref.dbfs, '--green') +
    meterRow('Original', f.original.dbfs, '--grey') +
    meterRow('RMS match', f.rms.adjusted_dbfs, '--purple', gainText(f.rms, false)) +
    meterRow('LUFS match', f.lufs.adjusted_dbfs, '--blue', gainText(f.lufs, true)) +
    meterRow('Combined', f.combined.adjusted_dbfs, '--cyan', gainText(f.combined, true));
}

function selectFile(filename) {
  document.querySelectorAll('.row').forEach(r => r.classList.toggle('selected', r.dataset.filename === filename));
  state.currentFile = filename;
  renderDetail(state.manifest.files.find(x => x.filename === filename));
}

function playIcon() {
  return '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 4l14 8-14 8V4z" fill="currentColor"/></svg>';
}
function modeIconAB() {
  return '<svg viewBox="0 0 24 24" width="13" height="13"><circle cx="8" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
}
function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch (e) { return iso; }
}

function renderList() {
  const list = $('#sound-list');
  list.innerHTML = '';
  state.manifest.files.forEach(f => {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.filename = f.filename;
    row.innerHTML =
      '<button class="play-icon-btn" title="Play: Reference, then RMS, LUFS, Combined">' + playIcon() + '</button>' +
      '<div class="row-name"><span class="row-title">' + f.filename + '</span>' +
        (f.processed_at ? '<span class="row-time">' + formatTime(f.processed_at) + '</span>' : '') +
      '</div>' +
      '<button class="mode-btn mode-ab" title="Play Reference, then the original unprocessed file">' + modeIconAB() + 'Ref + Original</button>' +
      '<div class="row-buttons">' +
      '<button class="chip chip-orig" data-stem="original">Orig</button>' +
      '<button class="chip chip-rms" data-stem="rms">RMS</button>' +
      '<button class="chip chip-lufs" data-stem="lufs">LUFS</button>' +
      '<button class="chip chip-combined" data-stem="combined">Comb</button>' +
      '</div>';
    row.addEventListener('click', (e) => { if (!e.target.closest('button')) selectFile(f.filename); });
    row.querySelector('.play-icon-btn').addEventListener('click', (e) => {
      e.stopPropagation(); selectFile(f.filename); playAllProcessed(f.filename);
    });
    row.querySelector('.mode-ab').addEventListener('click', (e) => {
      e.stopPropagation(); selectFile(f.filename); playReferenceAndOriginal(f.filename);
    });
    row.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); selectFile(f.filename); playStem(f.filename, btn.dataset.stem);
      });
    });
    list.appendChild(row);
  });
}

function renderHeader() {
  const ref = state.manifest.reference;
  $('#ref-name').textContent = ref.filename;
  $('#ref-readout').textContent = ref.dbfs.toFixed(2) + ' dBFS / ' + ref.lufs.toFixed(2) + ' LUFS';
  $('#delay-input').value = state.manifest.delay_ms_default;
  $('#run-time').textContent = state.manifest.run_at ? ('\u00b7 processed ' + formatTime(state.manifest.run_at)) : '';
}

function renderLog() {
  const box = $('#log-list');
  const summary = $('#log-summary');
  const entries = state.manifest.log || [];
  summary.textContent = 'Processing log (' + entries.length + ' file' + (entries.length === 1 ? '' : 's') + ')';
  box.innerHTML = entries.map(e =>
    '<div class="log-row">' +
      '<span>' + e.filename + '</span>' +
      '<span class="log-tag log-tag-' + e.status + '">' + e.status.replace(/_/g, ' ') + '</span>' +
      '<span class="log-time">' + formatTime(e.processed_at) + '</span>' +
    '</div>'
  ).join('');
}

async function loadManifest() {
  const res = await fetch('/manifest.json');
  state.manifest = await res.json();
  if (state.manifest.error) {
    $('#error-banner').style.display = 'block';
    $('#error-banner').textContent = state.manifest.error;
    $('#main-content').style.display = 'none';
    $('#log-panel').style.display = 'none';
    return;
  }
  renderHeader();
  renderList();
  renderLog();
}

$('#play-reference-btn').addEventListener('click', () => playStem(null, 'reference'));
loadManifest();
"""

INDEX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bootleg Volume Review</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="topbar">
    <div class="title-block">
      <h1>BOOTLEG <span>VOLUME REVIEW</span></h1>
      <p class="subtitle">Reference: <strong id="ref-name">-</strong> &nbsp; <span id="ref-readout" class="mono"></span> &nbsp; <span id="run-time" class="mono"></span></p>
    </div>
    <div class="controls">
      <button id="play-reference-btn" class="btn">Play reference</button>
      <label class="delay-label">Delay between sounds (ms)
        <input id="delay-input" type="number" min="0" step="50" value="500">
      </label>
    </div>
  </header>

  <div id="now-playing" class="now-playing idle">Nothing playing</div>
  <div id="error-banner" class="error-banner" style="display:none;"></div>

  <main id="main-content">
    <section id="sound-list" class="sound-list"></section>
    <aside id="detail-panel" class="detail-panel"><div class="empty">Select a sound to see its numbers.</div></aside>
  </main>

  <details id="log-panel" class="log-panel">
    <summary id="log-summary">Processing log</summary>
    <div id="log-list" class="log-list"></div>
  </details>

  <script src="/app.js"></script>
</body>
</html>
"""


class ReviewHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # keep the console quiet

    def _bytes(self, data, content_type):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _file(self, path, content_type="audio/wav"):
        try:
            with open(path, "rb") as f:
                data = f.read()
        except (FileNotFoundError, TypeError, IsADirectoryError):
            self.send_error(404, "Not found")
            return
        self._bytes(data, content_type)

    def do_GET(self):
        path = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)

        if path in ("/", "/index.html"):
            self._bytes(INDEX_HTML.encode("utf-8"), "text/html; charset=utf-8")
        elif path == "/style.css":
            self._bytes(STYLE_CSS.encode("utf-8"), "text/css; charset=utf-8")
        elif path == "/app.js":
            self._bytes(APP_JS.encode("utf-8"), "application/javascript; charset=utf-8")
        elif path == "/manifest.json":
            self._file(MANIFEST_JSON, "application/json; charset=utf-8")
        elif path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
        elif path == "/audio/reference":
            self._file(getattr(self.server, "ref_path", None))
        elif path.startswith("/audio/unprocessed/"):
            self._file(os.path.join(UNPROCESSED_DIR, path[len("/audio/unprocessed/"):]))
        elif path.startswith("/audio/rms/"):
            self._file(os.path.join(RMS_DIR, path[len("/audio/rms/"):]))
        elif path.startswith("/audio/lufs/"):
            self._file(os.path.join(LUFS_DIR, path[len("/audio/lufs/"):]))
        elif path.startswith("/audio/combined/"):
            self._file(os.path.join(COMBINED_DIR, path[len("/audio/combined/"):]))
        else:
            self.send_error(404, "Not found")


def find_free_port(start=8787, tries=25):
    port = start
    for _ in range(tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                port += 1
    raise RuntimeError("No free port found for the review server")


# ============================================================ entry point ===
if __name__ == "__main__":
    print("=== Bootleg Loudness Matcher ===")
    os.makedirs(UNPROCESSED_DIR, exist_ok=True)

    print(f"[STEP 1/3] Pick the reference sound (a dialog window should appear)...")
    ref_path = select_reference_file()
    if not ref_path:
        print("[ABORTED] No reference file was selected.")
        sys.exit(1)
    if not os.path.isfile(ref_path):
        print(f"[ERROR] Selected reference file doesn't exist:\n{ref_path}")
        sys.exit(1)

    print(f"[STEP 2/3] Reference: {ref_path}")
    print(f"Processing every .wav file in: {UNPROCESSED_DIR}\n")
    manifest = run_batch(ref_path)

    print("\n[STEP 3/3] Launching the review web app...")
    port = find_free_port()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), ReviewHandler)
    server.ref_path = ref_path

    url = f"http://127.0.0.1:{port}/"
    print(f"Review UI running at {url}  (Ctrl+C to stop)")
    webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
