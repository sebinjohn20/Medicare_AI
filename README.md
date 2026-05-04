# MediCare AI — Hospital Appointment System

A production-ready Next.js 14 hospital management system with AI receptionist, role-based dashboards, and real-time analytics.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare-ai
JWT_SECRET=your-minimum-32-character-secret-key-here
```

### 3. Run development server
```bash
npm run dev
```

### 4. Seed demo data
Visit `http://localhost:3000/auth/login`, then call the seed endpoint:
```bash
curl -X POST http://localhost:3000/api/seed
```
This creates 6 doctors + admin account: **admin@hospital.com / Admin@123**

---

## 🔑 Roles & Access

| Role  | Login              | Password  | Redirected to  |
|-------|--------------------|-----------|----------------|
| Admin | admin@hospital.com | Admin@123 | /admin         |
| User  | Register yourself  | Your pass | /dashboard     |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.js     ✅ FIXED (500 error)
│   │   │   ├── login/route.js
│   │   │   └── logout/route.js
│   │   ├── appointments/
│   │   │   ├── route.js            (GET all, POST create)
│   │   │   └── [id]/route.js       (GET, PATCH, DELETE)
│   │   ├── doctors/
│   │   │   ├── route.js
│   │   │   └── [id]/slots/route.js (available time slots)
│   │   ├── admin/
│   │   │   ├── stats/route.js
│   │   │   ├── users/route.js
│   │   │   └── doctors/route.js
│   │   ├── analytics/route.js
│   │   ├── schedule/route.js
│   │   ├── notifications/route.js
│   │   └── seed/route.js           (demo data)
│   ├── auth/
│   │   ├── login/page.jsx
│   │   └── signup/page.jsx
│   ├── dashboard/                  (user portal)
│   │   ├── page.jsx
│   │   ├── appointments/page.jsx
│   │   ├── book/page.jsx
│   │   ├── ai-chat/page.jsx        (Claude AI receptionist)
│   │   ├── notifications/page.jsx
│   │   └── settings/page.jsx
│   └── admin/                      (admin portal)
│       ├── page.jsx
│       ├── appointments/page.jsx
│       ├── doctors/page.jsx
│       ├── users/page.jsx
│       ├── analytics/page.jsx
│       ├── schedule/page.jsx
│       └── settings/page.jsx
├── components/
│   ├── ui/index.jsx                (Button, Card, Modal, Input, Select, Badge...)
│   ├── layout/
│   │   ├── Sidebar.jsx             (role-based nav)
│   │   └── AppLayout.jsx
│   ├── dashboard/UserDashboard.jsx
│   ├── appointments/
│   │   ├── BookAppointment.jsx     (3-step wizard)
│   │   └── AppointmentsPage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx      (charts, stats)
│   │   ├── AdminAppointments.jsx
│   │   ├── AdminDoctors.jsx        (CRUD)
│   │   ├── AdminUsers.jsx
│   │   ├── AdminAnalytics.jsx
│   │   └── AdminSchedule.jsx
│   ├── ai/AIChatPage.jsx           (Claude-powered chatbot)
│   ├── notifications/NotificationsPage.jsx
│   └── settings/SettingsPage.jsx
├── models/
│   ├── User.js                     ✅ FIXED (default role was "admin")
│   ├── Doctor.js
│   ├── Appointment.js
│   ├── Schedule.js
│   ├── Notification.js
│   └── Message.js
├── lib/
│   ├── mongodb.js                  ✅ FIXED (connection caching)
│   ├── jwt.js
│   ├── cookies.js                  ✅ FIXED (clearAuthCookie added)
│   └── utils.js
├── context/
│   ├── AuthContext.jsx
│   └── ToastContext.jsx            (NEW - toast notifications)
└── middleware.js                   ✅ FIXED (missing import)
```

---

## 🐛 Bugs Fixed

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `middleware.js` | `clearAuthCookie` imported but never defined → crash on token expiry | Added import from `@/lib/cookies` |
| 2 | `models/User.js` | Default role was `"admin"` — every new user became admin | Changed to `"user"` |
| 3 | `lib/cookies.js` | `clearAuthCookie` function missing entirely | Added the function |
| 4 | `api/auth/signup` | No proper error handling for mongoose validation errors | Added `ValidationError` + `11000` handlers |
| 5 | `lib/mongodb.js` | No connection options, could timeout silently | Added `serverSelectionTimeoutMS`, `maxPoolSize` |
| 6 | Dashboard | All data was hardcoded dummy data from `src/data/index.js` | All data fetched from MongoDB API |
| 7 | Sidebar logout | Didn't call AuthContext `logout()` → token cookie not cleared | Fixed to call logout + redirect |

---

## ✨ Features

### Patient Portal
- Book appointments via 3-step wizard (doctor → date/time → confirm)
- View, filter and cancel appointments
- AI Chat Receptionist (Claude-powered, aware of real doctor data)
- Toast notifications system
- Responsive mobile/tablet/desktop

### Admin Portal  
- Live stats dashboard (total, today, pending, waiting)
- Bar + Line charts (Recharts) — real MongoDB data
- Full appointment CRUD (edit status, delete)
- Doctor management (add, edit, deactivate)
- Patient directory with search
- Schedule management (holidays, emergency leave, slot configuration)
- Analytics (7-day, 30-day, pie chart breakdown)

### AI Receptionist
- Powered by Claude claude-sonnet-4-20250514
- Fetches real doctor list from your database
- Helps patients find specialists by symptom
- Quick-prompt buttons for common queries

### API Routes (all MongoDB-backed)
- `POST /api/auth/signup` — register user
- `POST /api/auth/login` — login (any role)
- `POST /api/auth/logout` — clear cookie
- `GET/POST /api/appointments` — list/create appointments
- `PATCH/DELETE /api/appointments/[id]` — update/delete
- `GET /api/doctors` — list active doctors
- `GET /api/doctors/[id]/slots?date=YYYY-MM-DD` — available slots
- `GET /api/admin/stats` — dashboard stats (admin only)
- `GET/POST /api/admin/doctors` — manage doctors (admin only)
- `GET /api/admin/users` — list users (admin only)
- `GET /api/analytics?days=7` — day-by-day chart data
- `GET/POST /api/schedule` — doctor schedules
- `GET/PATCH /api/notifications` — user notifications
- `POST /api/seed` — seed 6 demo doctors + admin user

---

## 🗄️ MongoDB Models

- **User** — name, email, password (hashed), role (user/admin/doctor), phone
- **Doctor** — name, specialty, workingHours, slotDuration, consultationFee, rating
- **Appointment** — patientId, doctorId, date, timeSlot, status, type, bookedVia
- **Schedule** — doctorId, date, start/end time, isHoliday, isEmergencyLeave
- **Notification** — userId, type, title, message, read
- **Message** — from, channel (email/whatsapp/chat), body, status

---

## 🌐 Tech Stack
- Next.js 14 (App Router)
- React 18 + Tailwind CSS 3
- MongoDB + Mongoose 8
- JWT + HTTP-only cookies
- Recharts (bar, line, pie charts)
- Lucide React icons
- Claude AI API (AI receptionist)
