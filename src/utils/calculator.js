/**
 * Calcula cajas, peso y volumen para una cantidad dada de un producto.
 * @param {object} product - producto parseado del Excel
 * @param {number} quantity - cantidad deseada de unidades
 * @returns {object} resultado del cálculo
 */
export function calculate(product, quantity) {
  const { units_per_box, box_weight_kg, box_length_cm, box_width_cm, box_height_cm, unit_weight_kg } = product

  const fullBoxes = Math.floor(quantity / units_per_box)
  const remainder = quantity % units_per_box
  const totalBoxes = fullBoxes + (remainder > 0 ? 1 : 0)

  const boxVolumeCm3 = box_length_cm * box_width_cm * box_height_cm
  const totalVolumeCm3 = boxVolumeCm3 * totalBoxes

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
    boxVolumeCm3,
    totalVolumeCm3,
    totalWeight,
    partialBoxWeight,
  }
}
