import { useCallback, useState } from 'react'
import { useLang } from '../i18n'

export default function FileUploader({ onFileLoaded, onClear, fileName }) {
  const { t } = useLang()
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = useCallback(async (file) => {
    setError(null)
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setError(t('fileError'))
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
    <div className="space-y-2">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : fileName
              ? 'border-green-400 bg-green-50/50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
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
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {fileName}
              <button
                onClick={(e) => { e.stopPropagation(); onClear() }}
                className="ml-1 p-0.5 rounded-full hover:bg-green-200 transition-colors"
                title={t('fileClear')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400">{t('fileReplace')}</p>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-gray-400">
                <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">{t('fileDrag')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('fileClick')}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      <p className="text-xs text-gray-400 text-center">
        {t('fileNoFile')}{' '}
        <a href={import.meta.env.BASE_URL + 'mean-pack-template.xlsx'} download className="text-blue-500 hover:underline font-medium">
          {t('fileDownload')}
        </a>
      </p>
    </div>
  )
}
