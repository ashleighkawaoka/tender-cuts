<script setup lang="ts">
import type { SanityImageSource } from '@sanity/image-url'

const props = withDefaults(
  defineProps<{
    name: string
    image: SanityImageSource | null
    /** Link target. Omit for a button tile (e.g. the homepage selector). */
    to?: string
    dimmed?: boolean
    draggable?: boolean
  }>(),
  { to: undefined, dimmed: false, draggable: false },
)

const { urlFor } = useImageUrl()
// Serve the image full-size; CSS sizes it to the tile. ignoreImageParams drops
// the hotspot crop so the whole image is used. No width param: it would make
// the CDN return a tiny SVG thumbnail.
const src = computed(() => urlFor(props.image)?.ignoreImageParams().url() ?? '')

const emit = defineEmits<{
  select: []
  dragstart: [event: DragEvent]
  dragend: []
}>()

// Dimmed tiles are locked: no drag, tap, focus, or hover.
const component = computed(() => {
  if (props.dimmed) return 'span'
  return props.to ? resolveComponent('NuxtLink') : 'button'
})

const componentProps = computed(() => {
  if (props.dimmed) {
    return { 'aria-disabled': 'true', tabindex: -1, draggable: false }
  }
  if (props.to) {
    return { to: props.to, draggable: props.draggable }
  }
  return { type: 'button', draggable: props.draggable }
})

function onClick() {
  if (!props.to && !props.dimmed) emit('select')
}

function onDragStart(event: DragEvent) {
  if (props.dimmed || !props.draggable) {
    event.preventDefault()
    return
  }
  emit('dragstart', event)
}
</script>

<template>
  <component
    :is="component"
    v-bind="componentProps"
    class="tile"
    :class="{ 'tile--dimmed': dimmed }"
    @click="onClick"
    @dragstart="onDragStart"
    @dragend="emit('dragend')"
  >
    <span class="tile__image-wrap">
      <img v-if="src" class="tile__image" :src="src" :alt="name" loading="lazy" />
    </span>
    <span class="tile__name">{{ name }}</span>
  </component>
</template>
