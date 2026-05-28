export function useTimer(expiresAt: Ref<Date | null>) {
  const remaining = ref(0)
  let interval: ReturnType<typeof setInterval> | null = null

  function stop() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  function start() {
    stop()
    tick()
    if (typeof window !== 'undefined') {
      interval = window.setInterval(tick, 1000)
    }
  }

  function tick() {
    if (!expiresAt.value) {
      remaining.value = 0
      return
    }
    const diff = expiresAt.value.getTime() - Date.now()
    remaining.value = Math.max(0, Math.floor(diff / 1000))
    if (remaining.value <= 0) stop()
  }

  onUnmounted(stop)

  watch(expiresAt, (val) => {
    if (val) start()
    else stop()
  }, { immediate: true })

  const minutes = computed(() => Math.floor(remaining.value / 60))
  const seconds = computed(() => remaining.value % 60)
  const expired = computed(() => remaining.value <= 0)
  const display = computed(() => {
    if (expired.value && expiresAt.value) return 'Expired'
    if (!expiresAt.value) return ''
    return `${minutes.value}:${seconds.value.toString().padStart(2, '0')}`
  })

  return { remaining, minutes, seconds, expired, display, start, stop }
}
