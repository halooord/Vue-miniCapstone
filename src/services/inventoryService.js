import { ref } from 'vue'

export const STORAGE_KEY = 'poultry-shop-inventory'
export const STOCK_HISTORY_KEY = 'poultry-shop-stock-history'

const createDefaultInventory = () => [
  {
    id: 'P-1001',
    name: 'Whole Chicken',
    category: 'Fresh Meat',
    price: 220,
    quantity: 34,
    minStock: 12,
    description: 'Fresh whole chickens for daily sales.'
  },
  {
    id: 'P-1002',
    name: 'Chicken Breast',
    category: 'Fresh Meat',
    price: 285,
    quantity: 18,
    minStock: 10,
    description: 'Premium chicken breast cuts.'
  },
  {
    id: 'P-1003',
    name: 'Chicken Wings',
    category: 'Fresh Meat',
    price: 190,
    quantity: 24,
    minStock: 15,
    description: 'Ready-to-cook chicken wings.'
  },
  {
    id: 'P-1004',
    name: 'Chicken Legs',
    category: 'Fresh Meat',
    price: 210,
    quantity: 9,
    minStock: 12,
    description: 'Chicken leg quarters ideal for family packs.'
  },
  {
    id: 'P-1005',
    name: 'Eggs',
    category: 'Eggs & Poultry',
    price: 120,
    quantity: 62,
    minStock: 20,
    description: 'Fresh layer eggs from local farms.'
  },
  {
    id: 'P-1006',
    name: 'Chicks',
    category: 'Chicks & Young Stock',
    price: 75,
    quantity: 40,
    minStock: 18,
    description: 'Healthy chicks ready for breeding or resale.'
  },
  {
    id: 'P-1007',
    name: 'Poultry Feed',
    category: 'Feed & Nutrition',
    price: 360,
    quantity: 11,
    minStock: 15,
    description: 'Balanced poultry feed for healthy growth.'
  }
]

const storageErrorMessage = 'Unable to save changes. Browser storage may be full or disabled. Please check your browser settings and try again.'

const safeRead = (key, required = false) => {
  try {
    if (typeof localStorage === 'undefined') {
      if (required) throw new Error(storageErrorMessage)
      return null
    }
    return localStorage.getItem(key)
  } catch (error) {
    if (required) throw new Error(storageErrorMessage)
    console.warn(`Unable to read ${key}:`, error)
    return null
  }
}

const safeWrite = (key, value) => {
  try {
    if (typeof localStorage === 'undefined') throw new Error(storageErrorMessage)
    localStorage.setItem(key, value)
  } catch (error) {
    throw new Error(storageErrorMessage)
  }
}

const isValidNumber = (value) =>
  (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
  Number.isFinite(Number(value))

const isValidNonNegativeNumber = (value) =>
  isValidNumber(value) && Number(value) >= 0

const normalizeProduct = (item, index) => {
  if (!item || typeof item !== 'object') {
    return null
  }

  const name = String(item.name ?? '').trim()
  const category = String(item.category ?? '').trim()
  const price = Number(item.price)
  const quantity = Number(item.quantity)
  const minStock = Number(item.minStock)

  if (!name || !category || !isValidNonNegativeNumber(item.price) || !isValidNonNegativeNumber(item.quantity) || !isValidNonNegativeNumber(item.minStock)) {
    return null
  }

  return {
    id: String(item.id ?? '').trim() || `P-${String(index + 1001).padStart(4, '0')}`,
    name,
    category,
    price: Number(price.toFixed(2)),
    quantity: Number(quantity),
    minStock: Number(minStock),
    description: String(item.description ?? '').trim()
  }
}

export const inventory = ref(loadInventory())
export const stockHistory = ref(loadStockHistory())

export function generateProductId() {
  const currentItems = inventory.value
  const maxNumber = currentItems.reduce((highest, item) => {
    const match = String(item.id).match(/(\d+)/)
    const currentValue = match ? Number(match[0]) : 0
    return Math.max(highest, currentValue)
  }, 0)

  return `P-${String(maxNumber + 1).padStart(4, '0')}`
}

export function persistInventory(items = inventory.value) {
  safeWrite(STORAGE_KEY, JSON.stringify(items))
}

export function persistStockHistory(history = stockHistory.value) {
  safeWrite(STOCK_HISTORY_KEY, JSON.stringify(history))
}

function loadStockHistory() {
  const saved = safeRead(STOCK_HISTORY_KEY)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Unable to parse stock history:', error)
    return []
  }
}

export function loadInventory() {
  const saved = safeRead(STORAGE_KEY)

  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        // An empty saved inventory is valid: do not restore the sample products.
        if (parsed.length === 0) return []

        const normalized = parsed.map(normalizeProduct).filter(Boolean)
        if (normalized.length > 0) return normalized
      }
    } catch (error) {
      console.warn('Unable to parse saved inventory:', error)
    }
  }

  // Only use sample products when no valid saved inventory exists.
  const defaultInventory = createDefaultInventory()
  try {
    persistInventory(defaultInventory)
  } catch (error) {
    // Initial display can still work; any attempted change will report the save error.
    console.warn(error.message)
  }
  return defaultInventory
}

export function normalizeProductInput(productData) {
  const product = productData ?? {}
  const name = String(product.name ?? '').trim()
  const category = String(product.category ?? '').trim()
  const price = Number(product.price)
  const quantity = Number(product.quantity)
  const minStock = Number(product.minStock)

  if (!name || !category) {
    throw new Error('Product name and category are required.')
  }

  if (!isValidNonNegativeNumber(product.price)) {
    throw new Error('Price must be a valid number greater than or equal to zero.')
  }

  if (!isValidNonNegativeNumber(product.quantity)) {
    throw new Error('Quantity must be a valid number greater than or equal to zero.')
  }

  if (!isValidNonNegativeNumber(product.minStock)) {
    throw new Error('Minimum stock must be a valid number greater than or equal to zero.')
  }

  return {
    id: String(product.id ?? generateProductId()).trim() || generateProductId(),
    name,
    category,
    price: Number(price.toFixed(2)),
    quantity: Number(quantity),
    minStock: Number(minStock),
    description: String(product.description ?? '').trim()
  }
}

export function addProduct(productData) {
  const normalizedProduct = normalizeProductInput(productData)

  if (inventory.value.some((item) => item.id === normalizedProduct.id)) {
    normalizedProduct.id = generateProductId()
  }

  const nextInventory = [...inventory.value, normalizedProduct]
  persistInventory(nextInventory)
  inventory.value = nextInventory
  return normalizedProduct
}

export function updateProduct(productId, productData) {
  const product = inventory.value.find((item) => item.id === productId)

  if (!product) {
    throw new Error('Product not found. Please select a valid item.')
  }

  // Quantity changes must be performed via adjustStock() to record movement history.
  if (Object.prototype.hasOwnProperty.call(productData ?? {}, 'quantity') &&
      (!isValidNonNegativeNumber(productData.quantity) || Number(productData.quantity) !== product.quantity)) {
    throw new Error('To change quantity, please use Stock Management.')
  }

  const normalizedProduct = normalizeProductInput({
    ...product,
    ...productData,
    id: productId,
    quantity: product.quantity
  })
  const nextInventory = inventory.value.map((item) =>
    item.id === productId ? normalizedProduct : item
  )

  persistInventory(nextInventory)
  inventory.value = nextInventory
  return normalizedProduct
}

export function deleteProduct(productId) {
  const product = inventory.value.find((item) => item.id === productId)

  if (!product) {
    throw new Error('Unable to delete an item that does not exist.')
  }

  const nextInventory = inventory.value.filter((item) => item.id !== productId)
  persistInventory(nextInventory)
  inventory.value = nextInventory
  return product
}

export function adjustStock(productId, action, amount) {
  if (action !== 'in' && action !== 'out') {
    throw new Error('Invalid stock action. Choose Stock In or Stock Out.')
  }

  const product = inventory.value.find((item) => item.id === productId)
  if (!product) {
    throw new Error('Please select a valid product for stock adjustment.')
  }

  if (!isValidNumber(amount) || Number(amount) <= 0) {
    throw new Error('Enter a valid quantity greater than zero.')
  }
  if (!isValidNonNegativeNumber(product.quantity)) {
    throw new Error('Current stock is invalid. Please check this product before adjusting it.')
  }

  const quantityValue = Number(amount)
  const nextQuantity = action === 'in'
    ? Number(product.quantity) + quantityValue
    : Number(product.quantity) - quantityValue

  if (action === 'out' && nextQuantity < 0) {
    throw new Error('Not enough stock available for this stock-out operation.')
  }
  if (!Number.isFinite(nextQuantity) || nextQuantity === product.quantity) {
    throw new Error('The resulting stock quantity is invalid. Please enter a different amount.')
  }

  const updatedProduct = { ...product, quantity: nextQuantity }
  const nextInventory = inventory.value.map((item) =>
    item.id === productId ? updatedProduct : item
  )
  const transaction = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toISOString(),
    productId,
    productName: product.name,
    transactionType: action === 'in' ? 'Stock In' : 'Stock Out',
    quantityChanged: quantityValue,
    resultingStock: nextQuantity
  }
  const nextHistory = [transaction, ...stockHistory.value].slice(0, 100)

  // Save both sets of data before updating the visible UI. Restore the first
  // key if the second write fails (localStorage has no multi-key transaction).
  const previousInventory = safeRead(STORAGE_KEY, true)
  persistInventory(nextInventory)
  try {
    persistStockHistory(nextHistory)
  } catch (error) {
    try {
      if (previousInventory === null) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        safeWrite(STORAGE_KEY, previousInventory)
      }
    } catch (rollbackError) {
      throw new Error(`${error.message} The previous inventory could not be restored. Refresh and check your saved stock.`)
    }
    throw error
  }

  inventory.value = nextInventory
  stockHistory.value = nextHistory
  return updatedProduct
}

export function getLowStockProducts(items = inventory.value) {
  return items.filter((item) => item.quantity <= item.minStock)
}

export function getInventorySummary(items = inventory.value) {
  const totalProducts = items.length
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0)
  const inventoryValue = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
  const lowStockCount = getLowStockProducts(items).length

  return {
    totalProducts,
    totalQuantity,
    inventoryValue,
    lowStockCount
  }
}

export function getCategoryBreakdown(items = inventory.value) {
  const counts = {}

  items.forEach((item) => {
    const key = item.category
    counts[key] = (counts[key] ?? 0) + 1
  })

  return Object.entries(counts).map(([category, count]) => ({ category, count }))
}
