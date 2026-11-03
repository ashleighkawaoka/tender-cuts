<script setup lang="ts">
import type { Tag } from '~/utils/content'

defineProps<{ tag: Tag }>()
</script>

<template>
  <NuxtLink :to="`/glossary#${tag.id}`" class="chip">{{ tag.name }}</NuxtLink>
</template>
