import { useState, useEffect, useRef } from 'react'
import UploadZone from './components/UploadZone'
import LanguageSelector from './components/LanguageSelector'
import JobStatus from './components/JobStatus'
import ResultsPanel from './components/ResultsPanel'
import { uploadVideo, startTranscription, getStatus } from './api/client'

const INITIAL_JOB = { status: 'pending', progress: 0, stage: '', error: null }

export default function App() {
  const [file, setFile] = useState(null)
  const [language, setLanguage] = useState('he')
  // phase: 'idle' | 'uploading' | 'ready' | 'working' | 'done' | 'error'
  const [phase, setPhase] = useState('idle')
  const [jobId, setJobId] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [jobStatus, setJobStatus] = useState(INITIAL_JOB)
  const pollRef = useRef(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // Clean up on unmount
  useEffect(() => () => stopPolling(), [])

  const handleFile = async (f) => {
    setFile(f)
    setPhase('uploading')
    setUploadProgress(0)
    try {
      const res = await uploadVideo(f, setUploadProgress)
      setJobId(res.data.job_id)
      setPhase('ready')
    } catch (err) {
      setPhase('error')
      setJobStatus({
        status: 'error',
        progress: 0,
        stage: 'Upload failed',
        error: err.response?.data?.detail ?? err.message,
      })
    }
  }

  const handleStart = async () => {
    setPhase('working')
    setJobStatus({ status: 'pending', progress: 0, stage: 'Starting...', error: null })

    try {
      await startTranscription(jobId, language)
    } catch (err) {
      setPhase('error')
      setJobStatus({
        status: 'error',
        progress: 0,
        stage: 'Failed to start transcription',
        error: err.response?.data?.detail ?? err.message,
      })
      return
    }

    // Poll every 2 seconds
    pollRef.current = setInterval(async () => {
      try {
        const res = await getStatus(jobId)
        const s = res.data
        setJobStatus(s)
        if (s.status === 'done') {
          stopPolling()
          setPhase('done')
        } else if (s.status === 'error') {
          stopPolling()
          setPhase('error')
        }
      } catch {
        // network blip — keep polling
      }
    }, 2000)
  }

  const handleReset = () => {
    stopPolling()
    setFile(null)
    setLanguage('he')
    setPhase('idle')
    setJobId(null)
    setUploadProgress(0)
    setJobStatus(INITIAL_JOB)
  }

  const isWorking = phase === 'uploading' || phase === 'working'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">🎬 Video Transcriber</h1>
          <p className="text-gray-500 mt-1 text-sm">Upload a video · Get Hebrew or English text</p>
        </div>

        {/* Upload zone — always visible */}
        <UploadZone onFile={handleFile} disabled={isWorking || phase === 'done'} />

        {/* Upload progress bar */}
        {phase === 'uploading' && (
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Uploading… {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Language selector */}
        {(phase === 'ready' || phase === 'working' || phase === 'done') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Transcription language</label>
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isWorking || phase === 'done'}
            />
          </div>
        )}

        {/* Start button */}
        {phase === 'ready' && (
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow"
          >
            Start Transcription
          </button>
        )}

        {/* Job status (working or error) */}
        {(phase === 'working' || phase === 'error') && (
          <JobStatus
            status={jobStatus.status}
            progress={jobStatus.progress}
            stage={jobStatus.stage}
            error={jobStatus.error}
          />
        )}

        {/* Results */}
        {phase === 'done' && (
          <ResultsPanel jobId={jobId} filename={file?.name} />
        )}

        {/* Reset / Start over */}
        {(phase === 'done' || phase === 'error') && (
          <button
            onClick={handleReset}
            className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
          >
            ↩ Start over
          </button>
        )}

      </div>
    </div>
  )
}
