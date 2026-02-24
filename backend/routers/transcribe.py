from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from models.job import Job, JobStatus, jobs
from utils.file_utils import get_upload_path, get_wav_path, get_output_path
from services.audio_extractor import extract_audio
from services.whisper_service import transcribe
from services.formatter import to_txt, to_srt

router = APIRouter()


class TranscribeRequest(BaseModel):
    language: str = "he"


def run_transcription(job_id: str, language: str):
    job = jobs[job_id]
    try:
        # Stage 1: Extract audio
        job.status = JobStatus.EXTRACTING
        job.stage = "Extracting audio..."
        job.progress = 10

        upload_path = get_upload_path(job_id, job.filename)
        wav_path = extract_audio(upload_path, job_id)

        # Stage 2: Transcribe
        job.status = JobStatus.TRANSCRIBING
        job.stage = "Transcribing audio..."
        job.progress = 40

        segments = transcribe(wav_path, language)
        job.progress = 90

        # Stage 3: Save outputs
        job.stage = "Saving results..."
        txt_content = to_txt(segments)
        srt_content = to_srt(segments)

        get_output_path(job_id, "txt").write_text(txt_content, encoding="utf-8")
        get_output_path(job_id, "srt").write_text(srt_content, encoding="utf-8")

        # Cleanup temp WAV
        wav_path.unlink(missing_ok=True)

        job.status = JobStatus.DONE
        job.progress = 100
        job.stage = "Done!"

    except Exception as e:
        job.status = JobStatus.ERROR
        job.stage = "Error"
        job.error = str(e)


@router.post("/transcribe/{job_id}")
async def start_transcription(
    job_id: str,
    request: TranscribeRequest,
    background_tasks: BackgroundTasks,
):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job.status != JobStatus.PENDING:
        raise HTTPException(status_code=409, detail="Job already started")

    job.language = request.language
    background_tasks.add_task(run_transcription, job_id, request.language)

    return {"job_id": job_id, "status": job.status}
