# TaskFlow Backend — REST API

A production-ready Node.js + Express backend for the TaskFlow task management system, following a strict **MVC architecture** with a dedicated service layer. Built with MongoDB/Mongoose, JWT authentication, role-based access control, and comprehensive input validation.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [ER Diagram](#er-diagram)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication & Security](#authentication--security)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## Architecture Overview

The backend follows a **strict MVC + Service Layer** pattern to keep concerns separated:

```
Request → Route → Middleware → Controller → Service → Model → Database
```

| Layer | Responsibility |
|---|---|
| **Routes** | HTTP method + URL mapping, attaches middleware and validators |
| **Middlewares** | Auth (JWT verify), authorization (role check), validation, error handling |
| **Controllers** | Thin layer — parses request, calls service, sends response |
| **Services** | All business logic, database queries, access control checks |
| **Models** | Mongoose schemas, pre-save hooks, instance methods |
| **Utils** | JWT helpers, custom error class, async wrapper, validators, constants |

> **Rule**: Routes never contain business logic. Controllers never query the database directly. Services are the only layer that interacts with Models.

---

## Folder Structure

```
taskflow-backend/
├── server.js                  # Entry point — connects DB then starts Express
├── package.json
├── .env.example               # Template for environment variables
└── src/
    ├── app.js                 # Express app setup (middleware, routes, error handlers)
    ├── config/
    │   └── db.js              # MongoDB connection using Mongoose
    ├── controllers/
    │   ├── authController.js  # Register, Login, Logout, GetMe, GetUsers
    │   ├── projectController.js # CRUD + Dashboard stats
    │   └── taskController.js  # CRUD for tasks within a project
    ├── middlewares/
    │   ├── authMiddleware.js   # JWT verification (protect) + role check (authorize)
    │   ├── errorMiddleware.js  # Centralized error handler + 404 handler
    │   └── validationMiddleware.js # express-validator result checker
    ├── models/
    │   ├── User.js            # name, email, password (hashed), role
    │   ├── Project.js         # title, description, createdBy, members[]
    │   └── Task.js            # title, description, status, priority, dueDate, projectId, assignedTo
    ├── routes/
    │   ├── authRoutes.js      # /api/auth/*
    │   ├── projectRoutes.js   # /api/projects/*
    │   └── taskRoutes.js      # /api/projects/:projectId/tasks/*
    ├── services/
    │   ├── authService.js     # User registration, login, token generation
    │   ├── projectService.js  # Project CRUD + aggregation-based dashboard stats
    │   └── taskService.js     # Task CRUD with project access validation
    └── utils/
        ├── accessControl.js   # Centralized project membership/ownership checks
        ├── apiError.js        # Custom ApiError class (statusCode + message)
        ├── asyncHandler.js    # Wraps async route handlers to catch errors
        ├── constants.js       # USER_ROLES, TASK_STATUSES, TASK_PRIORITIES
        ├── jwt.js             # generateAccessToken helper
        ├── sanitize.js        # NoSQL injection prevention (strips $ and . keys)
        └── validators.js      # express-validator rule sets for all routes
```

---

## ER Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│      User        │       │       Project         │       │        Task          │
├──────────────────┤       ├──────────────────────┤       ├──────────────────────┤
│ _id   (ObjectId) │◄──┐   │ _id      (ObjectId)  │◄──┐   │ _id       (ObjectId) │
│ name  (String)   │   │   │ title    (String)     │   │   │ title     (String)   │
│ email (String)   │   ├──▶│ createdBy(ref: User)  │   ├──▶│ projectId (ref: Proj)│
│ password (String)│   │   │ members  (ref: User[])│   │   │ assignedTo(ref: User)│
│ role  (enum)     │   │   │ description (String)  │   │   │ description (String) │
│ createdAt (Date) │   │   │ createdAt (Date)      │   │   │ status    (enum)     │
│ updatedAt (Date) │   │   │ updatedAt (Date)      │   │   │ priority  (enum)     │
└──────────────────┘   │   └──────────────────────┘   │   │ dueDate   (Date)     │
                       │                              │   │ createdAt (Date)     │
                       └──────────────────────────────┘   │ updatedAt (Date)     │
                                                          └──────────────────────┘

Relationships:
  • User  1 ──▶ N  Project   (createdBy)
  • User  N ◀──▶ N  Project   (members[])
  • Project 1 ──▶ N  Task      (projectId)
  • User  1 ──▶ N  Task      (assignedTo)
```

**Enums:**
- `role`: `user` | `admin`
- `status`: `pending` | `in-progress` | `completed`
- `priority`: `low` | `medium` | `high`

---

## Tech Stack

| Package | Purpose |
|---|---|
| `express` v5 | Web framework |
| `mongoose` v9 | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT generation & verification |
| `express-validator` | Request body/param validation |
| `helmet` | HTTP security headers |
| `cors` | Cross-origin resource sharing |
| `express-rate-limit` | API rate limiting |
| `express-mongo-sanitize` | NoSQL injection prevention |
| `dotenv` | Environment variable loader |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB instance)

### Installation

```bash
# Clone the repo
git clone https://github.com/satyamsaurabh1/task-project.git
cd task-project/taskflow-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values (see section below)

# Start development server
npm run dev
```

The server will start on `http://localhost:5000` (or whichever PORT you set).

---

## Environment Variables

Create a `.env` file in the `taskflow-backend/` root:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/taskflow` |
| `JWT_SECRET` | Secret key for signing JWTs | `my_super_secret_key_123` |
| `JWT_EXPIRES_IN` | Token expiry duration | `1d` |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Server health check |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT |
| `POST` | `/api/auth/logout` | ❌ | Logout (semantic endpoint) |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `GET` | `/api/auth/users` | ✅ | List all users (for task assignment) |

### Projects (`/api/projects`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | ✅ | Get all projects for current user |
| `POST` | `/api/projects` | ✅ | Create a new project |
| `GET` | `/api/projects/:id` | ✅ | Get single project by ID |
| `PUT` | `/api/projects/:id` | ✅ | Update a project (owner/admin only) |
| `DELETE` | `/api/projects/:id` | ✅ | Delete a project (owner/admin only) |
| `GET` | `/api/projects/stats/overview` | ✅ | Dashboard statistics (aggregation) |

### Tasks (`/api/projects/:projectId/tasks`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/tasks` | ✅ | Get all tasks in a project |
| `POST` | `/api/projects/:projectId/tasks` | ✅ | Create a task in a project |
| `GET` | `/api/projects/:projectId/tasks/:taskId` | ✅ | Get single task |
| `PUT` | `/api/projects/:projectId/tasks/:taskId` | ✅ | Update a task |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId` | ✅ | Delete a task |

> ✅ = Requires `Authorization: Bearer <token>` header

---

## Authentication & Security

1. **JWT Authentication** — Tokens issued on login/register, verified by `protect` middleware
2. **Password Hashing** — bcrypt with 10 salt rounds via pre-save hook
3. **Role-Based Access Control** — `authorize('admin', 'user')` middleware restricts routes by role
4. **Input Validation** — 8 express-validator rule sets: email format, strong password, MongoId params, task status/priority enums
5. **CORS** — Configured via `FRONTEND_URL` env variable (supports comma-separated origins)
6. **Rate Limiting** — Configurable window and max requests via env variables
7. **Helmet** — Sets security-related HTTP headers
8. **NoSQL Injection Prevention** — Custom `sanitize.js` middleware strips `$` and `.` from request keys + `express-mongo-sanitize`

---

## Error Handling

All errors flow through a centralized error handler (`errorMiddleware.js`):

```json
{
  "message": "Human-readable error message",
  "stack": "Stack trace (development only)"
}
```

- **`ApiError`** — Custom error class with `statusCode` and `message`
- **`asyncHandler`** — Wraps async functions to auto-catch rejected promises
- **`notFound`** — Returns 404 for unmatched routes
- **`errorHandler`** — Returns proper status code; hides stack trace in production

---

## Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo and select the `taskflow-backend` directory
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `taskflow-backend`
5. Add all environment variables from the table above
6. Set `NODE_ENV=production` and update `FRONTEND_URL` to your deployed frontend URL
7. Deploy!

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Under **Network Access**, add `0.0.0.0/0` for development or your Render IP for production
4. Copy the connection string and set it as `MONGO_URI`

---

## License

ISC
