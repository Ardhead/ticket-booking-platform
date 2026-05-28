export function useReservation() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const reserving = ref(false)
  const error = ref<string | null>(null)

  async function reserve(eventId: string, seatIds: string[]) {
    reserving.value = true
    error.value = null

    const idempotencyKey = crypto.randomUUID()
    const userId = crypto.randomUUID()

    try {
      const res = await $fetch(`${apiBase}/api/reservations`, {
        method: 'POST',
        body: { seatIds },
        headers: {
          'x-idempotency-key': idempotencyKey,
          'x-user-id': userId,
          'x-event-id': eventId,
        },
        retry: 1,
        retryDelay: 500,
      })

      const data = res as { reservationId: string; expiresAt: string }
      return {
        reservationId: data.reservationId,
        expiresAt: new Date(data.expiresAt),
        userId,
      }
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Reservation failed'
      return null
    } finally {
      reserving.value = false
    }
  }

  async function initiatePayment(reservationId: string, amount: number) {
    const idempotencyKey = crypto.randomUUID()

    try {
      const res = await $fetch(`${apiBase}/api/payments`, {
        method: 'POST',
        body: { reservationId, amount },
        headers: { 'x-idempotency-key': idempotencyKey },
      })
      return (res as { paymentId: string }).paymentId
    } catch {
      return null
    }
  }

  return { reserve, initiatePayment, reserving, error }
}
