<template>
  <header class="header">
    <NuxtLink to="/" class="header__logo" aria-label="Tender Cuts — home">
      <img src="/logo.svg" alt="Tender Cuts" class="header__logo-image" width="240" height="48" />
    </NuxtLink>
    <nav class="header__nav" aria-label="Site">
      <NuxtLink to="/browse" class="header__link">All cuts and methods</NuxtLink>
      <NuxtLink to="/glossary" class="header__link">Glossary</NuxtLink>
    </nav>
  </header>
</template>
