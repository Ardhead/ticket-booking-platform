export interface Seat {
  id: string
  rowLabel: string
  seatNumber: number
  status: number
}

export function useSeats(eventId: Ref<string>) {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const { data, pending, error, refresh } = useFetch<Seat[]>(
    () => `${apiBase}/api/events/${eventId.value}/seats`,
    { lazy: true, default: () => [] },
  )

  const selectedIds = ref<Set<string>>(new Set())

  function toggleSelect(seatId: string) {
    const next = new Set(selectedIds.value)
    if (next.has(seatId)) {
      next.delete(seatId)
    } else {
      next.add(seatId)
    }
    selectedIds.value = next
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  return {
    seats: data,
    loading: pending,
    error,
    refresh,
    selectedIds: readonly(selectedIds),
    toggleSelect,
    clearSelection,
  }
}
