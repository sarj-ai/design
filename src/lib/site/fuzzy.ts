const TIER = {
  field: 100,
  word: 92,
  fieldPrefix: 84,
  wordPrefix: 76,
  substring: 60,
  condensed: 52,
  typo: 44,
  wordFuzzy: 20,
  initialism: 22,
} as const

const TYPO_PENALTY = 10

// Short terms land inside long words by accident ("kb" in "checkbox"), so they only match at a word start.
const MIN_LOOSE_LENGTH = 3

const FUZZY_COVERAGE = 14

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

function condense(text: string): string {
  return text.replace(/[^\p{L}\p{N}]+/gu, "")
}

const WORDS = /[\p{L}\p{N}]+/gu

type Field = {
  normalized: string
  condensed: string
  words: string[]
}

const fields = new Map<string, Field>()

export function prepareField(text: string): Field {
  const cached = fields.get(text)
  if (cached) return cached

  const normalized = normalize(text)

  const field: Field = {
    normalized,
    condensed: condense(normalized),
    words: normalized.match(WORDS) ?? [],
  }
  fields.set(text, field)
  return field
}

export type Term = {
  normalized: string
  condensed: string
}

export function prepareQuery(query: string): Term[] {
  return normalize(query)
    .split(/\s+/)
    .map((word) => ({ normalized: word, condensed: condense(word) }))
    .filter((term) => term.condensed)
}

// Tiers are tried strongest first and the first hit wins.
export function scoreTerm(term: Term, field: Field): number | null {
  const query = term.normalized
  if (!query) return null

  if (field.normalized === query) return TIER.field
  if (field.words.includes(query)) return TIER.word
  if (field.normalized.startsWith(query)) return TIER.fieldPrefix
  if (field.words.some((word) => word.startsWith(query))) return TIER.wordPrefix
  if (query.length >= MIN_LOOSE_LENGTH) {
    if (field.normalized.includes(query)) return TIER.substring
    if (term.condensed && field.condensed.includes(term.condensed)) {
      return TIER.condensed
    }
  }

  const typo = typoScore(query, field.words)
  if (typo !== null) return typo

  const fuzzy = wordFuzzyScore(query, field.words)
  if (fuzzy !== null) return fuzzy

  return initialismScore(query, field)
}

function typoScore(query: string, words: string[]): number | null {
  const budget = query.length >= 7 ? 2 : query.length >= 4 ? 1 : 0
  if (budget === 0) return null

  let best: number | null = null

  for (const word of words) {
    if (word.length + budget < query.length) continue

    const distance = prefixEditDistance(query, word, budget)
    if (distance === null) continue
    if (best === null || distance < best) best = distance
    if (best === 1) break
  }

  return best === null ? null : TIER.typo - (best - 1) * TYPO_PENALTY
}

function prefixEditDistance(
  query: string,
  word: string,
  budget: number,
): number | null {
  let older: number[] = []
  let previous = Array.from({ length: query.length + 1 }, (_, i) => i)
  let best: number | null =
    previous[query.length] <= budget ? previous[query.length] : null

  for (let row = 1; row <= word.length; row++) {
    const current = [row]
    let rowBest = row

    for (let column = 1; column <= query.length; column++) {
      const substitution =
        previous[column - 1] + (word[row - 1] === query[column - 1] ? 0 : 1)
      let best = Math.min(
        substitution,
        previous[column] + 1,
        current[column - 1] + 1,
      )

      // An adjacent transposition counts as one edit.
      if (
        row > 1 &&
        column > 1 &&
        word[row - 1] === query[column - 2] &&
        word[row - 2] === query[column - 1]
      ) {
        best = Math.min(best, older[column - 2] + 1)
      }

      current[column] = best
      rowBest = Math.min(rowBest, best)
    }

    // A longer prefix can score better, so walk the whole word rather than stopping at the first fit.
    const distance = current[query.length]
    if (distance <= budget && (best === null || distance < best))
      best = distance
    if (best === 0) return 0

    // Distance only grows from here, so once the whole row is over budget no longer prefix can recover.
    if (rowBest > budget) return best

    older = previous
    previous = current
  }

  return best
}

function wordFuzzyScore(query: string, words: string[]): number | null {
  if (query.length < 3) return null

  let best: number | null = null

  for (const word of words) {
    if (word.length > query.length * 2) continue
    if (word[0] !== query[0]) continue
    if (!isSubsequence(query, word)) continue

    const coverage = query.length / word.length
    const score = TIER.wordFuzzy + coverage * FUZZY_COVERAGE
    if (best === null || score > best) best = score
  }

  return best
}

function isSubsequence(query: string, word: string): boolean {
  let cursor = 0
  for (const char of word) {
    if (char === query[cursor]) cursor++
    if (cursor === query.length) return true
  }
  return false
}

const INITIALISM_MAX_LENGTH = 10
const INITIALISM_MAX_CHUNKS = 3

function initialismScore(query: string, field: Field): number | null {
  if (query.length < 2 || query.length > INITIALISM_MAX_LENGTH) return null
  if (!field.words.length) return null

  const chunks = matchChunks(query, 0, field, 0, 0)
  if (chunks === null) return null

  return TIER.initialism - (chunks - 1) * 2
}

function matchChunks(
  query: string,
  cursor: number,
  field: Field,
  wordFrom: number,
  used: number,
): number | null {
  if (cursor === query.length) return used
  if (used === INITIALISM_MAX_CHUNKS) return null

  const last = Math.min(
    used === 0 ? field.words.length - 1 : wordFrom,
    field.words.length - 1,
  )

  for (let index = wordFrom; index <= last; index++) {
    const word = field.words[index]
    if (word[0] !== query[cursor]) continue

    let run = 1
    while (
      run < word.length &&
      cursor + run < query.length &&
      word[run] === query[cursor + run]
    ) {
      run++
    }

    for (let length = run; length >= 1; length--) {
      const rest = matchChunks(
        query,
        cursor + length,
        field,
        index + 1,
        used + 1,
      )
      if (rest !== null) return rest
    }
  }

  return null
}
