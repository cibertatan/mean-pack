import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
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

  const getSnapshot = () =>
    toPng(panelRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })

  const handleDownloadImage = async () => {
    if (!panelRef.current) return
    try {
      const url = await getSnapshot()
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

  const handleDownloadPdf = async () => {
    if (!panelRef.current) return
    try {
      const url = await getSnapshot()
      const img = new Image()
      img.src = url
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
      const pxW = img.width
      const pxH = img.height
      const pdfW = 190
      const pdfH = (pxH / pxW) * pdfW
      const pdf = new jsPDF({ orientation: pdfH > 270 ? 'p' : 'p', unit: 'mm', format: 'a4' })
      pdf.addImage(url, 'PNG', 10, 10, pdfW, pdfH)
      pdf.save(`mean-pack-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert(t('downloadPdfError'))
    }
  }

  return (
    <div className="space-y-3">
      <div ref={panelRef} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full" />
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">{t('orderSummary')}</h3>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="pb-2.5 font-medium">{t('model')}</th>
              <th className="pb-2.5 font-medium text-right">{t('qty')}</th>
              <th className="pb-2.5 font-medium text-right">{t('boxesHeader')}</th>
              <th className="pb-2.5 font-medium text-right">{t('weight')}</th>
              <th className="pb-2.5 font-medium text-right">{t('volume')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ id, product, quantity, result }) => (
              <tr key={id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-2.5">
                  <span className="font-medium text-gray-800">{product.model}</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {result.fullBoxes} {result.fullBoxes === 1 ? t('fullBox') : t('fullBoxes')}
                    {result.remainder > 0 && (
                      <span className="text-amber-500"> + {result.remainder} {result.remainder > 1 ? t('remainders') : t('remainder')}</span>
                    )}
                    {' '}({product.units_per_box} {t('unitsPerBox')})
                  </p>
                </td>
                <td className="py-2.5 text-right text-gray-700 align-top">{quantity}</td>
                <td className="py-2.5 text-right text-gray-700 align-top">{result.totalBoxes}</td>
                <td className="py-2.5 text-right text-gray-700 align-top">{fmt(result.totalWeight, 1, lang)}</td>
                <td className="py-2.5 text-right text-gray-700 align-top">{fmt(result.totalVolumeFt3, 2, lang)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-semibold text-gray-800">
              <td className="pt-3">{t('total')}</td>
              <td className="pt-3 text-right">{items.reduce((s, i) => s + i.quantity, 0)}</td>
              <td className="pt-3 text-right">
                <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {totals.totalBoxes}
                </span>
              </td>
              <td className="pt-3 text-right">{fmt(totals.totalWeight, 1, lang)}</td>
              <td className="pt-3 text-right">{fmt(totals.totalVolumeFt3, 2, lang)}</td>
            </tr>
          </tfoot>
        </table>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-400 space-y-0.5">
          {results.map(({ id, product, result }) => (
            <p key={id}>
              <span className="font-medium text-gray-500">{product.model}</span>: {t('boxDimensions')} {product.box_length_in}×{product.box_width_in}×{product.box_height_in} in, {product.box_weight_kg} {t('kgPerBox')}
              {result.remainder > 0 && !product.unit_weight_kg && <span className="text-amber-500"> {t('partialEstimated')}</span>}
            </p>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownloadImage}
          className="flex-1 bg-gray-800 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909-4.97-4.969a.75.75 0 00-1.06 0L2.5 11.06z" clipRule="evenodd" />
          </svg>
          PNG
        </button>
        <button
          onClick={handleDownloadPdf}
          className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
          </svg>
          PDF
        </button>
      </div>
    </div>
  )
}
