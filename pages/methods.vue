<script setup lang="ts">
useHead({ title: 'All methods' })

const { methods } = await useContent()

const search = ref('')
const query = computed(() => search.value.trim().toLowerCase())
const filteredMethods = computed(() =>
  methods.value.filter((m) => !query.value || m.name.toLowerCase().includes(query.value)),
)
const noMatches = computed(() => filteredMethods.value.length === 0)

// On a nested /methods/:id route, hide the list and let <NuxtPage /> render the detail.
const route = useRoute()
const isDetail = computed(() => route.params.id !== undefined)
</script>

<template>
  <div v-if="!isDetail" class="browse browse--methods">
    <SearchField v-model="search" class="browse__search" />

    <p v-if="noMatches" class="browse__empty">No matches.</p>

    <ul v-else class="browse__tiles">
      <li v-for="m in filteredMethods" :key="m.id">
        <ItemTile :name="m.name" :image="m.image" :to="`/methods/${m.id}`" />
      </li>
    </ul>
  </div>
  <!-- Nested route: /methods/:id renders here -->
  <NuxtPage />
</template>
