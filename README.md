# Bitespeed Identity Reconciliation

A backend web service that identifies and links customer contacts across multiple purchases using shared email or phone number information.

---

## 🚀 Live Endpoint

```
https://your-app-name.onrender.com
```

> Replace with your actual Render URL after deployment.

---

## 📌 Problem Statement

FluxKart.com customers often place orders using different email addresses and phone numbers. This service reconciles those contacts and links them to a single customer identity.

---

## 🛠️ Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Runtime  | Node.js           |
| Language | TypeScript        |
| Framework| Express.js        |
| Database | PostgreSQL        |
| DB Driver| pg (node-postgres) |

---

## 📁 Folder Structure

```
bitespeed-identity/
├── src/
│   ├── controllers/
│   │   └── identify.controller.ts
│   ├── services/
│   │   └── contact.service.ts
│   ├── routes/
│   │   └── identify.routes.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── migrations/
│   │       └── init.sql
│   ├── middlewares/
│   │   └── errorHandler.ts
│   ├── types/
│   │   └── contact.types.ts
│   ├── utils/
│   │   └── buildResponse.ts
│   └── index.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/bitespeed-identity.git
cd bitespeed-identity
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bitespeed_db
```

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE bitespeed_db;"
```

### 5. Run the migration

```bash
psql -U postgres -d bitespeed_db -f src/db/migrations/init.sql
```

### 6. Start the dev server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## 📬 API Reference

### `GET /`

Returns API info.

**Response:**
```json
{
  "message": "🚀 Bitespeed Identity Reconciliation API",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET  /health",
    "identify": "POST /identify"
  }
}
```

---

### `GET /health`

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

---

### `POST /identify`

Identifies and reconciles a customer contact.

**Request Body:**
```json
{
  "email": "doc@hillvalley.edu",
  "phoneNumber": "123456"
}
```

> Both fields are optional but at least one must be provided.

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["doc@hillvalley.edu", "emmett@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

---

## 🧠 How It Works

### Case 1 — No existing contact
Creates a new `primary` contact.

### Case 2 — Match found with new information
Creates a new `secondary` contact linked to the existing primary.

### Case 3 — Two separate primaries get connected
The older contact stays `primary`. The newer contact is demoted to `secondary`.

---

## 🧪 Test Cases (Postman)

**New customer:**
```json
{ "email": "doc@hillvalley.edu", "phoneNumber": "123456" }
```

**Same phone, new email:**
```json
{ "email": "emmett@hillvalley.edu", "phoneNumber": "123456" }
```

**Merge two primaries:**
```json
{ "email": "doc@hillvalley.edu", "phoneNumber": "999999" }
```

**Missing both fields (400 error):**
```json
{}
```

---

## 📦 Available Scripts

| Script          | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start dev server with auto-reload  |
| `npm run build` | Compile TypeScript to JavaScript   |
| `npm start`     | Run compiled production build      |

---

## 👤 Author

**Krish**  
GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)