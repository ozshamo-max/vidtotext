import os
import whisper
from pathlib import Path
from typing import List

_model = None


def get_model():
    global _model
    if _model is None:
        model_name = os.environ.get("WHISPER_MODEL", "medium")
        _model = whisper.load_model(model_name)
    return _model


def transcribe(audio_path: Path, language: str) -> List[dict]:
    """Transcribe audio file using Whisper. Returns list of segments."""
    model = get_model()
    result = model.transcribe(str(audio_path), language=language)
    return result["segments"]
