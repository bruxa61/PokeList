// Configuração das coleções
const collections = {
  journey: {
    name: 'Amigos de Jornada',
    code: 'SV09',
    theme: 'journey',
    totalCards: 190,
    imageUrlPattern: (num) => {
      return `https://images.pokemontcg.io/sv9/${num}.png`;
    },
    cardNumbers: generateCardNumbers(1, 190)
  },
  rivals: {
    name: 'Rivais Predestinados',
    code: 'SV10',
    theme: 'rivals',
    totalCards: 244,
    imageUrlPattern: (num) => {
      return `https://images.pokemontcg.io/sv10/${num}.png`;
    },
    cardNumbers: generateCardNumbers(1, 244)
  }
};

function generateCardNumbers(start, end) {
  const numbers = [];
  for (let i = start; i <= end; i++) {
    numbers.push(i);
  }
  return numbers;
}

let currentCollection = 'rivals'; // Começar com Rivais que tem imagens
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
  if (!collectedCards.rivals) collectedCards.rivals = [];
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

function renderCollection() {
  const collection = collections[currentCollection];
  
  document.getElementById('collection-title').textContent = collection.name;
  
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
  
  const displayNum = String(cardNum).padStart(3, '0');
  const imageUrl = collection.imageUrlPattern(cardNum);
  
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
  
  const displayNum = String(cardNum).padStart(3, '0');
  const imageUrl = collection.imageUrlPattern(cardNum);
  
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
