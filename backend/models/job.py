from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import uuid


class JobStatus(str, Enum):
    PENDING = "pending"
    EXTRACTING = "extracting"
    TRANSCRIBING = "transcribing"
    DONE = "done"
    ERROR = "error"


@dataclass
class Job:
    job_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    status: JobStatus = JobStatus.PENDING
    progress: int = 0
    stage: str = "Waiting to start..."
    error: Optional[str] = None
    language: Optional[str] = None
    filename: Optional[str] = None


# In-memory job store
jobs: dict[str, Job] = {}
