import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { calculate } from '../utils/calculator'
import { useLang } from '../i18n'

const locales = { es: 'es-CL', en: 'en-US' }

function fmt(n, decimals = 2, lang = 'es') {
  return Number(n).toLocaleString(locales[lang] || 'es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function ResultsPanel({ items }) {
  const { lang, t } = useLang()
  const panelRef = useRef(null)

  if (!items || items.length === 0) return null

  const results = items.map(item => ({
    ...item,
    result: calculate(item.product, item.quantity),
  }))

  const totals = results.reduce((acc, { result }) => ({
    totalBoxes: acc.totalBoxes + result.totalBoxes,
    totalWeight: acc.totalWeight + result.totalWeight,
    totalVolumeFt3: acc.totalVolumeFt3 + result.totalVolumeFt3,
  }), { totalBoxes: 0, totalWeight: 0, totalVolumeFt3: 0 })

  const handleDownload = async () => {
    if (!panelRef.current) return
    try {
      const url = await toPng(panelRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })
      const a = document.createElement('a')
      a.href = url
      a.download = `mean-pack-${new Date().toISOString().slice(0, 10)}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error generating image:', err)
      alert(t('downloadError'))
    }
  }

  return (
    <div className="space-y-3">
      <div ref={panelRef} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800">{t('orderSummary')}</h3>

        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-5 sm:px-5">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">{t('model')}</th>
              <th className="pb-2 font-medium text-right">{t('qty')}</th>
              <th className="pb-2 font-medium text-right">{t('boxesHeader')}</th>
              <th className="pb-2 font-medium text-right">{t('weight')}</th>
              <th className="pb-2 font-medium text-right">{t('volume')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ id, product, quantity, result }) => (
              <tr key={id} className="border-b border-gray-100">
                <td className="py-2">
                  <span className="font-medium text-gray-800">{product.model}</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {result.fullBoxes} {result.fullBoxes === 1 ? t('fullBox') : t('fullBoxes')}
                    {result.remainder > 0 && ` + ${result.remainder} ${result.remainder > 1 ? t('remainders') : t('remainder')}`}
                    {' '}({product.units_per_box} {t('unitsPerBox')})
                  </p>
                </td>
                <td className="py-2 text-right text-gray-700 align-top">{quantity}</td>
                <td className="py-2 text-right text-gray-700 align-top">{result.totalBoxes}</td>
                <td className="py-2 text-right text-gray-700 align-top">{fmt(result.totalWeight, 1, lang)}</td>
                <td className="py-2 text-right text-gray-700 align-top">{fmt(result.totalVolumeFt3, 2, lang)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-semibold text-gray-800">
              <td className="pt-3">{t('total')}</td>
              <td className="pt-3 text-right">{items.reduce((s, i) => s + i.quantity, 0)}</td>
              <td className="pt-3 text-right text-blue-600">{totals.totalBoxes}</td>
              <td className="pt-3 text-right">{fmt(totals.totalWeight, 1, lang)}</td>
              <td className="pt-3 text-right">{fmt(totals.totalVolumeFt3, 2, lang)}</td>
            </tr>
          </tfoot>
        </table>
        </div>

        <div className="text-xs text-gray-400 space-y-0.5 pt-1">
          {results.map(({ id, product, result }) => (
            <p key={id}>
              {product.model}: {t('boxDimensions')} {product.box_length_in}×{product.box_width_in}×{product.box_height_in} in, {product.box_weight_kg} {t('kgPerBox')}
              {result.remainder > 0 && !product.unit_weight_kg && ` ${t('partialEstimated')}`}
            </p>
          ))}
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full bg-gray-800 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
        </svg>
        {t('downloadImage')}
      </button>
    </div>
  )
}
