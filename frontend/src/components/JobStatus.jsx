const ICONS = {
  pending: '⏳',
  extracting: '🔊',
  transcribing: '🤖',
  done: '✅',
  error: '❌',
}

export default function JobStatus({ status, progress, stage, error }) {
  const icon = ICONS[status] ?? '⏳'
  const isError = status === 'error'
  const isDone = status === 'done'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className={`font-medium ${isError ? 'text-red-600' : isDone ? 'text-green-600' : 'text-gray-700'}`}>
          {stage}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${isError ? 'bg-red-500' : isDone ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-right text-sm text-gray-500">{progress}%</p>

      {isError && error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  )
}
