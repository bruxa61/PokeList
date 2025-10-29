# Checklist Pokémon TCG

## Visão Geral
Aplicação web moderna para acompanhar sua coleção de cartas Pokémon TCG. Design inspirado no site oficial da Pokémon com cores vibrantes e interface intuitiva.

## Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Armazenamento**: localStorage (100% local, sem banco de dados)
- **Servidor**: Python HTTP server
- **Imagens**: Pokémon TCG API CDN

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

## Coleções Disponíveis

### 1. **Rivais Predestinados (SV10)** - 244 cartas ✅
- **Código**: SV10 / Destined Rivals
- **Tema**: Team Rocket vs Treinadores Lendários
- **Cartas Especiais**: Mewtwo ex do Team Rocket, Garchomp ex da Cynthia, Ho-Oh ex do Ethan
- **Cor do tema**: Rosa/Vermelho
- **Status**: Todas as imagens funcionando!

### 2. **Amigos de Jornada (SV09)** - 190 cartas ✅
- **Código**: SV09 / Journey Together  
- **Tema**: Treinadores e seus Pokémon parceiros
- **Cartas Especiais**: Zoroark ex do N, Bellibolt ex da Iono, Clefairy ex da Lillie, Zacian ex do Hop
- **Cor do tema**: Azul
- **Status**: Todas as imagens funcionando!

## Funcionalidades Principais

### ✨ Interface Moderna
- Design inspirado no site oficial da Pokémon
- Temas de cores únicos para cada coleção
- Animações e transições suaves
- 100% responsivo (funciona em qualquer dispositivo)

### 🎮 Como Usar
1. **Selecionar Coleção**: Clique no botão da coleção desejada
2. **Marcar Cartas**: Clique em qualquer carta para marcá-la como coletada
3. **Visualizar Detalhes**: Clique novamente para abrir em tamanho grande
4. **Filtrar**: Use os botões para ver todas, só coletadas ou só faltando
5. **Acompanhar Progresso**: Veja em tempo real quantas cartas você já tem

### 📊 Sistema de Progresso
- Contador de cartas coletadas vs total
- Barra de progresso animada
- Porcentagem de conclusão
- Estatísticas visuais

### 🔍 Filtros Inteligentes
- **Ver Todas**: Mostra todas as cartas da coleção
- **Coletadas**: Mostra apenas as que você já tem
- **Faltando**: Mostra apenas as que você ainda precisa

### 🎨 Visual das Cartas
- **Cartas Não Coletadas**: Aparecem em escala de cinza com opacidade reduzida
- **Cartas Coletadas**: Cores vibrantes com check verde ✓
- **Efeitos de Hover**: Transições suaves ao passar o mouse
- **Modal**: Visualização em tamanho grande ao clicar

### 💾 Armazenamento
- Dados salvos automaticamente no navegador (localStorage)
- Não precisa de conta ou login
- Funciona offline após carregar as imagens
- Dados persistem entre sessões

### 🗑️ Gerenciamento
- Botão "Limpar Tudo" para resetar cada coleção
- Confirmação antes de apagar dados
- Dados independentes por coleção

## Como Executar

```bash
python3 server.py
```

O site estará disponível em: `http://localhost:5000`

## Tecnologias e URLs

### URLs das Imagens
- **Rivais Predestinados**: `https://images.pokemontcg.io/sv10/[NUM].png`
- **Amigos de Jornada**: `https://images.pokemontcg.io/sv9/[NUM].png`

### Armazenamento localStorage
```javascript
{
  "journey": [1, 5, 10, ...],  // Números das cartas coletadas
  "rivals": [2, 8, 15, ...]
}
```

## Histórico de Mudanças

### 29/10/2025 - v2.0 - Redesign Completo
- ✨ Design moderno inspirado no site oficial
- 🔄 Trocado para as coleções corretas:
  - **Amigos de Jornada (SV09)** - 190 cartas
  - **Rivais Predestinados (SV10)** - 244 cartas
- 🎨 Temas de cores únicos por coleção:
  - Amigos de Jornada: Azul
  - Rivais Predestinados: Rosa/Vermelho
- 🗑️ Removido Firebase (100% local agora)
- 🖼️ Integração com Pokémon TCG API para imagens
- 📊 Sistema de progresso melhorado
- 🔍 Filtros avançados
- 📱 Interface totalmente responsiva
- 💾 Salvamento automático via localStorage

## Observações

- Os dados ficam salvos apenas no navegador atual
- Se limpar os dados do navegador, sua coleção será perdida
- As imagens são carregadas do CDN oficial da Pokémon
- Funciona offline após carregar as imagens pela primeira vez
