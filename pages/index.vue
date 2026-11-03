<script setup lang="ts">
useHead({ title: 'What will heat do to this cut?' })

const { cuts, methods, getCut, getMethod, hasFit, tagsForMethod } = await useContent()
const { urlFor } = useImageUrl()

const cutId = ref<string | null>(null)
const methodId = ref<string | null>(null)

const cut = computed(() => (cutId.value ? getCut(cutId.value) : undefined))
const method = computed(() => (methodId.value ? getMethod(methodId.value) : undefined))

const cutImage = computed(() => urlFor(cut.value?.image)?.ignoreImageParams().url() ?? '')
const methodImage = computed(() => urlFor(method.value?.image)?.ignoreImageParams().url() ?? '')

// Dimming: with the other column filled, anything without a Fit row is locked.
const isCutDimmed = (id: string) => methodId.value !== null && !hasFit(id, methodId.value)
const isMethodDimmed = (id: string) => cutId.value !== null && !hasFit(cutId.value, id)

const methodTags = computed(() => (methodId.value ? tagsForMethod(methodId.value) : []))

const producesHeading = computed(() => {
  if (method.value && cut.value) return `What ${method.value.name} ${cut.value.name} produces`
  if (method.value) return `What ${method.value.name} produces`
  if (cut.value) return `What ${cut.value.name} produces`
  return 'Produces'
})

// Show a few options per column initially; "See more" reveals the rest.
const INITIAL_COUNT = 5
const methodsExpanded = ref(false)
const cutsExpanded = ref(false)
const visibleMethods = computed(() =>
  methodsExpanded.value ? methods.value : methods.value.slice(0, INITIAL_COUNT),
)
const visibleCuts = computed(() =>
  cutsExpanded.value ? cuts.value : cuts.value.slice(0, INITIAL_COUNT),
)
</script>

<template>
  <div class="game">
    <div class="game__columns">
      <section class="game__column" aria-label="Method">
        <header class="game__bar">
          <span class="game__bar-label">Method</span>
          <button
            v-if="method"
            type="button"
            class="game__clear"
            aria-label="Clear method"
            @click="methodId = null"
          >×</button>
        </header>
        <NuxtLink v-if="method" :to="`/methods/${method.id}`" class="game__figure">
          <img v-if="methodImage" class="game__image" :src="methodImage" :alt="method.name" />
          <span class="game__figure-name">{{ method.name }}</span>
        </NuxtLink>
        <ul v-else class="game__list">
          <li v-for="m in visibleMethods" :key="m.id">
            <button
              type="button"
              class="game__option"
              :class="{ 'game__option--dimmed': isMethodDimmed(m.id) }"
              :disabled="isMethodDimmed(m.id)"
              @click="methodId = m.id"
            >{{ m.name }}</button>
          </li>
        </ul>
        <button
          v-if="!method && !methodsExpanded && methods.length > INITIAL_COUNT"
          type="button"
          class="game__more"
          @click="methodsExpanded = true"
        >See more</button>
      </section>

      <section class="game__column" aria-label="Cut">
        <header class="game__bar">
          <span class="game__bar-label">Cut</span>
          <button
            v-if="cut"
            type="button"
            class="game__clear"
            aria-label="Clear cut"
            @click="cutId = null"
          >×</button>
        </header>
        <NuxtLink v-if="cut" :to="`/cuts/${cut.id}`" class="game__figure">
          <img v-if="cutImage" class="game__image" :src="cutImage" :alt="cut.name" />
          <span class="game__figure-name">{{ cut.name }}</span>
        </NuxtLink>
        <ul v-else class="game__list">
          <li v-for="c in visibleCuts" :key="c.id">
            <button
              type="button"
              class="game__option"
              :class="{ 'game__option--dimmed': isCutDimmed(c.id) }"
              :disabled="isCutDimmed(c.id)"
              @click="cutId = c.id"
            >{{ c.name }}</button>
          </li>
        </ul>
        <button
          v-if="!cut && !cutsExpanded && cuts.length > INITIAL_COUNT"
          type="button"
          class="game__more"
          @click="cutsExpanded = true"
        >See more</button>
      </section>
    </div>

    <section class="game__produces" aria-label="What the method produces">
      <h2 class="game__produces-heading">{{ producesHeading }}</h2>
      <ul v-if="methodTags.length" class="game__produces-list">
        <li v-for="tag in methodTags" :key="tag.id">
          <TagChip :tag="tag" />
        </li>
      </ul>
    </section>
  </div>
</template>
