<script setup lang="ts">
import type { Seat } from '~/composables/useSeats'

const props = defineProps<{
  seats: Seat[]
  selectedIds: Set<string>
  loading: boolean
}>()

const emit = defineEmits<{
  select: [seatId: string]
}>()

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>()

function handleClick(seat: Seat) {
  if (seat.status !== 0) return
  if (debounceMap.has(seat.id)) return
  emit('select', seat.id)
  debounceMap.set(seat.id, setTimeout(() => debounceMap.delete(seat.id), 300))
}

const rows = computed(() => {
  const map = new Map<string, Seat[]>()
  for (const s of props.seats) {
    if (!map.has(s.rowLabel)) map.set(s.rowLabel, [])
    map.get(s.rowLabel)!.push(s)
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
})
</script>

<template>
  <div class="seat-map">
    <div v-if="loading" class="seat-map-loading">Loading seats...</div>
    <div v-else-if="seats.length === 0" class="seat-map-empty">No seats available</div>
    <div v-else class="seat-grid">
      <div v-for="[row, rowSeats] in rows" :key="row" class="seat-row">
        <span class="seat-row-label">{{ row }}</span>
        <button
          v-for="seat in rowSeats"
          :key="seat.id"
          class="seat"
          :class="{ selected: selectedIds.has(seat.id), reserved: seat.status === 1, sold: seat.status === 2 }"
          :disabled="seat.status !== 0"
          @click="handleClick(seat)"
        >
          {{ seat.seatNumber }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seat-map { margin: 1.5rem 0; }
.seat-map-loading, .seat-map-empty { text-align: center; padding: 2rem; color: #6b7280; }
.seat.reserved { background: #000; color: #fff; border-color: #000; cursor: not-allowed; }
.seat.sold { background: #2563eb; color: #fff; border-color: #2563eb; cursor: not-allowed; }
.seat-grid { display: flex; flex-direction: column; gap: 0.5rem; align-items: center; }
.seat-row { display: flex; align-items: center; gap: 0.35rem; }
.seat-row-label { width: 1.5rem; font-weight: 600; color: #6b7280; text-align: right; }
.seat {
  width: 2.25rem; height: 2.25rem; border: 1px solid #ccc; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 0.75rem; transition: all 0.15s;
}
.seat:hover { border-color: #2563eb; background: #eff6ff; }
.seat.selected { background: #2563eb; color: #fff; border-color: #2563eb; }
</style>
