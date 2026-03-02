import { useState, useRef } from 'react'
import FileUploader from './components/FileUploader'
import ProductSearch from './components/ProductSearch'
import QuantityInput from './components/QuantityInput'
import ItemList from './components/ItemList'
import ResultsPanel from './components/ResultsPanel'
import PriceCalculator from './components/PriceCalculator'
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
  const [activeTab, setActiveTab] = useState('box')
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

  const handleClearFile = () => {
    setProducts([])
    setFileName(null)
    setSelectedProduct(null)
    setQuantity(0)
    setWarnings([])
    setItems([])
    setEditingId(null)
    localStorage.removeItem('mp_products')
    localStorage.removeItem('mp_fileName')
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

        {/* Tab switcher */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm gap-1">
          <button
            onClick={() => setActiveTab('box')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'box'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.004 4.086a1.5 1.5 0 001.25 0l7.004-4.086a.75.75 0 000-1.294l-.825-.484-5.554 3.24a2.25 2.25 0 01-1.5.001L3.196 12.87z" />
              <path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.004 4.086a1.5 1.5 0 001.25 0l7.004-4.086a.75.75 0 000-1.294l-.825-.484-5.554 3.24a2.25 2.25 0 01-1.5.001L3.196 8.87z" />
              <path d="M10.625 2.247a1.125 1.125 0 00-1.25 0L2.371 6.333a.75.75 0 000 1.294l7.004 4.086a1.5 1.5 0 001.25 0l7.004-4.086a.75.75 0 000-1.294l-7.004-4.086z" />
            </svg>
            Box Calculator
          </button>
          <button
            onClick={() => setActiveTab('price')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'price'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 001.192-.91C12.637 5.55 11.596 5 10.5 5c-1.096 0-2.137.55-2.894 1.54A5.205 5.205 0 006.94 8H6.25a.75.75 0 000 1.5h.42a6.442 6.442 0 000 1h-.42a.75.75 0 000 1.5h.69c.163.48.377.93.646 1.34.757.99 1.798 1.66 2.914 1.66 1.096 0 2.137-.55 2.894-1.54a.75.75 0 00-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95a3.505 3.505 0 01-.39-.55h1.342a.75.75 0 000-1.5H8.026a4.942 4.942 0 010-1h1.724a.75.75 0 000-1.5H8.408c.1-.18.214-.37.39-.55z" clipRule="evenodd" />
            </svg>
            Price Calculator
          </button>
        </div>

        {/* Box Calculator tab */}
        {activeTab === 'box' && (
          <>
            <FileUploader onFileLoaded={handleFileLoaded} onClear={handleClearFile} fileName={fileName} productCount={products.length} />

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
          </>
        )}

        {/* Price Calculator tab */}
        {activeTab === 'price' && <PriceCalculator />}
      </div>
    </div>
  )
}
