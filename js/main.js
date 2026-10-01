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

function typeLabel(card) {
  if (card.category) return card.category;
  if (card.types?.length) return card.types.join(' · ');
  return 'Carta';
}

function updateTheme() {
  const collection = COLLECTIONS[state.current];
  document.body.dataset.theme = collection.theme;
  $('.header').style.background = '';
  $('#collection-title').textContent = collection.name;
  $('#collection-description').textContent = collection.description;
  $('#collection-code').textContent = collection.code;
  $('#collection-logo').src = currentSet()?.logo || '';
  $('#collection-logo').hidden = !currentSet()?.logo;
  document.querySelectorAll('.collection-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.collection === state.current);
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
        <div class="card-meta"><span>${escapeHtml(card.types?.length ? card.types.join(' · ') : typeLabel(card))}</span><span>#${escapeHtml(card.num)}</span></div>
        <small class="card-rarity">${escapeHtml(card.rarity || 'Raridade não informada')}</small>
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
