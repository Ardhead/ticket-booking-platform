<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <NuxtLink to="/" class="app-logo">Ticket Booking</NuxtLink>
    </header>
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #000; }
a { color: inherit; text-decoration: none; }

.app-header {
  background: #000;
  color: #fff;
  padding: 1rem 2rem;
}
.app-logo { font-size: 1.25rem; font-weight: 700; }
.app-main { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
</style>
