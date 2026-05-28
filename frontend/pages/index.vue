<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

interface EventItem {
  id: string
  name: string
  startsAt: string
}

const { data: events, pending } = useFetch<EventItem[]>(`${apiBase}/api/events`, {
  default: () => [],
})
</script>

<template>
  <div>
    <h1 class="page-title">Upcoming Events</h1>
    <div v-if="pending" class="loading">Loading events...</div>
    <div v-else-if="events.length === 0" class="empty">No events scheduled</div>
    <div v-else class="event-list">
      <NuxtLink
        v-for="event in events"
        :key="event.id"
        :to="`/events/${event.id}`"
        class="event-card"
      >
        <h2>{{ event.name }}</h2>
        <p class="event-date">{{ new Date(event.startsAt).toLocaleString() }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.page-title { font-size: 1.5rem; margin-bottom: 1.5rem; }
.loading, .empty { text-align: center; padding: 2rem; color: #6b7280; }
.event-list { display: flex; flex-direction: column; gap: 0.75rem; }
.event-card {
  display: block; padding: 1rem 1.25rem; background: #fff; border-radius: 8px;
  border: 1px solid #e5e7eb; transition: box-shadow 0.15s;
}
.event-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.event-date { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
</style>
