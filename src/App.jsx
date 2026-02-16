import { useState, useRef } from 'react'
import FileUploader from './components/FileUploader'
import ProductSearch from './components/ProductSearch'
import QuantityInput from './components/QuantityInput'
import ItemList from './components/ItemList'
import ResultsPanel from './components/ResultsPanel'
import { parseProductFile } from './utils/excelParser'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-800">Mean Pack</h1>
          <p className="text-sm text-gray-500">Calculadora de cajas Mean Well</p>
        </header>

        <FileUploader onFileLoaded={handleFileLoaded} fileName={fileName} />

        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            <p className="font-medium mb-1">Advertencias al importar:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {products.length > 0 && (
          <>
            <p className="text-sm text-gray-500">{products.length} productos cargados</p>

            <div ref={formRef} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
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
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {editingId ? 'Guardar cambios' : 'Agregar item'}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
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
