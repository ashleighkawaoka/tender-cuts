<script setup lang="ts">
useHead({ title: 'All cuts and methods' })

const { animals, cuts, methods } = await useContent()

const route = useRoute()
const router = useRouter()

// The current view lives in the URL so it can be linked and survives refresh.
const view = computed<'cuts' | 'methods'>({
  get: () => (route.query.view === 'methods' ? 'methods' : 'cuts'),
  set: (value) => {
    search.value = ''
    router.replace({ query: value === 'cuts' ? {} : { view: value } })
  },
})

const search = ref('')

const query = computed(() => search.value.trim().toLowerCase())
const matches = (name: string) => !query.value || name.toLowerCase().includes(query.value)

const cutGroups = computed(() =>
  groupCutsByAnimal(cuts.value.filter((c) => matches(c.name)), animals.value),
)
const filteredMethods = computed(() => methods.value.filter((m) => matches(m.name)))
const noMatches = computed(() =>
  view.value === 'cuts' ? cutGroups.value.length === 0 : filteredMethods.value.length === 0,
)
</script>

<template>
  <div class="browse">
    <ViewToggle
      v-model="view"
      :options="[
        { value: 'cuts', label: 'All cuts' },
        { value: 'methods', label: 'All methods' },
      ]"
      class="browse__toggle"
    />

    <SearchField v-model="search" class="browse__search" />

    <p v-if="noMatches" class="browse__empty">No matches.</p>

    <template v-else-if="view === 'cuts'">
      <section v-for="group in cutGroups" :key="group.animal.id" class="browse__group">
        <h2 class="browse__group-heading">{{ group.animal.name }}</h2>
        <ul class="browse__tiles">
          <li v-for="c in group.items" :key="c.id">
            <ItemTile :name="c.name" :image="c.image" :to="`/cuts/${c.id}`" />
          </li>
        </ul>
      </section>
    </template>

    <ul v-else class="browse__tiles">
      <li v-for="m in filteredMethods" :key="m.id">
        <ItemTile :name="m.name" :image="m.image" :to="`/methods/${m.id}`" />
      </li>
    </ul>
  </div>
</template>
