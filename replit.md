# Checklist Pokémon TCG

## Visão Geral
Aplicação web moderna para acompanhar sua coleção de cartas Pokémon TCG. Design inspirado no site oficial da Pokémon com interface intuitiva e elegante.

## Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Armazenamento**: localStorage (sem banco de dados)
- **Servidor**: Python HTTP server
- **Imagens**: Pokémon TCG API (images.pokemontcg.io)

## Estrutura do Projeto
```
/
├── index.html        # Página principal
├── css/
│   └── style.css    # Estilos modernos e responsivos
├── js/
│   └── main.js      # Lógica da aplicação
└── server.py        # Servidor HTTP de desenvolvimento
```

## Funcionalidades

### Coleções Disponíveis

#### 1. **Tempestade de Prata (SWSH12)** - 245 cartas ✅
- Cartas principais: 1-195
- Cartas secretas: 196-215
- Trainer Gallery: TG01-TG30
- **Todas as imagens funcionando perfeitamente!**

#### 2. **Amigos de Jornada (SV09)** - 159 cartas ⏳
- Coleção muito recente (lançada em março de 2025)
- Imagens ainda não disponíveis no CDN público
- Será atualizada assim que as imagens estiverem disponíveis

### Recursos Principais
- ✅ **Clique para Coletar**: Marque cartas com um simples clique
- 📊 **Progresso em Tempo Real**: Veja quantas cartas você já tem
- 🎨 **Temas Personalizados**: Cada coleção com suas próprias cores
- 🔍 **Filtros Inteligentes**:
  - Ver Todas
  - Somente Coletadas
  - Somente Faltando
- 💾 **Salvamento Automático**: Dados persistem no navegador
- 📱 **100% Responsivo**: Funciona em mobile, tablet e desktop
- 🖼️ **Modal de Visualização**: Veja cartas em tamanho grande
- 🗑️ **Reset por Coleção**: Limpe sua coleção quando quiser

### Interface Visual
- **Cartas não coletadas**: Aparecem em escala de cinza com opacidade reduzida
- **Cartas coletadas**: Cores vibrantes com check verde ✓
- **Efeitos suaves**: Transições e animações em todos os elementos
- **Barra de progresso**: Animada com cores da coleção

## Como Usar

1. **Selecionar Coleção**: Clique no botão da coleção desejada
2. **Marcar Cartas**: Clique em qualquer carta para marcá-la como coletada
3. **Filtrar**: Use os botões de filtro para organizar sua visualização
4. **Visualizar**: Clique em uma carta para ver em tamanho grande

## Armazenamento de Dados

Os dados são salvos localmente no navegador usando localStorage:
```javascript
{
  "journey": [1, 5, 10, ...],  // Números das cartas coletadas
  "silver": [2, 8, 15, ...]
}
```

**Observação**: Os dados ficam salvos apenas no navegador que você está usando. Se limpar os dados do navegador, sua coleção será perdida.

## Desenvolvimento

Execute o servidor:
```bash
python3 server.py
```

O site estará disponível em: http://localhost:5000

## Histórico de Mudanças

### 29/10/2025 - Redesign Completo
- ✨ Design moderno inspirado no site oficial da Pokémon
- 🗑️ Removido Firebase (agora 100% local com localStorage)
- 🃏 Integração com Pokémon TCG API para imagens
- 📦 **Tempestade de Prata**: Todas as 245 cartas (principais + secretas + Trainer Gallery)
- 🎯 **Amigos de Jornada**: 159 cartas (imagens pendentes)
- 🎨 Temas visuais únicos por coleção
- 📊 Sistema de progresso aprimorado
- 🔍 Filtros avançados
- 📱 Interface totalmente responsiva

## Observações Técnicas

### Por que algumas coleções não têm imagens?
"Amigos de Jornada" (SV09) foi lançada muito recentemente (março de 2025) e as imagens ainda não estão disponíveis no CDN público da Pokémon TCG API. Assim que forem disponibilizadas, o site automaticamente começará a exibir as imagens corretas.

### URLs das Imagens
- **Tempestade de Prata**: `https://images.pokemontcg.io/swsh12/[NUM].png`
- **Amigos de Jornada**: `https://images.pokemontcg.io/sv09/[NUM].png` (pendente)
