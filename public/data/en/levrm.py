#!/usr/bin/env python3
"""
FILTER LEVEL WORDS BY EXISTING AUDIO

Removes every `word` object from all levels if its `filename`
is NOT present in input.txt (basename, without .wav).
"""

import json
from pathlib import Path

def load_input_basenames(input_path: Path) -> set:
    if not input_path.exists():
        raise FileNotFoundError(f"input.txt not found at {input_path}")

    basenames = set()
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Remove trailing .wav if present
            if line.lower().endswith(".wav"):
                line = line[:-4]
            line = line.strip()
            if line:
                basenames.add(line)
    return basenames


def filter_json_file(json_path: Path, allowed_basenames: set) -> None:
    print(f"\n📄 Processing {json_path.name}…")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "levels" not in data:
        print("⚠️  No 'levels' key found, skipping.")
        return

    total_words_before = 0
    total_words_after = 0

    for level in data["levels"]:
        words = level.get("words", [])
        total_words_before += len(words)

        # Keep only words whose filename is in allowed_basenames
        filtered_words = []
        for w in words:
            filename = (w.get("filename") or "").strip()
            if filename in allowed_basenames:
                filtered_words.append(w)
            else:
                # For debugging/logging if you want:
                print(f"   ❌ removing '{filename}' from level {level.get('id')}")

        level["words"] = filtered_words
        total_words_after += len(filtered_words)

    print(f"   ✅ {total_words_after}/{total_words_before} words kept")

    # Optional: backup original
    backup_path = json_path.with_suffix(json_path.suffix + ".bak")
    json_path.replace(backup_path)
    print(f"   💾 Backup saved as {backup_path.name}")

    # Write filtered JSON back to the original filename
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"   ✏️  Updated {json_path.name} written")


def main():
    script_dir = Path(__file__).parent.absolute()

    input_file = script_dir / "input.txt"
    json_files = [
        script_dir / "levels.json",
    ]

    print(f"🔍 FILTER LEVEL WORDS BY AUDIO - {script_dir}")
    print("=" * 70)

    # 1) Load allowed basenames from input.txt
    try:
        allowed = load_input_basenames(input_file)
    except Exception as e:
        print(f"❌ Error loading input.txt: {e}")
        return

    print(f"📊 {len(allowed)} basenames loaded from input.txt")

    # 2) Filter each JSON file in place (with .bak backup)
    for jf in json_files:
        if not jf.exists():
            print(f"⚠️  Missing JSON file: {jf.name}")
            continue
        try:
            filter_json_file(jf, allowed)
        except Exception as e:
            print(f"❌ Error processing {jf.name}: {e}")


if __name__ == "__main__":
    main()

