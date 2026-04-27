# 🎓 PlacementHub — College Placement Management System

A full-stack MERN application connecting **Students**, **Recruiters**, and **Admin (Placement Cell)** to streamline campus placements.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS v3, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| File Upload | Multer (PDF resumes) |

---

## 📁 Project Structure

```
campus_placement_portal_project/
├── server/          # Express.js backend (port 5000)
└── client/          # React + Vite frontend (port 5173)
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd server
npm install

# Configure environment (edit .env if needed)
# Default: mongodb://localhost:27017/placementDB

# Seed the database with demo data
node utils/seed.js

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 3. Open in Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@college.edu | admin123 |
| **Recruiter** (Google) | rahul@google.com | recruiter123 |
| **Recruiter** (Microsoft) | priya@microsoft.com | recruiter123 |
| **Recruiter** (Infosys) | amit@infosys.com | recruiter123 |
| **Student** | ananya@student.edu | student123 |
| **Student** | vikram@student.edu | student123 |
| **Student** | sneha@student.edu | student123 |
| **Student** | rohit@student.edu | student123 |

---

## 🌐 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placementDB
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Production (MongoDB Atlas)
Update `MONGO_URI` with your Atlas connection string:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/placementDB
```

---

## 👥 User Roles & Features

### 🧑‍🎓 Student
- Register/Login
- Build profile (education, GPA, skills, resume PDF)
- Browse jobs with search + filters (type, GPA)
- Apply with cover letter
- Track application status (timeline view)
- View recruiter feedback
- Smart job recommendations (skill + GPA matching)
- View announcements

### 🏢 Recruiter
- Register/Login
- Manage company profile
- Post job/internship openings with eligibility criteria
- View and manage applicants
- Update application status (shortlist, schedule interview, hire)
- Send feedback to candidates

### 🛠 Admin
- Full analytics dashboard with Recharts
- Approve/reject job postings
- Manage all users (activate/deactivate/delete)
- Post announcements with priority levels
- Generate and export placement reports

---

## 📡 API Endpoints

| Group | Base Path |
|-------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET/PUT/DELETE /api/users` |
| Jobs | `GET/POST/PUT/DELETE /api/jobs` |
| Applications | `GET/POST/PUT /api/applications` |
| Announcements | `GET/POST/PUT/DELETE /api/announcements` |
| Analytics | `GET /api/analytics/*` |
| Matching | `GET /api/matching/recommendations` |
| Upload | `POST /api/upload/resume` |

---

## 🔒 Security

- **JWT Authentication** — Bearer token in Authorization header
- **RBAC** — Each endpoint is restricted by user role
- **bcrypt** — Passwords hashed with 12 salt rounds
- **Input Validation** — express-validator on all POST routes
- **File Validation** — Only PDF files, max 5MB

---

## 📊 Smart Matching Algorithm

Job recommendations are scored based on:
1. **Skill overlap** (0–60 pts) — student skills vs job requirements
2. **GPA margin** (0–20 pts) — how far above minimum GPA
3. **Batch match** (0–20 pts) — whether target batch includes student
4. **Recency bonus** (5 pts) — jobs posted within last 7 days

---

## 🚀 Deployment

| Service | Platform |
|---------|---------|
| Frontend | Vercel (`cd client && npm run build`) |
| Backend | Render |
| Database | MongoDB Atlas |
