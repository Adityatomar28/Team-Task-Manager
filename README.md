<div align="center">

# 🔄 TeamSync

**A modern project management and team collaboration web application**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square)](https://clerk.dev/)

TeamSync helps teams organize projects, assign tasks, manage members, track progress, and collaborate through a clean SaaS-style dashboard — built as a full-stack portfolio project.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Screenshots](#-screenshots)

</div>

---

## ✨ Features
<img width="1920" height="1080" alt="photo-collage png" src="https://github.com/user-attachments/assets/146bfd03-37b7-4366-beb7-b343fb3bbab8" />



### 🗂️ Project Management
- Create, view, and delete projects
- Project-level roles: **Admin** and **Member**
- Invite members by email and manage access

### ✅ Task Management (Kanban)
- Drag-and-drop Kanban board with **TODO**, **IN_PROGRESS**, and **DONE** columns
- Task priorities: **Low**, **Medium**, **High**
- Assign tasks, set due dates, and add descriptions
- Create and edit tasks via a modal interface

### 👥 Team & Member Management
- Create teams and manage ownership
- Add or remove members with role-based permissions
- Filter and search through member lists

### 📊 Dashboard Analytics
- Overview stats: active tasks, completed tasks, overdue tasks
- Task status breakdown with progress bars
- Activity feed and recent task table

### 🤖 AI Project Assistant
- Floating chatbot powered by **Google Gemini API** (with OpenAI fallback)
- Helps with project planning, risk identification, progress summaries, and next actions

### 🎨 UI & UX
- Responsive SaaS dashboard — works on desktop and mobile
- Dark mode / Light mode toggle
- Animated page transitions and cards with **Framer Motion**
- Sidebar navigation with clean, modern design

---
DATABASE SCHEMA
<img width="1030" height="671" alt="Screenshot 2026-05-03 at 2 21 18 AM" src="https://github.com/user-attachments/assets/9ecf3f15-648f-4168-9d1a-58810acf0c74" />

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework and build tool |
| JavaScript / JSX | Component language |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| Lucide React | Icon library |
| Clerk React | Authentication UI |
| Recharts | Dashboard charts |
| dnd-kit | Drag-and-drop Kanban board |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| Prisma ORM | Database access layer |
| PostgreSQL / Prisma Postgres | Production database |
| In-memory JSON fallback | Local development database |
| Clerk Backend SDK | Server-side auth verification |
| JWT | Token-based authentication |
| dotenv | Environment variable management |
| CORS | Cross-origin request handling |

### AI / Chatbot
| Technology | Purpose |
|---|---|
| Google Gemini API | Primary AI model |
| OpenAI API | Fallback AI model |

### Dev Tools
| Tool | Purpose |
|---|---|
| ESLint | Code linting |
| Nodemon | Backend hot-reload |
| npm | Package management |
| Vite | Frontend build and dev server |
| Prisma Migrate | Database schema migrations |

---

## 📁 Project Structure

```
teamsync/
├── client/                   # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── Sidebar.jsx
│       │   ├── Chatbot.jsx
│       │   └── ...
│       ├── pages/            # Route-level page components
│       │   ├── Landing.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Projects.jsx
│       │   ├── Teams.jsx
│       │   ├── Members.jsx
│       │   └── Tasks.jsx
│       ├── App.jsx
│       └── main.jsx
│
├── server/                   # Node.js + Express backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── dashboard.js
│   │   └── chat.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── projectAccess.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── index.js
│
├── .env.example
└── README.md
```
---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- PostgreSQL database (or use the in-memory fallback for local dev)
- [Clerk](https://clerk.dev/) account
- [Google Gemini API key](https://makersuite.google.com/) (optional, for AI chatbot)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/teamsync.git
cd teamsync
```

### 2. Configure environment variables

**Backend** — create `server/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/teamsync"

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Chatbot (optional)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key   # fallback

# Server
PORT=5000
```

**Frontend** — create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```

---

### 3. Install dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Set up the database

```bash
cd server

# Run Prisma migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

> **Local development without PostgreSQL:** The server includes an in-memory JSON-backed fallback database that activates automatically when no `DATABASE_URL` is set.

### 5. Start the development servers

```bash
# Terminal 1 — Backend
cd server
npm run dev       # starts on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev       # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Public homepage with hero, features, and CTA |
| `/sign-in` | Login | Clerk authentication |
| `/sign-up` | Sign Up | Clerk registration |
| `/dashboard` | Dashboard | Stats, task overview, activity feed |
| `/projects` | Projects | Create, view, and manage projects |
| `/teams` | Teams | Team directory and workspace details |
| `/members` | Members | Add, filter, and remove members |
| `/tasks` | Kanban Board | Drag-and-drop task management |

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects for user |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get project details |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `POST` | `/api/projects/:id/members` | Add a member by email |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove a member |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/:id/tasks` | List tasks in a project |
| `POST` | `/api/projects/:id/tasks` | Create a new task |
| `PATCH` | `/api/tasks/:id` | Update task (status, priority, etc.) |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Get overview stats for current user |

### AI Chatbot
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message to the AI assistant |

---

## 🔐 Role-Based Access

| Action | Admin | Member |
|---|:---:|:---:|
| Create / Delete project | ✅ | ❌ |
| Add / Remove members | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| Delete tasks | ✅ | ❌ |
| View Kanban board | ✅ | ✅ |

---

## 🏗️ Production Build

```bash
# Build frontend
cd client
npm run build       # outputs to client/dist/

# Start backend in production
cd server
npm start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ as a full-stack portfolio project · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>
