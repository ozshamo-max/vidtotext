from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from models.job import jobs
from utils.file_utils import get_output_path

router = APIRouter()


@router.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    return {
        "job_id": job.job_id,
        "status": job.status,
        "progress": job.progress,
        "stage": job.stage,
        "error": job.error,
    }


@router.get("/download/{job_id}/{fmt}")
async def download_result(job_id: str, fmt: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    if fmt not in ("txt", "srt"):
        raise HTTPException(status_code=400, detail="Invalid format. Use 'txt' or 'srt'")

    output_path = get_output_path(job_id, fmt)
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Output file not ready yet")

    job = jobs[job_id]
    base_name = Path(job.filename).stem if job.filename else job_id
    return FileResponse(
        path=str(output_path),
        filename=f"{base_name}.{fmt}",
        media_type="text/plain; charset=utf-8",
    )
