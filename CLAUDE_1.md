# 🎬 Video Transcription System — CLAUDE.md

## Project Overview

A web-based system that transcribes audio from video files using **OpenAI Whisper (local)**
and outputs transcriptions in **Hebrew or English** as **TXT** and **SRT** files.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Backend      | Python 3.11+ with FastAPI           |
| STT Engine   | OpenAI Whisper (local, `openai-whisper`) |
| Audio Extract| FFmpeg via `ffmpeg-python`          |
| Frontend     | React + Vite + TailwindCSS          |
| File Storage | Local filesystem (uploads/outputs)  |
| Task Queue   | Background tasks via FastAPI        |

---

## Project Structure

```
video-transcriber/
├── CLAUDE.md                  ← this file
├── backend/
│   ├── main.py                ← FastAPI app entry point
│   ├── routers/
│   │   ├── upload.py          ← POST /upload endpoint
│   │   ├── transcribe.py      ← POST /transcribe endpoint
│   │   └── status.py          ← GET /status/{job_id}
│   ├── services/
│   │   ├── whisper_service.py ← Whisper transcription logic
│   │   ├── audio_extractor.py ← FFmpeg audio extraction
│   │   └── formatter.py       ← TXT and SRT output formatting
│   ├── models/
│   │   └── job.py             ← Job state dataclass
│   ├── utils/
│   │   └── file_utils.py      ← File management helpers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── UploadZone.jsx     ← Drag & drop video upload
│   │   │   ├── LanguageSelector.jsx ← Hebrew / English toggle
│   │   │   ├── JobStatus.jsx      ← Progress indicator
│   │   │   └── ResultsPanel.jsx   ← Download TXT / SRT buttons
│   │   └── api/
│   │       └── client.js          ← Axios API calls
│   ├── index.html
│   └── package.json
├── uploads/                   ← Temp video files (gitignored)
├── outputs/                   ← Generated TXT/SRT files (gitignored)
└── docker-compose.yml         ← Optional: containerize the app
```

---

## Core Features

### 1. Video Upload
- Drag & drop or file picker in the browser
- Supported formats: `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`
- Max file size: 2GB
- Uploaded files saved to `uploads/` with a UUID job ID

### 2. Audio Extraction
- Use **FFmpeg** to extract audio from the video as `.wav` (16kHz mono)
- Command: `ffmpeg -i input.mp4 -ar 16000 -ac 1 -f wav output.wav`

### 3. Transcription with Whisper
- Load model: `whisper.load_model("medium")` — good balance of speed and accuracy
- Run: `model.transcribe(audio_path, language="he")` or `language="en"`
- Returns: segments with `start`, `end`, `text` timestamps

### 4. Output Formatting

**TXT format:**
```
This is the transcribed text of the video, flowing naturally
as a paragraph without timestamps.
```

**SRT format:**
```
1
00:00:01,000 --> 00:00:04,500
This is the first subtitle line.

2
00:00:04,500 --> 00:00:08,200
And this is the second line.
```

### 5. Job Status & Progress
- Each transcription job has a UUID and a status: `pending → extracting → transcribing → done → error`
- Frontend polls `GET /status/{job_id}` every 2 seconds
- Show a progress bar and current stage in the UI

### 6. Download Results
- After completion, show download buttons for `.txt` and `.srt`
- Files served via `GET /download/{job_id}/{format}`

---

## API Endpoints

| Method | Path                          | Description                         |
|--------|-------------------------------|-------------------------------------|
| POST   | `/api/upload`                 | Upload video file, returns `job_id` |
| POST   | `/api/transcribe/{job_id}`    | Start transcription job             |
| GET    | `/api/status/{job_id}`        | Poll job status and progress        |
| GET    | `/api/download/{job_id}/txt`  | Download TXT result                 |
| GET    | `/api/download/{job_id}/srt`  | Download SRT result                 |

### Request — POST /api/transcribe/{job_id}
```json
{
  "language": "he"
}
```

### Response — GET /api/status/{job_id}
```json
{
  "job_id": "uuid-here",
  "status": "transcribing",
  "progress": 65,
  "stage": "Transcribing audio...",
  "error": null
}
```

---

## Implementation Plan (Ordered Steps)

### Phase 1 — Backend Foundation
1. Create `backend/` with FastAPI app skeleton
2. Install dependencies: `fastapi`, `uvicorn`, `openai-whisper`, `ffmpeg-python`, `python-multipart`
3. Implement `audio_extractor.py` — FFmpeg wrapper
4. Implement `whisper_service.py` — Whisper transcription
5. Implement `formatter.py` — TXT and SRT generation
6. Implement `job.py` — in-memory job store (dict with UUID keys)
7. Wire up all routers: upload, transcribe, status, download
8. Test backend with `curl` or Postman

### Phase 2 — Frontend
9. Scaffold React app: `npm create vite@latest frontend -- --template react`
10. Install: `axios`, `tailwindcss`
11. Build `UploadZone.jsx` — drag & drop, shows filename + size
12. Build `LanguageSelector.jsx` — two buttons: 🇮🇱 עברית / 🇬🇧 English
13. Build `JobStatus.jsx` — progress bar with stage text
14. Build `ResultsPanel.jsx` — download buttons for TXT + SRT
15. Wire up `api/client.js` with all API calls
16. Connect all components in `App.jsx`

### Phase 3 — Integration & Polish
17. Test full flow: upload → transcribe → download
18. Handle errors: wrong file type, Whisper failure, FFmpeg not found
19. Add file size validation on frontend
20. Add CORS configuration to FastAPI
21. (Optional) Add `docker-compose.yml` for easy deployment

---

## Environment Requirements

```bash
# System dependencies
brew install ffmpeg          # macOS
# OR
sudo apt install ffmpeg      # Ubuntu/Debian

# Python dependencies
pip install fastapi uvicorn openai-whisper ffmpeg-python python-multipart

# Node dependencies (frontend)
npm install
```

---

## Key Implementation Notes for Claude Code

- **Whisper is slow** — always run transcription in a `BackgroundTask` (FastAPI) so the HTTP request returns immediately with a `job_id`
- **Hebrew support** — Whisper supports Hebrew natively with `language="he"`. RTL text in the SRT file will display correctly in most subtitle players.
- **Whisper model size** — default to `"medium"` model. Allow override via env var `WHISPER_MODEL=large`
- **In-memory job store** is fine for MVP. Do NOT add a database unless asked.
- **FFmpeg must be installed** on the host system — check at startup and raise a clear error if missing
- **Do NOT use `subprocess` directly** for FFmpeg — use `ffmpeg-python` library for clean API
- **Frontend polling** — use `setInterval` with 2-second delay, clear it when status is `done` or `error`
- **File cleanup** — delete temp `.wav` files after transcription completes to save disk space

---

## Out of Scope (Do NOT implement unless asked)
- User authentication / login
- Database (SQLite, PostgreSQL, etc.)
- Translation (this system transcribes, not translates)
- Speaker diarization (who said what)
- Cloud deployment
- Multiple simultaneous jobs per session

---

## How to Run

```bash
# Terminal 1 — Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → opens at http://localhost:5173
```

---

## Definition of Done

- [ ] User can upload a video file via drag & drop
- [ ] User can select Hebrew or English
- [ ] Progress is shown during transcription  
- [ ] TXT file is downloadable after completion
- [ ] SRT file is downloadable after completion
- [ ] Errors are shown clearly in the UI
