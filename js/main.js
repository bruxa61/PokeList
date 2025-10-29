// js/main.js
// Módulo principal do Checklist Pokémon
// --------------------------------------------------
// Requisitos: arquivo index.html referencia este arquivo com <script type="module" src="js/main.js"></script>
// --------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/* ===========================
   Variáveis / Configuração
   =========================== */

// Essas variáveis podem ser injetadas pelo servidor/ambiente.
// Se você não usa injeção, substitua manualmente com seu firebaseConfig.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app = null;
let db = null;
let auth = null;
let userId = null;
let isAuthReady = false;

// Mantemos um checklist por coleção para evitar mistura de dados
const cardChecklists = {
  journey: {}, // dados carregados do Firestore para 'journey'
  rivals: {}   // dados carregados do Firestore para 'rivals'
};
let currentCollectionKey = 'journey'; // coleção ativa
let cardChecklist = {}; // referência rápida para checklist da coleção ativa

/* ===========================
   Dados estáticos (exemplo)
   =========================== */

const collectionData = {
  journey: {
    name: "Amigos de Jornada (SWSH11)",
    theme: { primary: 'blue', secondary: 'blue-100' },
    cards: [
      { num: "001/050", name: "Pikachu V", rarity: "HR", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_160.png" },
      { num: "002/050", name: "Bulbasaur", rarity: "C", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_3.png" },
      { num: "003/050", name: "Ivysaur", rarity: "U", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_4.png" },
      { num: "004/050", name: "Venusaur", rarity: "R", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_5.png" },
      { num: "010/050", name: "Lucario", rarity: "R", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_78.png" },
      { num: "025/050", name: "Zoroark de Hisui V", rarity: "HR", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_135.png" },
      { num: "030/050", name: "Mew VMAX", rarity: "HR", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_210.png" },
      { num: "035/050", name: "Bidoof", rarity: "C", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_121.png" },
      { num: "040/050", name: "Snorlax", rarity: "C", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_144.png" },
      { num: "050/050", name: "Palkia VSTAR", rarity: "HR", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH11/SWSH11_EN_185.png" },
    ]
  },
  rivals: {
    name: "Rivais Predestinados (SWSH12)",
    theme: { primary: 'red', secondary: 'red-100' },
    cards: [
      { num: "040/045", name: "Charizard", rarity: "R", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_26.png" },
      { num: "041/045", name: "Wartortle", rarity: "U", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_30.png" },
      { num: "042/045", name: "Blastoise", rarity: "R", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_31.png" },
      { num: "043/045", name: "Squirtle", rarity: "C", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_29.png" },
      { num: "044/045", name: "Gyarados VMAX", rarity: "HR", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_205.png" },
      { num: "045/045", name: "Inteleon VMAX", rarity: "HR", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_228.png" },
      { num: "050/045", name: "Boltund V", rarity: "HR", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_178.png" },
      { num: "060/045", name: "Arcanine", rarity: "U", imageUrl: "https://assets.pokemon.com/assets/cms2/img/cards/web/SWSH12/SWSH12_EN_48.png" },
    ]
  }
};

const rarityMap = {
  "C": { label: "Comum", color: "border-gray-500", icon: "●" },
  "U": { label: "Incomum", color: "border-green-500", icon: "◆" },
  "R": { label: "Rara", color: "border-purple-500", icon: "★" },
  "HR": { label: "Ultra Rara/Secreta", color: "border-yellow-400", icon: "✨" }
};

/* ===========================
   Elementos DOM
   =========================== */

const body = document.body;
const mainContainer = document.getElementById('main-container');
const collectionTitleEl = document.getElementById('collection-title');
const collectionStatsEl = document.getElementById('collection-stats');
const cardGridEl = document.getElementById('card-grid');
const userIdEl = document.getElementById('current-user-id');
const loadingOverlay = document.getElementById('loading-overlay');
const rarityLegendEl = document.getElementById('rarity-legend');

/* ===========================
   Funções UI / Utilitários
   =========================== */

function renderRarityLegend() {
  rarityLegendEl.innerHTML = '';
  Object.keys(rarityMap).forEach(key => {
    const item = rarityMap[key];
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
      <span class="text-xl font-bold ${item.color.replace('border-', 'text-')}">${item.icon}</span>
      <span class="font-medium">${item.label} (${key})</span>
    `;
    rarityLegendEl.appendChild(div);
  });
}

function applyTheme(primaryColor, secondaryColor, activeKey) {
  // Limpa classes anteriores e aplica novo background
  body.className = body.className.split(' ').filter(c => !c.startsWith('bg-') || c.includes('min-h-screen')).join(' ');
  body.classList.add(`bg-${secondaryColor}`);

  // Painel de estatísticas
  const statsPanel = document.querySelector('.theme-bg');
  if (statsPanel) {
    // limpar apenas classes bg-*
    statsPanel.className = statsPanel.className.split(' ').filter(c => !c.startsWith('bg-') || c.includes('transition')).join(' ');
    statsPanel.classList.add('bg-white/70', 'backdrop-blur-sm', 'border', `border-${primaryColor}-200`);
  }

  // Botões de coleção
  document.querySelectorAll('.collection-btn').forEach(btn => {
    const isSelected = btn.dataset.collection === activeKey;
    const baseClasses = "px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition duration-300 transform hover:scale-105";
    btn.className = baseClasses;
    if (isSelected) {
      btn.classList.add(`bg-${primaryColor}-600`, 'text-white', 'ring-4', `ring-${primaryColor}-300`);
    } else {
      btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    }
  });
}

/**
 * Renderiza as cartas da coleção atual.
 */
function renderCards() {
  const currentCollection = collectionData[currentCollectionKey];
  const theme = currentCollection.theme.primary;
  collectionTitleEl.textContent = currentCollection.name;
  cardGridEl.innerHTML = '';

  let cardsOwnedCount = 0;

  currentCollection.cards.forEach(card => {
    const isOwned = !!cardChecklist[card.num];
    if (isOwned) cardsOwnedCount++;

    const rarity = rarityMap[card.rarity] || rarityMap['C'];

    const cardContainer = document.createElement('div');
    cardContainer.className = 'bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1';
    cardContainer.dataset.cardNum = card.num;
    cardContainer.onclick = () => toggleCardStatus(card.num);

    const cardHtml = `
      <div class="p-2 border-b-4 ${rarity.color} theme-border">
        <img 
            src="${card.imageUrl}" 
            alt="${card.name} (${card.num})" 
            class="card-image w-full h-auto rounded-lg mb-2 ${isOwned ? 'card-owned' : ''}"
            onerror="this.onerror=null; this.src='https://placehold.co/300x420/${theme}/ffffff?text=${encodeURIComponent(card.num)}'; this.style.filter='none';"
        >
      </div>
      <div class="p-3 text-center">
          <p class="font-bold text-gray-800">${card.name}</p>
          <p class="text-sm font-medium text-gray-500">${card.num} | ${rarity.label}</p>
      </div>
    `;

    cardContainer.innerHTML = cardHtml;
    cardGridEl.appendChild(cardContainer);
  });

  // Atualiza estatísticas
  const totalCards = currentCollection.cards.length;
  const percentage = totalCards > 0 ? ((cardsOwnedCount / totalCards) * 100).toFixed(1) : 0;
  collectionStatsEl.textContent = `Cartas Encontradas: ${cardsOwnedCount} / ${totalCards} (${percentage}%)`;

  // Aplica tema visual
  applyTheme(currentCollection.theme.primary, currentCollection.theme.secondary, currentCollectionKey);
}

/* ===========================
   Firebase: Inicialização e Listeners
   =========================== */

/**
 * Inicializa Firebase e autenticação.
 */
async function initializeFirebase() {
  try {
    if (!firebaseConfig) {
      console.error("Firebase config ausente (firebaseConfig === null).");
      userIdEl.textContent = "Erro: Configuração do Firebase ausente.";
      // libera UI para depuração
      loadingOverlay.style.display = 'none';
      mainContainer.classList.remove('opacity-0');
      return;
    }

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Autenticação (tenta token custom se disponível, senão anônimo)
    try {
      if (initialAuthToken) {
        console.log("Autenticando com token custom...");
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        console.log("Autenticando anonimamente...");
        await signInAnonymously(auth);
      }
    } catch (authErr) {
      console.error("Erro durante autenticação:", authErr);
      userIdEl.textContent = "Erro de autenticação. Veja console.";
      loadingOverlay.style.display = 'none';
      mainContainer.classList.remove('opacity-0');
      return;
    }

    // Listener de estado de autenticação
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userId = user.uid;
        userIdEl.textContent = `ID do Usuário: ${userId}`;
        isAuthReady = true;
        console.log("Usuário autenticado:", userId);

        // configura listeners do Firestore
        setupFirestoreListener();

        // esconder loading e mostrar UI
        loadingOverlay.style.display = 'none';
        mainContainer.classList.remove('opacity-0');

        // render inicial (caso tenhamos dados locais)
        cardChecklist = cardChecklists[currentCollectionKey] || {};
        renderCards();
      } else {
        console.warn("onAuthStateChanged: usuário desconectado.");
        loadingOverlay.style.display = 'none';
        mainContainer.classList.remove('opacity-0');
      }
    });

  } catch (error) {
    console.error("Erro na inicialização do Firebase:", error);
    userIdEl.textContent = "Erro inicializando Firebase. Veja console.";
    loadingOverlay.style.display = 'none';
    mainContainer.classList.remove('opacity-0');
  }
}

/**
 * Configura os listeners do Firestore para as duas coleções.
 * Observação importante: passamos os segmentos do caminho como argumentos separados
 * ao invés de um template string com barras. Isso evita problemas de path.
 */
function setupFirestoreListener() {
  if (!db || !userId) {
    console.warn("setupFirestoreListener chamado sem db ou userId. Aguardando autenticação...");
    return;
  }

  // Construir referências aos documentos corretos (segmentos separados)
  const docRefJourney = doc(db, 'artifacts', String(appId), 'users', String(userId), 'pokemon-checklist', 'journey');
  const docRefRivals  = doc(db, 'artifacts', String(appId), 'users', String(userId), 'pokemon-checklist', 'rivals');

  // Listener para journey
  onSnapshot(docRefJourney, (docSnapshot) => {
    try {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        cardChecklists.journey = (data && data.cards && typeof data.cards === 'object') ? data.cards : {};
        console.log("Snapshot 'journey' recebido:", cardChecklists.journey);
      } else {
        cardChecklists.journey = {};
        console.log("Snapshot 'journey' não existe (documento vazio).");
      }
      // Se a coleção ativa for journey, atualiza a UI
      if (currentCollectionKey === 'journey') {
        cardChecklist = cardChecklists.journey;
        renderCards();
      }
    } catch (e) {
      console.error("Erro ao processar snapshot 'journey':", e);
    }
  }, (error) => {
    console.error("Erro no snapshot 'journey':", error);
    // Não travar a UI: liberar loading se houver erro grave
    loadingOverlay.style.display = 'none';
    mainContainer.classList.remove('opacity-0');
  });

  // Listener para rivals
  onSnapshot(docRefRivals, (docSnapshot) => {
    try {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        cardChecklists.rivals = (data && data.cards && typeof data.cards === 'object') ? data.cards : {};
        console.log("Snapshot 'rivals' recebido:", cardChecklists.rivals);
      } else {
        cardChecklists.rivals = {};
        console.log("Snapshot 'rivals' não existe (documento vazio).");
      }
      if (currentCollectionKey === 'rivals') {
        cardChecklist = cardChecklists.rivals;
        renderCards();
      }
    } catch (e) {
      console.error("Erro ao processar snapshot 'rivals':", e);
    }
  }, (error) => {
    console.error("Erro no snapshot 'rivals':", error);
    loadingOverlay.style.display = 'none';
    mainContainer.classList.remove('opacity-0');
  });

  // força render inicial baseado em dados que já estejam em memória
  cardChecklist = cardChecklists[currentCollectionKey] || {};
  renderCards();
}

/* ===========================
   Funções de interação com dados
   =========================== */

/**
 * Alterna o status de posse da carta localmente e salva no Firestore.
 * Salva no documento correto (journey/rivals).
 */
async function toggleCardStatus(cardNumber) {
  // Requer autenticação para salvar
  if (!userId || !db) {
    console.warn("Usuário não autenticado ou db não inicializado. Alteração local apenas.");
    // Alteração local para feedback imediato
    const newStatusLocal = !cardChecklist[cardNumber];
    if (newStatusLocal) cardChecklist[cardNumber] = true;
    else delete cardChecklist[cardNumber];
    renderCards();
    return;
  }

  // Alterna localmente para resposta imediata
  const newStatus = !cardChecklist[cardNumber];
  if (newStatus) cardChecklist[cardNumber] = true;
  else delete cardChecklist[cardNumber];

  // Atualiza checklist global da coleção ativa
  cardChecklists[currentCollectionKey] = { ...cardChecklist };

  // Atualiza a UI imediatamente
  renderCards();

  // Salva no Firestore no documento correto
  try {
    const docRef = doc(db, 'artifacts', String(appId), 'users', String(userId), 'pokemon-checklist', currentCollectionKey);
    // Escrevemos o objeto inteiro 'cards' no documento.
    await setDoc(docRef, { cards: cardChecklists[currentCollectionKey] }, { merge: true });
    console.log(`Status da carta ${cardNumber} salvo para coleção '${currentCollectionKey}'.`);
  } catch (error) {
    console.error("Erro ao salvar status da carta no Firestore:", error);
    // Reverter a mudança local em caso de erro (opcional)
    // (a snapshot do Firestore também pode corrigir isso quando houver leitura)
  }
}

/* ===========================
   Mudança de coleção (UI)
   =========================== */

function selectCollection(key) {
  if (!collectionData[key]) {
    console.warn("Coleção desconhecida:", key);
    return;
  }
  currentCollectionKey = key;
  // atualiza checklist ativo com os dados carregados do Firestore (ou vazio)
  cardChecklist = cardChecklists[key] || {};
  renderCards();
}

/* ===========================
   Inicialização (onload)
   =========================== */

window.onload = function() {
  // Render inicial da legenda
  renderRarityLegend();

  // Hooks nos botões
  const btnJourney = document.getElementById('btn-journey');
  const btnRivals = document.getElementById('btn-rivals');
  if (btnJourney) btnJourney.addEventListener('click', () => selectCollection('journey'));
  if (btnRivals) btnRivals.addEventListener('click', () => selectCollection('rivals'));

  // Tenta inicializar Firebase (se houver config). Se não houver, a UI ainda funciona localmente.
  initializeFirebase();

  // Se não houver Firebase configurado, liberamos o loading e mostramos a UI local
  // (isso evita ficar preso na tela de carregando quando o dev esquece de injetar config)
  setTimeout(() => {
    if (!isAuthReady && !firebaseConfig) {
      loadingOverlay.style.display = 'none';
      mainContainer.classList.remove('opacity-0');
      cardChecklist = cardChecklists[currentCollectionKey] || {};
      renderCards();
    }
  }, 800); // pequeno timeout para não interferir com autenticação real
};
