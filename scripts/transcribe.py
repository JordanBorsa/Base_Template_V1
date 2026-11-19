#!/usr/bin/env python3
"""Transcrit un fichier audio/vidéo avec Whisper (faster-whisper, CPU).

Usage : python3 scripts/transcribe.py fichier.mp4 [--model small] [--language fr] [--srt sortie.srt]
Le modèle est téléchargé depuis huggingface.co au premier usage.
"""
import argparse

from faster_whisper import WhisperModel


def ts(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{sec:02},{ms:03}"


p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
p.add_argument("file")
p.add_argument("--model", default="small", help="tiny, base, small, medium, large-v3…")
p.add_argument("--language", default=None, help="code ISO (fr, en…) ; détection auto sinon")
p.add_argument("--srt", default=None, help="écrit aussi des sous-titres SRT")
a = p.parse_args()

model = WhisperModel(a.model, device="cpu", compute_type="int8")
segments, info = model.transcribe(a.file, language=a.language, vad_filter=True)
segments = list(segments)
print(f"# langue détectée : {info.language} ({info.language_probability:.0%})")
for s in segments:
    print(f"[{ts(s.start)} → {ts(s.end)}] {s.text.strip()}")
if a.srt:
    with open(a.srt, "w", encoding="utf-8") as f:
        for i, s in enumerate(segments, 1):
            f.write(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n\n")
