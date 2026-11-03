import type {Animal, Content, Cut, GlossaryEntry, Method, Tag} from '~/utils/content'

// One small dataset powers every page, so fetch it all in a single query.
// Identical queries share Nuxt's async-data cache, so every page reuses it.
const CONTENT_QUERY = groq`{
  "animals": *[_type == "animal"] | order(sortOrder asc) {
    "id": id, name, sortOrder, usdaWholeF, usdaGroundF, restMinutes
  },
  "cuts": *[_type == "cut"] {
    "id": id, name, "animalId": animal->id, sortOrder,
    "image": cutImage, fatPercent, asSold, "fatImage": fatImage, scaleMaxF,
    "similarCutIds": similarCuts[]->id,
    cutType, ground,
    "doneness": doneness[] | order(order asc) {order, stop, startF, color},
    "fitMethodIds": fit[]->id
  },
  "methods": *[_type == "method"] | order(sortOrder asc) {
    "id": id, name, sortOrder, image, heat, pace, equipment,
    "steps": steps[] {phase, order, "text": step},
    "tagIds": tags[]->id
  },
  "tags": *[_type == "tag"] | order(sortOrder asc) { "id": id, name, sortOrder },
  "glossary": *[_type == "glossaryTerm"] { "id": id, term, definition }
}`

interface RawContent {
  animals: Animal[]
  cuts: (Omit<Cut, 'usdaSafeF' | 'doneness'> & {
    doneness: Pick<Cut['doneness'][number], 'order' | 'stop' | 'startF' | 'color'>[]
    fitMethodIds: string[]
  })[]
  methods: Method[]
  tags: Tag[]
  glossary: GlossaryEntry[]
}

export async function useContent() {
  const {data} = await useSanityQuery<RawContent>(CONTENT_QUERY)

  const content = computed<Content>(() => {
    const raw = data.value
    if (!raw) return {animals: [], cuts: [], methods: [], tags: [], glossary: []}

    const animalById = new Map(raw.animals.map((a) => [a.id, a]))

    const cuts: Cut[] = raw.cuts.map(({fitMethodIds: _fit, doneness, ...cut}) => ({
      ...cut,
      // From the animal: ground cuts use the ground safe minimum.
      usdaSafeF: cut.ground
        ? (animalById.get(cut.animalId)?.usdaGroundF ?? 0)
        : (animalById.get(cut.animalId)?.usdaWholeF ?? 0),
      doneness: computeDoneness(doneness, cut.scaleMaxF),
    }))

    return {
      animals: raw.animals,
      cuts,
      methods: raw.methods,
      tags: raw.tags,
      glossary: [...raw.glossary].sort((a, b) => a.term.localeCompare(b.term)),
    }
  })

  const fits = computed(() =>
    (data.value?.cuts ?? []).flatMap((c) =>
      (c.fitMethodIds ?? []).map((method) => ({cut: c.id, method})),
    ),
  )

  const getAnimal = (id: string) => content.value.animals.find((a) => a.id === id)
  const getCut = (id: string) => content.value.cuts.find((c) => c.id === id)
  const getMethod = (id: string) => content.value.methods.find((m) => m.id === id)
  const getTag = (id: string) => content.value.tags.find((t) => t.id === id)

  const hasFit = (cutId: string, methodId: string) =>
    fits.value.some((f) => f.cut === cutId && f.method === methodId)

  const methodsForCut = (cutId: string): Method[] =>
    content.value.methods.filter((m) => hasFit(cutId, m.id))

  const cutsForMethod = (methodId: string): Cut[] =>
    content.value.cuts.filter((c) => hasFit(c.id, methodId))

  const tagsForMethod = (methodId: string): Tag[] =>
    (getMethod(methodId)?.tagIds ?? [])
      .map((id) => getTag(id))
      .filter((t): t is Tag => t !== undefined)

  return {
    animals: computed(() => content.value.animals),
    cuts: computed(() => content.value.cuts),
    methods: computed(() => content.value.methods),
    tags: computed(() => content.value.tags),
    glossary: computed(() => content.value.glossary),
    getAnimal,
    getCut,
    getMethod,
    getTag,
    hasFit,
    methodsForCut,
    cutsForMethod,
    tagsForMethod,
  }
}
