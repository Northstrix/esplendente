import os
FFMPEG_DIR = r"C:\ffmpeg\bin"
FFMPEG_EXE = r"C:\ffmpeg\bin\ffmpeg.exe"
FFPROBE_EXE = r"C:\ffmpeg\bin\ffprobe.exe"

import numpy as np
import customtkinter as ctk
from tkinter import messagebox
from pydub import AudioSegment
AudioSegment.converter = FFMPEG_EXE
AudioSegment.ffprobe = FFPROBE_EXE
import pygame
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
os.environ["PATH"] = FFMPEG_DIR + os.pathsep + os.environ.get("PATH", "")
import noisereduce as nr
import io


# --- CONFIGURABLE VISUALS ---
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

# 20% Darker Hover Colors
HOVER_BLUE = "#0E5FBD"
HOVER_PURPLE = "#6C0EBD"
HOVER_SUCCESS = "#0EBD14"
HOVER_ERROR = "#BD140E"
HOVER_NEUTRAL = "#1B1B1B"

pygame.mixer.init()
ctk.set_appearance_mode("dark")

class BootlegSoundProcessor(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Bootleg Sound Processor")
        self.geometry("1400x1000")
        self.configure(fg_color=BG_BLACK)

        self.unprocessed_dir = "Unprocessed"
        self.processed_dir = "Processed"
        os.makedirs(self.processed_dir, exist_ok=True)

        self.files = []
        self.current_idx = 0
        self.audio = None
        self.global_avg_dbfs = -20.0
        self._after_id = None
        self.is_loading = False 

        self.setup_ui()
        
        # --- KEYBOARD SHORTCUTS ---
        # Note: If an input is focused, typing these will go into the box. 
        # Click outside the box on the timeline to use shortcuts.
        self.bind("b", lambda e: self.move_index(-1))   
        self.bind("n", lambda e: self.play_tuned())     
        self.bind("m", lambda e: self.save_and_next())  
        self.bind("p", lambda e: self.save_marked_and_next())
        self.bind("<Escape>", lambda e: self.move_index(1)) 
        self.bind("c", lambda e: self.play_comparison())

        self.after(100, self.initial_scan)

    def validate_numeric(self, P):
        """Prevents letters from being typed into inputs."""
        if P == "" or P == "-" or P == ".": return True
        try:
            float(P)
            return True
        except ValueError:
            return False

    def initial_scan(self):
        if not os.path.exists(self.unprocessed_dir):
            os.makedirs(self.unprocessed_dir)
            return
        wavs = [f for f in os.listdir(self.unprocessed_dir) if f.lower().endswith('.wav')]
        if not wavs:
            self.status_label.configure(text="No files found", text_color=COLOR_ERROR)
            return

        total_dbfs = 0
        count = 0
        for f in wavs:
            try:
                seg = AudioSegment.from_wav(os.path.join(self.unprocessed_dir, f))
                total_dbfs += seg.dBFS
                count += 1
            except: 
                pass
        
        self.global_avg_dbfs = total_dbfs / count if count > 0 else -20.0
        self.files = wavs
        self.load_file()

    def setup_ui(self):
        vcmd = (self.register(self.validate_numeric), '%P')

        # Header (Now shows Filename)
        self.status_label = ctk.CTkLabel(self, text="Scanning...", font=("Segoe UI", 32, "bold"), text_color=ACCENT_BLUE)
        self.status_label.pack(pady=(20, 5))
        self.info_label = ctk.CTkLabel(
            self, 
            text="B: Prev | N: Play | M: Save | P: Save + Flag", 
            font=("Segoe UI", 16), 
            text_color=COLOR_MARGINAL
        )
        self.info_label.pack()

        # Timeline (waveform section) – make it almost full width
        self.canvas_frame = ctk.CTkFrame(self, fg_color="#050505", border_width=1, border_color="#222")
        # was padx=40; now much smaller so it uses ~98% of window width
        self.canvas_frame.pack(fill="both", expand=True, padx=10, pady=10)
        self.fig, self.ax = plt.subplots(figsize=(12, 3))
        self.fig.patch.set_facecolor(BG_BLACK)
        self.ax.set_facecolor(BG_BLACK)
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.canvas_frame)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)

        # Trimmers – match waveform width visually
        self.trim_frame = ctk.CTkFrame(self, fg_color="transparent")
        # was padx=60; reduce so sliders nearly span window too
        self.trim_frame.pack(fill="x", padx=10)
        self.start_slider = ctk.CTkSlider(
            self.trim_frame, from_=0, to=100, button_color=ACCENT_BLUE, 
            button_hover_color=HOVER_BLUE, progress_color=ACCENT_BLUE, command=self.on_param_change
        )
        self.start_slider.pack(fill="x", pady=2)
        self.end_slider = ctk.CTkSlider(
            self.trim_frame, from_=0, to=100, button_color=ACCENT_PURPLE, 
            button_hover_color=HOVER_PURPLE, progress_color=ACCENT_PURPLE, command=self.on_param_change
        )
        self.end_slider.pack(fill="x", pady=2)

        # Dashboard
        self.dash = ctk.CTkFrame(self, fg_color="#0a0a0a", border_width=1, border_color="#1a1a1a")
        self.dash.pack(fill="x", padx=40, pady=20)

        # --- NOISE SECTION ---
        noise_box = ctk.CTkFrame(self.dash, fg_color="transparent")
        noise_box.pack(side="left", expand=True, fill="both", padx=10, pady=10)
        
        ctk.CTkLabel(noise_box, text="Noise Filter", font=("Arial", 12, "bold"), text_color=TEXT_WHITE).pack(pady=(0, 2))
        ctk.CTkLabel(noise_box, text="(Rec: 0.5 - 0.8)", font=("Arial", 11)).pack()
        n_sub = ctk.CTkFrame(noise_box, fg_color="transparent")
        n_sub.pack(pady=5)
        ctk.CTkLabel(n_sub, text="Strength: ", font=("Arial", 16, "bold")).pack(side="left")
        self.ent_noise = ctk.CTkEntry(n_sub, width=85, height=38, font=("Arial", 16), validate='key', validatecommand=vcmd)
        self.ent_noise.insert(0, "0.60")
        self.ent_noise.pack(side="left", padx=5)
        self.ent_noise.bind("<KeyRelease>", self.on_param_change)
        
        self.noise_check = ctk.CTkCheckBox(
            noise_box, text="Enable", font=("Arial", 14), 
            hover_color=HOVER_BLUE, border_color=ACCENT_BLUE, command=self.on_param_change
        )
        self.noise_check.pack(pady=5)

        # --- CLICK SECTION ---
        click_box = ctk.CTkFrame(self.dash, fg_color="transparent")
        click_box.pack(side="left", expand=True, fill="both", padx=10, pady=10)
        ctk.CTkLabel(click_box, text="Click Sound Removal", font=("Arial", 12, "bold"), text_color=TEXT_WHITE).pack(pady=(0, 2))
        self.click_mode = ctk.CTkSegmentedButton(
            click_box, values=["None", "Start", "End", "Both"], 
            selected_color=ACCENT_PURPLE, selected_hover_color=HOVER_PURPLE, command=self.on_click_mode_change
        )
        self.click_mode.pack(pady=(0, 10))
        self.click_params_ui = ctk.CTkFrame(click_box, fg_color="#111", corner_radius=10)
        labels = ["Dur (ms):", "Steepness:"]
        recs = ["(20-150)", "(0.5-3.0)"]
        defaults = ["45", "1.0"]
        self.click_entries = {}
        for i, (l, r, d) in enumerate(zip(labels, recs, defaults)):
            col = ctk.CTkFrame(self.click_params_ui, fg_color="transparent")
            col.grid(row=0, column=i, padx=15, pady=5)
            ctk.CTkLabel(col, text=r, font=("Arial", 11)).pack()
            row = ctk.CTkFrame(col, fg_color="transparent")
            row.pack()
            ctk.CTkLabel(row, text=l, font=("Arial", 16, "bold")).pack(side="left")
            ent = ctk.CTkEntry(row, width=85, height=38, font=("Arial", 16), validate='key', validatecommand=vcmd)
            ent.insert(0, d)
            ent.pack(side="left", padx=5)
            ent.bind("<KeyRelease>", self.on_param_change)
            self.click_entries[l] = ent

        # Buttons
        self.btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.btn_frame.pack(pady=20)
        self.btn_comp = ctk.CTkButton(
            self.btn_frame, text="COMPARE [C]", fg_color="#222", 
            hover_color=HOVER_NEUTRAL, width=200, height=60, command=self.play_comparison
        )
        self.btn_comp.grid(row=0, column=0, padx=10)
        self.btn_play = ctk.CTkButton(
            self.btn_frame, text="PLAY TUNED [N]", fg_color=ACCENT_BLUE, 
            hover_color=HOVER_BLUE, text_color="white", font=("bold", 14), width=230, height=60, command=self.play_tuned
        )
        self.btn_play.grid(row=0, column=1, padx=10)
        self.btn_save = ctk.CTkButton(
            self.btn_frame, text="APPROVE & NEXT [M]", fg_color=COLOR_SUCCESS, 
            hover_color=HOVER_SUCCESS, text_color="black", font=("bold", 14), width=230, height=60, command=self.save_and_next
        )
        self.btn_save.grid(row=0, column=2, padx=10)
        self.btn_skip = ctk.CTkButton(
            self.btn_frame, text="SKIP [ESC]", fg_color=COLOR_ERROR, 
            hover_color=HOVER_ERROR, width=150, height=60, command=lambda: self.move_index(1)
        )
        self.btn_skip.grid(row=0, column=3, padx=10)

    def on_click_mode_change(self, value):
        if value == "None": 
            self.click_params_ui.pack_forget()
        else: 
            self.click_params_ui.pack(pady=5, fill="x")
        self.on_param_change()

    def load_file(self):
        if 0 <= self.current_idx < len(self.files):
            self.is_loading = True
            self.click_mode.set("None")
            self.click_params_ui.pack_forget()
            
            filename = self.files[self.current_idx]
            path = os.path.join(self.unprocessed_dir, filename)
            raw = AudioSegment.from_wav(path)
            self.audio = raw.apply_gain(self.global_avg_dbfs - raw.dBFS)

            self.start_slider.configure(from_=0, to=len(self.audio))
            self.start_slider.set(0)
            self.end_slider.configure(from_=0, to=len(self.audio))
            self.end_slider.set(len(self.audio))
            
            self.status_label.configure(text=filename)
            self.update_plot()
            self.is_loading = False
            self.play_tuned()
        else:
            self.status_label.configure(text="PROCESSING COMPLETE", text_color=COLOR_SUCCESS)

    def on_param_change(self, _=None):
        if self.is_loading: 
            return
        self.update_plot()
        if self._after_id: 
            self.after_cancel(self._after_id)
        self._after_id = self.after(500, self.play_tuned)

    def update_plot(self):
        self.ax.clear()
        samples = np.array(self.audio.get_array_of_samples())[::35]
        self.ax.plot(samples, color=TIMELINE_AUDIO, linewidth=WAVEFORM_STROKE, alpha=0.9)
        
        s_val, e_val = self.start_slider.get(), self.end_slider.get()
        s_idx = (s_val / len(self.audio)) * len(samples)
        e_idx = (e_val / len(self.audio)) * len(samples)
        self.ax.axvline(s_idx, color="white", lw=1.5)
        self.ax.axvline(e_idx, color=ACCENT_PURPLE, lw=1.5)
        
        mode = self.click_mode.get()
        try: 
            dur_ms = float(self.click_entries["Dur (ms):"].get())
        except: 
            dur_ms = 0
        if mode != "None" and dur_ms > 0:
            ms_to_px = len(samples) / len(self.audio)
            if mode in ["Start", "Both"]:
                self.ax.axvspan(s_idx, s_idx + (dur_ms * ms_to_px), color=TIMELINE_CLICK, alpha=0.35)
            if mode in ["End", "Both"]:
                self.ax.axvspan(e_idx - (dur_ms * ms_to_px), e_idx, color=TIMELINE_CLICK, alpha=0.35)
            
        self.ax.axis('off')
        self.canvas.draw()

    def apply_filters(self, seg):
        # 1. Noise
        if self.noise_check.get():
            try: 
                str_val = float(self.ent_noise.get())
            except: 
                str_val = 0.6
            data = np.array(seg.get_array_of_samples()).astype(np.float32)
            reduced = nr.reduce_noise(y=data, sr=seg.frame_rate, prop_decrease=str_val)
            seg = seg._spawn(reduced.astype(np.int16).tobytes())

        # 2. v7 Surgical Click Logic
        mode = self.click_mode.get()
        if mode != "None":
            try:
                dur = int(float(self.click_entries["Dur (ms):"].get()))
                curve = float(self.click_entries["Steepness:"].get())
            except: 
                dur, curve = 45, 1.0
            
            dur = min(dur, len(seg)//2)
            if mode in ["Start", "Both"]:
                seg = seg.fade(start=0, end=dur, from_gain=-120, to_gain=0)
            if mode in ["End", "Both"]:
                seg = seg.fade(start=len(seg)-dur, end=len(seg), from_gain=0, to_gain=-120)

        return seg.apply_gain(self.global_avg_dbfs - seg.dBFS)

    def play_tuned(self):
        self.stop_playback()
        tuned = self.apply_filters(self.audio[self.start_slider.get():self.end_slider.get()])
        buf = io.BytesIO()
        tuned.export(buf, format="wav")
        buf.seek(0)
        pygame.mixer.music.load(buf)
        pygame.mixer.music.play()

    def play_comparison(self):
        self.stop_playback()
        orig = self.audio[self.start_slider.get():self.end_slider.get()]
        combined = orig + AudioSegment.silent(duration=500) + self.apply_filters(orig)
        buf = io.BytesIO()
        combined.export(buf, format="wav")
        buf.seek(0)
        pygame.mixer.music.load(buf)
        pygame.mixer.music.play()

    def stop_playback(self):
        pygame.mixer.music.stop()
        pygame.mixer.music.unload()

    def _export_current_segment(self):
        raw_name = self.files[self.current_idx].split('_')[0].lower().replace(".wav", "")
        save_path = os.path.join(self.processed_dir, f"{raw_name}.wav")
        c = 1
        while os.path.exists(save_path):
            save_path = os.path.join(self.processed_dir, f"{raw_name}_{c}.wav")
            c += 1
        self.apply_filters(self.audio[self.start_slider.get():self.end_slider.get()]).export(save_path, format="wav")
        return save_path

    def save_and_next(self):
        self.stop_playback()
        self._export_current_segment()
        self.move_index(1)

    def save_marked_and_next(self):
        self.stop_playback()
        save_path = self._export_current_segment()
        try:
            with open("payAttentionTo.txt", "a", encoding="utf-8") as f:
                f.write(os.path.basename(save_path) + "\n")
        except Exception as e:
            messagebox.showerror("Error", f"Could not write to payAttentionTo.txt:\n{e}")
        self.move_index(1)

    def move_index(self, d):
        self.current_idx += d
        if self.current_idx < 0: 
            self.current_idx = 0
        self.load_file()

if __name__ == "__main__":
    BootlegSoundProcessor().mainloop()
