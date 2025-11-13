const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'product_rating';
const JWT_SECRET = process.env.JWT_SECRET || 'mystrongsecret';

// Database connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Simple logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} => ${req.method} ${req.url}`);
  next();
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // change this path to your frontend public/uploads folder
    cb(null, path.join(__dirname, '../frontend/public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage });

// 🔹 Middleware: Verify Token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Auth header problem" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "token problem" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "mystrongsecret");
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// 🔹 Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(400).json({ message: 'Email already used' });

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role || 'reviewer']
    );
    const userId = result.insertId;
    res.status(201).json({ id: userId, username, email, role: role || 'reviewer' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🔹 Login (returns JWT)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

  if (!rows.length) return res.status(400).json({ message: "Invalid credentials" });

  const user = rows[0];
  if (user.password !== password)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, "mystrongsecret", {
    expiresIn: "1h",
  });

  res.json({ id: user.id, email: user.email, token });
});

// 🔹 Get all products with avg rating
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const out = await Promise.all(products.map(async p => {
      const [reviews] = await pool.query('SELECT rating FROM reviews WHERE product_id = ?', [p.id]);
      const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length) : null;
      return { ...p, avgRating: avg, reviewsCount: reviews.length };
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Create Product (Login required)
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { user_id, title, description, price } = req.body;
    if (!user_id || !title) return res.status(400).json({ message: "Missing fields" });

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      'INSERT INTO products (user_id, title, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [user_id, title, description || null, price || null, image_url]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔹 Get Product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const product = rows[0];
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [id]);
    const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length) : null;
    res.json({ ...product, reviews, avgRating: avg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Add Review (Login required)
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const { user_id, rating, comment } = req.body;

    if (!user_id) return res.status(401).json({ message: "Access denied, no user ID provided" });
    if (!rating) return res.status(400).json({ message: "Missing rating" });

    // Check if this user already reviewed this product
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [productId, user_id, rating, comment || null]
    );

    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.put('/api/products/:productId/reviews/:reviewId', async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { user_id, rating, comment } = req.body;

    // Check if review exists and belongs to user
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? AND user_id = ?', [reviewId, user_id]);
    if (!rows.length) return res.status(403).json({ message: 'Not allowed to edit this review' });

    await pool.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, reviewId]
    );

    const [updated] = await pool.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a review
app.delete("/api/products/:id/reviews/:reviewId", verifyToken, async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user.id;

    // Check if review exists
    const [review] = await pool.query("SELECT * FROM reviews WHERE id = ? AND product_id = ?", [reviewId, id]);
    if (!review.length) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only author can delete their own review
    if (review[0].user_id !== userId) {
      return res.status(403).json({ message: "You can delete only your own review" });
    }

    // Delete review
    await pool.query("DELETE FROM reviews WHERE id = ?", [reviewId]);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}); 


// Basic health check
app.get('/', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
