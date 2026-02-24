from fastapi import APIRouter, UploadFile, File, HTTPException

from models.job import Job, jobs
from utils.file_utils import get_upload_path, is_allowed_extension, MAX_FILE_SIZE

router = APIRouter()


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename or not is_allowed_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed: .mp4, .mkv, .avi, .mov, .webm",
        )

    job = Job(filename=file.filename)
    jobs[job.job_id] = job

    upload_path = get_upload_path(job.job_id, file.filename)
    size = 0

    try:
        with open(upload_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    upload_path.unlink(missing_ok=True)
                    del jobs[job.job_id]
                    raise HTTPException(status_code=413, detail="File too large (max 2 GB)")
                f.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        upload_path.unlink(missing_ok=True)
        del jobs[job.job_id]
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    return {"job_id": job.job_id}
