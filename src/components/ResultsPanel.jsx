import { calculate } from '../utils/calculator'

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function ResultsPanel({ product, quantity }) {
  if (!product || !quantity || quantity <= 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-400">
        {!product
          ? 'Selecciona un producto para ver los resultados'
          : 'Ingresa la cantidad deseada'}
      </div>
    )
  }

  const result = calculate(product, quantity)
  const volumeM3 = result.totalVolumeCm3 / 1_000_000

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-lg text-gray-800">
        {product.model}
        {product.series && <span className="text-gray-400 font-normal ml-2">({product.series})</span>}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Cajas completas" value={result.fullBoxes} />
        <Stat label="Sobrantes" value={result.remainder} unit="uds" />
        <Stat
          label="Total cajas"
          value={result.totalBoxes}
          highlight
        />
        <Stat label="Uds/caja" value={product.units_per_box} />
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Peso total" value={fmt(result.totalWeight)} unit="kg" />
        <Stat label="Volumen total" value={fmt(volumeM3, 3)} unit="m³" />
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p>Dimensiones caja: {product.box_length_cm} x {product.box_width_cm} x {product.box_height_cm} cm</p>
        <p>Peso caja completa: {product.box_weight_kg} kg</p>
        {result.remainder > 0 && (
          <p>
            Peso caja parcial ({result.remainder} uds): {fmt(result.partialBoxWeight)} kg
            {!product.unit_weight_kg && ' (estimado)'}
          </p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, unit, highlight }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-semibold ${highlight ? 'text-blue-600' : 'text-gray-800'}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}
