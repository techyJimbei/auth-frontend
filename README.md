# Auth Frontend - User Authentication System

A full-stack authentication application built with **React**, **Node.js (Middleware)**, and a **Quarkus** backend. This project implements a secure, industry-standard authentication flow featuring email verification, session management, and a multi-tier cloud architecture.

## 🏗️ Architecture

The application uses a three-tier architecture to enhance security and session control:
1.  **Frontend (Vercel)**: React SPA handling the UI and client-side routing.
2.  **Middleware (Render)**: Node.js/Express server managing stateful sessions (`express-session`) and proxying requests to the backend.
3.  **Backend (Render)**: Quarkus service handling business logic, persistence (Supabase/PostgreSQL), and JWT issuance.



## 🚀 Features

- **User Signup**: Real-time password complexity validation and email domain autocomplete.
- **User Login**: Multi-stage authentication involving password verification in Quarkus and session creation in Node.js.
- **Seamless Email Verification**: Automatic redirection from Email -> Middleware -> Frontend Dashboard upon success.
- **Protected Dashboard**: Restricts access based on verification status with auto-polling for real-time updates.
- **JWT Security**: Backend tokens signed with **HS256 (Symmetric Key)** for stateless integrity.

## 📋 Prerequisites

- Node.js (v18+)
- Quarkus backend running on Render/Local
- PostgreSQL/Supabase database
- Resend API account for email delivery

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd auth-frontend

```

### 2. Middleware Server (.env)

Create a `.env` file in the `server/` directory:

```env
PORT=10000
QUARKUS_API=[https://auth-service-qav9.onrender.com/api](https://auth-service-qav9.onrender.com/api)
SESSION_SECRET=your_secure_random_string
FRONTEND_URL=[https://oppenxai-auth-service.vercel.app](https://oppenxai-auth-service.vercel.app)

```

### 3. Frontend Client (.env)

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=[https://auth-frontend-swo7.onrender.com](https://auth-frontend-swo7.onrender.com)

```

## 🚀 Deployment Configuration

### Vercel (Frontend)

To prevent `404 NOT FOUND` errors on page refresh or redirects, a `vercel.json` is required in the root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

```

### Render (Middleware)

* **Build Command**: `npm install`
* **Start Command**: `node server.js`
* **Environment**: Ensure `NODE_ENV` is set to `production`.

## 🔄 Updated User Flows

### 1. Verification Redirection

Instead of showing a static success page, the system now follows a seamless transition:

* User clicks link in email.
* **Node.js Middleware** catches the request and triggers the **Quarkus** verification logic.
* Upon success, the Middleware issues a `302 Redirect` directly to the Frontend Dashboard.
* The React app detects the new status via `checkAuth()` and updates the UI instantly.

### 2. Session Security

* **Cross-Origin**: Configured with `credentials: true` and `SameSite: 'none'` to allow the Vercel frontend to communicate with the Render middleware.
* **JWT Signature**: Tokens are signed by Quarkus using a 32-character symmetric key (`HS256`) defined in environment variables.

## 🎨 Tech Stack

* **Frontend**: React 18, Vite, React Router v6, Axios.
* **Middleware**: Node.js, Express, Express-Session, Axios.
* **Backend API**: Quarkus (Java), Hibernate Panache, SmallRye JWT, Resend SDK.
* **Persistence**: Supabase (PostgreSQL).

## 🧪 Testing Coverage

The project includes a comprehensive suite of tests:

* ✅ **Frontend**: Component rendering and navigation flow (Vitest).
* ✅ **Middleware**: Proxy routing and session persistence (Jest/Supertest).
* ✅ **Backend**: API endpoint security and DB transactions (JUnit/RestAssured).

## 👤 Author

Shruti - [GitHub Profile](https://github.com/techyJimbei)

## 🔗 Related Repositories

* [Quarkus Backend Service](https://github.com/techyJimbei/auth-service)

