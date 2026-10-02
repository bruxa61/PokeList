const API_BASE = 'https://api.tcgdex.net/v2';
const CACHE_KEY = 'pokelist-tcgdex-cache-v2';
const META_CACHE_KEY = 'pokelist-tcgdex-card-meta-v1';
const CACHE_TTL = 1000 * 60 * 60 * 24;
const DETAIL_CONCURRENCY = 10;

export const COLLECTIONS = {
  journey: {
    id: 'sv09', language: 'pt', name: 'Amigos de Jornada', code: 'JTG', theme: 'journey',
    logoUrl: 'https://d1i787aglh9bmb.cloudfront.net/assets/img/sv-expansions/sv09/logo/pt-br/sv9-logo.png',
    description: 'A expansão Scarlet & Violet — Amigos de Jornada.',
  },
  rivals: {
    id: 'sv10', language: 'pt', name: 'Rivais Predestinados', code: 'DRI', theme: 'rivals',
    logoUrl: 'https://d1i787aglh9bmb.cloudfront.net/assets/img/sv-expansions/sv10/logo/pt-br/sv10-logo.png',
    description: 'A expansão Scarlet & Violet — Rivais Predestinados.',
  },
  anniversary: {
    id: '30th', language: 'en', name: 'Coleção 30 anos', code: '30C', theme: 'anniversary',
    logoUrl: 'https://d1i787aglh9bmb.cloudfront.net/assets/img/global/logos/pt-br/thirty.png',
    description: 'O conjunto comemorativo do 30º aniversário do Pokémon TCG.',
  },
};

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage cheio ou bloqueado */ }
}
function readSetCache() { return readStorage(CACHE_KEY); }
function readMetaCache() { return readStorage(META_CACHE_KEY); }

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`TCGdex respondeu HTTP ${response.status}`);
  return response.json();
}

function normalizeCard(card, metadata = {}) {
  return {
    id: card.id,
    num: card.localId,
    name: card.name,
    image: card.image || null,
    category: metadata.category || card.category || '—',
    types: Array.isArray(metadata.types) ? metadata.types : (Array.isArray(card.types) ? card.types : []),
    rarity: metadata.rarity || card.rarity || '—',
  };
}

function normalizeSet(set) {
  return {
    id: set.id,
    name: set.name,
    logo: set.logo || null,
    symbol: set.symbol || null,
    releaseDate: set.releaseDate || null,
    cardCount: set.cardCount || { total: (set.cards || []).length, official: (set.cards || []).length },
    cards: (set.cards || []).map((card) => normalizeCard(card)),
  };
}

async function enrichCards(cards, language, signal, onProgress) {
  const metaCache = readMetaCache();
  const pending = cards.filter((card) => {
    const metadata = metaCache[`${language}:${card.id}`];
    if (metadata) Object.assign(card, metadata);
    return !metadata;
  });
  let done = cards.length - pending.length;
  onProgress?.({ done, total: cards.length });

  let next = 0;
  async function worker() {
    while (next < pending.length) {
      const card = pending[next++];
      try {
        const detail = await fetchJson(`${API_BASE}/${language}/cards/${card.id}`, signal);
        const metadata = {
          category: detail.category || '—',
          types: Array.isArray(detail.types) ? detail.types : [],
          rarity: detail.rarity || '—',
        };
        Object.assign(card, metadata);
        metaCache[`${language}:${card.id}`] = metadata;
      } catch {
        // A carta continua visível; apenas ficará sem os metadados que falharam.
      } finally {
        done += 1;
        onProgress?.({ done, total: cards.length });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(DETAIL_CONCURRENCY, pending.length) }, worker));
  writeStorage(META_CACHE_KEY, metaCache);
}

export async function getCollection(collectionKey, { force = false, onProgress } = {}) {
  const collection = COLLECTIONS[collectionKey];
  if (!collection) throw new Error('Coleção desconhecida.');
  const cacheId = `${collection.language}:${collection.id}`;
  const cache = readSetCache();
  const cached = cache[cacheId];
  const cachedHasMetadata = cached?.data?.cards?.every((card) => card.rarity !== '—' || card.types?.length || card.category !== '—');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    let data;
    if (!force && cached && Date.now() - cached.savedAt < CACHE_TTL && cachedHasMetadata) {
      data = cached.data;
      onProgress?.({ done: data.cards.length, total: data.cards.length, fromCache: true });
    } else {
      const raw = await fetchJson(`${API_BASE}/${collection.language}/sets/${collection.id}`, controller.signal);
      data = normalizeSet(raw);
      await enrichCards(data.cards, collection.language, controller.signal, onProgress);
      cache[cacheId] = { savedAt: Date.now(), data };
      writeStorage(CACHE_KEY, cache);
    }
    return { ...data, source: cached && data === cached.data ? 'cache' : 'api' };
  } catch (error) {
    if (cached?.data) return { ...cached.data, source: 'cache-stale', error };
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function clearApiCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(META_CACHE_KEY);
}
