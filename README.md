# ERP/CRM Operations Portal

A production-grade, full-stack ERP/CRM Operations Portal MVP built for high performance, reliability, and clean architecture.

## 📁 Repository Overview

```
/
├── backend/            # Express.js / TypeScript REST API application
│   ├── src/            # Source code (controllers, routes, services, middleware)
│   ├── migrations/     # Database DDL migration scripts
│   ├── tests/          # Integration & business flow tests
│   ├── Dockerfile      # Multi-stage container build definition
│   └── README.md       # Backend documentation & API reference
│
├── frontend/           # (Placeholder for React frontend)
│
├── docker-compose.yml  # Local development container setup (Backend + PostgreSQL)
└── README.md           # Root repository documentation
```

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (`pg` pool, DDL migrations, transactions)
- **Security & Auth**: JWT authentication, `bcrypt` password hashing, RBAC middleware, Helmet, CORS
- **Validation**: Zod schema validation
- **DevOps**: Docker, Docker Compose, GitHub Actions ready

---

## 🚀 Quick Start

### 1. Local Development (Backend)

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

The API will be available at `http://localhost:5000/api/health`.

### 2. Docker Compose Setup

```bash
docker-compose up --build
```

---

## 🔐 Credentials (Demo Data)

Run `npm run seed` inside `backend/` to populate demo data:

| User | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Admin | `admin@demo.com` | `password123` | `ADMIN` |
| Sales | `sales@demo.com` | `password123` | `SALES` |
| Warehouse | `warehouse@demo.com` | `password123` | `WAREHOUSE` |
| Accounts | `accounts@demo.com` | `password123` | `ACCOUNTS` |

---

## 🧪 Testing

```bash
cd backend
npm test
```

Runs Jest integration test suite covering authentication, CRM customer creation, product management, draft challans, and transactional stock reduction/rollback.
