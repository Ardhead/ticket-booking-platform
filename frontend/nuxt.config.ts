export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: { strict: true },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },

  },
  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },
})
