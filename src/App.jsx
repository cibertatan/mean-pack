import { useState, useRef } from 'react'
import FileUploader from './components/FileUploader'
import ProductSearch from './components/ProductSearch'
import QuantityInput from './components/QuantityInput'
import ItemList from './components/ItemList'
import ResultsPanel from './components/ResultsPanel'
import { parseProductFile } from './utils/excelParser'
import { useLang } from './i18n'

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function store(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

let nextId = Date.now()

export default function App() {
  const { lang, toggleLang, t } = useLang()
  const [products, setProducts] = useState(() => loadStored('mp_products', []))
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(0)
  const [fileName, setFileName] = useState(() => loadStored('mp_fileName', null))
  const [warnings, setWarnings] = useState([])
  const [items, setItems] = useState([])
  const [editingId, setEditingId] = useState(null)

  const handleFileLoaded = async (file) => {
    const { products: parsed, warnings: warns } = await parseProductFile(file)
    setProducts(parsed)
    setWarnings(warns)
    setFileName(file.name)
    setSelectedProduct(null)
    setQuantity(0)
    setItems([])
    setEditingId(null)
    store('mp_products', parsed)
    store('mp_fileName', file.name)
  }

  const handleAdd = () => {
    if (!selectedProduct || quantity <= 0) return

    if (editingId) {
      setItems(prev => prev.map(item =>
        item.id === editingId ? { ...item, product: selectedProduct, quantity } : item
      ))
      setEditingId(null)
    } else {
      setItems(prev => [...prev, { id: nextId++, product: selectedProduct, quantity }])
    }
    setSelectedProduct(null)
    setQuantity(0)
  }

  const handleRemove = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setSelectedProduct(null)
      setQuantity(0)
    }
  }

  const formRef = useRef(null)

  const handleEdit = (item) => {
    setSelectedProduct(item.product)
    setQuantity(item.quantity)
    setEditingId(item.id)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setSelectedProduct(null)
    setQuantity(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-5 sm:space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-5 h-5">
                <path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.004 4.086a1.5 1.5 0 001.25 0l7.004-4.086a.75.75 0 000-1.294l-.825-.484-5.554 3.24a2.25 2.25 0 01-1.5.001L3.196 12.87z" />
                <path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.004 4.086a1.5 1.5 0 001.25 0l7.004-4.086a.75.75 0 000-1.294l-.825-.484-5.554 3.24a2.25 2.25 0 01-1.5.001L3.196 8.87z" />
                <path d="M10.625 2.247a1.125 1.125 0 00-1.25 0L2.371 6.333a.75.75 0 000 1.294l7.004 4.086a1.5 1.5 0 001.25 0l7.004-4.086a.75.75 0 000-1.294l-7.004-4.086z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('appTitle')}</h1>
              <p className="text-xs sm:text-sm text-gray-400">{t('appSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0 shadow-sm"
          >
            <span className={lang === 'es' ? 'font-bold text-blue-600' : ''}>ES</span>
            <span className="text-gray-300">|</span>
            <span className={lang === 'en' ? 'font-bold text-blue-600' : ''}>EN</span>
          </button>
        </header>

        <FileUploader onFileLoaded={handleFileLoaded} fileName={fileName} />

        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
            <p className="font-medium mb-1">{t('warnings')}</p>
            <ul className="list-disc list-inside space-y-0.5">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {products.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {products.length}
              </span>
              <p className="text-sm text-gray-500">{t('productsLoaded', products.length)}</p>
            </div>

            <div ref={formRef} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
              <ProductSearch
                products={products}
                selectedProduct={selectedProduct}
                onSelect={setSelectedProduct}
              />

              <QuantityInput
                quantity={quantity}
                onChange={setQuantity}
                disabled={!selectedProduct}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!selectedProduct || quantity <= 0}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm disabled:shadow-none"
                >
                  {editingId ? t('saveChanges') : t('addItem')}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    {t('cancel')}
                  </button>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <>
                <ItemList
                  items={items}
                  onRemove={handleRemove}
                  onEdit={handleEdit}
                  editingId={editingId}
                />
                <ResultsPanel items={items} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
