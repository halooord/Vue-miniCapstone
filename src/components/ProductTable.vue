<script setup>
const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  emptyMessage: {
    type: String,
    default: 'No matching items found.'
  }
})

const emit = defineEmits(['edit', 'delete'])

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2
  }).format(Number(value))
</script>

<template>
  <div class="table-wrap">
    <table v-if="products.length" class="data-table">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Product Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Available Qty</th>
          <th>Min Stock</th>
          <th>Stock Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td>
            <strong>{{ product.name }}</strong>
          </td>
          <td>{{ product.category }}</td>
          <td>{{ formatCurrency(product.price) }}</td>
          <td>{{ product.quantity }}</td>
          <td>{{ product.minStock }}</td>
          <td>
            <span
              :class="[
                'status-badge',
                product.quantity <= product.minStock ? 'warning' : 'safe'
              ]"
            >
              {{ product.quantity <= product.minStock ? 'Low Stock' : 'In Stock' }}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary" @click="$emit('edit', product.id)">Edit</button>
              <button class="btn btn-danger" @click="$emit('delete', product.id)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty-state">
      {{ emptyMessage }}
    </div>
  </div>
</template>
