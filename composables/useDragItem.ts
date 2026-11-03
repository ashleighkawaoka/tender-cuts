export interface DragItem {
  type: 'cut' | 'method'
  id: string
}

// Same-window drag state, so slots can check what is being dragged during
// dragover (dataTransfer data is protected until drop).
const dragItem = ref<DragItem | null>(null)

export function useDragItem() {
  return {
    dragItem,
    startDrag(item: DragItem) {
      dragItem.value = item
    },
    endDrag() {
      dragItem.value = null
    },
  }
}
