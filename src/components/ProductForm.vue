<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  submitLabel: {
    type: String,
    default: 'Save Product'
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const defaultForm = {
  id: '',
  name: '',
  category: '',
  price: '',
  quantity: '',
  minStock: '',
  description: ''
}

const form = reactive({ ...defaultForm })
const errors = ref({})

const categoryOptions = [
  'Fresh Meat',
  'Eggs & Poultry',
  'Feed & Nutrition',
  'Chicks & Young Stock'
]

watch(
  () => props.initialData,
  (value) => {
    const nextForm = value ?? {}
    Object.assign(form, defaultForm, {
      id: nextForm.id ?? '',
      name: nextForm.name ?? '',
      category: nextForm.category ?? '',
      price: nextForm.price ?? '',
      quantity: nextForm.quantity ?? '',
      minStock: nextForm.minStock ?? '',
      description: nextForm.description ?? ''
    })
    errors.value = {}
  },
  { immediate: true }
)

const validateForm = () => {
  const validationErrors = {}

  if (!form.name.trim()) {
    validationErrors.name = 'Product name is required.'
  }

  if (!form.category.trim()) {
    validationErrors.category = 'Please choose a category.'
  }

  if (form.price === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    validationErrors.price = 'Price must be a valid number greater than or equal to zero.'
  }

  if (form.quantity === '' || !Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 0) {
    validationErrors.quantity = 'Quantity must be a valid number greater than or equal to zero.'
  }

  if (form.minStock === '' || !Number.isFinite(Number(form.minStock)) || Number(form.minStock) < 0) {
    validationErrors.minStock = 'Minimum stock must be a valid number greater than or equal to zero.'
  }

  return validationErrors
}

const handleSubmit = () => {
  const validationErrors = validateForm()
  errors.value = validationErrors

  if (Object.keys(validationErrors).length > 0) {
    return
  }

  emit('submit', {
    ...form,
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    quantity: Number(form.quantity),
    minStock: Number(form.minStock)
  })
}
</script>

<template>
  <form class="form-card" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <div class="field-group">
        <label for="product-name">Product Name</label>
        <input
          id="product-name"
          v-model="form.name"
          type="text"
          :class="{ 'input-error': errors.name }"
          placeholder="Enter product name"
        />
        <small v-if="errors.name" class="form-error">{{ errors.name }}</small>
      </div>

      <div class="field-group">
        <label for="product-category">Category</label>
        <select
          id="product-category"
          v-model="form.category"
          :class="{ 'input-error': errors.category }"
        >
          <option value="">Select category</option>
          <option v-for="category in categoryOptions" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <small v-if="errors.category" class="form-error">{{ errors.category }}</small>
      </div>

      <div class="field-group">
        <label for="product-price">Price (₱)</label>
        <input
          id="product-price"
          v-model="form.price"
          type="number"
          min="0"
          step="0.01"
          :class="{ 'input-error': errors.price }"
          placeholder="0.00"
        />
        <small v-if="errors.price" class="form-error">{{ errors.price }}</small>
      </div>

      <div class="field-group">
        <label for="product-quantity">Available Quantity</label>
        <input
          id="product-quantity"
          v-model="form.quantity"
          type="number"
          min="0"
          step="any"
          :disabled="isEditing"
          :class="{ 'input-error': errors.quantity }"
          placeholder="0"
        />
        <small v-if="errors.quantity" class="form-error">{{ errors.quantity }}</small>
        <small v-if="isEditing">To change stock quantity, use Stock Management.</small>
      </div>

      <div class="field-group">
        <label for="product-min-stock">Minimum Stock Level</label>
        <input
          id="product-min-stock"
          v-model="form.minStock"
          type="number"
          min="0"
          step="any"
          :class="{ 'input-error': errors.minStock }"
          placeholder="0"
        />
        <small v-if="errors.minStock" class="form-error">{{ errors.minStock }}</small>
      </div>

      <div class="field-group full-width">
        <label for="product-description">Description (Optional)</label>
        <textarea
          id="product-description"
          v-model="form.description"
          rows="4"
          placeholder="Short notes or product details"
        />
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn-primary">{{ submitLabel }}</button>
    </div>
  </form>
</template>
