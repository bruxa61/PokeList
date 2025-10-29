// Configuração das coleções
const collections = {
  journey: {
    name: 'Amigos de Jornada',
    code: 'SV09',
    theme: 'journey',
    logo: 'https://tcg.pokemon.com/assets/img/sv-expansions/journey-together/logo/pt-br/sv9-logo.png',
    totalCards: 190,
    imageUrlPattern: (num) => `https://images.pokemontcg.io/sv9/${num}.png`,
    headerGradient: 'linear-gradient(135deg, #167eac 0%, #95c5c8 100%)'
  },
  rivals: {
    name: 'Rivais Predestinados',
    code: 'SV10',
    theme: 'rivals',
    logo: 'https://tcg.pokemon.com/assets/img/sv-expansions/destined-rivals/logo/pt-br/sv10-logo.png',
    totalCards: 244,
    imageUrlPattern: (num) => `https://images.pokemontcg.io/sv10/${num}.png`,
    headerGradient: 'linear-gradient(135deg, #c63939 0%, #551452 100%)'
  }
};

let currentCollection = 'journey';
let currentFilter = 'all';
let currentTypeFilter = 'all';
let currentRarityFilter = 'all';
let searchQuery = '';
let collectedCards = {};

function initializeApp() {
  loadCollectedCards();
  setupEventListeners();
  renderRarityFilters();
  renderTypeFilters();
  renderCollection();
  updateHeaderTheme();
}

function loadCollectedCards() {
  const saved = localStorage.getItem('pokemonChecklist');
  if (saved) {
    try {
      collectedCards = JSON.parse(saved);
    } catch (e) {
      collectedCards = {};
    }
  }
  
  if (!collectedCards.journey) collectedCards.journey = [];
  if (!collectedCards.rivals) collectedCards.rivals = [];
}

function saveCollectedCards() {
  localStorage.setItem('pokemonChecklist', JSON.stringify(collectedCards));
}

function setupEventListeners() {
  // Seletores de coleção
  document.querySelectorAll('.collection-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCollection = btn.dataset.collection;
      updateCollectionButtons();
      updateHeaderTheme();
      renderCollection();
    });
  });

  // Filtros de status
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      updateFilterButtons();
      renderCards();
    });
  });

  // Botão de limpar
  document.getElementById('reset-collection').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todas as cartas desta coleção?')) {
      collectedCards[currentCollection] = [];
      saveCollectedCards();
      renderCollection();
    }
  });

  // Barra de pesquisa
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderCards();
  });
}

function setupTypeFilters() {
  document.querySelectorAll('.type-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTypeFilter = btn.dataset.type;
      
      // Atualizar estado ativo dos botões
      document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      renderCards();
    });
  });
}

function setupRarityFilters() {
  document.querySelectorAll('.rarity-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRarityFilter = btn.dataset.rarity;
      
      // Atualizar estado ativo dos botões
      document.querySelectorAll('.rarity-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      renderCards();
    });
  });
}

function updateHeaderTheme() {
  const header = document.querySelector('.header');
  const collection = collections[currentCollection];
  
  header.style.background = collection.headerGradient;
}

function updateCollectionButtons() {
  document.querySelectorAll('.collection-btn').forEach(btn => {
    btn.classList.remove('active', 'rivals-theme');
    if (btn.dataset.collection === currentCollection) {
      btn.classList.add('active');
      if (currentCollection === 'rivals') {
        btn.classList.add('rivals-theme');
      }
    }
  });
}

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active', 'rivals-theme');
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('active');
      if (currentCollection === 'rivals') {
        btn.classList.add('rivals-theme');
      }
    }
  });
}

function renderRarityFilters() {
  const rarityFiltersContainer = document.getElementById('rarity-filters');
  rarityFiltersContainer.innerHTML = '';
  
  // Botão "Todas as Raridades"
  const allBtn = document.createElement('button');
  allBtn.className = 'rarity-filter-btn active';
  allBtn.dataset.rarity = 'all';
  allBtn.innerHTML = `<span>Todas</span>`;
  rarityFiltersContainer.appendChild(allBtn);
  
  // Botões para cada raridade
  Object.entries(window.rarityTypes).forEach(([key, rarity]) => {
    const btn = document.createElement('button');
    btn.className = 'rarity-filter-btn';
    btn.dataset.rarity = key;
    btn.style.setProperty('--rarity-bg', rarity.bgColor);
    btn.style.setProperty('--rarity-color', rarity.color);
    btn.innerHTML = `
      <span class="rarity-symbol">${rarity.symbol}</span>
      <span class="rarity-name">${rarity.name}</span>
    `;
    rarityFiltersContainer.appendChild(btn);
  });
  
  setupRarityFilters();
}

function renderTypeFilters() {
  const typeFiltersContainer = document.getElementById('type-filters');
  typeFiltersContainer.innerHTML = '';
  
  // Botão "Todos os Tipos"
  const allBtn = document.createElement('button');
  allBtn.className = 'type-filter-btn active';
  allBtn.dataset.type = 'all';
  allBtn.innerHTML = `<span>Todos</span>`;
  typeFiltersContainer.appendChild(allBtn);
  
  // Botões para cada tipo
  Object.entries(window.pokemonTypes).forEach(([key, type]) => {
    const btn = document.createElement('button');
    btn.className = 'type-filter-btn';
    btn.dataset.type = key;
    btn.style.setProperty('--type-color', type.color);
    btn.innerHTML = `
      <svg class="type-icon" width="24" height="24" viewBox="0 0 24 24">${type.svg}</svg>
      <span class="type-name">${type.name}</span>
    `;
    typeFiltersContainer.appendChild(btn);
  });
  
  setupTypeFilters();
}

function renderCollection() {
  const collection = collections[currentCollection];
  
  // Atualizar título
  document.getElementById('collection-title').textContent = collection.name;
  
  // Atualizar logo
  const logo = document.getElementById('collection-logo');
  logo.src = collection.logo;
  logo.alt = `Logo ${collection.name}`;
  
  // Atualizar tema
  const progressCard = document.querySelector('.progress-card');
  progressCard.classList.remove('rivals-theme');
  if (currentCollection === 'rivals') {
    progressCard.classList.add('rivals-theme');
  }
  
  updateFilterButtons();
  renderCards();
  updateProgress();
}

function renderCards() {
  const collection = collections[currentCollection];
  const cardGrid = document.getElementById('card-grid');
  cardGrid.innerHTML = '';
  
  const collected = collectedCards[currentCollection] || [];
  const cards = window.cardData[currentCollection] || [];
  
  cards.forEach(cardInfo => {
    const isCollected = collected.includes(cardInfo.num);
    
    // Filtro de status
    if (currentFilter === 'collected' && !isCollected) return;
    if (currentFilter === 'missing' && isCollected) return;
    
    // Filtro de tipo
    if (currentTypeFilter !== 'all' && cardInfo.type !== currentTypeFilter) return;
    
    // Filtro de raridade
    if (currentRarityFilter !== 'all' && cardInfo.rarity !== currentRarityFilter) return;
    
    // Filtro de pesquisa
    if (searchQuery && !cardInfo.name.toLowerCase().includes(searchQuery)) return;
    
    const cardElement = createCardElement(cardInfo, isCollected, collection);
    cardGrid.appendChild(cardElement);
  });
  
  // Mostrar mensagem se não houver cartas
  if (cardGrid.children.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'Nenhuma carta encontrada com os filtros selecionados';
    cardGrid.appendChild(emptyMessage);
  }
}

function createCardElement(cardInfo, isCollected, collection) {
  const card = document.createElement('div');
  card.className = `card-item ${isCollected ? 'collected' : 'not-collected'}`;
  card.dataset.cardNum = cardInfo.num;
  
  const displayNum = String(cardInfo.num).padStart(3, '0');
  const imageUrl = collection.imageUrlPattern(cardInfo.num);
  
  const pokemonType = window.pokemonTypes[cardInfo.type];
  const rarity = window.rarityTypes[cardInfo.rarity];
  
  card.innerHTML = `
    <div class="card-image-container">
      <img 
        class="card-image" 
        src="${imageUrl}" 
        alt="${cardInfo.name}"
        loading="lazy"
        onerror="this.src='https://tcg.pokemon.com/assets/img/global/tcg-card-back.jpg'"
      >
      ${isCollected ? '<div class="collected-badge">✓</div>' : ''}
      <div class="rarity-badge" style="background: ${rarity.bgColor}; color: ${rarity.color}; box-shadow: 0 2px 8px rgba(0,0,0,0.2)">
        ${rarity.symbol}
      </div>
    </div>
    <div class="card-info">
      <p class="card-name">${cardInfo.name}</p>
      <div class="card-meta">
        <span class="card-type" style="color: ${pokemonType.color}">
          <svg class="card-type-icon" width="16" height="16" viewBox="0 0 24 24">${pokemonType.svg}</svg>
          ${pokemonType.name}
        </span>
        <span class="card-number">#${displayNum}</span>
      </div>
    </div>
  `;
  
  // Clicar na carta adiciona/remove diretamente
  card.addEventListener('click', () => toggleCard(cardInfo.num));
  
  return card;
}

function updateProgress() {
  const collection = collections[currentCollection];
  const collected = collectedCards[currentCollection] || [];
  const cards = window.cardData[currentCollection] || [];
  
  const total = cards.length;
  const count = collected.length;
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  document.getElementById('collected-count').textContent = count;
  document.getElementById('total-count').textContent = total;
  document.getElementById('progress-bar').style.width = `${percentage}%`;
  document.getElementById('progress-percentage').textContent = `${percentage}% completo`;
}

function toggleCard(cardNum) {
  const collected = collectedCards[currentCollection] || [];
  const index = collected.indexOf(cardNum);
  
  if (index > -1) {
    // Remover da coleção
    collected.splice(index, 1);
  } else {
    // Adicionar à coleção
    collected.push(cardNum);
  }
  
  collectedCards[currentCollection] = collected;
  saveCollectedCards();
  
  // Re-renderizar apenas as cartas
  renderCards();
  updateProgress();
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);
