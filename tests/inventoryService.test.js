import test from 'node:test'
import assert from 'node:assert/strict'

const savedValues = new Map()
let failingKey = null

globalThis.localStorage = {
  getItem(key) {
    return savedValues.has(key) ? savedValues.get(key) : null
  },
  setItem(key, value) {
    if (key === failingKey) throw new Error('QuotaExceededError')
    savedValues.set(key, String(value))
  },
  removeItem(key) {
    savedValues.delete(key)
  }
}

const service = await import('../src/services/inventoryService.js')

const sampleProduct = () => ({
  id: 'P-1001',
  name: 'Chicken Breast',
  category: 'Fresh Meat',
  price: 200,
  quantity: 10,
  minStock: 4,
  description: 'Test item'
})

function reset(products = [sampleProduct()]) {
  failingKey = null
  service.inventory.value = structuredClone(products)
  service.stockHistory.value = []
  savedValues.set(service.STORAGE_KEY, JSON.stringify(products))
  savedValues.set(service.STOCK_HISTORY_KEY, '[]')
}

function assertUnchanged(beforeInventory, beforeHistory) {
  assert.deepEqual(service.inventory.value, beforeInventory)
  assert.deepEqual(service.stockHistory.value, beforeHistory)
  assert.equal(savedValues.get(service.STORAGE_KEY), JSON.stringify(beforeInventory))
  assert.equal(savedValues.get(service.STOCK_HISTORY_KEY), JSON.stringify(beforeHistory))
}

test('stock in/out adds exactly one record per successful adjustment', () => {
  reset()
  service.adjustStock('P-1001', 'in', 5)
  assert.equal(service.inventory.value[0].quantity, 15)
  assert.equal(service.stockHistory.value.length, 1)
  assert.equal(service.stockHistory.value[0].transactionType, 'Stock In')
  assert.equal(service.stockHistory.value[0].resultingStock, 15)
  service.adjustStock('P-1001', 'out', 3)
  assert.equal(service.inventory.value[0].quantity, 12)
  assert.equal(service.stockHistory.value.length, 2)
  assert.equal(service.stockHistory.value[0].transactionType, 'Stock Out')
  assert.equal(service.stockHistory.value[0].resultingStock, 12)
  assert.equal(JSON.parse(savedValues.get(service.STORAGE_KEY))[0].quantity, 12)
  assert.equal(JSON.parse(savedValues.get(service.STOCK_HISTORY_KEY)).length, 2)
})

test('too much stock out leaves inventory and history untouched', () => {
  reset()
  const before = JSON.parse(JSON.stringify(service.inventory.value))
  assert.throws(() => service.adjustStock('P-1001', 'out', 11), /Not enough stock/)
  assertUnchanged(before, [])
})

test('invalid action and amounts never change data', () => {
  reset()
  const before = JSON.parse(JSON.stringify(service.inventory.value))
  for (const action of ['', 'remove', null, 'IN']) {
    assert.throws(() => service.adjustStock('P-1001', action, 2), /Invalid stock action/)
  }
  for (const amount of ['', '   ', 'abc', Infinity, -Infinity, NaN, 0, -1, null, undefined, true, {}, []]) {
    assert.throws(() => service.adjustStock('P-1001', 'in', amount), /valid quantity/)
  }
  assertUnchanged(before, [])
})

test('saved empty inventory remains empty when loaded', () => {
  reset([])
  assert.deepEqual(service.loadInventory(), [])
  assert.equal(savedValues.get(service.STORAGE_KEY), '[]')
})

test('a fresh service import does not restore defaults after deleting all products', async () => {
  reset([])
  const fresh = await import('../src/services/inventoryService.js?reload-empty-test')
  assert.deepEqual(fresh.inventory.value, [])
  assert.equal(savedValues.get(service.STORAGE_KEY), '[]')
})

test('valid saved inventory and fractional quantities are preserved', () => {
  reset([{...sampleProduct(), quantity: 2.75, minStock: 1.5}])
  assert.equal(service.loadInventory()[0].quantity, 2.75)
  service.adjustStock('P-1001', 'out', 0.5)
  assert.equal(service.inventory.value[0].quantity, 2.25)
  assert.equal(service.stockHistory.value[0].quantityChanged, 0.5)
})

test('editing details does not change quantity or record movement', () => {
  reset()
  const saved = service.updateProduct('P-1001', { name: 'New Chicken Breast', price: 235 })
  assert.equal(saved.name, 'New Chicken Breast')
  assert.equal(saved.quantity, 10)
  assert.equal(service.stockHistory.value.length, 0)
  assert.throws(() => service.updateProduct('P-1001', {name:'Changed', quantity: 99}), /Stock Management/)
  assert.equal(service.inventory.value[0].name, 'New Chicken Breast')
  assert.equal(service.inventory.value[0].quantity, 10)
})

test('invalid product numeric fields are rejected', () => {
  reset()
  for (const [field, value] of [['price', Infinity], ['price', ''], ['quantity', NaN], ['minStock', -Infinity], ['quantity', '  ']]) {
    assert.throws(() => service.addProduct({...sampleProduct(), id: 'P-3000', [field]: value}))
  }
  assert.equal(service.inventory.value.length, 1)
})

test('saving failures for create, edit and delete do not change UI data', () => {
  for (const operation of [
    () => service.addProduct({...sampleProduct(), id:'P-3000'}),
    () => service.updateProduct('P-1001', {name:'Updated'}),
    () => service.deleteProduct('P-1001')
  ]) {
    reset()
    const before = JSON.parse(JSON.stringify(service.inventory.value))
    failingKey = service.STORAGE_KEY
    assert.throws(operation, /Browser storage/)
    assertUnchanged(before, [])
  }
  failingKey = null
})

test('stock adjustment inventory save failure leaves both states intact', () => {
  reset()
  const before = JSON.parse(JSON.stringify(service.inventory.value))
  failingKey = service.STORAGE_KEY
  assert.throws(() => service.adjustStock('P-1001', 'in', 5), /Browser storage/)
  assertUnchanged(before, [])
  failingKey = null
})

test('history write failure rolls back inventory and does not update UI', () => {
  reset()
  const before = JSON.parse(JSON.stringify(service.inventory.value))
  failingKey = service.STOCK_HISTORY_KEY
  assert.throws(() => service.adjustStock('P-1001', 'in', 5), /Browser storage/)
  assertUnchanged(before, [])
  failingKey = null
})

test('dashboard summary and low-stock results follow successful stock adjustments', () => {
  reset([{...sampleProduct(), quantity: 10, minStock: 8}])
  service.adjustStock('P-1001', 'out', 3)
  assert.equal(service.getInventorySummary().totalQuantity, 7)
  assert.equal(service.getInventorySummary().lowStockCount, 1)
  assert.equal(service.getLowStockProducts().length, 1)
  assert.equal(service.stockHistory.value[0].resultingStock, 7)
})
