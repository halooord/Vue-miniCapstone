<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <div class="app-shell">
    <AppNavbar />
    <main class="page-shell">
      <router-view />
    </main>

    <footer class="page-footer">
      Data is stored in this browser using localStorage and is not shared across devices or users.
    </footer>
  </div>
</template>
