<script setup lang="ts">
import type { DragItem } from '~/composables/useDragItem'

const props = defineProps<{
  label: string
  accepts: DragItem['type']
  /** Item filling the slot, with a link to its detail page. Null when empty. */
  item: { id: string; name: string; image: string; to: string } | null
  /** Whether the item currently being dragged may drop here. */
  canDrop: (item: DragItem) => boolean
}>()

const emit = defineEmits<{
  drop: [id: string]
  clear: []
}>()

const { dragItem, endDrag } = useDragItem()
const isOver = ref(false)

const droppable = computed(() =>
  dragItem.value !== null && dragItem.value.type === props.accepts && props.canDrop(dragItem.value),
)

function onDragOver(event: DragEvent) {
  if (!droppable.value) return
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  isOver.value = true
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isOver.value = false
  const item = dragItem.value
  endDrag()
  if (item && item.type === props.accepts && props.canDrop(item)) {
    emit('drop', item.id)
  }
}
</script>

<template>
  <div
    class="slot"
    :class="{
      'slot--filled': item !== null,
      'slot--over': isOver,
      'slot--ready': droppable && !isOver,
    }"
    @dragover="onDragOver"
    @dragleave="isOver = false"
    @drop="onDrop"
  >
    <span v-if="!item" class="slot__label">{{ label }}</span>
    <template v-else>
      <NuxtLink :to="item.to" class="slot__link">
        <img class="slot__image" :src="`/images/${item.image}`" :alt="item.name" />
        <span class="slot__name">{{ item.name }}</span>
      </NuxtLink>
      <button
        type="button"
        class="slot__clear"
        :aria-label="`Clear ${label.toLowerCase()}`"
        @click="emit('clear')"
      >
        ×
      </button>
    </template>
  </div>
</template>
