import ffmpeg
from pathlib import Path

from utils.file_utils import get_wav_path


def extract_audio(input_path: Path, job_id: str) -> Path:
    """Extract audio from video file as 16kHz mono WAV."""
    output_path = get_wav_path(job_id)

    try:
        (
            ffmpeg
            .input(str(input_path))
            .output(str(output_path), ar=16000, ac=1, f="wav")
            .overwrite_output()
            .run(quiet=True)
        )
    except ffmpeg.Error as e:
        stderr = e.stderr.decode() if e.stderr else "unknown error"
        raise RuntimeError(f"FFmpeg audio extraction failed: {stderr}")

    return output_path
