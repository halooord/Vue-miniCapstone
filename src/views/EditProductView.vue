<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductForm from '../components/ProductForm.vue'
import { inventory, updateProduct } from '../services/inventoryService'

const route = useRoute()
const router = useRouter()

const product = computed(() => inventory.value.find((item) => item.id === route.params.id) ?? null)
const errorMessage = ref('')

const handleSubmit = (productData) => {
  try {
    updateProduct(route.params.id, productData)
    router.push({
      path: '/inventory',
      query: {
        message: `${productData.name} updated successfully.`
      }
    })
  } catch (error) {
    errorMessage.value = error.message
  }
}

const handleCancel = () => {
  router.push('/inventory')
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Product</h1>
        <p class="page-subtitle">Update the selected poultry item and save your changes.</p>
      </div>
    </div>

    <div v-if="!product" class="empty-state">
      Product not found. Return to the inventory page and select a valid item.
      <div style="margin-top: 1rem;">
        <router-link class="btn btn-primary" to="/inventory">Back to Inventory</router-link>
      </div>
    </div>

    <template v-else>
      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      <ProductForm
        :initial-data="product"
        :is-editing="true"
        submit-label="Update Product"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
  </div>
</template>
