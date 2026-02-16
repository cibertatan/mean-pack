import { useCallback, useState } from 'react'

export default function FileUploader({ onFileLoaded, fileName }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = useCallback(async (file) => {
    setError(null)
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Solo se aceptan archivos .xlsx o .xls')
      return
    }
    try {
      await onFileLoaded(file)
    } catch (err) {
      setError(err.message)
    }
  }, [onFileLoaded])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => setDragOver(false), [])

  const onInputChange = useCallback((e) => {
    handleFile(e.target.files[0])
    e.target.value = ''
  }, [handleFile])

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : fileName
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={onInputChange}
        />
        {fileName ? (
          <div>
            <p className="text-green-700 font-medium">{fileName}</p>
            <p className="text-sm text-gray-500 mt-1">Click o arrastra otro archivo para reemplazar</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 font-medium">Arrastra tu archivo Excel aquí</p>
            <p className="text-sm text-gray-400 mt-1">o haz click para seleccionar</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <p className="text-xs text-gray-400">
        ¿No tienes archivo?{' '}
        <a href="/mean-pack-template.xlsx" download className="text-blue-500 hover:underline">
          Descarga el template
        </a>
      </p>
    </div>
  )
}
