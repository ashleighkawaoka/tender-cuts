<script setup>
useHead({
  titleTemplate: (title) => (title ? `${title} | Tender Cuts` : 'Tender Cuts'),
  htmlAttrs: { lang: 'en' },
})
</script>

<template>
  <div class="site">
    <a href="#main" class="screen-reader-text">Skip to content</a>
    <AppHeader />
    <main id="main" class="site__main">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>
