<script setup>
import { computed } from 'vue'
import SummaryCard from '../components/SummaryCard.vue'
import { getCategoryBreakdown, getInventorySummary, getLowStockProducts, inventory } from '../services/inventoryService'

const summary = computed(() => getInventorySummary())
const categoryBreakdown = computed(() => getCategoryBreakdown())
const lowStockItems = computed(() => getLowStockProducts())
const maxCategoryCount = computed(() => {
  const values = categoryBreakdown.value.map((item) => item.count)
  return Math.max(...values, 1)
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  }).format(Number(value))
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Inventory Reports</h1>
        <p class="page-subtitle">Review the current product mix, stock level, and category distribution.</p>
      </div>
    </div>

    <section class="summary-grid">
      <SummaryCard
        label="Products"
        :value="summary.totalProducts"
        subtitle="Recorded items"
        badge="Count"
        tone="success"
        to="/inventory"
      />
      <SummaryCard
        label="Available Stock"
        :value="summary.totalQuantity"
        subtitle="Units on hand"
        badge="Live"
        tone="success"
        to="/stock"
      />
      <SummaryCard
        label="Inventory Value"
        :value="formatCurrency(summary.inventoryValue)"
        subtitle="Current total value"
        badge="Worth"
        tone="success"
        to="/reports"
      />
      <SummaryCard
        label="Low Stock"
        :value="summary.lowStockCount"
        subtitle="Items needing refill"
        :badge="summary.lowStockCount > 0 ? 'Review' : 'Healthy'"
        :tone="summary.lowStockCount > 0 ? 'warning' : 'success'"
        :to="summary.lowStockCount > 0 ? { path: '/inventory', query: { status: 'Low Stock' } } : '/inventory'"
      />
    </section>

    <section class="report-grid" style="margin-top: 1.5rem;">
      <article class="report-card">
        <div class="card-head">
          <h3>Category Summary</h3>
        </div>

        <ul class="chart-list">
          <li v-for="category in categoryBreakdown" :key="category.category" class="chart-row">
            <span>{{ category.category }}</span>
            <div class="progress">
              <div class="progress-bar" :style="{ width: `${(category.count / maxCategoryCount) * 100}%` }" />
            </div>
            <strong>{{ category.count }}</strong>
          </li>
        </ul>
      </article>

      <article class="report-card">
        <div class="card-head">
          <h3>Low Stock List</h3>
        </div>

        <div v-if="lowStockItems.length" class="notes">
          <router-link
            v-for="product in lowStockItems"
            :key="product.id"
            :to="{ path: '/stock', query: { productId: product.id } }"
            class="note-box note-box-link"
          >
            <strong>{{ product.name }}</strong>
            <span>{{ product.quantity }} available / {{ product.minStock }} minimum</span>
          </router-link>
        </div>

        <div v-else class="empty-state">No low stock products at the moment.</div>
      </article>
    </section>
  </div>
</template>
