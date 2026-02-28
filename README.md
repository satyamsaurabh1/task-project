# TaskFlow - Team Collaboration & Task Management System

A modern, full-stack task management application with a strict MVC backend and a React Kanban-style frontend.

## Features
- **JWT Authentication**: Secure login and registration.
- **Project Workspaces**: Create and manage team projects.
- **Kanban Board**: Drag-and-drop-like task management (status updates).
- **RBAC**: Admin and User roles.
- **Responsive Design**: Premium UI with Inter font and HSL color palette.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt.
- **Frontend**: React (Vite), Axios, Lucide Icons, React Hot Toast.
- **Architecture**: Strict MVC (Backend), Context API (Frontend).

## Setup Instructions

### Backend
1. `cd taskflow-backend`
2. `npm install`
3. Create a `.env` file with `PORT`, `MONGO_URI`, and `JWT_SECRET`.
4. `npm start` (or `node server.js`)

### Frontend
1. `cd taskflow-frontend`
2. `npm install`
3. Create a `.env` file with `VITE_API_URL`.
4. `npm run dev`

## Deployment
- Backend: Render/Railway
- Frontend: Vercel/Netlify
- DB: MongoDB Atlas
