<script setup lang="ts">
useHead({ title: 'All cuts' })

const { animals, cuts } = await useContent()

const search = ref('')
const query = computed(() => search.value.trim().toLowerCase())
const matches = (name: string) => !query.value || name.toLowerCase().includes(query.value)

const cutGroups = computed(() =>
  groupCutsByAnimal(cuts.value.filter((c) => matches(c.name)), animals.value),
)
const noMatches = computed(() => cutGroups.value.length === 0)

// On a nested /cuts/:id route, hide the list and let <NuxtPage /> render the detail.
const route = useRoute()
const isDetail = computed(() => route.params.id !== undefined)
</script>

<template>
  <div v-if="!isDetail" class="browse browse--cuts">
    <SearchField v-model="search" class="browse__search" />

    <p v-if="noMatches" class="browse__empty">No matches.</p>

    <template v-else>
      <section v-for="group in cutGroups" :key="group.animal.id" class="browse__group">
        <h2 class="browse__group-heading">{{ group.animal.name }}</h2>
        <div class="browse__group-body">
          <ul class="browse__tiles">
            <li v-for="c in group.items" :key="c.id">
              <ItemTile :name="c.name" :image="c.image" :to="`/cuts/${c.id}`" />
            </li>
          </ul>
        </div>
      </section>
    </template>
  </div>
  <!-- Nested route: /cuts/:id renders here -->
  <NuxtPage />
</template>
