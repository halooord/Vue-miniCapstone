<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import StockAdjustmentForm from '../components/StockAdjustmentForm.vue'
import { adjustStock, inventory, stockHistory } from '../services/inventoryService'

const route = useRoute()
const statusMessage = ref('')
const isError = ref(false)
const recentHistory = computed(() => stockHistory.value.slice(0, 8))
const lowStockItems = computed(() => inventory.value.filter((item) => item.quantity <= item.minStock))

const handleStockSubmit = (payload) => {
  try {
    const updatedProduct = adjustStock(payload.productId, payload.action, payload.amount)
    isError.value = false
    statusMessage.value = `${updatedProduct.name} was ${payload.action === 'in' ? 'stocked in' : 'stocked out'} by ${payload.amount} units.`
  } catch (error) {
    isError.value = true
    statusMessage.value = error.message
  }
}

const formatDate = (value) =>
  new Date(value).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Stock Management</h1>
        <p class="page-subtitle">Adjust stock in and out while tracking every inventory movement.</p>
      </div>
    </div>

    <div v-if="statusMessage" :class="isError ? 'form-error' : 'alert-banner'">{{ statusMessage }}</div>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="card-head">
          <h3>Update Stock</h3>
        </div>
        <StockAdjustmentForm
          :products="inventory"
          :initial-product-id="route.query.productId"
          @submit="handleStockSubmit"
        />
      </section>

      <aside class="panel">
        <div class="card-head">
          <h3>Restock Alerts</h3>
        </div>

        <div v-if="lowStockItems.length" class="list-stack">
          <router-link
            v-for="product in lowStockItems"
            :key="product.id"
            :to="{ path: '/stock', query: { productId: product.id } }"
            class="list-item list-item-link"
          >
            <div>
              <strong>{{ product.name }}</strong>
              <span>{{ product.quantity }} / {{ product.minStock }} minimum</span>
            </div>
            <span class="stock-pill warning">Low</span>
          </router-link>
        </div>

        <div v-else class="empty-state">No restocking alerts at this time.</div>
      </aside>
    </div>

    <section class="table-card">
      <div class="card-head">
        <h3>Stock Movement History</h3>
      </div>

      <div v-if="recentHistory.length" class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty Changed</th>
              <th>Resulting Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in recentHistory" :key="entry.id">
              <td>{{ formatDate(entry.date) }}</td>
              <td>{{ entry.productName }}</td>
              <td>
                <span :class="['status-badge', entry.transactionType === 'Stock In' ? 'safe' : 'warning']">
                  {{ entry.transactionType }}
                </span>
              </td>
              <td>{{ entry.quantityChanged }}</td>
              <td>{{ entry.resultingStock }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">No stock movements recorded yet.</div>
    </section>
  </div>
</template>
