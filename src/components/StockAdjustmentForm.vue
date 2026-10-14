<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  initialProductId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit'])

const selectedProductId = ref('')
const quantity = ref(1)
const action = ref('in')
const errorMessage = ref('')

watch(
  [() => props.products, () => props.initialProductId],
  ([products, initialProductId]) => {
    if (!products.length) {
      selectedProductId.value = ''
      return
    }

    if (products.some((item) => item.id === initialProductId)) {
      selectedProductId.value = initialProductId
    } else if (!products.some((item) => item.id === selectedProductId.value)) {
      selectedProductId.value = products[0].id
    }
  },
  { immediate: true }
)

const selectedProduct = computed(() => {
  return props.products.find((item) => item.id === selectedProductId.value) ?? null
})

const handleSubmit = () => {
  if (!selectedProduct.value) {
    errorMessage.value = 'Please select a product.'
    return
  }

  if (quantity.value === '' || quantity.value === null ||
      !Number.isFinite(Number(quantity.value)) || Number(quantity.value) <= 0) {
    errorMessage.value = 'Please enter a valid quantity greater than zero.'
    return
  }

  if (action.value !== 'in' && action.value !== 'out') {
    errorMessage.value = 'Please choose Stock In or Stock Out.'
    return
  }

  const nextQuantity = action.value === 'in'
    ? Number(selectedProduct.value.quantity) + Number(quantity.value)
    : Number(selectedProduct.value.quantity) - Number(quantity.value)

  if (!Number.isFinite(nextQuantity)) {
    errorMessage.value = 'The resulting stock quantity is invalid.'
    return
  }

  if (action.value === 'out' && nextQuantity < 0) {
    errorMessage.value = 'Stock out cannot make the quantity negative.'
    return
  }

  errorMessage.value = ''
  emit('submit', {
    productId: selectedProductId.value,
    action: action.value,
    amount: Number(quantity.value)
  })

}
</script>

<template>
  <form class="form-card" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <div class="field-group">
        <label for="stock-product">Product</label>
        <select id="stock-product" v-model="selectedProductId">
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }} ({{ product.quantity }} available)
          </option>
        </select>
      </div>

      <div class="field-group">
        <label for="stock-adjustment">Quantity</label>
        <input id="stock-adjustment" v-model.number="quantity" type="number" min="0" step="any" />
      </div>

      <div class="field-group">
        <label for="stock-action">Action</label>
        <select id="stock-action" v-model="action">
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
        </select>
      </div>
    </div>

    <div v-if="selectedProduct" class="note-box" style="margin-top: 1rem;">
      <strong>{{ selectedProduct.name }}</strong>
      <span>
        Current stock: {{ selectedProduct.quantity }} items.
        <span v-if="selectedProduct.quantity <= selectedProduct.minStock" class="status-badge warning">Needs restocking</span>
      </span>
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">Apply Adjustment</button>
    </div>
  </form>
</template>
