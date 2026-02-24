import { getDownloadUrl } from '../api/client'

export default function ResultsPanel({ jobId, filename }) {
  const baseName = filename ? filename.replace(/\.[^/.]+$/, '') : 'transcript'

  return (
    <div className="space-y-3">
      <p className="text-green-700 font-semibold text-center text-lg">
        ✅ Transcription complete!
      </p>
      <div className="flex gap-3">
        <a
          href={getDownloadUrl(jobId, 'txt')}
          download={`${baseName}.txt`}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          📄 Download TXT
        </a>
        <a
          href={getDownloadUrl(jobId, 'srt')}
          download={`${baseName}.srt`}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
        >
          🎬 Download SRT
        </a>
      </div>
    </div>
  )
}
