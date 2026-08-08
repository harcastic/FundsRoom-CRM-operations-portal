# ERP/CRM Operations Portal Backend MVP

Clean, production-grade Node.js / Express / TypeScript backend for an ERP/CRM MVP technical case study.

## 🚀 Tech Stack

- **Runtime**: Node.js v20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (`pg` driver)
- **Authentication**: JWT (JSON Web Tokens) & `bcrypt` password hashing
- **Validation**: Zod
- **Security**: Helmet, CORS, parameterized SQL queries
- **Dev Tools**: `tsx`, `jest`, `supertest`

---

## 📁 Architecture & Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # PostgreSQL pool configuration & health check
│   │   └── env.ts             # Zod environment variable validation
│   ├── controllers/           # HTTP request & response handlers
│   ├── routes/                # Express router definitions & middleware binding
│   ├── services/              # Pure business logic & SQL query execution
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT verification & user attachment
│   │   ├── role.middleware.ts # Role-based access control (RBAC)
│   │   ├── validation.middleware.ts # Zod request validation
│   │   └── error.middleware.ts# Centralized error handler
│   ├── validators/            # Zod validation schemas
│   ├── types/                 # TypeScript interfaces & types
│   ├── utils/                 # JWT, password hashing & response helpers
│   ├── scripts/               # DB migration & seed scripts
│   ├── app.ts                 # Express application configuration
│   └── server.ts              # HTTP listener entrypoint
├── migrations/                # DDL SQL migration scripts
├── tests/                     # Jest integration & business flow tests
├── Dockerfile                 # Multi-stage production container build
├── .dockerignore
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_erp_db
JWT_SECRET=super_secret_jwt_key_for_development_mode_12345
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
```

---

## 🛠️ Getting Started & Commands

```bash
# Install dependencies
npm install

# Run database migrations (creates schema and tables)
npm run migrate

# Seed database with initial demo users, customers, and products
npm run seed

# Run in development mode (hot-reload with tsx)
npm run dev

# Run test suite
npm test

# Build TypeScript to production JavaScript (dist/)
npm run build

# Start production server
npm start
```

---

## 🔑 Demo Login Credentials

Run `npm run seed` to insert these default users:

| Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| `admin@demo.com` | `password123` | `ADMIN` | Full access across all modules |
| `sales@demo.com` | `password123` | `SALES` | Customer CRM, Follow-ups, Create & Confirm Challans |
| `warehouse@demo.com` | `password123` | `WAREHOUSE` | Products, Stock Adjustments, Stock Movements, View Challans |
| `accounts@demo.com` | `password123` | `ACCOUNTS` | View Customers, View Products, View Challans |

---

## 🔐 Roles & RBAC Matrix

- **ADMIN**: Full unrestricted access.
- **SALES**: Customers CRUD, Follow-ups, Create/Confirm Challans, View Products.
- **WAREHOUSE**: View/Create/Update Products, Adjust Stock (`IN`/`OUT`), View Stock Movements, View Challans.
- **ACCOUNTS**: Read-only access to Customers, Products, and Challans.

---

## 💡 Core Business Flow: Transactional Sales Challan Confirmation

1. **Challan Creation (`DRAFT`)**:
   - `POST /api/challans`
   - Validates customer and products.
   - Generates unique number (e.g. `CH-000001`).
   - Copies product snapshot (`product_name`, `sku`, `unit_price`) into `challan_items`.
   - **Does NOT modify stock.**

2. **Challan Confirmation (`CONFIRMED`)**:
   - `POST /api/challans/:id/confirm`
   - Starts PostgreSQL transaction (`BEGIN`).
   - Locks product rows with `SELECT ... FOR UPDATE`.
   - Validates sufficient stock for all requested items.
   - **If stock < requested quantity**: Rollbacks transaction, returns `409 Conflict` (`INSUFFICIENT_STOCK`).
   - **If sufficient**: Atomically reduces product stock, creates `OUT` stock movement log, updates status to `CONFIRMED`, and commits transaction (`COMMIT`).

---

## 📡 API Reference Summary

### Authentication
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Get current authenticated user profile.

### Customers (CRM)
- `GET /api/customers?search=raj&status=ACTIVE&page=1&limit=10`: Paginated & filtered list.
- `GET /api/customers/:id`: Customer detail.
- `POST /api/customers`: Create customer.
- `PUT /api/customers/:id`: Update customer.
- `GET /api/customers/:id/followups`: List customer follow-up notes.
- `POST /api/customers/:id/followups`: Add follow-up note.

### Products & Inventory
- `GET /api/products?search=keyboard&lowStock=true`: List products with low-stock filter.
- `GET /api/products/:id`: Product detail.
- `POST /api/products`: Create product.
- `PUT /api/products/:id`: Update product.
- `POST /api/inventory/:productId/adjust`: Adjust stock (`IN` / `OUT`) in a transaction.
- `GET /api/inventory/:productId/movements`: View product stock movement history.

### Sales Challans
- `GET /api/challans?status=DRAFT`: List sales challans.
- `GET /api/challans/:id`: Get sales challan with snapshot items.
- `POST /api/challans`: Create draft challan.
- `POST /api/challans/:id/confirm`: Transactional confirmation & stock reduction.
- `POST /api/challans/:id/cancel`: Cancel draft challan.

### Dashboard & System Health
- `GET /api/dashboard/stats`: Returns system summary counts.
- `GET /api/health`: Health check and DB connectivity status.

---

## 🐳 Docker Deployment

```bash
# Build standalone Docker image
docker build -t crm-backend ./backend

# Run with docker-compose (Backend + PostgreSQL)
docker-compose up --build
```
