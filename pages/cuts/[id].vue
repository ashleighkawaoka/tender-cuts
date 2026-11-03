<script setup lang="ts">
const { getCut, getAnimal, methodsForCut } = await useContent()

const route = useRoute()
const cut = computed(() => getCut(route.params.id as string))

if (!cut.value) {
  throw createError({ statusCode: 404, statusMessage: 'Cut not found' })
}

const animal = computed(() => getAnimal(cut.value!.animalId))
const suitedMethods = computed(() => methodsForCut(cut.value!.id))
const similarCuts = computed(() =>
  cut.value!.similarCutIds
    .map((id) => getCut(id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined),
)

useHead({ title: computed(() => cut.value?.name) })
</script>

<template>
  <article v-if="cut" class="detail">
    <header class="detail__header">
      <div class="detail__heading">
        <h1 class="detail__name">{{ cut.name }}</h1>
        <p v-if="animal" class="detail__animal">{{ animal.name }}</p>
      </div>
      <img class="detail__image" :src="`/images/${cut.image}`" :alt="cut.name" />
    </header>

    <section class="detail__section detail__fat" aria-label="Fat">
      <h2 class="detail__section-heading">Fat</h2>
      <p class="detail__fat-value">{{ cut.fatPercent }}%</p>
      <img
        class="detail__fat-image"
        :src="`/images/${cut.fatImage}`"
        :alt="`${cut.name} fat ${cut.fatPercent}%`"
      />
    </section>

    <section class="detail__section" aria-label="Doneness">
      <h2 class="detail__section-heading">Doneness</h2>
      <DonenessDial :cut="cut" />
    </section>

    <section v-if="suitedMethods.length" class="detail__section" aria-label="Methods that suit it">
      <h2 class="detail__section-heading">Methods that suit it</h2>
      <ul class="detail__tiles">
        <li v-for="m in suitedMethods" :key="m.id">
          <ItemTile :name="m.name" :image="m.image" :to="`/methods/${m.id}`" />
        </li>
      </ul>
    </section>

    <section v-if="similarCuts.length" class="detail__section" aria-label="Similar cuts">
      <h2 class="detail__section-heading">Similar cuts</h2>
      <ul class="detail__tiles">
        <li v-for="c in similarCuts" :key="c.id">
          <ItemTile :name="c.name" :image="c.image" :to="`/cuts/${c.id}`" />
        </li>
      </ul>
    </section>
  </article>
</template>
