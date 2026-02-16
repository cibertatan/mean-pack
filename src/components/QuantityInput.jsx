import { useLang } from '../i18n'

export default function QuantityInput({ quantity, onChange, disabled }) {
  const { t } = useLang()
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantityLabel')}</label>
      <input
        type="number"
        min="1"
        step="1"
        value={quantity}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        disabled={disabled}
        placeholder={t('quantityPlaceholder')}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
      />
    </div>
  )
}
