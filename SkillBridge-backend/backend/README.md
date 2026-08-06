# SkillBridge CUET — Backend API

AI-powered career and recruitment platform backend, built exclusively for verified **CUET students** and **verified companies**. This is a standalone Node.js/Express/MongoDB backend designed to plug into an existing MERN frontend service layer without changing the frontend architecture.

---

## Project Overview

SkillBridge CUET connects Chittagong University of Engineering & Technology (CUET) students with companies for internships, jobs, research, industrial training, competitions, and freelancing opportunities. Every student and company must be **verified by an admin** before they can log in or participate, keeping the platform exclusive and trustworthy.

The backend exposes a clean REST API with a consistent JSON envelope, JWT authentication, role-based authorization, file uploads, messaging, notifications, AI placeholder endpoints, and a full admin verification workflow.

---

## Features

- **Authentication** — Student, Company, and Admin login with JWT; bcrypt password hashing; pending/rejected accounts are blocked from logging in
- **Student Registration** — CUET email validation, student ID, department, batch, phone, ID card upload; status starts as `pending`
- **Company Registration** — Company details, HR contact, trade license + logo upload; status starts as `pending`
- **Admin Verification** — Admins approve/reject students and companies with rejection reasons; pending accounts cannot log in
- **Student Profile** — Full profile CRUD with education, experience, certifications, achievements, portfolio, skills, resume upload, and saved opportunities
- **Company Profile** — Full profile CRUD; full opportunity CRUD; applicant management with shortlist/reject/interview/offer; company analytics
- **Opportunities** — Full CRUD for companies; public search, filter, and pagination for students; six opportunity types
- **Applications** — Students apply, withdraw, and track status; companies view applicants, shortlist, reject, schedule interviews, and offer; duplicate prevention
- **Application Status Flow** — `pending → reviewing → shortlisted → interview → offered → rejected` (plus student-initiated `withdrawn`)
- **Messaging** — Student ↔ Company conversations with read status and timestamps
- **Notifications** — Per-user notifications with read/unread tracking
- **AI Placeholder APIs** — Resume analysis, opportunity recommendations, and candidate matching (mock responses, logged for admin audit)
- **Admin Dashboard** — Verification queue, user management, platform analytics, reports, AI logs, opportunity moderation
- **File Uploads** — Multer-based uploads for student IDs, resumes, company logos, and trade licenses
- **Security** — Helmet, CORS, rate limiting, input validation, password hashing, JWT, role middleware, duplicate-email prevention
- **Centralized Error Handling** — Consistent JSON error envelope across all endpoints
- **Cascade Handling** — Deleting an opportunity removes its applications and cleans conversation references

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │     db.js                  # MongoDB connection via Mongoose
│   ├── controllers/
│   │     ai/                    # AI placeholder endpoints (resume, recommendations, matching)
│   │     admin/                 # Verification, analytics, moderation, users, reports, AI logs
│   │     application/           # Apply, withdraw, status tracking, applicants
│   │     auth/                  # Student & Company registration, login
│   │     company/               # Company profile, opportunities, analytics, interview scheduling
│   │     message/               # Conversations & messages
│   │     notification/          # Notifications
│   │     opportunity/           # Public opportunity browsing
│   │     student/               # Student profile, resume, saved opportunities
│   ├── models/                  # Mongoose schemas (9 models)
│   │     Admin.js  AILog.js  Application.js  Company.js
│   │     Conversation.js  Message.js  Notification.js
│   │     Opportunity.js  Student.js
│   ├── routes/                  # Express route definitions
│   ├── middlewares/             # auth, upload, validate, rateLimiter, error
│   ├── services/                # authService (JWT + login logic)
│   ├── validators/              # express-validator chains
│   ├── utils/                   # apiResponse, AppError, castDBError
│   ├── uploads/                 # Multer destination folders
│   │     student-ids/  resumes/  company-logos/  trade-licenses/
│   ├── scripts/                 # seedAdmin.js (manual admin creation)
│   ├── app.js                   # Express app configuration
│   └── server.js                # Entry point — boots DB + server
├── .env.example
├── package.json
├── README.md
├── DATABASE_SETUP.md
└── .gitignore
```

---

## Tech Stack

| Category        | Technology                     |
|-----------------|--------------------------------|
| Runtime         | Node.js                        |
| Framework       | Express.js                     |
| Database        | MongoDB                        |
| ODM             | Mongoose                       |
| Authentication  | JWT (jsonwebtoken)             |
| Password Hashing| bcrypt                         |
| File Uploads    | Multer                         |
| Env Config      | dotenv                         |
| Security        | Helmet, CORS, express-rate-limit |
| Logging         | Morgan                         |
| Validation      | express-validator              |
| Cookies         | cookie-parser                  |
| Dev Server      | Nodemon                        |

---

## API Endpoints

All responses use the envelope: `{ success, message, data?, errors? }`

### Auth
| Method | Path                          | Access  | Description                |
|--------|-------------------------------|---------|----------------------------|
| POST   | /api/auth/student/register    | Public  | Register student (multipart)|
| POST   | /api/auth/company/register    | Public  | Register company (multipart)|
| POST   | /api/auth/login              | Public  | Login (student/company/admin)|
| GET    | /api/auth/me                  | Auth    | Current user               |

### Student
| Method | Path                                    | Access    | Description                |
|--------|-----------------------------------------|-----------|----------------------------|
| GET    | /api/student/profile                    | Student   | View profile               |
| PUT    | /api/student/profile                    | Student   | Update profile             |
| POST   | /api/student/resume                     | Student*  | Upload resume (multipart)  |
| GET    | /api/student/saved-opportunities        | Student*  | List saved opportunities   |
| POST   | /api/student/saved-opportunities/:oppId | Student*  | Save an opportunity        |
| DELETE | /api/student/saved-opportunities/:oppId | Student*  | Unsave an opportunity      |

### Company
| Method | Path                                        | Access    | Description                |
|--------|---------------------------------------------|-----------|----------------------------|
| GET    | /api/company/profile                        | Company   | View profile               |
| PUT    | /api/company/profile                        | Company   | Update profile             |
| POST   | /api/company/opportunities                  | Company*  | Create opportunity        |
| GET    | /api/company/opportunities                  | Company   | List my opportunities      |
| GET    | /api/company/opportunities/:id/applicants-count | Company* | Applicant count per opp. |
| PUT    | /api/company/opportunities/:id              | Company   | Update opportunity         |
| DELETE | /api/company/opportunities/:id              | Company*  | Delete opportunity         |
| PATCH  | /api/company/applications/:id/interview     | Company*  | Schedule interview         |
| GET    | /api/company/analytics                      | Company*  | Company analytics          |

### Opportunities (public browsing)
| Method | Path                       | Access | Description                    |
|--------|----------------------------|--------|--------------------------------|
| GET    | /api/opportunities         | Public | List + search + filter + pagination |
| GET    | /api/opportunities/:id     | Public | Single opportunity             |

### Applications
| Method | Path                                          | Access    | Description              |
|--------|-----------------------------------------------|-----------|--------------------------|
| POST   | /api/opportunities/:id/apply                  | Student*  | Apply (multipart resume) |
| GET    | /api/applications/me                          | Student   | My applications          |
| GET    | /api/applications/:id                         | Student   | Single application detail|
| DELETE | /api/applications/:id/withdraw                | Student   | Withdraw application     |
| GET    | /api/applications/opportunity/:opportunityId | Company*  | View applicants          |
| PATCH  | /api/applications/:id/status                  | Company*  | Update status            |

**Application status flow:** `pending → reviewing → shortlisted → interview → offered → rejected` (students can `withdraw`)

### Messages
| Method | Path                                       | Access              | Description            |
|--------|--------------------------------------------|---------------------|------------------------|
| GET    | /api/messages/conversations                | Student/Company*    | List conversations    |
| POST   | /api/messages/conversations                | Student/Company*    | Start conversation    |
| GET    | /api/messages/conversations/:id/messages   | Student/Company*    | Message history        |
| POST   | /api/messages/conversations/:id/messages   | Student/Company*    | Send message           |
| PATCH  | /api/messages/conversations/:id/read        | Student/Company*    | Mark messages read    |

### Notifications
| Method | Path                            | Access | Description            |
|--------|---------------------------------|--------|------------------------|
| GET    | /api/notifications              | Auth   | List notifications     |
| PATCH  | /api/notifications/:id/read     | Auth   | Mark one read           |
| PATCH  | /api/notifications/read-all     | Auth   | Mark all read           |

### AI (placeholder endpoints — mock responses)
| Method | Path                            | Access    | Description                    |
|--------|---------------------------------|-----------|--------------------------------|
| POST   | /api/ai/resume-analysis         | Student*  | Mock resume analysis           |
| GET    | /api/ai/recommendations          | Student*  | Mock opportunity recommendations|
| POST   | /api/ai/candidate-matching       | Company*  | Mock candidate matching        |

### Admin
| Method | Path                                          | Access | Description                |
|--------|-----------------------------------------------|--------|----------------------------|
| GET    | /api/admin/verifications                       | Admin  | Verification queue         |
| GET    | /api/admin/verifications/:role/:id             | Admin  | View one record            |
| PATCH  | /api/admin/verifications/:role/:id/approve     | Admin  | Approve student/company    |
| PATCH  | /api/admin/verifications/:role/:id/reject       | Admin  | Reject student/company     |
| DELETE | /api/admin/opportunities/:id                    | Admin  | Remove inappropriate opp.  |
| GET    | /api/admin/analytics                           | Admin  | Dashboard statistics       |
| GET    | /api/admin/users                               | Admin  | User management list       |
| GET    | /api/admin/users/:role/:id                      | Admin  | View one user              |
| PATCH  | /api/admin/users/:role/:id/status               | Admin  | Update user status         |
| GET    | /api/admin/reports                             | Admin  | Aggregated reports         |
| GET    | /api/admin/ai-logs                             | Admin  | AI usage audit logs        |

`*` = requires an **approved** account (admin verification).

---

## Database Schema

Nine Mongoose models with reference relationships (ObjectIds) instead of embedding where appropriate:

| Model           | Key Fields                                   | Relationships                                  |
|-----------------|----------------------------------------------|------------------------------------------------|
| **Student**     | email (CUET), studentId, department, batch, status, education[], experience[], certifications[], achievements[], portfolio[], savedOpportunities[] | savedOpportunities → Opportunity |
| **Company**     | companyName, hrName, email, industry, status  | —                                              |
| **Admin**       | name, email (manually seeded)                 | —                                              |
| **Opportunity** | title, type, deadline, status, isActive      | `company` → Company                             |
| **Application** | status, coverLetter, resumeUrl, interview    | `opportunity` → Opportunity, `student` → Student, `company` → Company |
| **Conversation**| lastMessageAt                                | `student` → Student, `company` → Company, `opportunity` → Opportunity |
| **Message**     | content, read, readAt                         | `conversation` → Conversation, `sender` (Student/Company via refPath) |
| **Notification**| title, body, isRead                           | `recipient` (Student/Company/Admin via refPath) |
| **AILog**       | feature, inputSummary, outputSummary, durationMs | `requester` (Student/Company/Admin via refPath) |

**Indexes:** unique on student email + studentId, company email, conversation (student+company), application (opportunity+student). Text index on Opportunity (title, description, tags). Compound/status indexes on frequently-filtered fields.

**Cascade:** deleting an Opportunity hard-deletes its Applications and unsets its reference from Conversations.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/skillbridge_cuet

JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7

MAX_FILE_SIZE_MB=5
```

---

## Installation

```bash
cd backend
npm install
cp .env.example .env   # then edit .env and set MONGODB_URI + JWT_SECRET
```

---

## Running Locally

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The server boots at `http://localhost:5000`. Health check: `GET /health`.

---

## MongoDB Atlas Setup

See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for the full guide — why MongoDB, local install, Atlas cluster creation, connection strings, `.env` configuration, connection testing, MongoDB Compass, and common errors.

Quick steps:
1. Create a free account at **mongodb.com/cloud/atlas**.
2. Build a free M0 cluster.
3. Add a database user (save the password).
4. Add your IP (or `0.0.0.0/0` for dev) under Network Access.
5. Copy the Node.js connection string, replace `<password>`.
6. Set `MONGODB_URI` in `.env` to that string.

---

## Admin Seed Command

Admins are **manually inserted** — there is no public admin registration endpoint.

```bash
node src/scripts/seedAdmin.js "Admin Name" admin@yourdomain.com YourStrongPass1
```

Then log in via `POST /api/auth/login` with `role: "admin"`.

---

## Authentication Flow

1. Student/Company registers via `/api/auth/student/register` or `/api/auth/company/register`.
2. Password is hashed with bcrypt before saving. Status is set to `pending`.
3. On login (`/api/auth/login` with `role`), credentials are verified. **Pending and rejected accounts are blocked from logging in** with a clear message.
4. Only after an admin approves the account can the user log in and receive a JWT.
5. The JWT contains `{ id, role }` and is sent as `Authorization: Bearer <token>` on protected requests.
6. The `protect` middleware decodes the JWT and loads the user; `restrict("role")` enforces role-based access; `requireApproved` blocks pending accounts from approved-only routes.

---

## Verification Workflow

```
Student/Company registers
        │
        ▼
   status = "pending"  ──►  cannot log in
        │
        ▼
   Admin reviews at /api/admin/verifications
        │
        ├── approve ──► status = "approved"  ──►  can log in + full access
        │
        └── reject  ──► status = "rejected" (with reason) ──►  cannot log in
```

---

## File Uploads

Multer handles multipart uploads. Files are saved under `src/uploads/<category>/` and served statically at `/uploads/...`.

| Field         | Destination folder   | Allowed types               |
|---------------|----------------------|-----------------------------|
| idCard        | student-ids          | jpeg, png, webp, pdf        |
| resume        | resumes              | pdf                         |
| logo          | company-logos        | jpeg, png, webp             |
| tradeLicense  | trade-licenses       | jpeg, png, webp, pdf        |

Max file size is configurable via `MAX_FILE_SIZE_MB` (default 5 MB).

---

## Error Handling

A centralized error handler converts Mongoose/JWT/Multer errors into a consistent envelope and returns operational errors with proper status codes. Unexpected errors are logged with a full stack trace and return a safe 500.

Example error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Must be a CUET email (@cuet.ac.bd)" }]
}
```

---

## Security Features

- **Helmet** — secure HTTP headers
- **CORS** — configurable origin via `CLIENT_URL`
- **Rate limiting** — global API limiter + stricter auth limiter
- **bcrypt** — password hashing (cost factor 12)
- **JWT** — signed tokens with expiry
- **Role middleware** — `restrict(...roles)` per route
- **Approval gate** — `requireApproved` blocks pending accounts; login itself is blocked for pending/rejected users
- **Input validation** — express-validator on all body fields
- **Duplicate prevention** — unique email/studentId/company-email checks
- **CUET email enforcement** — regex `@cuet.ac.bd` on student registration

---

## MERN Integration Guide

The backend is designed to **directly replace** the frontend's mock services without changing the frontend architecture:

1. **Consistent envelope** — every endpoint returns `{ success, message, data }`, matching what a typical frontend service layer expects.
2. **REST conventions** — resource-oriented paths map cleanly to frontend API client methods.
3. **Bearer token auth** — the frontend stores the JWT from `/api/auth/login` and attaches it as `Authorization: Bearer <token>`; no cookie/session changes needed.
4. **Separate project** — this backend runs independently; the frontend points its base URL (e.g. `VITE_API_URL`) at `http://localhost:5000/api`.
5. **AI placeholders** — the `/api/ai/*` endpoints return mock JSON shaped like the eventual real AI output, so the frontend can build and integrate those screens now.
6. **No frontend changes required** — replace mock data calls with real `fetch`/`axios` calls to the matching endpoints above.

To connect: set the frontend's API base URL to the backend's address and wire each service method to the corresponding endpoint in the table above.
