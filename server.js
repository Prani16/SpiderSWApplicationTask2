const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass123',
    database: 'bookhub'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// User Registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
        if (err) throw err;
        res.status(201).send('User registered');
    });
});

// User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) throw err;
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ id: results[0].id }, 'secret', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Middleware to Verify Token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token required');
    
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) return res.status(403).send('Invalid token');
        req.userId = decoded.id;
        next();
    });
};

// Create Book
app.post('/books', verifyToken, (req, res) => {
    const { title, author, genre, cover_image, description } = req.body;
    
    db.query('INSERT INTO books (title, author, genre, cover_image, description) VALUES (?, ?, ?, ?, ?)', [title, author, genre, cover_image, description], (err, result) => {
        if (err) throw err;
        res.status(201).send('Book created');
    });
});

// Get All Books
app.get('/books', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get Book by ID
app.get('/books/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM books WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.status(404).send('Book not found');
        res.json(results[0]);
    });
});

// Delete Book by ID
app.delete('/books/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM books WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        res.send('Book deleted');
    });
});

// Add Favorite Book
app.post('/favorites', verifyToken, (req, res) => {
    const { book_id } = req.body;
    
    db.query('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)', [req.userId, book_id], (err, result) => {
        if (err) throw err;
        res.status(201).send('Book added to favorites');
    });
});

// Get Favorite Books
app.get('/favorites', verifyToken, (req, res) => {
    db.query('SELECT b.* FROM books b JOIN favorites f ON b.id = f.book_id WHERE f.user_id = ?', [req.userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Buy Book
app.post('/purchases', verifyToken, (req, res) => {
    const { book_id } = req.body;
    
    db.query('INSERT INTO purchases (user_id, book_id) VALUES (?, ?)', [req.userId, book_id], (err, result) => {
        if (err) throw err;
        res.status(201).send('Book purchased');
    });
});

// Get Purchased Books
app.get('/purchases', verifyToken, (req, res) => {
    db.query('SELECT b.* FROM books b JOIN purchases p ON b.id = p.book_id WHERE p.user_id = ?', [req.userId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Update User Profile
app.put('/profile', verifyToken, (req, res) => {
    const { username, email } = req.body;

    db.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.userId], (err, result) => {
        if (err) throw err;
        res.send('Profile updated');
    });
});

// Change Password
app.put('/profile/password', verifyToken, async (req, res) => {
    const { old_password, new_password } = req.body;

    db.query('SELECT * FROM users WHERE id = ?', [req.userId], async (err, results) => {
        if (err) throw err;
        if (results.length === 0 || !(await bcrypt.compare(old_password, results[0].password))) {
            return res.status(401).send('Invalid old password');
        }
        const hashedPassword = await bcrypt.hash(new_password, 10);
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.userId], (err, result) => {
            if (err) throw err;
            res.send('Password changed');
        });
    });
});

// Upload Profile Picture
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.userId}-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.post('/profile/picture', verifyToken, upload.single('profile_picture'), (req, res) => {
    const profile_picture = `/uploads/${req.file.filename}`;

    db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profile_picture, req.userId], (err, result) => {
        if (err) throw err;
        res.send('Profile picture updated');
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
