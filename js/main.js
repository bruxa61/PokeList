import { COLLECTIONS, clearApiCache, getCollection } from './api.js';

const state = {
  current: 'journey',
  filter: 'all',
  type: 'all',
  rarity: 'all',
  query: '',
  collections: {},
  owned: loadOwned(),
};

const $ = (selector) => document.querySelector(selector);

function loadOwned() {
  try {
    const value = JSON.parse(localStorage.getItem('pokelist-owned-v2') || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function saveOwned() {
  localStorage.setItem('pokelist-owned-v2', JSON.stringify(state.owned));
}

function currentSet() {
  return state.collections[state.current];
}

function collectionCount(set) {
  return set?.cardCount?.official || set?.cardCount?.total || set?.cards?.length || 0;
}

function setStatus(message, type = 'info') {
  const status = $('#api-status');
  status.textContent = message;
  status.dataset.type = type;
}

function setLoading(isLoading) {
  document.body.classList.toggle('is-loading', isLoading);
  $('#loading-state').hidden = !isLoading;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function valuesFromCards(cards, key) {
  return [...new Set(cards.flatMap((card) => key === 'types' ? (card.types || []) : [card[key]])
    .filter((value) => value && value !== '—'))].sort((a, b) => a.localeCompare(b));
}

const TYPE_SYMBOLS = {
  planta: ['Planta', '#4f9d45', '<path d="M20 4C10 4 4 9 4 18c0 1.2.2 2.3.6 3.4C14 21 20 15 20 4Z"/><path d="M5 20c4-4 7-7 12-10"/>'],
  grass: ['Grass', '#4f9d45', '<path d="M20 4C10 4 4 9 4 18c0 1.2.2 2.3.6 3.4C14 21 20 15 20 4Z"/><path d="M5 20c4-4 7-7 12-10"/>'],
  fogo: ['Fogo', '#ed6c32', '<path d="M12 3c1 5-3 6-3 10a3 3 0 0 0 6 0c0-2-1-3-1-5 4 3 6 6 6 9a8 8 0 1 1-16 0c0-4 3-7 8-10Z"/>'],
  fire: ['Fire', '#ed6c32', '<path d="M12 3c1 5-3 6-3 10a3 3 0 0 0 6 0c0-2-1-3-1-5 4 3 6 6 6 9a8 8 0 1 1-16 0c0-4 3-7 8-10Z"/>'],
  água: ['Água', '#3d83d5', '<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/>'],
  water: ['Water', '#3d83d5', '<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/>'],
  elétrico: ['Elétrico', '#e6ad18', '<path d="M14 2 5 13h6l-1 9 9-12h-6l1-8Z"/>'],
  lightning: ['Lightning', '#e6ad18', '<path d="M14 2 5 13h6l-1 9 9-12h-6l1-8Z"/>'],
  lutador: ['Lutador', '#b65a35', '<path d="m7 5 5 3 5-3 3 3-3 5 2 4-3 3-4-3-4 3-3-3 2-4-3-5 3-3Z"/>'],
  fighting: ['Fighting', '#b65a35', '<path d="m7 5 5 3 5-3 3 3-3 5 2 4-3 3-4-3-4 3-3-3 2-4-3-5 3-3Z"/>'],
  psíquico: ['Psíquico', '#a64ba6', '<path d="M12 3a7 7 0 0 0-4 12v5h8v-5a7 7 0 0 0-4-12Z"/><path d="M9 18h6"/>'],
  psychic: ['Psychic', '#a64ba6', '<path d="M12 3a7 7 0 0 0-4 12v5h8v-5a7 7 0 0 0-4-12Z"/><path d="M9 18h6"/>'],
  sombrio: ['Sombrio', '#4b4658', '<path d="M12 3 3 12l9 9 9-9-9-9Z"/><path d="m12 7 2 5-2 5-2-5 2-5Z"/>'],
  darkness: ['Darkness', '#4b4658', '<path d="M12 3 3 12l9 9 9-9-9-9Z"/><path d="m12 7 2 5-2 5-2-5 2-5Z"/>'],
  aço: ['Aço', '#718096', '<path d="m12 2 8 4v7c0 5-3 8-8 9-5-1-8-4-8-9V6l8-4Z"/><path d="m8 12 3 3 5-6"/>'],
  metal: ['Metal', '#718096', '<path d="m12 2 8 4v7c0 5-3 8-8 9-5-1-8-4-8-9V6l8-4Z"/><path d="m8 12 3 3 5-6"/>'],
  dragão: ['Dragão', '#6575b8', '<path d="M20 5c-5 0-9 2-11 6-1 2-3 3-5 3 1 4 5 6 9 5 5-1 8-6 7-14Z"/><path d="M5 19c3-3 6-5 10-6"/>'],
  dragon: ['Dragon', '#6575b8', '<path d="M20 5c-5 0-9 2-11 6-1 2-3 3-5 3 1 4 5 6 9 5 5-1 8-6 7-14Z"/><path d="M5 19c3-3 6-5 10-6"/>'],
  incolor: ['Incolor', '#7b8794', '<path d="M12 3 21 12l-9 9-9-9 9-9Z"/><circle cx="12" cy="12" r="3"/>'],
  colorless: ['Colorless', '#7b8794', '<path d="M12 3 21 12l-9 9-9-9 9-9Z"/><circle cx="12" cy="12" r="3"/>'],
};

const RARITY_SYMBOLS = [
  { match: ['common', 'comum'], symbol: '●', className: 'rarity-common' },
  { match: ['uncommon', 'incomum'], symbol: '◆', className: 'rarity-uncommon' },
  { match: ['double rare', 'rara dupla'], symbol: '★★', className: 'rarity-double' },
  { match: ['special illustration rare', 'ilustração rara especial'], symbol: '★★', className: 'rarity-special' },
  { match: ['illustration rare', 'ilustração rara'], symbol: '★', className: 'rarity-illustration' },
  { match: ['hyper rare', 'hiper rara'], symbol: '★★★', className: 'rarity-hyper' },
  { match: ['ultra rare', 'ultra rara'], symbol: '★★', className: 'rarity-ultra' },
  { match: ['rare', 'rara'], symbol: '★', className: 'rarity-rare' },
];

function typeIcons(types = [], category = '') {
  const labels = types.length ? types : [category];
  return labels.map((type) => {
    const icon = TYPE_SYMBOLS[String(type).toLocaleLowerCase('pt-BR')] || ['Carta', '#7b8794', '<circle cx="12" cy="12" r="7"/>'];
    return `<span class="energy-symbol" style="--energy-color:${icon[1]}" title="${escapeHtml(icon[0])}" aria-label="${escapeHtml(icon[0])}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon[2]}</svg></span>`;
  }).join('');
}

function raritySymbol(rarity = '') {
  const found = RARITY_SYMBOLS.find((item) => item.match.some((name) => rarity.toLocaleLowerCase('pt-BR').includes(name)));
  const symbol = found || { symbol: '—', className: 'rarity-unknown' };
  return `<span class="rarity-symbol-card ${symbol.className}" title="${escapeHtml(rarity || 'Raridade não informada')}" aria-label="${escapeHtml(rarity || 'Raridade não informada')}">${symbol.symbol}</span>`;
}

function typeLabel(card) {
  if (card.category) return card.category;
  if (card.types?.length) return card.types.join(' · ');
  return 'Carta';
}

function updateTheme() {
  const collection = COLLECTIONS[state.current];
  document.body.dataset.theme = collection.theme;
  document.body.className = `theme-${collection.theme}`;
  $('.header').style.background = '';
  $('#collection-title').textContent = collection.name;
  $('#collection-description').textContent = collection.description;
  $('#collection-code').textContent = collection.code;
  document.querySelector('.progress-card').className = `progress-card ${collection.theme}-theme`;
  document.querySelectorAll('.collection-btn').forEach((button) => {
    const isActive = button.dataset.collection === state.current;
    button.classList.toggle('active', isActive);
    button.classList.toggle('journey-theme', isActive && collection.theme === 'journey');
    button.classList.toggle('rivals-theme', isActive && collection.theme === 'rivals');
    button.classList.toggle('anniversary-theme', isActive && collection.theme === 'anniversary');
  });
}

function renderFilters() {
  const set = currentSet();
  const cards = set?.cards || [];
  const filters = $('#filter-buttons');
  const total = cards.length;
  const owned = state.owned[state.current] || [];
  filters.innerHTML = [
    ['all', `Todas (${total})`],
    ['missing', `Faltando (${Math.max(total - owned.length, 0)})`],
    ['owned', `Colecionadas (${owned.length})`],
  ].map(([value, label]) => `<button class="filter-btn ${state.filter === value ? 'active' : ''}" data-filter="${value}">${label}</button>`).join('');
  filters.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    render();
  }));

  const types = valuesFromCards(cards, 'types');
  const rarities = valuesFromCards(cards, 'rarity');
  const typeFilter = $('#type-filter');
  const rarityFilter = $('#rarity-filter');
  typeFilter.innerHTML = '<option value="all">Todos os tipos</option>' + types.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  rarityFilter.innerHTML = '<option value="all">Todas as raridades</option>' + rarities.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  typeFilter.value = types.includes(state.type) ? state.type : 'all';
  rarityFilter.value = rarities.includes(state.rarity) ? state.rarity : 'all';
}

function renderProgress() {
  const set = currentSet();
  const cards = set?.cards || [];
  const owned = state.owned[state.current] || [];
  const availableTotal = cards.length;
  const officialTotal = collectionCount(set);
  const percent = availableTotal ? Math.round((owned.length / availableTotal) * 100) : 0;
  $('#collected-count').textContent = owned.length;
  $('#total-count').textContent = availableTotal;
  $('#progress-bar').style.width = `${percent}%`;
  $('#progress-percentage').textContent = `${percent}% completo`;
  $('#official-total').textContent = officialTotal;
  $('#available-total').textContent = availableTotal;
  $('#incomplete-notice').hidden = officialTotal <= availableTotal;
}

function cardMatches(card, owned) {
  const query = state.query.trim().toLocaleLowerCase('pt-BR');
  const isOwned = owned.includes(card.id);
  if (state.filter === 'owned' && !isOwned) return false;
  if (state.filter === 'missing' && isOwned) return false;
  if (state.type !== 'all' && !(card.types || []).includes(state.type)) return false;
  if (state.rarity !== 'all' && card.rarity !== state.rarity) return false;
  if (query && !`${card.name} ${card.num} ${card.category}`.toLocaleLowerCase('pt-BR').includes(query)) return false;
  return true;
}

function renderCards() {
  const grid = $('#card-grid');
  const set = currentSet();
  const owned = state.owned[state.current] || [];
  const cards = (set?.cards || []).filter((card) => cardMatches(card, owned));
  grid.innerHTML = '';
  if (!cards.length) {
    grid.innerHTML = '<div class="empty-message">Nenhuma carta encontrada com os filtros atuais.</div>';
    return;
  }

  cards.forEach((card) => {
    const isOwned = owned.includes(card.id);
    const item = document.createElement('article');
    item.className = `card-item ${isOwned ? 'collected' : 'not-collected'}`;
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-pressed', String(isOwned));
    const image = card.image ? `${card.image}/high.webp` : '';
    item.innerHTML = `
      <div class="card-image-container">
        ${image ? `<img class="card-image" src="${escapeHtml(image)}" alt="${escapeHtml(card.name)}" loading="lazy">` : '<div class="card-placeholder">Imagem<br>indisponível</div>'}
        ${isOwned ? '<div class="collected-badge" aria-label="Carta coletada">✓</div>' : ''}
      </div>
      <div class="card-info">
        <p class="card-name" title="${escapeHtml(card.name)}">${escapeHtml(card.name)}</p>
        <div class="card-meta"><span class="card-types" aria-label="Tipos: ${escapeHtml(card.types?.join(', ') || typeLabel(card))}">${typeIcons(card.types, card.category)}</span><span class="card-number">#${escapeHtml(card.num)}</span></div>
        <div class="card-rarity" aria-label="Raridade: ${escapeHtml(card.rarity || 'Raridade não informada')}">${raritySymbol(card.rarity)}</div>
      </div>`;
    const toggle = () => toggleOwned(card.id);
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
    grid.appendChild(item);
  });
}

function toggleOwned(cardId) {
  const owned = new Set(state.owned[state.current] || []);
  owned.has(cardId) ? owned.delete(cardId) : owned.add(cardId);
  state.owned[state.current] = [...owned];
  saveOwned();
  render();
}

function render() {
  updateTheme();
  renderFilters();
  renderProgress();
  renderCards();
}

async function selectCollection(key, { force = false } = {}) {
  state.current = key;
  state.filter = 'all';
  state.type = 'all';
  state.rarity = 'all';
  state.query = '';
  $('#search-input').value = '';
  render();
  setLoading(true);
  setStatus('Consultando a TCGdex…');
  try {
    const result = await getCollection(key, {
      force,
      onProgress: ({ done, total, fromCache }) => {
        if (!fromCache && total) setStatus(`Carregando metadados: ${done}/${total} cartas…`);
      },
    });
    state.collections[key] = result;
    const origin = result.source === 'api' ? 'TCGdex ao vivo' : 'cache local';
    const official = collectionCount(result);
    setStatus(`${result.cards.length} cartas carregadas · fonte: ${origin}${official > result.cards.length ? ` · ${official} oficiais informadas pela API` : ''}`, result.error ? 'warning' : 'success');
    render();
  } catch (error) {
    setStatus(`Não foi possível carregar esta coleção: ${error.message}`, 'error');
    $('#card-grid').innerHTML = '<div class="empty-message">Verifique sua conexão e tente novamente. A TCGdex não exige API key para este projeto.</div>';
  } finally {
    setLoading(false);
  }
}

function setup() {
  document.querySelectorAll('.collection-btn').forEach((button) => button.addEventListener('click', () => selectCollection(button.dataset.collection)));
  $('#search-input').addEventListener('input', (event) => { state.query = event.target.value; renderCards(); });
  $('#type-filter').addEventListener('change', (event) => { state.type = event.target.value; renderCards(); });
  $('#rarity-filter').addEventListener('change', (event) => { state.rarity = event.target.value; renderCards(); });
  $('#reset-collection').addEventListener('click', () => {
    if (!confirm(`Limpar as cartas coletadas de ${COLLECTIONS[state.current].name}?`)) return;
    state.owned[state.current] = [];
    saveOwned();
    render();
  });
  $('#refresh-data').addEventListener('click', async () => {
    clearApiCache();
    await selectCollection(state.current, { force: true });
  });
  render();
  selectCollection(state.current);
}

document.addEventListener('DOMContentLoaded', setup);
