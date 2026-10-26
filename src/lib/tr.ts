const LOCALE = 'tr-TR'

export const upperTr = (s: string): string => s.toLocaleUpperCase(LOCALE)
export const lowerTr = (s: string): string => s.toLocaleLowerCase(LOCALE)

const FOLD: Record<string, string> = {
  ı: 'i',
  ğ: 'g',
  ü: 'u',
  ş: 's',
  ö: 'o',
  ç: 'c',
  â: 'a',
  î: 'i',
  û: 'u',
}

/**
 * Search key: Turkish-aware lowercase (İ -> i, I -> ı), then diacritics folded so
 * that someone typing on a keyboard without Turkish letters still finds the entry.
 */
export const searchKey = (s: string): string =>
  lowerTr(s)
    .replace(/[ığüşöçâîû]/g, (c) => FOLD[c] ?? c)
    .replace(/\s+/g, ' ')
    .trim()

export const includesTr = (haystack: string, needle: string): boolean =>
  searchKey(haystack).includes(searchKey(needle))

export const compareTr = (a: string, b: string): number => a.localeCompare(b, LOCALE)

/** First letter upper-cased with Turkish rules ("istanbul" -> "İstanbul"). */
export const capitalizeTr = (s: string): string =>
  s.length === 0 ? s : upperTr(s.charAt(0)) + s.slice(1)

export const slugify = (s: string): string =>
  searchKey(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
