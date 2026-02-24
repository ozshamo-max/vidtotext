import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000/api' })

export const uploadVideo = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload', formData, {
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  })
}

export const startTranscription = (jobId, language) =>
  api.post(`/transcribe/${jobId}`, { language })

export const getStatus = (jobId) => api.get(`/status/${jobId}`)

export const getDownloadUrl = (jobId, fmt) =>
  `http://localhost:8000/api/download/${jobId}/${fmt}`
