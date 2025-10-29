# Pokémon TCG Checklist Application

## Overview

This is a web-based checklist application for tracking Pokémon Trading Card Game (TCG) collections. The application allows users to browse, filter, and mark cards as collected from different Pokémon TCG sets (specifically SV09 "Amigos de Jornada" and SV10 "Rivais Predestinados"). It provides a visual interface to track collection progress, filter by card type and rarity, and search for specific cards. The application is entirely client-side with local storage persistence and includes a simple Python HTTP server for development/deployment.

## Recent Changes

**October 29, 2025:**
- Added pokéball favicon for better visual branding
- Implemented interactive rarity filter system (replaced static legend)
- Enhanced theming system with dynamic header gradients that change based on collection
- Improved type icon system using emoji symbols (lightweight, no external dependencies)
- Redesigned rarity badges with better colors and removed dark background
- Made collection metadata more flexible by including headerGradient in collection objects

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Pure Vanilla JavaScript**: No frameworks used, DOM manipulation handled directly
- **HTML5 + CSS3**: Semantic markup with modern CSS features (CSS variables, flexbox/grid, gradients)
- **Local Storage API**: Client-side data persistence for tracking collected cards

**Design Patterns:**
- **Single Page Application (SPA)**: All functionality on one page with dynamic content rendering
- **Module Pattern**: JavaScript organized with window-scoped objects for data and functions
- **Event-Driven Architecture**: User interactions handled through event listeners
- **Separation of Concerns**: Data (cardData.js), logic (main.js), and presentation (style.css) are separated

**State Management:**
- Application state stored in global variables (`currentCollection`, `collectedCards`, `currentFilter`, etc.)
- Persistence handled via `localStorage` with JSON serialization
- State changes trigger UI re-renders through dedicated render functions

**Rationale**: Chose vanilla JavaScript for simplicity and zero build step. This makes the application extremely portable and easy to deploy without npm dependencies or bundlers. Local storage provides adequate persistence for a personal checklist tool without requiring a backend database.

### Backend Architecture

**Technology Stack:**
- **Python 3 HTTP Server**: Simple static file server using built-in `http.server` module
- **No Framework**: Uses only Python standard library

**Server Features:**
- Custom request handler (`NoCacheHTTPRequestHandler`) that extends `SimpleHTTPRequestHandler`
- Cache-control headers added to prevent browser caching issues during development
- Configurable host/port (defaults to `0.0.0.0:5000`)

**Rationale**: Since this is a purely client-side application, a full web framework like Flask or Express would be overkill. The Python HTTP server provides the minimal infrastructure needed to serve static files during development. The no-cache headers ensure changes are immediately visible without hard refreshes.

**Alternatives Considered:**
- Using a Node.js server (http-server package): Would require npm dependencies
- No server at all (file:// protocol): Would cause CORS issues with external resources
- Full backend framework: Unnecessary complexity for static file serving

**Pros**: Zero dependencies, extremely simple, portable
**Cons**: Not suitable for production (no security features, performance optimizations, or HTTPS)

### Data Architecture

**Card Data Structure:**
```javascript
{
  num: Number,      // Card number in set
  name: String,     // Pokémon name
  type: String,     // Pokémon type (grass, fire, water, etc.)
  rarity: String    // Card rarity (common, rare, ultraRare, etc.)
}
```

**Collection Configuration:**
```javascript
{
  name: String,              // Display name
  code: String,              // Set code (SV09, SV10)
  theme: String,             // CSS theme identifier
  logo: String,              // External logo URL
  totalCards: Number,        // Total cards in set
  imageUrlPattern: Function, // Function to generate card image URLs
  headerGradient: String     // CSS gradient for header
}
```

**Storage Schema:**
```javascript
localStorage['pokemonChecklist'] = {
  journey: [1, 5, 10, ...],  // Array of collected card numbers
  rivals: [2, 15, 23, ...]    // Array of collected card numbers
}
```

**Rationale**: Lightweight data structures optimized for client-side rendering. Card numbers stored as arrays rather than objects to minimize storage footprint. External image URLs reduce application size and leverage CDN caching.

### UI/UX Architecture

**Theming System:**
- CSS custom properties (variables) for dynamic theming
- Collection-specific color schemes (journey: blue/teal, rivals: red/purple)
- Dynamic header gradients defined in collection metadata
- Theme switching updates CSS variables, gradients, and button styles in real-time
- Smooth visual transitions between collection themes

**Filtering System:**
- Multi-dimensional filtering: status (all/collected/missing), type, rarity
- Interactive rarity filter buttons that toggle on/off
- Search functionality with real-time filtering by Pokémon name
- Filters combine with AND logic
- Visual feedback on active filters with highlight states

**Progressive Enhancement:**
- Core functionality works without JavaScript (displays static HTML)
- JavaScript enhances with interactivity and persistence
- Graceful degradation for missing localStorage

**Responsive Design:**
- Mobile-first approach implied by viewport meta tag
- CSS likely uses media queries for different screen sizes (truncated in sample)

## External Dependencies

### Third-Party Services

**Pokémon TCG Image CDN:**
- **URL Pattern**: `https://images.pokemontcg.io/{setCode}/{cardNumber}.png`
- **Purpose**: Hosts official card images for SV9 and SV10 sets
- **Rationale**: External hosting eliminates need to store/serve large image files locally
- **Fallback**: Application should handle image load failures gracefully

**Pokémon Official Assets:**
- **Set Logos**: `https://tcg.pokemon.com/assets/img/sv-expansions/.../logo/pt-br/...`
- **Purpose**: Official branding for collection headers
- **Language**: Portuguese (pt-br) localization

### Font Services

**Google Fonts:**
- **Fonts Used**: Flexo (400/500/700), Roboto (400/500/700)
- **Purpose**: Typography consistency and visual polish
- **Loading**: Linked via CDN in HTML head
- **Fallback**: System fonts defined in CSS (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`)

### Browser APIs

**localStorage:**
- **Purpose**: Persist user's collection progress across sessions
- **Data Format**: JSON-serialized objects
- **Storage Key**: `'pokemonChecklist'`
- **Quota**: Subject to browser limits (~5-10MB typical)

**Fetch API (implied):**
- May be used for loading card images dynamically
- No explicit backend API calls observed in code sample

### Static Assets

**Favicon:**
- **Path**: `/favicon.ico`
- **Purpose**: Browser tab icon (pokéball design)
- **Format**: ICO file for broad browser compatibility

**No Database:**
- Application intentionally avoids database to maintain simplicity
- All data hardcoded in JavaScript or stored in localStorage
- Suitable for personal use but not multi-user scenarios

**No Authentication:**
- Single-user application with no login system
- Data stored locally per browser/device
- No sync functionality between devices