# ERP / CRM Frontend Portal

A clean, responsive, minimal, and professional frontend application for the ERP / CRM MVP, built using **React**, **TypeScript**, **Vite**, and **React Router**.

This frontend integrates directly with the existing Express / PostgreSQL REST API backend without modifying backend specifications.

---

## Features

- **Authentication & JWT Session Management**: Persistent login, automatic Bearer token injection, session restoration via `/api/auth/me`.
- **Role-Based Access Control (RBAC)**: Custom UI permissions matrix for `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` roles.
- **Dashboard Metrics**: Real-time summary cards for Customers, Products, Low Stock alerts, Draft Challans, and Confirmed Challans.
- **Customer Management & Follow-ups**: Full CRUD, status filter (Lead, Active, Inactive), customer type badges, pagination, and follow-up interaction history.
- **Product & Inventory Management**: Catalog list, SKU tracking, low stock highlights, and Stock IN / OUT manual adjustment modal.
- **Sales Challan Workflow**: Multi-product line item creation, subtotal calculation, draft saving, and automated inventory stock deduction upon explicit confirmation.
- **Responsive Layout**: Mobile-friendly sidebar drawer, clean table horizontal scrolling, and touch-optimized controls.

---

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Routing**: React Router v6
- **State Management**: React Context (`AuthContext`) + Local Component State
- **HTTP Client**: Axios with request/response interceptors
- **Icons**: `lucide-react`
- **Styling**: Modern Vanilla CSS Design Tokens (Inter font, restrained corporate color palette)

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Running backend API (default: `http://localhost:5000/api`)

### Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Configuration (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Development & Production Build

### Run Development Server

```bash
npm run dev
```

Application will run locally at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Performs strict TypeScript compilation and outputs production static assets in `dist/`.

---

## Docker Deployment

Build and run using the multi-stage Nginx Dockerfile:

```bash
# Build Docker image
docker build -t crm_frontend:latest .

# Run container
docker run -p 3000:80 crm_frontend:latest
```

---

## Available Application Routes

| Route | Description | Access Roles |
|---|---|---|
| `/login` | Centered Login Page | Public |
| `/dashboard` | Dashboard Overview & Quick Stats | All Roles |
| `/customers` | Customer Directory & Search | Admin, Sales, Accounts |
| `/customers/:id` | Customer Profile & Follow-up History | Admin, Sales, Accounts |
| `/products` | Product Catalog & SKU Search | All Roles |
| `/products/:id` | Product Details & Stock Movements | All Roles |
| `/inventory` | Inventory & Stock Adjustments | Admin, Warehouse |
| `/challans` | Sales Challans List | All Roles |
| `/challans/create` | Create Sales Challan Form | Admin, Sales |
| `/challans/:id` | Challan Details & Stock Confirmation | All Roles |

---

## License

ISC
