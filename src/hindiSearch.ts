/**
 * Universal Hindi (Devanagari) <-> English / Hinglish (Roman) Phonetic Search Engine
 * Enables searching Hindi voter names, surnames, castes, districts, blocks, and villages
 * using either Devanagari ("लक्ष्मी", "सीहोर", "मीणा") or English/Hinglish ("lakshmi", "laxmi", "sehore", "sihor", "meena", "mina").
 */

const DEVANAGARI_TO_ROMAN_MAP: Record<string, string> = {
  // Independent vowels
  अ: 'a',
  आ: 'aa',
  इ: 'i',
  ई: 'ee',
  उ: 'u',
  ऊ: 'oo',
  ऋ: 'ri',
  ए: 'e',
  ऐ: 'ai',
  ओ: 'o',
  औ: 'au',
  अं: 'an',
  अः: 'ah',

  // Consonants (inherent 'a' handled below)
  क: 'k',
  ख: 'kh',
  ग: 'g',
  घ: 'gh',
  ङ: 'n',
  च: 'ch',
  छ: 'chh',
  ज: 'j',
  झ: 'jh',
  ञ: 'n',
  ट: 't',
  ठ: 'th',
  ड: 'd',
  ढ: 'dh',
  ण: 'n',
  त: 't',
  थ: 'th',
  द: 'd',
  ध: 'dh',
  न: 'n',
  प: 'p',
  फ: 'ph',
  ब: 'b',
  भ: 'bh',
  म: 'm',
  य: 'y',
  र: 'r',
  ल: 'l',
  व: 'v',
  श: 'sh',
  ष: 'sh',
  स: 's',
  ह: 'h',
  क्ष: 'ksh',
  त्र: 'tr',
  ज्ञ: 'gy',
  ड़: 'd',
  ढ़: 'dh',
  क़: 'k',
  ख़: 'kh',
  ग़: 'g',
  ज़: 'z',
  फ़: 'f',
};

const MATRA_TO_ROMAN_MAP: Record<string, string> = {
  'ा': 'a',
  'ि': 'i',
  'ी': 'ee',
  'ु': 'u',
  'ू': 'oo',
  'ृ': 'ri',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
  'ं': 'n',
  'ँ': 'n',
  'ः': 'h',
  'ॅ': 'e',
  'ॉ': 'o',
};

const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

const VIRAMA = '्';
const NUKTA = '़';

function isConsonant(ch: string): boolean {
  return Boolean(DEVANAGARI_TO_ROMAN_MAP[ch]) && !'अआइईउऊऋएऐओऔ'.includes(ch);
}

/**
 * Transliterates a Devanagari string into lowercase Roman / Hinglish.
 */
export function transliterateDevanagariToRoman(input: string): string {
  if (!input) return '';
  let out = '';
  const chars = Array.from(input);
  const len = chars.length;

  for (let i = 0; i < len; i++) {
    const ch = chars[i];
    const next = chars[i + 1] || '';

    if (DEVANAGARI_DIGITS[ch]) {
      out += DEVANAGARI_DIGITS[ch];
      continue;
    }

    // Handle consonant + nukta combinations (ड़, ढ़, ज़, फ़)
    if (next === NUKTA) {
      const combined = ch + next;
      const mapped = DEVANAGARI_TO_ROMAN_MAP[combined] || DEVANAGARI_TO_ROMAN_MAP[ch] || ch;
      out += mapped;
      i++;
      const afterNukta = chars[i + 1] || '';
      if (
        afterNukta &&
        afterNukta !== VIRAMA &&
        !MATRA_TO_ROMAN_MAP[afterNukta] &&
        afterNukta !== ' '
      ) {
        out += 'a';
      }
      continue;
    }

    if (isConsonant(ch)) {
      out += DEVANAGARI_TO_ROMAN_MAP[ch];
      if (next === VIRAMA) {
        i++; // skip virama, no inherent 'a'
      } else if (MATRA_TO_ROMAN_MAP[next]) {
        // Matra will be processed on next iteration (or if anusvara/chandrabindu, keep inherent 'a' before 'n')
        if (next === 'ं' || next === 'ँ') {
          out += 'a';
        }
      } else if (next && next !== ' ' && next !== '-' && next !== '/' && next !== ')') {
        out += 'a';
      }
      continue;
    }

    if (MATRA_TO_ROMAN_MAP[ch]) {
      out += MATRA_TO_ROMAN_MAP[ch];
      continue;
    }

    if (DEVANAGARI_TO_ROMAN_MAP[ch]) {
      out += DEVANAGARI_TO_ROMAN_MAP[ch];
      continue;
    }

    out += ch.toLowerCase();
  }

  return out;
}

/**
 * Converts a Roman/Hinglish string into a canonical phonetic skeleton so that
 * spelling variations ("lakshmi" vs "laxmi", "meena" vs "mina", "sehore" vs "sihor",
 * "berasia" vs "bairasiya", "dhakad" vs "dhakar", "mewada" vs "mewara") match seamlessly.
 */
export function toPhoneticSkeleton(roman: string): string {
  if (!roman) return '';
  return roman
    .toLowerCase()
    .replace(/x/g, 'ks')
    .replace(/ksh/g, 'ks')
    .replace(/gy/g, 'g')
    .replace(/chh/g, 'c')
    .replace(/ch/g, 'c')
    .replace(/sh/g, 's')
    .replace(/ph/g, 'p')
    .replace(/f/g, 'p')
    .replace(/bh/g, 'b')
    .replace(/dh/g, 'd')
    .replace(/th/g, 't')
    .replace(/gh/g, 'g')
    .replace(/jh/g, 'j')
    .replace(/kh/g, 'k')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j')
    .replace(/ri/g, 'r')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/ai/g, 'e')
    .replace(/ae/g, 'e')
    .replace(/au/g, 'o')
    .replace(/ou/g, 'o')
    .replace(/ia/g, 'i')
    .replace(/iya/g, 'i')
    .replace(/io/g, 'i')
    .replace(/iy/g, 'i')
    .replace(/ey/g, 'e')
    .replace(/ay/g, 'e')
    .replace(/m([pb])/g, 'n$1')
    .replace(/([a-z])\1+/g, '$1')
    .replace(/[ae]\b/g, '');
}

/**
 * Strips non-initial vowels from each word so schwa differences
 * ("gunaga" vs "gunga", "sihor" vs "sehore", "indaur" vs "indore", "gvaliyar" vs "gwalior")
 * produce identical consonant keys ("gng", "shr", "indr", "gvlr").
 */
export function toConsonantSkeleton(skeleton: string): string {
  return skeleton
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 2) return word;
      const first = word[0];
      const rest = word
        .slice(1)
        .replace(/[aeiouy]/g, '')
        .replace(/([a-z])\1+/g, '$1');
      return first + rest;
    })
    .join(' ');
}

const indexCache = new Map<string, string>();

/**
 * Builds a searchable normalized string containing Devanagari, Roman transliteration,
 * phonetic skeleton, and consonant skeleton for fast matching.
 */
export function buildSearchableIndex(raw: string): string {
  if (!raw) return '';
  const cached = indexCache.get(raw);
  if (cached !== undefined) return cached;

  const lower = raw
    .toLowerCase()
    .replace(/[०-९]/g, (d) => DEVANAGARI_DIGITS[d] || d);
  const roman = transliterateDevanagariToRoman(lower);
  const skeleton = toPhoneticSkeleton(roman);
  const consonantKey = toConsonantSkeleton(skeleton);

  const combined = `${lower} ${roman} ${skeleton} ${consonantKey}`;
  if (indexCache.size < 25000) {
    indexCache.set(raw, combined);
  }
  return combined;
}

/**
 * Normalizes a user search query by stripping common Hindi/English prefixes
 * ("मकान 10" -> "10", "makan 10" -> "10", "ward 2" -> "2", "वार्ड 2" -> "2")
 * and splitting into tokens.
 */
export function matchesSearchQuery(
  fields: Array<string | number | undefined | null>,
  rawQuery: string
): boolean {
  const trimmed = (rawQuery || '').trim();
  if (!trimmed) return true;

  const cleanedQuery = trimmed
    .toLowerCase()
    .replace(/[०-९]/g, (d) => DEVANAGARI_DIGITS[d] || d)
    .replace(
      /^(मकान\s*(नंबर|क्र\.?|संख्या)?|makan\s*(no\.?|number)?|house\s*(no\.?|number)?|h\.?\s*no\.?|वार्ड\s*(नंबर|क्र\.?)?|ward\s*(no\.?)?|बूथ\s*(नंबर|क्र\.?)?|booth\s*(no\.?)?)\s*[:#-]*\s*/i,
      ''
    )
    .trim();

  if (!cleanedQuery) return true;

  const combinedFieldText = fields
    .filter((f) => f !== undefined && f !== null && f !== '')
    .map((f) => String(f))
    .join(' ');

  const indexedTarget = buildSearchableIndex(combinedFieldText);

  const tokens = cleanedQuery.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const tokenRoman = transliterateDevanagariToRoman(token);
    const tokenSkeleton = toPhoneticSkeleton(tokenRoman);
    const tokenConsonant = toConsonantSkeleton(tokenSkeleton);

    const directMatch = indexedTarget.includes(token);
    const romanMatch =
      tokenRoman.length > 0 && indexedTarget.includes(tokenRoman);
    const skeletonMatch =
      tokenSkeleton.length >= 2 && indexedTarget.includes(tokenSkeleton);
    const consonantMatch =
      tokenConsonant.length >= 2 && indexedTarget.includes(tokenConsonant);

    if (!directMatch && !romanMatch && !skeletonMatch && !consonantMatch) {
      return false;
    }
  }

  return true;
}
