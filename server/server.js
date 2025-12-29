const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Backend API URL
const QUARKUS_API = process.env.QUARKUS_API || 'https://auth-service-qav9.onrender.com/api';

// Allowed origins - both production and preview URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://oppenxai-auth-service.vercel.app',
  /https:\/\/auth-frontend-.*\.vercel\.app$/
];

app.set('trust proxy', 1);


// CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            }
            return allowed.test(origin); // For regex patterns
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Always true for production HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'none', // Required for cross-origin cookies
        domain: undefined // Let browser handle it
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Middleware server is running',
        quarkusApi: QUARKUS_API,
        nodeEnv: process.env.NODE_ENV
    });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        console.log('Signup request received:', req.body.email);
        const response = await axios.post(`${QUARKUS_API}/auth/signup`, req.body);
        console.log('Signup successful:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Signup error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Signup failed' }
        );
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body.email);
        const response = await axios.post(`${QUARKUS_API}/auth/login`, req.body);

        req.session.user = {
            email: req.body.email,
            token: response.data.token,
            isVerified: response.data.isVerified || false
        };

        console.log('Login successful, session created');
        res.json({
            message: 'Login successful',
            token: response.data.token,
            isVerified: response.data.isVerified
        });
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Login failed' }
        );
    }
});

// Get current user status
app.get('/api/auth/me', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
        email: req.session.user.email,
        token: req.session.user.token,
        isVerified: req.session.user.isVerified || false
    });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Verify email
app.get('/api/auth/verify', async (req, res) => {
    try {
        const response = await axios.get(
            `${QUARKUS_API}/auth/verify?token=${req.query.token}`
        );

        if (req.session.user) {
            req.session.user.isVerified = true;
        }

        res.send(response.data);
    } catch (error) {
        console.error('Verification error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).send(
            error.response?.data || 'Verification failed'
        );
    }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
    try {
        const response = await axios.post(`${QUARKUS_API}/auth/resend-verification`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Resend verification error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Failed to resend verification email' }
        );
    }
});

// Only start server if not being required for tests
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Session server running on http://localhost:${PORT}`);
        console.log(`Connecting to Quarkus API at: ${QUARKUS_API}`);
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;