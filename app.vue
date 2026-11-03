<script setup>
useHead({
  titleTemplate: (title) => (title ? `${title} | Tender Cuts` : 'Tender Cuts'),
  htmlAttrs: { lang: 'en' },
})
</script>

<template>
  <div class="site">
    <a href="#main" class="screen-reader-text">Skip to content</a>
    <main id="main" class="site__main">
      <NuxtPage />
    </main>
  </div>
</template>
