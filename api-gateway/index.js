const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const AUTH_SERVICE = 'http://localhost:3002';
const BOOK_SERVICE = 'http://localhost:3001';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

app.post('/auth/register', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/register`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth service error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth service error' });
  }
});

// ✅ PROTECTED ROUTES
app.get('/books', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE}/books`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Book service error' });
  }
});

app.get('/books/:id', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE}/books/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Book service error' });
  }
});

app.post('/books', verifyToken, requireAdmin, async (req, res) => {
  try {
    const response = await axios.post(`${BOOK_SERVICE}/books`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Book service error' });
  }
});

app.delete('/books/:id', verifyToken, async (req, res) => {
  try {
    const response = await axios.delete(`${BOOK_SERVICE}/books/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Book service error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});