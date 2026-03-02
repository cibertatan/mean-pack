import { createContext, useContext, useState, useCallback } from 'react'

const translations = {
  es: {
    appTitle: 'Mean Pack',
    appSubtitle: 'Calculadora de cajas Mean Well',
    warnings: 'Advertencias al importar:',
    productsLoaded: (n) => `${n} productos disponibles`,
    selectProduct: 'Selecciona un producto y cantidad',
    saveChanges: 'Guardar cambios',
    addItem: 'Agregar item',
    cancel: 'Cancelar',

    // FileUploader
    fileReplace: 'Click o arrastra otro archivo para reemplazar',
    fileDrag: 'Arrastra tu archivo Excel aquí',
    fileClick: 'o haz click para seleccionar',
    fileError: 'Solo se aceptan archivos .xlsx o .xls',
    fileClear: 'Quitar archivo',
    fileNoFile: '¿No tienes archivo?',
    fileDownload: 'Descarga el template',

    // ProductSearch
    modelLabel: 'Modelo',
    modelPlaceholder: 'Buscar modelo...',
    modelNotFound: (q) => `No se encontró "${q}"`,
    unitsPerBox: 'uds/caja',

    // QuantityInput
    quantityLabel: 'Cantidad de unidades',
    quantityPlaceholder: 'Ej: 120',

    // ItemList
    itemsAdded: 'Items agregados',
    units: 'uds',
    box: 'caja',
    boxes: 'cajas',
    edit: 'Editar',
    remove: 'Quitar',

    // ResultsPanel
    orderSummary: 'Resumen del pedido',
    model: 'Modelo',
    qty: 'Uds',
    boxesHeader: 'Cajas',
    weight: 'Peso (kg)',
    volume: 'Vol (ft³)',
    fullBox: 'caja completa',
    fullBoxes: 'cajas completas',
    remainder: 'sobrante',
    remainders: 'sobrantes',
    total: 'Total',
    boxDimensions: 'caja',
    kgPerBox: 'kg/caja',
    partialEstimated: '(peso parcial estimado)',
    downloadImage: 'Descargar imagen',
    downloadPdf: 'Descargar PDF',
    downloadError: 'No se pudo generar la imagen.',
    downloadPdfError: 'No se pudo generar el PDF.',

    // Tabs
    tabBox: 'Calculadora de Cajas',
    tabPrice: 'Calculadora de Precios',

    // PriceCalculator – secciones
    pcProductInfo: 'Información del Producto',
    pcPricing: 'Precio y Margen',
    pcShipping: 'Envío y Logística',
    pcResults: 'Resultados',

    // PriceCalculator – campos
    pcModel: 'Modelo',
    pcCost: 'Costo (USD)',
    pcTotalSaleQty: 'Cantidad Total de Venta',
    pcPcsPerBox: 'Pzas por Caja',
    pcWeightPerBox: 'Peso por Caja (kg)',
    pcProfitPct: 'Porcentaje de Ganancia (%)',
    pcTaxPct: 'Porcentaje de Impuesto (%)',
    pcShippingCostPerKg: 'Costo de Envío por Kg (USD)',
    pcDeliveryTime: 'Tiempo de Entrega',
    pcShippingMethod: 'Método de Envío',
    pcIncoterms: 'Incoterms',
    pcSelect: 'Seleccionar...',

    // PriceCalculator – resultados
    pcShippingCostLabel: 'Costo de Envío',
    pcUnitPrice: 'Precio Unitario',
    pcGrandTotal: 'Total General',
    pcTotalProfit: 'Ganancia Total',

    // PriceCalculator – botones / hints
    pcDownloadPdf: 'Descargar Cotización PDF',
    pcFillHint: 'Ingresa Costo, Cantidad y Pzas/Caja para ver resultados.',
  },
  en: {
    appTitle: 'Mean Pack',
    appSubtitle: 'Mean Well Box Calculator',
    warnings: 'Import warnings:',
    productsLoaded: (n) => `${n} products available`,
    selectProduct: 'Select a product and quantity',
    saveChanges: 'Save changes',
    addItem: 'Add item',
    cancel: 'Cancel',

    // FileUploader
    fileReplace: 'Click or drag another file to replace',
    fileDrag: 'Drag your Excel file here',
    fileClick: 'or click to select',
    fileError: 'Only .xlsx or .xls files are accepted',
    fileClear: 'Remove file',
    fileNoFile: "Don't have a file?",
    fileDownload: 'Download template',

    // ProductSearch
    modelLabel: 'Model',
    modelPlaceholder: 'Search model...',
    modelNotFound: (q) => `"${q}" not found`,
    unitsPerBox: 'units/box',

    // QuantityInput
    quantityLabel: 'Unit quantity',
    quantityPlaceholder: 'e.g. 120',

    // ItemList
    itemsAdded: 'Added items',
    units: 'units',
    box: 'box',
    boxes: 'boxes',
    edit: 'Edit',
    remove: 'Remove',

    // ResultsPanel
    orderSummary: 'Order summary',
    model: 'Model',
    qty: 'Qty',
    boxesHeader: 'Boxes',
    weight: 'Weight (kg)',
    volume: 'Vol (ft³)',
    fullBox: 'full box',
    fullBoxes: 'full boxes',
    remainder: 'remainder',
    remainders: 'remainders',
    total: 'Total',
    boxDimensions: 'box',
    kgPerBox: 'kg/box',
    partialEstimated: '(partial weight estimated)',
    downloadImage: 'Download image',
    downloadPdf: 'Download PDF',
    downloadError: 'Could not generate the image.',
    downloadPdfError: 'Could not generate the PDF.',

    // Tabs
    tabBox: 'Box Calculator',
    tabPrice: 'Price Calculator',

    // PriceCalculator – sections
    pcProductInfo: 'Product Information',
    pcPricing: 'Pricing',
    pcShipping: 'Shipping & Logistics',
    pcResults: 'Results',

    // PriceCalculator – fields
    pcModel: 'Model',
    pcCost: 'Cost (USD)',
    pcTotalSaleQty: 'Total Sale Quantity',
    pcPcsPerBox: 'Pcs Per Box',
    pcWeightPerBox: 'Weight Per Box (kg)',
    pcProfitPct: 'Profit Percentage (%)',
    pcTaxPct: 'Tax Percentage (%)',
    pcShippingCostPerKg: 'Shipping Cost Per Kg (USD)',
    pcDeliveryTime: 'Delivery Time',
    pcShippingMethod: 'Shipping Method',
    pcIncoterms: 'Incoterms',
    pcSelect: 'Select...',

    // PriceCalculator – results
    pcShippingCostLabel: 'Shipping Cost',
    pcUnitPrice: 'Unit Price',
    pcGrandTotal: 'Grand Total',
    pcTotalProfit: 'Total Profit',

    // PriceCalculator – buttons / hints
    pcDownloadPdf: 'Download Quotation PDF',
    pcFillHint: 'Fill in Cost, Total Sale Quantity and Pcs Per Box to see results.',
  },
}

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('mp_lang') || 'es'
    } catch {
      return 'es'
    }
  })

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'es' ? 'en' : 'es'
      localStorage.setItem('mp_lang', next)
      return next
    })
  }, [])

  const t = useCallback((key, ...args) => {
    const val = translations[lang][key]
    if (typeof val === 'function') return val(...args)
    return val || key
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
