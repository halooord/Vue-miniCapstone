<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'success'
  },
  to: {
    type: [String, Object],
    default: null
  }
})
</script>

<template>
  <component :is="to ? 'router-link' : 'article'" :to="to" class="summary-card" :class="{ 'summary-card-link': to }">
    <p class="card-label">{{ label }}</p>
    <h3 class="card-value">{{ value }}</h3>
    <div class="card-subtext">
      <span>{{ subtitle }}</span>
      <span v-if="badge" :class="`card-badge ${tone}`">{{ badge }}</span>
    </div>
  </component>
</template>
