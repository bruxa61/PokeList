# Checklist Pokémon TCG

## Project Overview
A web-based checklist application for tracking Pokémon Trading Card Game collections. Users can mark cards as owned/not owned across different card sets (Amigos de Jornada and Rivais Predestinados).

## Tech Stack
- **Frontend**: HTML, CSS (Tailwind CDN), JavaScript (ES6 modules)
- **Backend**: Firebase (Authentication + Firestore)
- **Server**: Python HTTP server for static file serving

## Project Structure
```
/
├── index.html        # Main HTML file
├── css/
│   └── style.css    # Custom styles
├── js/
│   └── main.js      # Main application logic with Firebase integration
└── server.py        # Simple HTTP server for development
```

## Firebase Configuration
The application expects Firebase configuration to be injected via global variables:
- `__app_id`: Application identifier
- `__firebase_config`: Firebase configuration JSON
- `__initial_auth_token`: Optional custom auth token

Without Firebase config, the app will still load but won't persist data.

## Features
- Two card collections: "Amigos de Jornada" and "Rivais Predestinados"
- Visual card tracking with grayscale/color toggle
- Real-time sync with Firestore
- Anonymous authentication support
- Rarity-based card categorization (Common, Uncommon, Rare, Hyper Rare)
- Progress tracking with statistics

## Development
The app runs on port 5000 using a Python HTTP server that serves static files.

## Recent Changes
- Initial project setup in Replit environment (Oct 29, 2025)
