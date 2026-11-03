<script setup lang="ts">
import type { GlossaryEntry, MethodStep } from '~/utils/content'

const props = defineProps<{ steps: MethodStep[]; terms: GlossaryEntry[] }>()

const phases = computed(() =>
  (['Before', 'During', 'After'] as const)
    .map((phase) => ({
      phase,
      label: `${phase} the heat`,
      steps: props.steps.filter((s) => s.phase === phase).sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.steps.length > 0),
)
</script>

<template>
  <div class="steps">
    <section v-for="group in phases" :key="group.phase" class="steps__group">
      <h3 class="steps__heading">{{ group.label }}</h3>
      <ol class="steps__list">
        <li v-for="step in group.steps" :key="step.order" class="steps__step">
          <template v-for="(segment, i) in linkGlossaryTerms(step.text, terms)" :key="i">
            <NuxtLink
              v-if="segment.glossaryId"
              :to="`/glossary#${segment.glossaryId}`"
              class="steps__term"
            >{{ segment.text }}</NuxtLink>
            <template v-else>{{ segment.text }}</template>
          </template>
        </li>
      </ol>
    </section>
  </div>
</template>
