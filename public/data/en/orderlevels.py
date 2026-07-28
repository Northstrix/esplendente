#!/usr/bin/env python3
import json
import sys

def main():
    filename = "levels.json"
    
    try:
        # Read the JSON file
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Reassign sequential IDs from 1 to N (keeping original order)
        for i, level in enumerate(data["levels"], 1):
            level["id"] = i
        
        # Write back to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        total_levels = len(data["levels"])
        print(f"✓ Renumbered {total_levels} levels from 1 to {total_levels}")
        print(f"✓ Updated file: {filename}")
        
        # Show first and last few levels to verify
        print("\nFirst 3 levels after renumbering:")
        for level in data["levels"][:3]:
            print(f"  ID {level['id']}: {level['title']}")
        
        if total_levels > 3:
            print(f"\nLast 2 levels:")
            for level in data["levels"][-2:]:
                print(f"  ID {level['id']}: {level['title']}")
            
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        return 1
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON: {e}")
        return 1
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

