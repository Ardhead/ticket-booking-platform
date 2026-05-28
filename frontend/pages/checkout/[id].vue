<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const reservationId = route.params.id as string
const expiresAt = ref(new Date(route.query.expiresAt as string))
const eventId = route.query.eventId as string

const paymentId = ref<string | null>(null)
const paying = ref(false)
const paymentError = ref<string | null>(null)

const { initiatePayment } = useReservation()

async function handlePayment() {
  paying.value = true
  paymentError.value = null
  const id = await initiatePayment(reservationId, 50)
  if (id) {
    paymentId.value = id
  } else {
    paymentError.value = 'Payment initiation failed. Please try again.'
  }
  paying.value = false
}

function handleExpired() {
  router.push(`/events/${eventId}`)
}
</script>

<template>
  <div class="checkout">
    <h1 class="page-title">Complete Reservation</h1>
    <p class="reservation-id">Reservation: {{ reservationId.slice(0, 8) }}…</p>

    <CountdownTimer :expires-at="expiresAt" />

    <div v-if="!paymentId" class="payment-section">
      <button
        class="btn btn-primary"
        :disabled="paying"
        @click="handlePayment"
      >
        {{ paying ? 'Processing…' : 'Pay $50.00' }}
      </button>
      <p v-if="paymentError" class="error">{{ paymentError }}</p>
    </div>

    <div v-else class="payment-success">
      <p>Payment initiated successfully</p>
      <p class="payment-id">Payment ID: {{ paymentId }}</p>
      <p class="note">Waiting for payment confirmation…</p>
    </div>
  </div>
</template>

<style scoped>
.checkout { max-width: 500px; margin: 0 auto; text-align: center; }
.page-title { font-size: 1.5rem; margin-bottom: 0.25rem; }
.reservation-id { color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; }
.payment-section { margin-top: 1.5rem; }
.btn {
  padding: 0.75rem 2rem; border: none; border-radius: 6px;
  font-size: 1rem; cursor: pointer; transition: opacity 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.error { margin-top: 0.75rem; color: #000; }
.payment-success { margin-top: 1.5rem; color: #2563eb; }
.payment-id { font-size: 0.8rem; color: #6b7280; margin-top: 0.25rem; }
.note { margin-top: 1rem; font-size: 0.9rem; color: #6b7280; }
</style>
