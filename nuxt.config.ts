export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/sanity'],
  css: ['~/scss/main.scss'],
  app: {
    head: {
      // TODO: replace with your own Typekit kit for this site, or remove
      link: [{ rel: 'stylesheet', href: 'https://use.typekit.net/eyr6ctn.css' }],
    },
  },
  sanity: {
    // TODO: replace with the projectId from tender-cuts-sanity/sanity.config.ts
    projectId: 'your-project-id',
    dataset: 'production',
    apiVersion: '2026-11-03',
    useCdn: false, // new data shows up right away
  },
})
