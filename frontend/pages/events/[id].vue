<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()
const eventId = computed(() => route.params.id as string)

const { data: event } = useFetch<{ id: string; name: string; startsAt: string }>(
  () => `${apiBase}/api/events/${eventId.value}`,
  { default: () => null as any },
)

const {
  seats, loading, selectedIds, toggleSelect,
} = useSeats(eventId)

const { reserve, reserving } = useReservation()
const router = useRouter()

async function handleReserve() {
  const seatIds = Array.from(selectedIds.value)
  if (seatIds.length === 0) return

  const result = await reserve(eventId.value, seatIds)
  if (result) {
    router.push(`/checkout/${result.reservationId}?expiresAt=${result.expiresAt.toISOString()}&eventId=${eventId.value}`)
  }
}
</script>

<template>
  <div v-if="event">
    <h1 class="page-title">{{ event.name }}</h1>
    <p class="event-date">{{ new Date(event.startsAt).toLocaleString() }}</p>

    <SeatMap
      :seats="seats"
      :selected-ids="selectedIds"
      :loading="loading"
      @select="toggleSelect"
    />

    <div class="actions">
      <p class="selected-count" v-if="selectedIds.size > 0">
        {{ selectedIds.size }} seat(s) selected
      </p>
      <button
        class="btn btn-primary"
        :disabled="selectedIds.size === 0 || reserving"
        @click="handleReserve"
      >
        {{ reserving ? 'Reserving...' : 'Reserve Seats' }}
      </button>
    </div>
  </div>
  <div v-else class="loading">Loading event...</div>
</template>

<style scoped>
.page-title { font-size: 1.5rem; margin-bottom: 0.25rem; }
.event-date { color: #6b7280; margin-bottom: 1rem; }
.actions { text-align: center; margin-top: 1.5rem; }
.selected-count { margin-bottom: 0.75rem; color: #374151; }
.btn {
  padding: 0.6rem 1.5rem; border: none; border-radius: 6px;
  font-size: 1rem; cursor: pointer; transition: opacity 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.loading { text-align: center; padding: 2rem; color: #6b7280; }
</style>
