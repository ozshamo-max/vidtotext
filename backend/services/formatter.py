from typing import List


def format_seconds(seconds: float) -> str:
    """Convert seconds to SRT timestamp format: HH:MM:SS,mmm"""
    ms = int((seconds % 1) * 1000)
    s = int(seconds) % 60
    m = (int(seconds) // 60) % 60
    h = int(seconds) // 3600
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def to_txt(segments: List[dict]) -> str:
    """Generate plain text transcript."""
    return " ".join(seg["text"].strip() for seg in segments)


def to_srt(segments: List[dict]) -> str:
    """Generate SRT subtitle file content."""
    blocks = []
    for i, seg in enumerate(segments, start=1):
        start = format_seconds(seg["start"])
        end = format_seconds(seg["end"])
        text = seg["text"].strip()
        blocks.append(f"{i}\n{start} --> {end}\n{text}")
    return "\n\n".join(blocks)
