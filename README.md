# Auth Frontend - User Authentication System

A full-stack authentication application built with React, Node.js, and Quarkus backend. This project implements user signup, login, email verification, and session management.

## 🚀 Features

- **User Signup** with email and password
  - Real-time password validation (uppercase, lowercase, digit, special character)
  - Email domain autocomplete suggestions (@gmail.com, @live.com, @yahoo.com)
- **User Login** with session management
- **Email Verification** via link
- **Protected Dashboard** showing verification status
- **Auto-refresh** verification status polling
- **Comprehensive Testing** with Jest and Vitest

## 🏗️ Architecture

```
auth-frontend/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express session server
└── README.md
```

**Backend**: [Quarkus Auth Service](https://github.com/techyJimbei/auth-service)

## 📋 Prerequisites

- Node.js (v16+)
- Quarkus backend running on `http://localhost:8080`
- PostgreSQL database (configured in Quarkus)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd auth-frontend
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

## 🚀 Running Locally

### Start the Node.js Server (Port 3001)
```bash
cd server
npm run dev
```

### Start the React Client (Port 5173)
```bash
cd client
npm run dev
```

### Access the Application
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing

### Run Server Tests
```bash
cd server
npm test
```

### Run Client Tests
```bash
cd client
npm test
```

## 🔐 Environment Variables

### Server (.env)
```env
PORT=3001
QUARKUS_API=http://localhost:8080/api
SESSION_SECRET=your-secret-key-change-in-production
```

## 📱 User Flows

### 1. Signup
- Navigate to `/signup`
- Enter email and password (must meet requirements)
- Password validation shows real-time feedback
- Email suggestions appear when typing `@`
- Submit to create account

### 2. Login
- Navigate to `/login`
- Enter credentials
- Redirects to dashboard on success

### 3. Dashboard
- Shows email verification status
- **Unverified**: "You need to validate your email to access the portal"
- **Verified**: "Your email is validated. You can access the portal"
- Auto-refreshes every 5 seconds to check verification status

### 4. Email Verification
- Check email for verification link
- Click link to verify
- Dashboard automatically updates

## 🎨 Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Axios
- Vitest + React Testing Library

### Backend (Session Layer)
- Node.js
- Express
- Express Session
- Jest + Supertest

### Backend (API)
- Quarkus
- PostgreSQL
- JWT Authentication

## 📦 Deployment

### Option 1: Render.com (Recommended)

**Deploy Node.js Server:**
- Root directory: `server/`
- Build: `npm install`
- Start: `npm start`

**Deploy React Client:**
- Root directory: `client/`
- Build: `npm install && npm run build`
- Publish: `dist/`

### Option 2: Separate Platforms
- **Frontend**: Vercel/Netlify
- **Server**: Render/Railway
- **Backend**: Render/Railway
- **Database**: Neon/Supabase

## 🔧 Configuration for Production

Update `client/src/App.jsx`:
```javascript
axios.defaults.baseURL = 'https://your-server-url.com';
```

Update `server/server.js`:
```javascript
const QUARKUS_API = process.env.QUARKUS_API || 'https://your-backend-url.com/api';
```

## 📝 API Endpoints

### Node.js Server (Port 3001)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify?token=xxx` - Email verification

## 🧪 Testing Coverage

- ✅ Login component tests
- ✅ Signup component tests
- ✅ Dashboard component tests
- ✅ Server API endpoint tests
- ✅ Session management tests
- ✅ Error handling tests

## 🤝 Contributing

This project was created as part of a coding assessment to demonstrate:
- Full-stack development skills
- Learning new technologies (Quarkus)
- Clean code practices
- Comprehensive testing
- Modern UX patterns

## 📄 License

MIT

## 👤 Author

Shruti - [GitHub](https://github.com/techyJimbei)

## 🔗 Related Repositories

- [Quarkus Backend](https://github.com/techyJimbei/auth-service)
