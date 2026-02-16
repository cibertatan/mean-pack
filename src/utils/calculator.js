/**
 * Calcula cajas, peso y volumen para una cantidad dada de un producto.
 * Dimensiones en pulgadas, peso en kg.
 */
export function calculate(product, quantity) {
  const { units_per_box, box_weight_kg, box_length_in, box_width_in, box_height_in, unit_weight_kg } = product

  const fullBoxes = Math.floor(quantity / units_per_box)
  const remainder = quantity % units_per_box
  const totalBoxes = fullBoxes + (remainder > 0 ? 1 : 0)

  const boxVolumeIn3 = box_length_in * box_width_in * box_height_in
  const totalVolumeIn3 = boxVolumeIn3 * totalBoxes
  const totalVolumeFt3 = totalVolumeIn3 / 1728

  let partialBoxWeight = 0
  if (remainder > 0) {
    partialBoxWeight = unit_weight_kg
      ? remainder * unit_weight_kg
      : (remainder / units_per_box) * box_weight_kg
  }

  const totalWeight = fullBoxes * box_weight_kg + partialBoxWeight

  return {
    fullBoxes,
    remainder,
    totalBoxes,
    boxVolumeIn3,
    totalVolumeIn3,
    totalVolumeFt3,
    totalWeight,
    partialBoxWeight,
  }
}
