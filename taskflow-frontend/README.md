# TaskFlow Frontend — React SPA

A modern React single-page application for the TaskFlow task management system. Features a premium dark-themed UI with a Kanban board, real-time toast notifications, protected routes, and full CRUD for projects and tasks.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages & Routes](#pages--routes)
- [Architecture](#architecture)
- [Deployment](#deployment)

---

## Features

- **JWT Authentication** — Login/Register with token persistence in localStorage
- **Protected Routes** — Unauthorized users are redirected to login
- **Dashboard** — Project overview with search and real-time task statistics
- **Kanban Board** — Tasks grouped by status (Pending → In-Progress → Completed)
- **Project Management** — Create projects, add team members, update or delete
- **Task Management** — Create, edit, assign, set priority/due-date, delete
- **Profile Page** — View current user profile and account details
- **Toast Notifications** — Success/error feedback via react-hot-toast
- **Loading States** — Spinner component + custom `useAsyncAction` hook
- **Form Validation** — Client-side validation before API calls
- **Axios Interceptors** — Auto-attach JWT token, auto-logout on 401
- **Premium UI** — Dark theme, Inter font, HSL color palette, micro-animations

---

## Tech Stack

| Package | Purpose |
|---|---|
| `react` v19 | UI library |
| `react-dom` v19 | DOM rendering |
| `react-router-dom` v7 | Client-side routing |
| `axios` | HTTP client for API calls |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon library |
| `vite` v7 | Build tool and dev server |
| `eslint` | Code linting |

---

## Folder Structure

```
taskflow-frontend/
├── index.html                 # HTML entry point with React root
├── vite.config.js             # Vite configuration
├── package.json
├── .env.example               # Environment variable template
├── public/                    # Static public assets
└── src/
    ├── main.jsx               # App entry — renders <App /> with BrowserRouter
    ├── App.jsx                # Root component — routes + AuthProvider + Toaster
    ├── index.css              # Global styles — dark theme, Inter font, HSL palette
    ├── assets/                # Static assets (images, fonts)
    ├── components/
    │   ├── AppShell.jsx       # Layout wrapper (sidebar, header, navigation)
    │   ├── EmptyState.jsx     # Empty state placeholder component
    │   ├── FormField.jsx      # Reusable form field component
    │   ├── KanbanColumn.jsx   # Kanban board column (renders TaskCards)
    │   ├── Loader.jsx         # Loading spinner component
    │   ├── ProtectedRoute.jsx # Route guard — redirects to /login if unauthorized
    │   └── TaskCard.jsx       # Individual task card (status badge, priority, etc.)
    ├── context/
    │   └── AuthContext.jsx    # Authentication context (login, register, logout, user state)
    ├── hooks/
    │   └── useAsyncAction.js  # Custom hook for async operations with loading/error states
    ├── pages/
    │   ├── Login.jsx          # Login page with form validation
    │   ├── Register.jsx       # Registration page with form validation
    │   ├── Dashboard.jsx      # Dashboard — stats cards + project list with search
    │   ├── CreateProject.jsx  # New project form with member selection
    │   ├── ProjectDetails.jsx # Project view with Kanban board
    │   ├── CreateTask.jsx     # New task form (title, description, status, priority, due date, assignee)
    │   ├── EditTask.jsx       # Edit task form (pre-populated)
    │   └── ProfilePage.jsx   # User profile page
    ├── services/
    │   └── api.js             # Axios instance with interceptors (auth token, 401 handling)
    └── utils/
        ├── formatters.js      # Date formatting, status labels, time-ago helper
        ├── storage.js         # localStorage helpers (get/set/clear user)
        └── validation.js      # Client-side form validation functions
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- TaskFlow backend running (see backend README)

### Installation

```bash
# Clone the repo
git clone https://github.com/satyamsaurabh1/task-project.git
cd task-project/taskflow-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL

# Start dev server
npm run dev
```

The app will open at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the `taskflow-frontend/` root:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Pages & Routes

| Route | Page | Auth Required | Description |
|---|---|---|---|
| `/login` | Login | ❌ | User login form |
| `/register` | Register | ❌ | User registration form |
| `/` | Dashboard | ✅ | Project list + statistics |
| `/profile` | Profile | ✅ | Current user profile |
| `/create-project` | Create Project | ✅ | New project form |
| `/projects/:id` | Project Details | ✅ | Kanban board with tasks |
| `/projects/:id/create-task` | Create Task | ✅ | New task form |
| `/projects/:id/tasks/:taskId/edit` | Edit Task | ✅ | Edit existing task |
| `*` | — | — | Redirects to `/` |

---

## Architecture

```
main.jsx
  └── BrowserRouter
        └── App.jsx
              ├── AuthProvider (Context API)
              ├── Toaster (react-hot-toast)
              └── Routes
                    ├── Public: Login, Register
                    ├── Protected (ProtectedRoute wrapper)
                    │     ├── Dashboard
                    │     ├── ProfilePage
                    │     ├── CreateProject
                    │     ├── ProjectDetails (Kanban)
                    │     ├── CreateTask
                    │     └── EditTask
                    └── Catch-all → Redirect to /
```

**Key patterns:**
- **AuthContext** manages login, registration, logout, and user state
- **ProtectedRoute** checks for authenticated user and redirects if missing
- **api.js** Axios instance auto-attaches JWT from localStorage and clears user on 401
- **useAsyncAction** custom hook provides `{ execute, loading, error }` for any async operation

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select your repo and set **Root Directory** to `taskflow-frontend`
4. Vercel auto-detects Vite — no build config needed
5. Add environment variable: `VITE_API_URL` = your deployed backend URL
6. Deploy!

### Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) → **New Site from Git**
2. Set **Base Directory** to `taskflow-frontend`
3. **Build Command**: `npm run build`
4. **Publish Directory**: `taskflow-frontend/dist`
5. Add environment variable: `VITE_API_URL`
6. Add a `_redirects` file in `public/` with `/* /index.html 200` for SPA routing

---

## License

ISC
