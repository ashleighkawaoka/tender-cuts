<script setup lang="ts">
defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="search">
    <label for="search-input" class="screen-reader-text">Search</label>
    <input
      id="search-input"
      class="search__input"
      type="search"
      placeholder="Search"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
