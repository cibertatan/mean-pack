import { useState, useRef, useEffect } from 'react'

export default function ProductSearch({ products, selectedProduct, onSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const filtered = query.trim()
    ? products.filter(p =>
        p.model.toLowerCase().includes(query.toLowerCase()) ||
        (p.series && p.series.toLowerCase().includes(query.toLowerCase()))
      )
    : products

  useEffect(() => {
    if (selectedProduct) setQuery(selectedProduct.model)
    else setQuery('')
  }, [selectedProduct])

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (product) => {
    onSelect(product)
    setQuery(product.model)
    setOpen(false)
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    setOpen(true)
    if (selectedProduct) onSelect(null)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder="Buscar modelo..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((p) => (
            <li
              key={p.model}
              onClick={() => handleSelect(p)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              <span className="font-medium">{p.model}</span>
              {p.series && <span className="text-gray-400 ml-2">({p.series})</span>}
              <span className="text-gray-400 ml-2">— {p.units_per_box} uds/caja</span>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">
          No se encontró "{query}"
        </div>
      )}
    </div>
  )
}
