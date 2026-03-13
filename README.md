# TaskFlow — Team Collaboration & Task Management System

A modern, full-stack **MERN** task management application with a strict MVC backend and a React Kanban-style frontend.

> **Backend**: Node.js + Express 5 + MongoDB (Mongoose 9)  
> **Frontend**: React 19 + Vite 7 + React Router 7

---

## ✨ Features

- **JWT Authentication** — Secure login/register with access tokens
- **Role-Based Access Control** — Admin and User roles
- **Project Workspaces** — Create, manage, and collaborate on team projects
- **Kanban Board** — Visual task management with status columns
- **Task Management** — Create, assign, prioritize, and track tasks
- **Dashboard** — Real-time stats via MongoDB aggregation pipeline
- **Input Validation** — express-validator (backend) + client-side validation
- **Security** — Helmet, CORS, rate limiting, NoSQL injection prevention
- **Premium UI** — Dark theme with Inter font, HSL palette, and micro-animations

---

## 🏗 Architecture

```
┌─────────────┐       ┌──────────────────────────────────────────────────────┐
│  React SPA  │       │            Express Backend (MVC)                     │
│  (Vite)     │──────▶│  Routes → Middleware → Controllers → Services → DB  │
│             │◀──────│                                                      │
└─────────────┘  JWT  └──────────────────────────────────────────────────────┘
                          │
                          ▼
                    ┌──────────┐
                    │ MongoDB  │
                    │ Atlas    │
                    └──────────┘
```

---

## 📁 Project Structure

```
task-project/
├── taskflow-backend/          # Express REST API (MVC + Service Layer)
│   ├── src/
│   │   ├── config/            # Database connection
│   │   ├── controllers/       # Request handlers (thin layer)
│   │   ├── middlewares/       # Auth, validation, error handling
│   │   ├── models/            # Mongoose schemas (User, Project, Task)
│   │   ├── routes/            # Route definitions
│   │   ├── services/          # Business logic & DB queries
│   │   └── utils/             # Helpers (JWT, validators, error class)
│   └── server.js              # Entry point
│
├── taskflow-frontend/         # React SPA
│   ├── src/
│   │   ├── components/        # Reusable UI (AppShell, Kanban, TaskCard...)
│   │   ├── context/           # Auth context (login, logout, state)
│   │   ├── hooks/             # Custom hooks (useAsyncAction)
│   │   ├── pages/             # 8 pages (Dashboard, Login, ProjectDetails...)
│   │   ├── services/          # Axios instance with interceptors
│   │   └── utils/             # Validation, formatters, localStorage
│   └── index.html             # Entry point
│
└── TaskFlow.postman_collection.json  # Postman API collection
```

See individual README files for detailed documentation:
- [Backend README](./taskflow-backend/README.md) — Architecture, ER diagram, API endpoints, deployment
- [Frontend README](./taskflow-frontend/README.md) — Features, routes, components, deployment

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/satyamsaurabh1/task-project.git
cd task-project
```

### 2. Backend Setup

```bash
cd taskflow-backend
npm install
cp .env.example .env    # Then edit .env with your MongoDB URI and JWT secret
npm run dev              # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd taskflow-frontend
npm install
cp .env.example .env    # Set VITE_API_URL=http://localhost:5000/api
npm run dev              # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Example |
|---|---|
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `your_secret_key` |
| `JWT_EXPIRES_IN` | `1d` |
| `FRONTEND_URL` | `http://localhost:5173` |
| `NODE_ENV` | `development` |

### Frontend (`.env`)

| Variable | Example |
|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` |

---

## 📊 ER Diagram

```
User (1) ──▶ (N) Project     via createdBy
User (N) ◀──▶ (N) Project    via members[]
Project (1) ──▶ (N) Task     via projectId
User (1) ──▶ (N) Task        via assignedTo
```

See the [Backend README](./taskflow-backend/README.md#er-diagram) for the full diagram.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Node.js, Express 5, Mongoose 9, JWT, bcrypt, express-validator, Helmet, CORS |
| Frontend | React 19, Vite 7, React Router 7, Axios, Lucide Icons, React Hot Toast |
| Database | MongoDB Atlas |
| Deployment | Render (backend), Vercel (frontend) |

---

## 📮 API Collection

Import `TaskFlow.postman_collection.json` into Postman to test all 16 API endpoints. The collection includes:
- Auto-token saving on login/register
- Collection variables for `baseUrl`, `authToken`, `projectId`, `taskId`
- Organized folders: Auth, Projects, Tasks, Health

---

## 🌐 Deployment

| Component | Platform | Guide |
|---|---|---|
| Backend | Render | [Deployment steps](./taskflow-backend/README.md#deployment) |
| Frontend | Vercel | [Deployment steps](./taskflow-frontend/README.md#deployment) |
| Database | MongoDB Atlas | [Setup guide](./taskflow-backend/README.md#mongodb-atlas-setup) |

---

## 📝 License

ISC
