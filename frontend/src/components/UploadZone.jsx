import { useRef, useState } from 'react'

const ALLOWED = ['.mp4', '.mkv', '.avi', '.mov', '.webm']

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadZone({ onFile, disabled }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const inputRef = useRef()

  const validate = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ALLOWED.includes(ext)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED.join(', ')}`)
      return false
    }
    setError('')
    return true
  }

  const handleFile = (f) => {
    if (!f || disabled) return
    if (!validate(f)) return
    setFile(f)
    onFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={[
          'border-2 border-dashed rounded-xl p-10 text-center transition-colors',
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          !disabled && !file ? 'hover:border-blue-400 cursor-pointer' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          file ? 'bg-green-50 border-green-400' : '',
        ].join(' ')}
      >
        {file ? (
          <div>
            <div className="text-4xl mb-2">🎬</div>
            <p className="font-semibold text-green-700 break-all">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600 font-medium">Drag &amp; drop your video here</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">{ALLOWED.join(' · ')}</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
