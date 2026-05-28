<script setup lang="ts">
import { toRef } from 'vue'

const props = defineProps<{
  expiresAt: Date | null
}>()

const { display, expired } = useTimer(toRef(props, 'expiresAt'))
</script>

<template>
  <div v-if="expiresAt" class="countdown" :class="{ expired }">
    <span v-if="expired">Reservation expired</span>
    <span v-else>Time remaining: <strong>{{ display }}</strong></span>
  </div>
</template>

<style scoped>
.countdown {
  text-align: center; padding: 0.75rem; border-radius: 6px;
  background: #eff6ff; color: #2563eb; font-size: 1.1rem;
}
.countdown.expired { background: #000; color: #fff; }
</style>
