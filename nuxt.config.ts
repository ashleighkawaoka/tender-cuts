export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/sanity'],
  css: ['~/scss/main.scss'],
  app: {
    head: {
      // Acme Gothic (Typekit)
      link: [{ rel: 'stylesheet', href: 'https://use.typekit.net/xje3uvp.css' }],
    },
  },
  vite: {
    optimizeDeps: {
      // Pre-bundle so runtime discovery doesn't force page reloads in dev
      include: ['@sanity/client', '@vue/devtools-core'],
    },
  },
  sanity: {
    projectId: 'zn7a2em4',
    dataset: 'production',
    apiVersion: '2026-11-03',
    useCdn: false, // new data shows up right away
  },
})
