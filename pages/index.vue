<script setup lang="ts">
import type { DragItem } from '~/composables/useDragItem'

useHead({ title: 'What will heat do to this cut?' })

const { animals, cuts, methods, getCut, getMethod, hasFit, tagsForMethod } = await useContent()

const view = ref<'cut' | 'method'>('cut')
const cutId = ref<string | null>(null)
const methodId = ref<string | null>(null)

const { startDrag, endDrag } = useDragItem()

const cut = computed(() => (cutId.value ? getCut(cutId.value) : undefined))
const method = computed(() => (methodId.value ? getMethod(methodId.value) : undefined))

const cutGroups = computed(() => groupCutsByAnimal(cuts.value, animals.value))

// Dimming: with the other slot filled, anything without a Fit row is locked.
const isCutDimmed = (id: string) => methodId.value !== null && !hasFit(id, methodId.value)
const isMethodDimmed = (id: string) => cutId.value !== null && !hasFit(cutId.value, id)

const canDrop = (item: DragItem) =>
  item.type === 'cut' ? !isCutDimmed(item.id) : !isMethodDimmed(item.id)

function place(item: DragItem) {
  if (!canDrop(item)) return
  if (item.type === 'cut') cutId.value = item.id
  else methodId.value = item.id
}

function onTileDragStart(item: DragItem, event: DragEvent) {
  startDrag(item)
  event.dataTransfer?.setData('text/plain', item.id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const methodTags = computed(() => (methodId.value ? tagsForMethod(methodId.value) : []))
</script>

<template>
  <div class="game">
    <div class="game__slots">
      <PairSlot
        label="Cut"
        accepts="cut"
        :item="cut ? { id: cut.id, name: cut.name, image: cut.image, to: `/cuts/${cut.id}` } : null"
        :can-drop="canDrop"
        @drop="(id) => (cutId = id)"
        @clear="cutId = null"
      />
      <PairSlot
        label="Method"
        accepts="method"
        :item="method ? { id: method.id, name: method.name, image: method.image, to: `/methods/${method.id}` } : null"
        :can-drop="canDrop"
        @drop="(id) => (methodId = id)"
        @clear="methodId = null"
      />
    </div>

    <div class="game__zone">
      <section v-if="methodTags.length" class="game__chips" aria-label="What the method does">
        <h2 class="game__chips-heading">What the method does</h2>
        <ul class="game__chips-list">
          <li v-for="tag in methodTags" :key="tag.id">
            <TagChip :tag="tag" />
          </li>
        </ul>
      </section>

      <ViewToggle
        v-model="view"
        :options="[
          { value: 'cut', label: 'Cut' },
          { value: 'method', label: 'Method' },
        ]"
        class="game__toggle"
      />

      <div v-if="view === 'cut'" class="game__selector">
        <section v-for="group in cutGroups" :key="group.animal.id" class="game__group">
          <h2 class="game__group-heading">{{ group.animal.name }}</h2>
          <ul class="game__words">
            <li v-for="c in group.items" :key="c.id">
              <button
                type="button"
                class="game__word"
                :class="{ 'game__word--dimmed': isCutDimmed(c.id) }"
                :disabled="isCutDimmed(c.id)"
                :tabindex="isCutDimmed(c.id) ? -1 : undefined"
                :draggable="!isCutDimmed(c.id)"
                @click="place({ type: 'cut', id: c.id })"
                @dragstart="onTileDragStart({ type: 'cut', id: c.id }, $event)"
                @dragend="endDrag"
              >{{ c.name }}</button>
            </li>
          </ul>
        </section>
      </div>

      <div v-else class="game__selector">
        <ul class="game__words">
          <li v-for="m in methods" :key="m.id">
            <button
              type="button"
              class="game__word"
              :class="{ 'game__word--dimmed': isMethodDimmed(m.id) }"
              :disabled="isMethodDimmed(m.id)"
              :tabindex="isMethodDimmed(m.id) ? -1 : undefined"
              :draggable="!isMethodDimmed(m.id)"
              @click="place({ type: 'method', id: m.id })"
              @dragstart="onTileDragStart({ type: 'method', id: m.id }, $event)"
              @dragend="endDrag"
            >{{ m.name }}</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
