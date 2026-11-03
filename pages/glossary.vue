<script setup lang="ts">
useHead({ title: 'Glossary' })

const { glossary } = await useContent()
</script>

<template>
  <div class="glossary">
    <h1 class="glossary__title">Glossary</h1>
    <dl class="glossary__list">
      <div v-for="entry in glossary" :key="entry.id" :id="entry.id" class="glossary__entry">
        <dt class="glossary__term">{{ entry.term }}</dt>
        <dd class="glossary__definition">{{ entry.definition }}</dd>
      </div>
    </dl>
  </div>
</template>
