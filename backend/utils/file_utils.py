from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"

ALLOWED_EXTENSIONS = {".mp4", ".mkv", ".avi", ".mov", ".webm"}
MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024  # 2GB


def ensure_dirs():
    UPLOADS_DIR.mkdir(exist_ok=True)
    OUTPUTS_DIR.mkdir(exist_ok=True)


def get_upload_path(job_id: str, filename: str) -> Path:
    suffix = Path(filename).suffix.lower()
    return UPLOADS_DIR / f"{job_id}{suffix}"


def get_wav_path(job_id: str) -> Path:
    return UPLOADS_DIR / f"{job_id}.wav"


def get_output_path(job_id: str, fmt: str) -> Path:
    return OUTPUTS_DIR / f"{job_id}.{fmt}"


def is_allowed_extension(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS
