# ERP/CRM Operations Portal

A clean, production-grade full-stack ERP/CRM Operations Portal MVP built for business management, inventory tracking, customer follow-ups, and sales challan dispatches.

---

## 📁 Repository Structure

```
/
├── backend/            # Express.js / TypeScript REST API application
│   ├── src/            # Controllers, routes, services, middleware, validators
│   ├── migrations/     # Database DDL migration scripts
│   ├── tests/          # Integration & transactional stock reduction tests
│   ├── Dockerfile      # Node alpine backend container
│   └── README.md       # Backend API documentation
│
├── frontend/           # React / TypeScript Vite SPA application
│   ├── src/            # Pages, components, services, context, routes, hooks
│   ├── Dockerfile      # Multi-stage Nginx static build container
│   ├── .env.example    # Environment variable template
│   └── README.md       # Frontend application documentation
│
├── docker-compose.yml  # Full-stack orchestrator (Frontend + Backend + PostgreSQL)
└── README.md           # Root repository documentation
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, Axios, Lucide React, Custom CSS Tokens
- **Backend**: Node.js, Express.js, TypeScript, Zod Schema Validation, Helmet, CORS
- **Database**: PostgreSQL (`pg` pool with transactions for inventory dispatches)
- **Security**: JWT Authentication, `bcrypt` Hashing, Role-Based Access Control (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **DevOps**: Docker, Docker Compose, Nginx static proxy

---

## 🚀 Quick Start

### Option A: Local Development

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```
   API runs at `http://localhost:5000/api`.

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Application runs at `http://localhost:5173`.

### Option B: Docker Compose (Full Stack)

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Database**: `localhost:5432`

---

## 🔐 Credentials (Demo Data)

Run `npm run seed` inside `backend/` to populate sample data:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `password123` | Full System Access |
| **Sales** | `sales@demo.com` | `password123` | Dashboard, Customers, Products, Challans |
| **Warehouse** | `warehouse@demo.com` | `password123` | Dashboard, Products, Stock Adjustments, Challans |
| **Accounts** | `accounts@demo.com` | `password123` | Dashboard, Customer (view), Product (view), Challan (view) |

---

## 🧪 Demonstration Flow

1. Login as **Sales** (`sales@demo.com` / `password123`).
2. View **Dashboard** metrics.
3. Open **Customers**, view details, and add a **Follow-up Note**.
4. Open **Products**, view available stock.
5. Create a **Sales Challan** with line items and click **Save as Draft**.
6. Open **Challan Details** and click **Confirm Challan**.
7. Backend validates inventory stock, deducts quantity, logs stock movement (`OUT`), and sets status to `CONFIRMED`.
8. Open **Products / Inventory** to verify updated available stock counts.
