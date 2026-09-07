/**
 * Text matching for the index search.
 *
 * The index is a short list of long strings — a title, a ticket ID, a surface,
 * a paragraph of description — and people type into it the way they talk about
 * the work: a couple of words in any order ("drawer settings"), half a ticket
 * ID ("des149"), an abbreviation ("kb"), a word with a letter missing
 * ("trasfer"). So a term is tried against a field several ways, strongest
 * first, and the tier it lands on *is* its score.
 *
 * Everything here is one term against one field. Which fields exist, what each
 * one is worth, and how the terms combine live in `mockups-data.ts`.
 */

/**
 * How much each way of matching is worth. The gaps are wide enough that a
 * weaker match in an important field can still outrank a stronger match in an
 * unimportant one — that is the point of scoring rather than filtering — but
 * not so wide that a description hit buries a title hit.
 */
const TIER = {
  /** The field is the term. */
  field: 100,
  /** A whole word in the field is the term. */
  word: 92,
  /** The field starts with the term — a partly typed title. */
  fieldPrefix: 84,
  /** A word starts with the term, which is most of what typing looks like. */
  wordPrefix: 76,
  /** The term appears mid-word. */
  substring: 60,
  /** It appears once punctuation is dropped: "des149" in "DES-149". */
  condensed: 52,
  /** A word is the term with a typo, minus `TYPO_PENALTY` per extra edit. */
  typo: 44,
  /** A word contains the term's letters in order: "trnsfr" in "transfer". */
  wordFuzzy: 20,
  /** The term reads as an initialism of the field: "kb". */
  initialism: 22,
} as const

const TYPO_PENALTY = 10

/**
 * Below this, a term is only allowed to match at the start of a word.
 *
 * Two letters land inside a long word by accident constantly — "kb" is in
 * "checkbox" — and a coincidence that beats the card the reader meant is
 * exactly the failure this search is fixing.
 */
const MIN_LOOSE_LENGTH = 3

/** How much of a word the term has to cover to earn the `wordFuzzy` tier. */
const FUZZY_COVERAGE = 14

/**
 * Lowercase and unaccented. Every comparison runs on this, never on the raw
 * text, so case and accents can never be the reason something fails to match.
 */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

/** Letters and digits only — what makes "des149" find "DES-149". */
function condense(text: string): string {
  return text.replace(/[^\p{L}\p{N}]+/gu, "")
}

const WORDS = /[\p{L}\p{N}]+/gu

/** A field, split every way a term is going to be tried against it. */
export type Field = {
  normalized: string
  condensed: string
  words: string[]
}

/* The mockup list is a fixed set of strings and this runs on every keystroke,
   so each field is split once and kept. */
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

/** One word of a query, prepared the same way the fields are. */
export type Term = {
  normalized: string
  condensed: string
}

/**
 * The query split into terms. Every term has to land somewhere to match, so
 * a term made only of punctuation is dropped rather than kept and failed —
 * one stray dash should not empty the page.
 */
export function prepareQuery(query: string): Term[] {
  return normalize(query)
    .split(/\s+/)
    .map((word) => ({ normalized: word, condensed: condense(word) }))
    .filter((term) => term.condensed)
}

/**
 * How well one term matches one field, or `null` when it does not at all.
 *
 * The tiers are tried strongest first and the first hit wins, so the score
 * says *how* it matched — which is what makes the ranking legible: an exact
 * ticket ID cannot be outranked by a stray letter in a paragraph.
 */
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

/**
 * A misspelling, scored by how far off it is.
 *
 * The edit budget scales with the term because one wrong letter in three is a
 * different word ("card" is not "call"), while one wrong letter in nine is a
 * slip. Distance is measured against every prefix of the word too, so a term
 * still being typed — "trasfer" for "transfer" — is a typo rather than a miss.
 */
function typoScore(query: string, words: string[]): number | null {
  const budget = query.length >= 7 ? 2 : query.length >= 4 ? 1 : 0
  if (budget === 0) return null

  let best: number | null = null

  for (const word of words) {
    // Nothing within budget can be this far off in length.
    if (word.length + budget < query.length) continue

    const distance = prefixEditDistance(query, word, budget)
    if (distance === null) continue
    if (best === null || distance < best) best = distance
    if (best === 1) break
  }

  return best === null ? null : TIER.typo - (best - 1) * TYPO_PENALTY
}

/**
 * The smallest edit distance between `query` and any prefix of `word`,
 * counting a swapped pair of adjacent letters as one edit, or `null` once
 * every possibility exceeds `budget`.
 *
 * Prefixes rather than the whole word because the reader is typing: "knowlege"
 * should reach "knowledge base", and it only does if the trailing " base" is
 * free rather than five more edits.
 */
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

      /* Two letters typed in the wrong order is one slip, not two: without
         this, "vioce" is as far from "voice" as a word that shares three
         letters with it. */
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

    /* Every prefix is a candidate and a longer one can score better than a
       shorter one — "conversatoins" is two edits from "conversation" but one
       from "conversations" — so the whole word is walked for the best of
       them rather than stopping at the first that fits. */
    const distance = current[query.length]
    if (distance <= budget && (best === null || distance < best))
      best = distance
    if (best === 0) return 0

    // Distance only grows from here, so once the whole row is over budget no
    // longer prefix can come back under it.
    if (rowBest > budget) return best

    older = previous
    previous = current
  }

  return best
}

/**
 * The term's letters in order inside one word — "trnsfr" in "transfer".
 *
 * Kept to a single word on purpose. Scattering the same letters across a whole
 * description is how a subsequence match turns a paragraph into a hit for
 * almost anything, which is exactly the noise this search is fixing.
 */
function wordFuzzyScore(query: string, words: string[]): number | null {
  if (query.length < 3) return null

  let best: number | null = null

  for (const word of words) {
    // A short term inside a long word is a coincidence, not an abbreviation.
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

/**
 * The term read as an initialism: "kb" for "Knowledge base", "confrep" for
 * "Configure Report".
 *
 * The words have to be *next to each other* and each run has to start one.
 * An initialism assembled from words scattered through a paragraph is not an
 * initialism — it is a coincidence, and in a field this long there is one for
 * almost any three letters.
 */
const INITIALISM_MAX_LENGTH = 10
const INITIALISM_MAX_CHUNKS = 3

function initialismScore(query: string, field: Field): number | null {
  if (query.length < 2 || query.length > INITIALISM_MAX_LENGTH) return null
  if (!field.words.length) return null

  const chunks = matchChunks(query, 0, field, 0, 0)
  if (chunks === null) return null

  return TIER.initialism - (chunks - 1) * 2
}

/**
 * Walks the term from `cursor`, taking as much as possible from each word it
 * starts at, and backtracking to a shorter run when the rest cannot be placed.
 * Returns how many runs it took, or `null` if it does not fit in the cap.
 *
 * `wordFrom` is where the next run may start: anywhere for the first one,
 * and the very next word for every one after it.
 */
function matchChunks(
  query: string,
  cursor: number,
  field: Field,
  wordFrom: number,
  used: number,
): number | null {
  if (cursor === query.length) return used
  if (used === INITIALISM_MAX_CHUNKS) return null

  // The first run may start at any word; every run after it continues from
  // the word immediately following the one before.
  const last = Math.min(
    used === 0 ? field.words.length - 1 : wordFrom,
    field.words.length - 1,
  )

  for (let index = wordFrom; index <= last; index++) {
    const word = field.words[index]
    if (word[0] !== query[cursor]) continue

    // How much of the rest of the term this word can absorb.
    let run = 1
    while (
      run < word.length &&
      cursor + run < query.length &&
      word[run] === query[cursor + run]
    ) {
      run++
    }

    // Longest run first: it is both the likelier reading and the one that
    // leaves the fewest runs to place.
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
