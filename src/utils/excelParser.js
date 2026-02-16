import * as XLSX from 'xlsx'

const REQUIRED_COLUMNS = ['model', 'units_per_box', 'box_weight_kg', 'box_length_in', 'box_width_in', 'box_height_in']

/**
 * Lee un archivo Excel y retorna un array de productos validados.
 * @param {File} file
 * @returns {Promise<object>}
 */
export async function parseProductFile(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })

  if (rows.length === 0) {
    throw new Error('El archivo está vacío o no tiene datos.')
  }

  const headers = Object.keys(rows[0])
  const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col))
  if (missing.length > 0) {
    throw new Error(`Columnas requeridas faltantes: ${missing.join(', ')}`)
  }

  const products = []
  const errors = []

  rows.forEach((row, i) => {
    const rowNum = i + 2
    const model = String(row.model ?? '').trim()
    if (!model) {
      errors.push(`Fila ${rowNum}: modelo vacío`)
      return
    }

    const units_per_box = Number(row.units_per_box)
    const box_weight_kg = Number(row.box_weight_kg)
    const box_length_in = Number(row.box_length_in)
    const box_width_in = Number(row.box_width_in)
    const box_height_in = Number(row.box_height_in)

    if ([units_per_box, box_weight_kg, box_length_in, box_width_in, box_height_in].some(v => !Number.isFinite(v) || v <= 0)) {
      errors.push(`Fila ${rowNum} (${model}): valores numéricos inválidos`)
      return
    }

    products.push({
      model,
      series: row.series ? String(row.series).trim() : null,
      units_per_box: Math.floor(units_per_box),
      box_weight_kg,
      box_length_in,
      box_width_in,
      box_height_in,
      unit_weight_kg: row.unit_weight_kg != null ? Number(row.unit_weight_kg) : null,
    })
  })

  if (products.length === 0) {
    throw new Error(`No se encontraron productos válidos.\n${errors.join('\n')}`)
  }

  return { products, warnings: errors }
}
