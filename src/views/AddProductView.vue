<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProductForm from '../components/ProductForm.vue'
import { addProduct } from '../services/inventoryService'

const router = useRouter()
const errorMessage = ref('')

const handleSubmit = (productData) => {
  try {
    const savedProduct = addProduct(productData)
    router.push({
      path: '/inventory',
      query: {
        message: `${savedProduct.name} was added successfully.`
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
        <h1 class="page-title">Add Product</h1>
        <p class="page-subtitle">Create a new poultry inventory item with the required details.</p>
      </div>
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
    <ProductForm submit-label="Add Product" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>
