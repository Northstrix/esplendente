import os
FFMPEG_DIR = r"C:\ffmpeg\bin"
FFMPEG_EXE = r"C:\ffmpeg\bin\ffmpeg.exe"
FFPROBE_EXE = r"C:\ffmpeg\bin\ffprobe.exe"

import sys
import io
import customtkinter as ctk
from tkinter import messagebox
from pydub import AudioSegment
AudioSegment.converter = FFMPEG_EXE
AudioSegment.ffprobe = FFPROBE_EXE
os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ.get("PATH", "")

import pygame

# --- CONFIGURABLE VISUALS (from your UI) ---
WAVEFORM_STROKE = 1.2
TIMELINE_AUDIO = "#1177ED"
TIMELINE_CLICK = "#ED1177"
BG_BLACK = "#000000"

# Main Colors
ACCENT_BLUE = "#1177ED"
ACCENT_PURPLE = "#8711ED"
COLOR_SUCCESS = "#11ED19"
COLOR_ERROR = "#ED1911"
COLOR_MARGINAL = "#11E5ED"
TEXT_WHITE = "#FFFFFF"

# Darker Hover Colors
HOVER_BLUE = "#0E5FBD"
HOVER_PURPLE = "#6C0EBD"
HOVER_SUCCESS = "#0EBD14"
HOVER_ERROR = "#BD140E"
HOVER_NEUTRAL = "#1B1B1B"

pygame.mixer.init()
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")


class DuplicateWordCleaner(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Bootleg Duplicate Word Cleaner")
        self.geometry("1000x650")
        self.configure(fg_color=BG_BLACK)

        # Directories
        script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
        self.unprocessed_dir = os.path.join(script_dir, "Unprocessed")

        # Data
        self.groups = {}          # word -> [full_paths]
        self.group_keys = []      # sorted list of words
        self.current_group_index = 0
        self.current_files = []   # paths for current word
        self.current_audio = None
        self.current_file_for_play = None

        # State for "which to keep" mode
        self.waiting_for_keep_choice = False

        # UI state
        self.selected_keep_name = ctk.StringVar(value="")
        self.status_text = ctk.StringVar(value="Scanning for duplicates...")
        self.word_text = ctk.StringVar(value="-")
        self.group_info_text = ctk.StringVar(value="")

        self.setup_ui()

        # Keyboard shortcuts:
        # 1–9,0 -> play or select
        for i in range(10):
            key = str(i)
            self.bind(key, self.on_number_key)

        self.bind("m", self.on_m_key)       # M = keep mode
        self.bind("b", lambda e: self.prev_group())
        self.bind("<Escape>", lambda e: self.next_group())

        self.after(100, self.initial_scan)

    # ---------- Scanning ----------

    def initial_scan(self):
        if not os.path.exists(self.unprocessed_dir):
            os.makedirs(self.unprocessed_dir)
            self.status_text.set("Created 'Unprocessed', but no files found.")
            return

        wavs = [
            f for f in os.listdir(self.unprocessed_dir)
            if f.lower().endswith(".wav") and os.path.isfile(os.path.join(self.unprocessed_dir, f))
        ]

        if not wavs:
            self.status_text.set("No .wav files found in 'Unprocessed'.")
            return

        groups = {}
        for fname in wavs:
            base = os.path.splitext(fname)[0]
            parts = base.split("_", 1)
            if not parts:
                continue
            word = parts[0].lower()
            full_path = os.path.join(self.unprocessed_dir, fname)
            groups.setdefault(word, []).append(full_path)

        self.groups = {w: sorted(paths) for w, paths in groups.items() if len(paths) > 1}
        self.group_keys = sorted(self.groups.keys())

        if not self.group_keys:
            self.status_text.set("No duplicate words found in 'Unprocessed'.")
            return

        self.status_text.set("Use 1–9/0 to play files. Press M to choose which to keep.")
        self.load_group(0)

    # ---------- UI ----------

    def setup_ui(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="#050505", corner_radius=10)
        header.pack(fill="x", padx=20, pady=20)

        title_label = ctk.CTkLabel(
            header,
            text="Bootleg Duplicate Word Cleaner",
            font=("Segoe UI", 28, "bold"),
            text_color=ACCENT_BLUE
        )
        title_label.pack(pady=(10, 0))

        subtitle = ctk.CTkLabel(
            header,
            textvariable=self.status_text,
            font=("Segoe UI", 14),
            text_color=COLOR_MARGINAL
        )
        subtitle.pack(pady=(0, 10))

        # Word info
        word_frame = ctk.CTkFrame(self, fg_color="#0a0a0a", corner_radius=10)
        word_frame.pack(fill="x", padx=20, pady=(0, 10))

        ctk.CTkLabel(
            word_frame,
            text="Current word:",
            font=("Segoe UI", 16, "bold"),
            text_color=TEXT_WHITE
        ).pack(side="left", padx=15, pady=10)

        ctk.CTkLabel(
            word_frame,
            textvariable=self.word_text,
            font=("Segoe UI", 20, "bold"),
            text_color=ACCENT_PURPLE
        ).pack(side="left", padx=10)

        ctk.CTkLabel(
            word_frame,
            textvariable=self.group_info_text,
            font=("Segoe UI", 14),
            text_color=COLOR_MARGINAL
        ).pack(side="right", padx=15)

        # Center (file list + info)
        center = ctk.CTkFrame(self, fg_color="#050505", corner_radius=10)
        center.pack(fill="both", expand=True, padx=20, pady=10)

        list_frame = ctk.CTkFrame(center, fg_color="transparent")
        list_frame.pack(side="left", fill="both", expand=True, padx=10, pady=10)

        ctk.CTkLabel(
            list_frame,
            text="Variants for this word:",
            font=("Segoe UI", 16, "bold"),
            text_color=TEXT_WHITE
        ).pack(anchor="w", pady=(0, 5))

        self.listbox = ctk.CTkTextbox(
            list_frame,
            fg_color="#000000",
            text_color=TEXT_WHITE,
            font=("Consolas", 13),
            wrap="none",
            height=10
        )
        self.listbox.pack(fill="both", expand=True)

        help_frame = ctk.CTkFrame(center, fg_color="#0a0a0a", corner_radius=10)
        help_frame.pack(side="right", fill="y", padx=10, pady=10)

        ctk.CTkLabel(
            help_frame,
            text="Controls",
            font=("Segoe UI", 16, "bold"),
            text_color=TEXT_WHITE
        ).pack(pady=(10, 5))

        help_text = (
            "1–9 / 0  → Play variant (index 1–10)\n"
            "M        → Enter KEEP mode\n"
            "In KEEP mode:\n"
            "  1–9/0  → Choose file to keep\n"
            "B        → Previous word\n"
            "ESC      → Next word\n"
        )
        ctk.CTkLabel(
            help_frame,
            text=help_text,
            justify="left",
            font=("Segoe UI", 12),
            text_color=COLOR_MARGINAL
        ).pack(pady=(0, 10))

        # Buttons
        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(pady=20)

        self.btn_prev = ctk.CTkButton(
            btn_frame,
            text="<< PREVIOUS WORD [B]",
            fg_color="#222222",
            hover_color=HOVER_NEUTRAL,
            width=220,
            height=50,
            command=self.prev_group
        )
        self.btn_prev.grid(row=0, column=0, padx=10)

        self.btn_next = ctk.CTkButton(
            btn_frame,
            text="NEXT WORD [ESC] >>",
            fg_color=COLOR_ERROR,
            hover_color=HOVER_ERROR,
            width=220,
            height=50,
            command=self.next_group
        )
        self.btn_next.grid(row=0, column=1, padx=10)

    # ---------- Group handling ----------

    def load_group(self, index):
        if not self.group_keys:
            self.word_text.set("-")
            self.group_info_text.set("No duplicate groups.")
            self.listbox.configure(state="normal")
            self.listbox.delete("1.0", "end")
            self.listbox.configure(state="disabled")
            self.update_nav_buttons()
            return

        if index < 0 or index >= len(self.group_keys):
            return

        self.waiting_for_keep_choice = False
        self.current_group_index = index
        word = self.group_keys[index]
        self.current_files = self.groups[word]
        self.current_audio = None
        self.current_file_for_play = None

        self.word_text.set(word)
        self.group_info_text.set(
            f"Group {index + 1} of {len(self.group_keys)} • {len(self.current_files)} file(s)"
        )

        # Fill listbox with numbered entries
        self.listbox.configure(state="normal")
        self.listbox.delete("1.0", "end")
        for i, full_path in enumerate(self.current_files, start=1):
            name = os.path.basename(full_path)
            self.listbox.insert("end", f"{i}. {name}\n")
        self.listbox.configure(state="disabled")

        self.status_text.set("Use number keys to play variants. Press M to choose which to keep.")
        self.update_nav_buttons()

    def update_nav_buttons(self):
        if not self.group_keys:
            self.btn_prev.configure(state="disabled")
            self.btn_next.configure(state="disabled")
            return

        if self.current_group_index <= 0:
            self.btn_prev.configure(state="disabled")
        else:
            self.btn_prev.configure(state="normal")

        if self.current_group_index >= len(self.group_keys) - 1:
            self.btn_next.configure(state="disabled")
        else:
            self.btn_next.configure(state="normal")

    # ---------- Keyboard handlers ----------

    def on_number_key(self, event):
        """Handle 1–9,0 keys.

        - Normal mode: play that index
        - KEEP mode: choose that index to keep
        """
        if not self.current_files:
            return

        key = event.keysym
        if key == "0":
            idx = 10
        else:
            try:
                idx = int(key)
            except ValueError:
                return

        if idx < 1 or idx > len(self.current_files):
            # out of range for this group
            return

        if self.waiting_for_keep_choice:
            # Use this index to keep
            self.keep_by_index(idx - 1)
        else:
            # Just play that index
            self.play_index(idx - 1)

    def on_m_key(self, event):
        """Enter KEEP mode: ask user to press a number."""
        if not self.current_files:
            return
        self.waiting_for_keep_choice = True
        self.status_text.set(
            "KEEP MODE: press the number (1–9/0) of the file you want to keep for this word."
        )

    # ---------- Playback ----------

    def play_index(self, idx):
        if idx < 0 or idx >= len(self.current_files):
            return

        target_path = self.current_files[idx]
        try:
            seg = AudioSegment.from_wav(target_path)
            self.current_audio = seg
            self.current_file_for_play = target_path
        except Exception as e:
            messagebox.showerror("Error", f"Error loading audio:\n{e}")
            return

        self.stop_playback()
        try:
            buf = io.BytesIO()
            self.current_audio.export(buf, format="wav")
            buf.seek(0)
            pygame.mixer.music.load(buf)
            pygame.mixer.music.play()
            self.status_text.set(f"Playing #{idx + 1}: {os.path.basename(target_path)}")
        except Exception as e:
            messagebox.showerror("Playback error", f"Could not play audio:\n{e}")

    def stop_playback(self):
        try:
            pygame.mixer.music.stop()
            pygame.mixer.music.unload()
        except Exception:
            pass

    # ---------- Keep/delete ----------

    def keep_by_index(self, idx):
        if not self.current_files:
            return
        if idx < 0 or idx >= len(self.current_files):
            return

        keep_path = self.current_files[idx]
        delete_paths = [p for i, p in enumerate(self.current_files) if i != idx]

        keep_name = os.path.basename(keep_path)
        friendly_list = "\n".join(os.path.basename(p) for p in delete_paths)
        msg = (
            f"KEEP:\n  {keep_name}\n\n"
            f"DELETE {len(delete_paths)} other file(s) for word '{self.word_text.get()}'?\n\n"
            f"Files to delete:\n{friendly_list}"
        )

        if not messagebox.askyesno("Confirm deletion", msg):
            # Stay in keep mode
            return

        self.stop_playback()
        errors = []
        for p in delete_paths:
            try:
                os.remove(p)
            except Exception as e:
                errors.append(f"{os.path.basename(p)}: {e}")

        if errors:
            messagebox.showerror(
                "Delete errors",
                "Some files could not be deleted:\n\n" + "\n".join(errors)
            )

        # Update groups
        word = self.group_keys[self.current_group_index]
        del self.groups[word]
        self.group_keys = sorted(self.groups.keys())
        self.waiting_for_keep_choice = False

        if not self.group_keys:
            self.current_files = []
            self.word_text.set("-")
            self.group_info_text.set("All duplicate groups processed.")
            self.listbox.configure(state="normal")
            self.listbox.delete("1.0", "end")
            self.listbox.configure(state="disabled")
            self.status_text.set("Done. No more duplicates in 'Unprocessed'.")
            self.update_nav_buttons()
            return

        if self.current_group_index >= len(self.group_keys):
            self.current_group_index = len(self.group_keys) - 1

        self.load_group(self.current_group_index)

    # ---------- Navigation ----------

    def prev_group(self):
        if self.current_group_index > 0:
            self.stop_playback()
            self.load_group(self.current_group_index - 1)

    def next_group(self):
        if self.current_group_index < len(self.group_keys) - 1:
            self.stop_playback()
            self.load_group(self.current_group_index + 1)

    # ---------- Close ----------

    def destroy(self):
        self.stop_playback()
        super().destroy()


if __name__ == "__main__":
    app = DuplicateWordCleaner()
    app.mainloop()
