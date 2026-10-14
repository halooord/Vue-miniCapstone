<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Add Product', to: '/add-product' },
  { label: 'Stock', to: '/stock' },
  { label: 'Reports', to: '/reports' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <router-link to="/" class="brand">
        <div class="brand-mark">🐔</div>
        <div class="brand-copy">
          <span>Poultry Shop</span>
          <small>Inventory System</small>
        </div>
      </router-link>

      <nav class="nav-links" aria-label="Main navigation">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isActive(item.to) }"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>
