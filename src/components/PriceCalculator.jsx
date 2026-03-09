import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { useLang } from '../i18n'

// ── Company letterhead info ───────────────────────────────────────────────────
const COMPANY = {
  name: 'MEAN WELL',
  tagline: 'POWER SUPPLY',
  address1: '9675 NW 174th ST Suite 400,',
  address2: 'Miami, Florida, 33018, U.S.A.',
  phone: '+1-305-432-1030',
}
// ─────────────────────────────────────────────────────────────────────────────

const INCOTERMS_OPTIONS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']


function calcResults(f) {
  const cost = parseFloat(f.cost) || 0
  const qty = parseInt(f.totalSaleQty) || 0
  const weightPerBox = parseFloat(f.weightPerBox) || 0
  const pcsPerBox = Math.max(parseInt(f.pcsPerBox) || 1, 1)
  const profitPct = parseFloat(f.profitPct) || 0
  const taxPct = parseFloat(f.taxPct) || 0
  const shippingPerKg = parseFloat(f.shippingCostPerKg) || 0

  const totalBoxes = qty / pcsPerBox
  const totalWeight = totalBoxes * weightPerBox
  const shippingCost = shippingPerKg * totalWeight
  const shippingPerUnit = qty > 0 ? shippingCost / qty : 0

  const unitCostWithProfit = cost * (1 + profitPct / 100)
  const unitTax = unitCostWithProfit * (taxPct / 100)
  const unitPrice = unitCostWithProfit + unitTax + shippingPerUnit

  const shippingToCustomers = parseFloat(f.shippingToCustomers) || 0
  const subtotal = unitPrice * qty
  const grandTotal = subtotal + shippingToCustomers
  const totalProfit = (unitCostWithProfit - cost) * qty

  return { shippingToCustomers, unitPrice, subtotal, grandTotal, totalProfit, totalWeight, totalBoxes }
}

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="[&_input]:w-full [&_input]:border [&_input]:border-gray-200 [&_input]:rounded-lg [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-gray-800 [&_input]:bg-gray-50 [&_input]:outline-none [&_input:focus]:border-blue-400 [&_input:focus]:bg-white [&_input:focus]:ring-2 [&_input:focus]:ring-blue-100 [&_input]:transition-all [&_select]:w-full [&_select]:border [&_select]:border-gray-200 [&_select]:rounded-lg [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_select]:text-gray-800 [&_select]:bg-gray-50 [&_select]:outline-none [&_select:focus]:border-blue-400 [&_select:focus]:bg-white [&_select:focus]:ring-2 [&_select:focus]:ring-blue-100 [&_select]:transition-all">
        {children}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-blue-600 rounded-full" />
        <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ResultRow({ label, value, highlight, big, profit }) {
  if (big) {
    return (
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <span className="font-bold text-blue-800 text-sm">{label}</span>
        <span className="font-bold text-blue-700 text-lg">{value}</span>
      </div>
    )
  }
  if (profit) {
    return (
      <div className="flex items-center justify-between px-1">
        <span className="font-medium text-emerald-700 text-sm">{label}</span>
        <span className="font-semibold text-emerald-600 text-sm">{value}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between px-1">
      <span className={`text-sm ${highlight ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{value}</span>
    </div>
  )
}

export default function PriceCalculator() {
  const { t } = useLang()
  const [form, setForm] = useState({
    model: '',
    cost: '',
    totalSaleQty: '',
    weightPerBox: '',
    pcsPerBox: '',
    profitPct: '',
    taxPct: '',
    shippingCostPerKg: '',
    deliveryTime: '',
    shippingMethod: '',
    shippingToCustomers: '',
    incoterms: '',
  })

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const hasInputs = form.cost && form.totalSaleQty && form.pcsPerBox
  const res = hasInputs ? calcResults(form) : null

  const handleDownloadPdf = async () => {
    if (!res) return
    try {
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    // ── Letterhead ────────────────────────────────────────────────────
    // Load logo from public folder
    let logoDataUrl = null
    try {
      const resp = await fetch(import.meta.env.BASE_URL + 'logo.jpg')
      if (!resp.ok) throw new Error('logo not found')
      const blob = await resp.blob()
      logoDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (_) { /* logo missing, skip */ }

    // White header area with light border bottom
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageW, 55, 'F')
    pdf.setDrawColor(226, 232, 240)
    pdf.setLineWidth(0.5)
    pdf.line(0, 55, pageW, 55)

    // Logo on the left
    const logoW = 44
    const logoH = 25
    const logoX = 12
    const logoY = 9
    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, 'JPEG', logoX, logoY, logoW, logoH)
    }

    // Company text to the right of logo
    const textX = logoX + logoW + 5
    pdf.setTextColor(20, 20, 20)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(COMPANY.name, textX, 15)

    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(20, 20, 20)
    pdf.text(COMPANY.tagline, textX, 20)

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(90, 90, 90)
    pdf.text(COMPANY.address1, textX, 25)
    pdf.text(COMPANY.address2, textX, 29)
    pdf.text(`Tel: ${COMPANY.phone}`, textX, 33)

    // ── Quotation title & date ────────────────────────────────────────
    pdf.setTextColor(30, 64, 175)
    pdf.setFontSize(15)
    pdf.setFont('helvetica', 'bold')
    pdf.text('SALES QUOTATION', 14, 62)

    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Date: ${today}`, 14, 68)

    // ── Divider ───────────────────────────────────────────────────────
    pdf.setDrawColor(226, 232, 240)
    pdf.setLineWidth(0.4)
    pdf.line(14, 73, pageW - 14, 73)

    // ── Body rows ─────────────────────────────────────────────────────
    let y = 83

    const labelX = 14
    const valueX = 90

    const infoRows = [
      ['MODEL', form.model || '—'],
      ['TOTAL SALE QUANTITY', `${fmt(parseInt(form.totalSaleQty) || 0, 0)} units`],
      ['WEIGHT PER BOX', form.weightPerBox ? `${form.weightPerBox} kg` : '—'],
      ['PCS PER BOX', form.pcsPerBox || '—'],
      ['TOTAL WEIGHT', `${fmt(res.totalWeight)} kg`],
      ['DELIVERY TIME', form.deliveryTime || '—'],
      ['SHIPPING METHOD', form.shippingMethod || '—'],
      ['INCOTERMS', form.incoterms || '—'],
    ]

    pdf.setFontSize(9.5)
    infoRows.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(71, 85, 105)
      pdf.text(label, labelX, y)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(15, 23, 42)
      pdf.text(String(value), valueX, y)

      y += 9
    })

    // ── Pricing section ───────────────────────────────────────────────
    y += 4
    pdf.setDrawColor(226, 232, 240)
    pdf.line(14, y, pageW - 14, y)
    y += 10

    const priceRows = [
      { label: 'UNIT PRICE', value: `$ ${fmt(res.unitPrice)}`, big: false },
      { label: 'SUBTOTAL', value: `$ ${fmt(res.subtotal)}`, big: false },
      { label: 'SHIPPING COST', value: `$ ${fmt(res.shippingToCustomers)}`, big: false },
      { label: 'GRAND TOTAL', value: `$ ${fmt(res.grandTotal)}`, big: true },
    ]

    priceRows.forEach(({ label, value, big }) => {
      if (big) {
        pdf.setFillColor(239, 246, 255)
        pdf.rect(12, y - 6, pageW - 24, 11, 'F')
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(30, 64, 175)
      } else {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(71, 85, 105)
      }
      pdf.text(label, labelX, y)
      pdf.text(value, pageW - 14, y, { align: 'right' })
      y += big ? 13 : 10
    })

    // ── Footer ────────────────────────────────────────────────────────
    const footerY = pageH - 18
    pdf.setDrawColor(226, 232, 240)
    pdf.line(14, footerY - 5, pageW - 14, footerY - 5)

    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(148, 163, 184)
    pdf.text(
      'This quotation is valid for 3 days only due to inventory movement and sales activity.',
      pageW / 2,
      footerY,
      { align: 'center' },
    )
    pdf.text(
      `Thank you for your business — ${COMPANY.name}`,
      pageW / 2,
      footerY + 5,
      { align: 'center' },
    )

    const modelSlug = (form.model || 'product').replace(/\s+/g, '-').toLowerCase()
    pdf.save(`quotation-${modelSlug}-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('Could not generate PDF: ' + (err?.message || err))
    }
  }

  return (
    <div className="space-y-5">

      {/* Product Information */}
      <Section title={t('pcProductInfo')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('pcModel')}>
            <input
              type="text"
              value={form.model}
              onChange={set('model')}
              placeholder="e.g. RSP-500-24"
            />
          </Field>
          <Field label={t('pcCost')}>
            <input
              type="number"
              value={form.cost}
              onChange={set('cost')}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </Field>
          <Field label={t('pcTotalSaleQty')}>
            <input
              type="number"
              value={form.totalSaleQty}
              onChange={set('totalSaleQty')}
              placeholder="0"
              min="0"
            />
          </Field>
          <Field label={t('pcPcsPerBox')}>
            <input
              type="number"
              value={form.pcsPerBox}
              onChange={set('pcsPerBox')}
              placeholder="0"
              min="1"
            />
          </Field>
          <Field label={t('pcWeightPerBox')}>
            <input
              type="number"
              value={form.weightPerBox}
              onChange={set('weightPerBox')}
              placeholder="0.00"
              min="0"
              step="0.1"
            />
          </Field>
        </div>
      </Section>

      {/* Pricing */}
      <Section title={t('pcPricing')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('pcProfitPct')}>
            <input
              type="number"
              value={form.profitPct}
              onChange={set('profitPct')}
              placeholder="0"
              min="0"
              max="1000"
              step="0.1"
            />
          </Field>
          <Field label={t('pcTaxPct')}>
            <input
              type="number"
              value={form.taxPct}
              onChange={set('taxPct')}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </Field>
        </div>
      </Section>

      {/* Shipping & Logistics */}
      <Section title={t('pcShipping')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('pcShippingCostPerKg')}>
            <input
              type="number"
              value={form.shippingCostPerKg}
              onChange={set('shippingCostPerKg')}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </Field>
          <Field label={t('pcDeliveryTime')}>
            <input
              type="text"
              value={form.deliveryTime}
              onChange={set('deliveryTime')}
              placeholder="e.g. 15–20 days"
            />
          </Field>
          <Field label={t('pcShippingMethod')}>
            <input
              type="text"
              value={form.shippingMethod}
              onChange={set('shippingMethod')}
              placeholder="e.g. Air, Sea, Express Courier"
            />
          </Field>
          <Field label="Shipping to Customers (USD)">
            <input
              type="number"
              value={form.shippingToCustomers}
              onChange={set('shippingToCustomers')}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </Field>
          <Field label={t('pcIncoterms')}>
            <select value={form.incoterms} onChange={set('incoterms')}>
              <option value="">{t('pcSelect')}</option>
              {INCOTERMS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Results */}
      {res && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <h3 className="font-semibold text-base sm:text-lg text-gray-800">{t('pcResults')}</h3>
          </div>

          <div className="space-y-2">
            <div className="border-t border-gray-100 pt-2 space-y-2">
              {res.totalWeight > 0 && (
                <ResultRow label="Total Weight" value={`${fmt(res.totalWeight)} kg`} highlight />
              )}
              <ResultRow label={t('pcUnitPrice')} value={`$ ${fmt(res.unitPrice)}`} highlight />
              {res.shippingToCustomers > 0 && (
                <ResultRow label="Shipping to Customers" value={`$ ${fmt(res.shippingToCustomers)}`} highlight />
              )}
              <ResultRow label={t('pcGrandTotal')} value={`$ ${fmt(res.grandTotal)}`} big />
            </div>
            <div className="border-t border-gray-100 pt-2">
              <ResultRow label={t('pcTotalProfit')} value={`$ ${fmt(res.totalProfit)}`} profit />
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            className="w-full mt-1 bg-red-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
            </svg>
            {t('pcDownloadPdf')}
          </button>
        </div>
      )}

      {!hasInputs && (
        <p className="text-center text-sm text-gray-400 py-4">
          {t('pcFillHint')}
        </p>
      )}
    </div>
  )
}
