<script setup lang="ts">
const { animals, glossary, getMethod, cutsForMethod } = await useContent()

const route = useRoute()
const method = computed(() => getMethod(route.params.id as string))

if (!method.value) {
  throw createError({ statusCode: 404, statusMessage: 'Method not found' })
}

const suitedCutGroups = computed(() =>
  groupCutsByAnimal(cutsForMethod(method.value!.id), animals.value),
)

useHead({ title: computed(() => method.value?.name) })
</script>

<template>
  <article v-if="method" class="detail">
    <header class="detail__header">
      <div class="detail__heading">
        <h1 class="detail__name">{{ method.name }}</h1>
      </div>
      <img class="detail__image" :src="`/images/${method.image}`" :alt="method.name" />
    </header>

    <section class="detail__section" aria-label="Heat">
      <h2 class="detail__section-heading">Heat</h2>
      <dl class="detail__facts">
        <div class="detail__fact">
          <dt class="detail__fact-label">Heat</dt>
          <dd class="detail__fact-value">{{ method.heat }}</dd>
        </div>
        <div class="detail__fact">
          <dt class="detail__fact-label">Pace</dt>
          <dd class="detail__fact-value">{{ method.pace }}</dd>
        </div>
      </dl>
    </section>

    <section class="detail__section" aria-label="Equipment">
      <h2 class="detail__section-heading">Equipment</h2>
      <ul class="detail__equipment">
        <li v-for="item in method.equipment" :key="item" class="detail__equipment-item">
          {{ item }}
        </li>
      </ul>
    </section>

    <section class="detail__section" aria-label="Steps">
      <h2 class="detail__section-heading">Steps</h2>
      <StepsList :steps="method.steps" :terms="glossary" />
    </section>

    <section v-if="suitedCutGroups.length" class="detail__section" aria-label="Cuts that suit it">
      <h2 class="detail__section-heading">Cuts that suit it</h2>
      <section v-for="group in suitedCutGroups" :key="group.animal.id" class="detail__subgroup">
        <h3 class="detail__subgroup-heading">{{ group.animal.name }}</h3>
        <ul class="detail__tiles">
          <li v-for="c in group.items" :key="c.id">
            <ItemTile :name="c.name" :image="c.image" :to="`/cuts/${c.id}`" />
          </li>
        </ul>
      </section>
    </section>
  </article>
</template>
