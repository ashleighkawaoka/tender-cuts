import type {GlossaryEntry} from '~/utils/content'

export interface TextSegment {
  text: string
  glossaryId: string | null
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Match a term and its simple word forms: "Rest" also matches
 * "rest", "rests", "rested", "resting". A trailing "e" drops for
 * "-ing" ("Dry brine" matches "dry brining"), and a trailing "s"
 * drops for the verb tags ("Browns" matches "browned").
 */
function wordPattern(word: string): string {
  const base = escapeRegExp(word)
  if (word.endsWith('s') && word.length > 1) {
    const stem = escapeRegExp(word.slice(0, -1))
    return `(?:${base}(?:d|ed|ing)?|${stem}(?:s|es|ed|ing|d)?)`
  }
  return word.endsWith('e')
    ? `(?:${base}(?:s|d|ed)?|${escapeRegExp(word.slice(0, -1))}(?:ing|ed))`
    : `(?:${base}(?:s|es|ed|ing|d)?)`
}

/**
 * Split step text into segments, linking glossary terms.
 * Whole words/phrases only, not case-sensitive, longest term first
 * (so "Dry brine" wins over a shorter term inside it), and only the
 * first appearance of each term is linked.
 */
export function linkGlossaryTerms(text: string, terms: GlossaryEntry[]): TextSegment[] {
  // Longest term first, so "Dry brine" wins over a shorter term inside it.
  const termPatterns = [...terms]
    .sort((a, b) => b.term.length - a.term.length)
    .map((entry) => ({
      entry,
      regex: new RegExp(`\\b${entry.term.split(/\s+/).map(wordPattern).join('\\s+')}\\b`, 'i'),
    }))

  const linked = new Set<string>()

  function split(segment: string): TextSegment[] {
    for (const {entry, regex} of termPatterns) {
      if (linked.has(entry.id)) continue
      const match = regex.exec(segment)
      if (!match) continue
      linked.add(entry.id)
      const before = segment.slice(0, match.index)
      const after = segment.slice(match.index + match[0].length)
      return [
        ...split(before),
        {text: match[0], glossaryId: entry.id},
        ...split(after),
      ]
    }
    return segment ? [{text: segment, glossaryId: null}] : []
  }

  return split(text)
}
