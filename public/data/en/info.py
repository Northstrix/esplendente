#!/usr/bin/env python3
import os
import json
from pathlib import Path
from collections import Counter

def main():
    script_dir = Path(__file__).parent.absolute()
    levels_file = script_dir / "levels.json"
    
    print(f"=== LEVELS ANALYZER ===")
    print(f"Scanning: {levels_file}")
    
    if not levels_file.exists():
        print(f"❌ levels.json not found!")
        return
    
    try:
        with open(levels_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Handle {"levels": [...]} or direct array
        if 'levels' in data:
            levels = data['levels']
        else:
            levels = data
            
        print(f"\n📊 TOTAL LEVELS: {len(levels)}")
        print("📋 ENTRIES PER LEVEL:")
        print("-" * 50)
        
        total_words = 0
        total_entries = 0
        entry_counts = Counter()  # Track entry count distribution
        
        for level in levels:
            level_id = level.get('id', 'NO-ID')
            title = level.get('title', 'NO-TITLE')
            words_list = level.get('words', [])
            
            entries_in_level = len(words_list)
            words_in_level = 0
            for word_entry in words_list:
                word_text = word_entry.get('word', '')
                if isinstance(word_text, str):
                    words_in_level += len(word_text.split())
            
            total_words += words_in_level
            total_entries += entries_in_level
            entry_counts[entries_in_level] += 1  # Count this entry count
            
            print(f"Level {level_id}: '{title}' → {entries_in_level} entries, {words_in_level} words")
        
        print("-" * 50)
        print(f"TOTAL: {total_words} words, {total_entries} entries across {len(levels)} levels")
        
        # Print entry count statistics (only for counts that exist)
        if entry_counts:
            print("\n📈 ENTRY COUNT DISTRIBUTION:")
            print("-" * 35)
            for entry_count, level_freq in sorted(entry_counts.items()):
                print(f"{entry_count} entries: {level_freq} level{'s' if level_freq > 1 else ''}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()

