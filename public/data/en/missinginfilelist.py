#!/usr/bin/env python3
"""
WAV FILE MISSING LIST - filenames present in JSON but NOT listed in input.txt
"""

import json
from pathlib import Path

def main():
    script_dir = Path(__file__).parent.absolute()

    # JSON files to scan for filenames
    json_files = ["levels.json"]

    # Input (existing wav list) and output (missing from input but present in JSON)
    input_file = script_dir / "input.txt"
    output_file = script_dir / "output2.txt"

    print(f"🔍 MISSING WAV Finder - {script_dir}")
    print("=" * 70)

    # --- STEP 1: collect all filenames from JSON ---
    print("📋 Collecting JSON filenames...")
    json_filenames = set()

    for json_file in json_files:
        file_path = script_dir / json_file
        if not file_path.exists():
            print(f"⚠️  Missing: {json_file}")
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if "levels" in data:
                for level in data["levels"]:
                    for word in level.get("words", []):
                        filename = word.get("filename", "").strip()
                        if filename:
                            json_filenames.add(filename)

            print(f"   ✅ {json_file}")

        except Exception as e:
            print(f"   ❌ {json_file}: {e}")

    print(f"📊 Found {len(json_filenames)} unique JSON filenames")
    print(f"📝 JSON filenames sample: {sorted(list(json_filenames))[:5]}...")

    # --- STEP 2: read input.txt and collect existing basenames (without .wav) ---
    if not input_file.exists():
        print("\n❌ input.txt not found! Create it with your WAV list.")
        return

    print(f"\n📄 Reading input.txt ({input_file.stat().st_size} bytes)...")

    input_basenames = set()
    try:
        with open(input_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                # strip trailing ".wav" if present
                if line.lower().endswith(".wav"):
                    base = line[:-4]
                else:
                    base = line
                base = base.strip()
                if base:
                    input_basenames.add(base)
    except Exception as e:
        print(f"\n❌ Error reading input.txt: {e}")
        return

    print(f"📊 Found {len(input_basenames)} unique basenames in input.txt")

    # --- STEP 3: compute JSON names missing from input and write to output2.txt ---
    missing = sorted(json_filenames - input_basenames)
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            for name in missing:
                f.write(name + ".wav\n")  # or just name if you don't want .wav

        print(f"\n✅ Wrote output2.txt with {len(missing)} missing entries")
    except Exception as e:
        print(f"\n❌ Error writing output2.txt: {e}")
        return


if __name__ == "__main__":
    main()

