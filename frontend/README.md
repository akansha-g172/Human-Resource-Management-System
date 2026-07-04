# HRMS Frontend (Vite + React + SCSS + Tailwind)

This is the React frontend for the Human Resource Management System (HRMS). It is styled using Sass (SCSS) and Tailwind CSS, featuring robust validation using Zod and role-based client-side routing.

It contains a stateful mock service layer that allows the entire application to be fully interactive and testable without a running backend.

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).
Navigate to the `frontend/` folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create a `.env` file:
```bash
cp .env.example .env
```
Inside `.env`, you will find two key configurations:
- `VITE_API_URL`: The URL of the FastAPI backend.
- `VITE_USE_MOCK`: Set to `true` to run the frontend in mock mode, or `false` to connect to the actual backend.

---

## 🚀 Running the App

To boot the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

To verify compiling or bundle production files:
```bash
npm run build
```

---

## 🔑 Demo Login Accounts (Mock Mode)

When running with `VITE_USE_MOCK=true`, use the following hardcoded accounts to bypass and test the system:

### 👤 Employee Account
- **Identifier**: `ODJD260704007` or `john.doe@demo.com`
- **Password**: `password123!`

### 👑 Administrator Account
- **Identifier**: `admin@demo.com`
- **Password**: `password123!`

*Note: You can click the convenient preset buttons on the Sign In page to autofill these credentials.*

---

## 🔄 Swapping to the Real Backend

Once the FastAPI backend dev endpoints are live:
1. Edit your `.env` file.
2. Change `VITE_USE_MOCK` to `false`:
   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=https://your-deployed-backend.render.com
   ```
3. Restart the dev server (`npm run dev`).
The app will automatically route requests through `apiClient.js` using the real FastAPI endpoints instead of mock functions.
