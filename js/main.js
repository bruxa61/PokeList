// Configuração das coleções
const collections = {
  journey: {
    name: 'Amigos de Jornada',
    code: 'SV09',
    theme: 'journey',
    totalCards: 159,
    imageUrlPattern: (num) => {
      // SV09 ainda não está no CDN pokemontcg.io, usando placeholder
      return `https://tcg.pokemon.com/assets/img/global/tcg-card-back.jpg`;
    },
    cardNumbers: generateCardNumbers(1, 159)
  },
  silver: {
    name: 'Tempestade de Prata',
    code: 'SWSH12',
    theme: 'silver',
    totalCards: 245,
    imageUrlPattern: (num) => {
      if (typeof num === 'string' && num.startsWith('TG')) {
        return `https://images.pokemontcg.io/swsh12/${num}.png`;
      }
      return `https://images.pokemontcg.io/swsh12/${num}.png`;
    },
    cardNumbers: [
      ...generateCardNumbers(1, 195),
      ...generateCardNumbers(196, 215),
      ...generateTrainerGalleryNumbers()
    ]
  }
};

function generateCardNumbers(start, end) {
  const numbers = [];
  for (let i = start; i <= end; i++) {
    numbers.push(i);
  }
  return numbers;
}

function generateTrainerGalleryNumbers() {
  const tgCards = [];
  for (let i = 1; i <= 30; i++) {
    tgCards.push(`TG${String(i).padStart(2, '0')}`);
  }
  return tgCards;
}

let currentCollection = 'silver'; // Começar com Silver que tem imagens
let currentFilter = 'all';
let collectedCards = {};

function initializeApp() {
  loadCollectedCards();
  setupEventListeners();
  renderCollection();
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
  if (!collectedCards.silver) collectedCards.silver = [];
}

function saveCollectedCards() {
  localStorage.setItem('pokemonChecklist', JSON.stringify(collectedCards));
}

function setupEventListeners() {
  document.querySelectorAll('.collection-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCollection = btn.dataset.collection;
      updateCollectionButtons();
      renderCollection();
    });
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      updateFilterButtons();
      renderCards();
    });
  });

  document.getElementById('reset-collection').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todas as cartas desta coleção?')) {
      collectedCards[currentCollection] = [];
      saveCollectedCards();
      renderCollection();
    }
  });

  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function updateCollectionButtons() {
  document.querySelectorAll('.collection-btn').forEach(btn => {
    btn.classList.remove('active', 'silver-theme');
    if (btn.dataset.collection === currentCollection) {
      btn.classList.add('active');
      if (currentCollection === 'silver') {
        btn.classList.add('silver-theme');
      }
    }
  });
}

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active', 'silver-theme');
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('active');
      if (currentCollection === 'silver') {
        btn.classList.add('silver-theme');
      }
    }
  });
}

function renderCollection() {
  const collection = collections[currentCollection];
  
  document.getElementById('collection-title').textContent = collection.name;
  
  const progressCard = document.querySelector('.progress-card');
  progressCard.classList.remove('silver-theme');
  if (currentCollection === 'silver') {
    progressCard.classList.add('silver-theme');
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
  
  collection.cardNumbers.forEach(num => {
    const isCollected = collected.includes(num);
    
    if (currentFilter === 'collected' && !isCollected) return;
    if (currentFilter === 'missing' && isCollected) return;
    
    const cardElement = createCardElement(num, isCollected, collection);
    cardGrid.appendChild(cardElement);
  });
}

function createCardElement(cardNum, isCollected, collection) {
  const card = document.createElement('div');
  card.className = `card-item ${isCollected ? 'collected' : 'not-collected'}`;
  card.dataset.cardNum = cardNum;
  
  let displayNum, imageNum;
  if (typeof cardNum === 'string') {
    displayNum = cardNum;
    imageNum = cardNum;
  } else {
    displayNum = String(cardNum).padStart(3, '0');
    imageNum = cardNum;
  }
  
  const imageUrl = collection.imageUrlPattern(imageNum);
  
  card.innerHTML = `
    <div class="card-image-container">
      <img 
        class="card-image" 
        src="${imageUrl}" 
        alt="Carta ${displayNum}"
        loading="lazy"
        onerror="this.src='https://tcg.pokemon.com/assets/img/global/tcg-card-back.jpg'"
      >
    </div>
    <div class="card-info">
      <p class="card-number">#${displayNum}</p>
    </div>
  `;
  
  card.addEventListener('click', () => openModal(cardNum, isCollected, collection));
  
  return card;
}

function updateProgress() {
  const collection = collections[currentCollection];
  const collected = collectedCards[currentCollection] || [];
  const total = collection.totalCards;
  const count = collected.length;
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  document.getElementById('collected-count').textContent = count;
  document.getElementById('total-count').textContent = total;
  document.getElementById('progress-bar').style.width = `${percentage}%`;
  document.getElementById('progress-percentage').textContent = `${percentage}% completo`;
}

function openModal(cardNum, isCollected, collection) {
  const modal = document.getElementById('card-modal');
  
  let displayNum, imageNum;
  if (typeof cardNum === 'string') {
    displayNum = cardNum;
    imageNum = cardNum;
  } else {
    displayNum = String(cardNum).padStart(3, '0');
    imageNum = cardNum;
  }
  
  const imageUrl = collection.imageUrlPattern(imageNum);
  
  document.getElementById('modal-image').src = imageUrl;
  document.getElementById('modal-name').textContent = `Carta #${displayNum}`;
  document.getElementById('modal-number').textContent = `${collection.name} - ${collection.code}`;
  
  const toggleBtn = document.getElementById('modal-toggle');
  toggleBtn.className = `modal-toggle ${isCollected ? 'collected' : 'not-collected'}`;
  toggleBtn.textContent = isCollected ? 'Remover da Coleção' : 'Adicionar à Coleção';
  
  toggleBtn.onclick = () => toggleCard(cardNum);
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('card-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function toggleCard(cardNum) {
  const collected = collectedCards[currentCollection] || [];
  const index = collected.indexOf(cardNum);
  
  if (index > -1) {
    collected.splice(index, 1);
  } else {
    collected.push(cardNum);
  }
  
  collectedCards[currentCollection] = collected;
  saveCollectedCards();
  
  closeModal();
  renderCollection();
}

document.addEventListener('DOMContentLoaded', initializeApp);
