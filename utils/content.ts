import type { SanityImageSource } from '@sanity/image-url'

export interface Animal {
  id: string
  name: string
  sortOrder: number
  usdaWholeF: number
  usdaGroundF: number
  restMinutes: number
}

export interface DonenessBand {
  order: number
  stop: string
  startF: number | null
  endF: number | null
  startC: number | null
  endC: number | null
  color: string
}

export interface Cut {
  id: string
  name: string
  animalId: string
  sortOrder: number
  image: SanityImageSource | null
  fatPercent: number
  asSold: string
  fatImage: SanityImageSource | null
  usdaSafeF: number
  scaleMaxF: number | null
  similarCutIds: string[]
  cutType: 'lean-tender' | 'rich-tender' | 'lean-tough' | 'rich-tough'
  ground: boolean
  doneness: DonenessBand[]
}

export interface MethodStep {
  phase: 'Before' | 'During' | 'After'
  order: number
  text: string
}

export interface Method {
  id: string
  name: string
  sortOrder: number
  image: SanityImageSource | null
  heat: 'Dry' | 'Wet' | 'Combination'
  pace: 'Fast and hot' | 'Low and slow' | 'Either'
  equipment: string[]
  steps: MethodStep[]
  tagIds: string[]
}

export interface Tag {
  id: string
  name: string
  sortOrder: number
}

export interface GlossaryEntry {
  id: string
  term: string
  definition: string
}

export interface Content {
  animals: Animal[]
  cuts: Cut[]
  methods: Method[]
  tags: Tag[]
  glossary: GlossaryEntry[]
}

export const toCelsius = (f: number) => Math.round(((f - 32) * 5) / 9)

/**
 * Doneness bands store only their Start °F: each band's End °F is the next
 * stop's start (or the cut's Scale max °F for the last stop), and °C is
 * calculated. Bacon's stops are by look, so they have no temperatures.
 */
export function computeDoneness(
  bands: Pick<DonenessBand, 'order' | 'stop' | 'startF' | 'color'>[],
  scaleMaxF: number | null,
): DonenessBand[] {
  const sorted = [...bands].sort((a, b) => a.order - b.order)
  return sorted.map((band, i) => {
    if (band.startF == null) return {...band, endF: null, startC: null, endC: null}
    const endF = i < sorted.length - 1 ? sorted[i + 1].startF : scaleMaxF
    return {
      ...band,
      endF,
      startC: toCelsius(band.startF),
      endC: endF != null ? toCelsius(endF) : null,
    }
  })
}

export interface AnimalGroup<T> {
  animal: Animal
  items: T[]
}

/** Group cuts under their animal, ordered by animal sort order then cut sort order. */
export function groupCutsByAnimal(cutList: Cut[], animals: Animal[]): AnimalGroup<Cut>[] {
  return [...animals]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((animal) => ({
      animal,
      items: cutList
        .filter((c) => c.animalId === animal.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((group) => group.items.length > 0)
}

/** True when the cut's doneness is by look, not temperature (bacon). */
export const isByLook = (cut: Cut) => cut.doneness.some((b) => b.startF == null)
