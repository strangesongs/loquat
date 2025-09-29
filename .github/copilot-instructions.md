# Loquat: Fruit Tree Map - AI Coding Guide

## Architecture Overview
**Split Client/Server**: Express backend serves API + static files, React frontend handles UI. DynamoDB stores user data.

- **Server**: `server.js` → controllers → schemas (DynamoDB integration)  
- **Client**: React components in `client/` with esbuild bundling to `dist/`
- **Data Flow**: Frontend → `/user` & `/save` API → DynamoDB (`LoquatUsers` table)

## Key Build System (esbuild)
**Entry Point**: `client/main.js` (NOT index.js) - this bundles React app
```bash
npm run dev          # Runs client + server concurrently 
npm run dev:client   # esbuild dev server on port 3000
npm run dev:server   # nodemon Express server on port 8080
```

**Critical**: Server serves static files from `dist/` at root, but dev mode uses esbuild's built-in server.

## DynamoDB Integration Patterns
**No traditional database**: Uses AWS DynamoDB with raw SDK (not ORM)
- Table: `LoquatUsers`, Partition Key: `userName` (String)
- Data format: `{ userName: "user", savedPins: [...] }` stored as JSON string
- See `server/schemas/schemas.js` for raw DynamoDB client usage patterns

## React Component Architecture  
**Class Components**: Uses legacy React class components, not hooks
- `sidebar.jsx`: Floating sidebar with dropdown state management
- `map.jsx`: Leaflet integration via react-leaflet
- **State Pattern**: Hardcoded fruit/marker arrays in component state (not props)

## Unique Conventions
**No Authentication**: "Login" just accepts username, creates user if missing  
**Mixed File Extensions**: `.jsx` for React, `.js` for vanilla JS, `.css` imports in JSX  
**Legacy Leaflet**: CDN imports in HTML + react-leaflet wrapper  
**Floating UI**: Sidebar uses `position: fixed` overlay pattern, not flex/grid

## CSS Architecture
**Import Pattern**: CSS imported directly in React components (esbuild handles bundling)
```jsx
import './stylesheets/sidebar.css';  // Component-specific styles
```
**Font Loading**: Google Fonts loaded via HTML `<link>` tags, not CSS imports  
**Layout**: Uses viewport units (`100vh/vw`) with fixed positioning for overlay components

## Environment Setup
**Required Variables**:
```
AWS_REGION=us-west-2
DYNAMODB_TABLE=LoquatUsers  
```
**AWS Credentials**: Local dev uses `~/.aws/credentials`, production uses IAM roles

## Common Gotchas  
- **Entry confusion**: Build targets `client/main.js`, not `index.js`
- **Port separation**: Client dev (3000) ≠ server (8080) - proxy needed for API calls
- **DynamoDB format**: Data stored as stringified JSON in single field
- **Legacy React**: Uses `render()` from 'react-dom', not React 18 createRoot
- **Static serving**: Express serves from `dist/` but build outputs there too

## File Reference
- `server/controllers/controllers.js` - API endpoint patterns  
- `server/schemas/schemas.js` - DynamoDB client setup
- `client/sidebar.jsx` - State management examples
- `client/stylesheets/sidebar.css` - Floating layout patterns
