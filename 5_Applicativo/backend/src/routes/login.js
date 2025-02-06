require("dotenv").config();
const express = require('express');
const { authenticate } = require('../controllers/ldap');
const jwt = require('jsonwebtoken');

const login = express.Router();
login.use(express.json());


// API di login
login.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Autenticazione tramite LDAP
    const isAuthenticated = await authenticate(username, password);

    if (isAuthenticated) {
      // JWT Token
      const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// Middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Esempio di rotte protette
login.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});

module.exports = login;

