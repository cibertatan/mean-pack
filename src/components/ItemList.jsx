import { calculate } from '../utils/calculator'
import { useLang } from '../i18n'

export default function ItemList({ items, onRemove, onEdit, editingId }) {
  const { t } = useLang()
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700">{t('itemsAdded')}</h3>
        <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      {items.map((item) => {
        const result = calculate(item.product, item.quantity)
        const isEditing = editingId === item.id
        return (
          <div
            key={item.id}
            className={`flex items-center justify-between bg-white border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all shadow-sm ${
              isEditing ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate text-sm sm:text-base">
                {item.product.model}
                {item.product.series && (
                  <span className="text-gray-400 font-normal ml-1">({item.product.series})</span>
                )}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {item.quantity} {t('units')} — {result.totalBoxes} {result.totalBoxes === 1 ? t('box') : t('boxes')} — {result.totalWeight.toFixed(1)} kg
              </p>
            </div>
            <div className="flex gap-1 ml-3 shrink-0">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={t('edit')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('remove')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
