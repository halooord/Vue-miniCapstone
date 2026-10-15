<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductTable from '../components/ProductTable.vue'
import { deleteProduct, inventory } from '../services/inventoryService'

const router = useRouter()
const route = useRoute()

const errorMessage = ref('')
const searchTerm = ref('')
const categoryFilter = ref('All')
const statusFilter = ref(route.query.status === 'Low Stock' ? 'Low Stock' : 'All')

const categories = computed(() => ['All', ...new Set(inventory.value.map((item) => item.category))])

const filteredProducts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  return inventory.value.filter((product) => {
    const matchesQuery = !query || product.name.toLowerCase().includes(query)
    const matchesCategory = categoryFilter.value === 'All' || product.category === categoryFilter.value
    const matchesStatus =
      statusFilter.value === 'All' ||
      (statusFilter.value === 'Low Stock' ? product.quantity <= product.minStock : product.quantity > product.minStock)

    return matchesQuery && matchesCategory && matchesStatus
  })
})

const successMessage = ref(route.query.message ? String(route.query.message) : '')

watch(
  () => route.query.message,
  (message) => {
    successMessage.value = message ? String(message) : ''
  }
)

watch(
  () => route.query.status,
  (status) => {
    statusFilter.value = status === 'Low Stock' ? 'Low Stock' : 'All'
  }
)


const handleDelete = (id) => {
  const product = inventory.value.find((item) => item.id === id)

  if (!product) {
    return
  }

  const shouldDelete = window.confirm(`Delete ${product.name} from the inventory?`)

  if (!shouldDelete) {
    return
  }

  try {
    const deletedProduct = deleteProduct(id)

    successMessage.value = `${deletedProduct.name} was deleted successfully.`
    errorMessage.value = ''
  } catch (error) {
    successMessage.value = ''
    errorMessage.value = error.message
  }
}


const handleEdit = (id) => {
  router.push(`/edit-product/${id}`)
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Inventory Management</h1>
        <p class="page-subtitle">Track every poultry product and manage stock levels in one place.</p>
      </div>
      <div class="page-actions">
        <router-link class="btn btn-primary" to="/add-product">Add Product</router-link>
      </div>
    </div>

    <div v-if="successMessage" class="alert-banner">✅ {{ successMessage }}</div>
    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <section class="table-card">
      <div class="toolbar">
        <div class="filter-group">
          <div class="field-group">
            <label for="search-products">Search</label>
            <input id="search-products" v-model="searchTerm" type="search" placeholder="Search product name" />
          </div>

          <div class="field-group">
            <label for="category-filter">Category</label>
            <select id="category-filter" v-model="categoryFilter">
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label for="status-filter">Stock Status</label>
            <select id="status-filter" v-model="statusFilter">
              <option value="All">All</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Healthy">Healthy</option>
            </select>
          </div>
        </div>
      </div>

      <ProductTable
        :products="filteredProducts"
        empty-message="No products match your current search or filter."
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </section>
  </div>
</template>
