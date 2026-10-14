<script setup>
import { computed } from 'vue'
import SummaryCard from '../components/SummaryCard.vue'
import { getInventorySummary, getLowStockProducts, inventory } from '../services/inventoryService'

const summary = computed(() => getInventorySummary())
const lowStockItems = computed(() => getLowStockProducts())
const recentProducts = computed(() => [...inventory.value].slice().reverse().slice(0, 4))

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  }).format(Number(value))
</script>

<template>
  <div>
    <section class="hero">
      <h1 class="page-title">Welcome to the Poultry Shop Dashboard</h1>
      <p>
        Track all poultry products, monitor stock levels, and keep the shop ready for daily sales
        and restocking decisions.
      </p>
      <div class="hero-actions">
        <router-link class="btn btn-primary" to="/inventory">View Inventory</router-link>
        <router-link class="btn btn-secondary" to="/add-product">Add Product</router-link>
      </div>
    </section>

    <section class="summary-grid" style="margin-top: 1.5rem;">
      <SummaryCard
        label="Total Products"
        :value="summary.totalProducts"
        subtitle="Active items in stock"
        badge="Live"
        tone="success"
        to="/inventory"
      />
      <SummaryCard
        label="Total Stock"
        :value="summary.totalQuantity"
        subtitle="Units available"
        badge="Updated"
        tone="success"
        to="/stock"
      />
      <SummaryCard
        label="Low Stock"
        :value="summary.lowStockCount"
        subtitle="Need restocking"
        :badge="summary.lowStockCount > 0 ? 'Review' : 'Healthy'"
        :tone="summary.lowStockCount > 0 ? 'warning' : 'success'"
        :to="summary.lowStockCount > 0 ? { path: '/inventory', query: { status: 'Low Stock' } } : '/inventory'"
      />
      <SummaryCard
        label="Inventory Value"
        :value="formatCurrency(summary.inventoryValue)"
        subtitle="Current stock value"
        :badge="formatCurrency(summary.inventoryValue)"
        tone="success"
        to="/reports"
      />
    </section>

    <section class="dashboard-grid">
      <article class="info-card">
        <div class="card-head">
          <h3>Recently Added Items</h3>
        </div>

        <div v-if="recentProducts.length" class="list-stack">
          <router-link
            v-for="product in recentProducts"
            :key="product.id"
            :to="`/edit-product/${product.id}`"
            class="list-item list-item-link"
          >
            <div>
              <strong>{{ product.name }}</strong>
              <span>{{ product.category }}</span>
            </div>
            <div class="stock-pill" :class="product.quantity <= product.minStock ? 'warning' : 'safe'">
              {{ product.quantity }} left
            </div>
            </router-link>
        </div>

        <div v-else class="empty-state">No recent inventory items available.</div>
      </article>

      <article class="panel">
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
              <span>{{ product.quantity }} / {{ product.minStock }} min</span>
            </div>
            <span class="stock-pill warning">Low</span>
          </router-link>
        </div>

        <div v-else class="empty-state">All products are within the preferred stock range.</div>
      </article>
    </section>
  </div>
</template>
