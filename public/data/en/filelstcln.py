import os
import json
from pathlib import Path

# === MANUAL EXCLUSION LIST (filenames to always exclude) ===
EXCLUSION_LIST = {
    "creyóse",
    "diréis",
    "carrizal",
    "almenorruido"
}

def main():
    script_dir = Path(__file__).parent.absolute()
    
    # JSON files to scan for filenames
    json_files = ["levels.json"]
    
    # Input/Output files
    input_file = script_dir / "input.txt"
    output_file = script_dir / "output.txt"
    
    print(f"🔍 EXACT MATCH WAV Filter - {script_dir}")
    print("=" * 70)
    
    # === STEP 1: Extract ALL JSON filenames (EXACT match only) ===
    print("📋 Collecting JSON filenames...")
    json_filenames = set()
    
    for json_file in json_files:
        file_path = script_dir / json_file
        if not file_path.exists():
            print(f"⚠️  Missing: {json_file}")
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if 'levels' in data:
                for level in data['levels']:
                    for word in level.get('words', []):
                        filename = word.get('filename', '').strip()
                        if filename:
                            json_filenames.add(filename)  # EXACT string match
            
            print(f"   ✅ {json_file}")
            
        except Exception as e:
            print(f"   ❌ {json_file}: {e}")
    
    print(f"📊 Found {len(json_filenames)} unique JSON filenames")
    print(f"📝 JSON filenames sample: {sorted(list(json_filenames))[:5]}...")
    
    # === STEP 2: Read input.txt and filter ===
    if not input_file.exists():
        print(f"\n❌ input.txt not found! Create it with your WAV list.")
        return
    
    print(f"\n📄 Reading input.txt ({input_file.stat().st_size} bytes)...")
    
    excluded = 0
    kept = 0
    output_lines = []
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                
                basename = Path(line).stem  # e.g. "rosa bianca.wav" → "rosa bianca"
                
                # Exclude if basename is in JSON filenames or in the manual exclusion list
                if basename in json_filenames or basename in EXCLUSION_LIST:
                    excluded += 1
                    reason = []
                    if basename in json_filenames:
                        reason.append("JSON match")
                    if basename in EXCLUSION_LIST:
                        reason.append("manual exclusion")
                    print(f"   ❌ {line} ({' + '.join(reason)})")
                else:
                    kept += 1
                    output_lines.append(line)
                    print(f"   ✅ {line}")
    
    except Exception as e:
        print(f"\n❌ Error reading input.txt: {e}")
        return
    
    # === STEP 3: Write output.txt ===
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            for line in output_lines:
                f.write(line + '\n')
        
        print(f"\n✅ Wrote output.txt ({len(output_lines)} lines)")
        print(f"📊 RESULTS: {kept} KEPT, {excluded} EXCLUDED")
        
        if EXCLUSION_LIST:
            print(f"\n🚫 Manual exclusions applied: {sorted(EXCLUSION_LIST)}")
    
    except Exception as e:
        print(f"\n❌ Error writing output.txt: {e}")
        return


if __name__ == "__main__":
    main()

