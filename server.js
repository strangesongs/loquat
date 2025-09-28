const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const controllers = require('./server/controllers/controllers');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
