const express = require('express');
const Database = require('better-sqlite3');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// This tells Express to understand JSON data sent to it
app.use(express.json());

// Create and connect to the database
const db = new Database('books.db');

// Create the books table if it doesn't exist yet
db.exec
(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT
  )
`);

// GET all books
app.get('/books', (req, res) => 
{
  const books = db.prepare('SELECT * FROM books').all();
  res.json(books);
});

// GET a single book by id
app.get('/books/:id', (req, res) => 
{
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// POST - add a new book
app.post('/books', (req, res) => 
{
  const { title, author, genre } = req.body;
  const result = db.prepare('INSERT INTO books (title, author, genre) VALUES (?, ?, ?)').run(title, author, genre);
  res.status(201).json({ id: result.lastInsertRowid, title, author, genre });
});

// DELETE a book
app.delete('/books/:id', (req, res) => {
  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.json({ message: 'Book deleted' });
});

// Start the server
app.listen(PORT, () => 
{
  console.log(`Book service running on port ${PORT}`);
});