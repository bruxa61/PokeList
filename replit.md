# Checklist Pokémon TCG

## Visão Geral
Aplicação web para acompanhar sua coleção de cartas Pokémon TCG. Marque cartas como coletadas, acompanhe seu progresso e organize sua coleção com um design moderno inspirado no site oficial da Pokémon.

## Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Armazenamento**: localStorage (sem banco de dados)
- **Servidor**: Python HTTP server para desenvolvimento
- **Imagens**: CDN oficial da Pokémon

## Estrutura do Projeto
```
/
├── index.html        # Página principal
├── css/
│   └── style.css    # Estilos customizados e responsivos
├── js/
│   └── main.js      # Lógica da aplicação e localStorage
└── server.py        # Servidor HTTP para desenvolvimento
```

## Funcionalidades

### Coleções Disponíveis
1. **Amigos de Jornada (SV09)** - 190 cartas
2. **Tempestade de Prata (SWSH12)** - 215 cartas

### Recursos
- ✅ Marcação de cartas coletadas com um clique
- 📊 Acompanhamento de progresso em tempo real
- 🎨 Temas visuais distintos para cada coleção
- 🔍 Filtros: Ver todas / Coletadas / Faltando
- 💾 Salvamento automático via localStorage
- 📱 Design responsivo para mobile e desktop
- 🖼️ Modal com visualização ampliada das cartas
- 🗑️ Opção de limpar toda a coleção

### Design
- Interface inspirada no site oficial da Pokémon TCG
- Cartas não coletadas aparecem em escala de cinza
- Cartas coletadas com check verde e cores vibrantes
- Barra de progresso animada
- Efeitos de hover e transições suaves

## Como Funciona

### Armazenamento
Os dados são salvos localmente no navegador usando localStorage:
```javascript
{
  "journey": [1, 5, 10, 23, ...],  // IDs das cartas coletadas
  "silver": [2, 8, 15, ...]
}
```

### Estrutura das Cartas
Cada coleção define:
- Nome e código da coleção
- Total de cartas
- Padrão de URL das imagens
- Tema de cores

## Desenvolvimento
Execute `python3 server.py` para iniciar o servidor na porta 5000.

## Histórico de Mudanças
- **29/10/2025**: Redesign completo inspirado no site oficial da Pokémon
  - Removido Firebase (agora usa apenas localStorage)
  - Adicionadas todas as 190 cartas de Amigos de Jornada
  - Adicionadas todas as 215 cartas de Tempestade de Prata
  - Novo design moderno e responsivo
  - Sistema de filtros e progresso melhorado
  - Modal para visualização de cartas
