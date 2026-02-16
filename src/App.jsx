import { useState } from 'react'
import FileUploader from './components/FileUploader'
import ProductSearch from './components/ProductSearch'
import QuantityInput from './components/QuantityInput'
import ResultsPanel from './components/ResultsPanel'
import { parseProductFile } from './utils/excelParser'

export default function App() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(0)
  const [fileName, setFileName] = useState(null)
  const [warnings, setWarnings] = useState([])

  const handleFileLoaded = async (file) => {
    const { products: parsed, warnings: warns } = await parseProductFile(file)
    setProducts(parsed)
    setWarnings(warns)
    setFileName(file.name)
    setSelectedProduct(null)
    setQuantity(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
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
          </>
        )}

        <ResultsPanel product={selectedProduct} quantity={quantity} />
      </div>
    </div>
  )
}
