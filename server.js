import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import controllers from './server/controllers/controllers.js';

const app = express();
const PORT = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from dist/ at the root FIRST
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the built frontend for root and all non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Catch-all for client-side routing (SPA)
app.get(/^\/((?!api|user|save|dist).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Map page (legacy)
app.get('/map', (req, res) => {
  res.redirect('./client/map-index.html');
});

// API endpoints
app.post('/user', controllers.loginUser); // login/create user
app.post('/save', controllers.saveButton); // save pins for user
app.post('/api/pins', controllers.createPin); // create new pin
app.get('/api/pins', controllers.getAllPins); // get all pins

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
