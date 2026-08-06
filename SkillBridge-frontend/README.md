# SkillBridge CUET

An AI-powered career and recruitment platform exclusively for verified CUET (Chittagong University of Engineering & Technology) students and verified companies.

## Overview

SkillBridge CUET connects verified CUET students with verified companies. Students build profiles, upload CVs, and apply to internships, jobs, research positions, and more. Companies post opportunities and manage applicants. Admins verify students, verify companies, moderate opportunities, and manage the platform.

The platform includes three AI support features:

- **AI Resume Analysis** — Scores a student's CV and provides strengths, weaknesses, missing skills, and improvement suggestions.
- **AI Opportunity Recommendation** — Matches opportunities to a student's skills and profile with a match score and reasoning.
- **AI Candidate Matching** — Ranks applicants for a company with match percentages and explanations.

## User Roles

### Student

- Register with CUET email
- Build profile: skills, portfolio, resume, education, experience, certifications, achievements
- Upload CV for AI analysis
- Browse and search opportunities with filters
- Apply to opportunities and track application status
- Receive AI-powered recommendations
- Message with companies

### Company

- Register and submit verification documents
- Wait for admin verification
- Post and manage opportunities
- View applicants with AI candidate matching
- Shortlist, reject, and message candidates
- View recruitment analytics

### Admin

- Verify students
- Verify companies (approve / reject with document review)
- Manage opportunities (moderate, flag, remove)
- View platform analytics
- Monitor AI activity logs
- Handle user reports

## Tech Stack

- **React 18** with TypeScript
- **Vite** build tool
- **Tailwind CSS** with a custom design system (Forest Green primary, Slate secondary, Amber accent)
- **React Router** for routing with protected, role-based routes
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Hook Form** patterns with custom form components

## Design System

| Token | Color | Usage |
|-------|-------|-------|
| Primary | Forest Green `#166534` | Actions, active states, branding |
| Secondary | Deep Slate `#334155` | Text, neutral surfaces |
| Accent | Golden Amber `#D97706` | Highlights, AI features |
| Background | Warm Ivory `#FCFCF8` | Page background |
| Surface | White `#FFFFFF` | Cards |
| Border | `#E5E7EB` | Dividers, input borders |

Typography: **Inter** for body, **Plus Jakarta Sans** for headings.

## Architecture

```
src/
  components/        Reusable UI components
    ui/             Primitives: Button, Card, Badge, Modal, Input, etc.
    layout/         Navbar, Footer, DashboardLayout, AuthLayout
    shared/         OpportunityCard, CompanyCard, ApplicantCard, etc.
    auth/           ProtectedRoute
  context/          AuthContext (login, register, logout, session)
  services/         Service layer (Promise-based mock responses)
    authService.ts
    studentService.ts
    companyService.ts
    adminService.ts
    opportunityService.ts
    applicationService.ts
    notificationService.ts
    messageService.ts
    aiService.ts
  lib/              Types, utils, constants
  pages/            Page components by role
    auth/           Login, Register, Forgot/Reset password, verification
    student/        Dashboard, opportunities, profile, AI, messages, settings
    company/        Dashboard, profile, opportunities, applicants, messages
    admin/          Dashboard, verifications, students, companies, analytics, logs
    public/         Landing, opportunities, companies, about, FAQ
```

## Service Layer (MERN-Ready)

All pages consume services via async/await. The service layer currently returns empty arrays and mock responses. To integrate a MERN backend, replace the service implementations with API calls — no component changes required.

```typescript
// Current (mock)
opportunityService.getAll() → Promise<Opportunity[]>

// Future (MERN)
opportunityService.getAll() → fetch('/api/opportunities').then(res => res.json())
```

## Getting Started

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run typecheck # TypeScript check
```

## Current Status

This is a **frontend prototype**. The following are implemented:

- Complete role-based authentication flow with protected routes
- Role-separated sidebars and navigation
- Student: dashboard, profile, portfolio, resume, opportunities, applications, AI analysis, AI recommendations, messages, notifications, settings
- Company: dashboard, profile, post/manage opportunities, applicants with AI matching, messages, analytics, settings
- Admin: dashboard, verifications, students, companies, opportunities, reports, analytics, AI logs, settings
- Public: landing page, opportunities browse, companies, about, FAQ
- Service layer with Promise-based mock responses
- Professional empty states throughout
- Responsive design (desktop, tablet, mobile)

## Future Backend Integration

- Replace service mock implementations with MERN API calls
- Add Supabase or MongoDB for data persistence
- Implement real authentication with JWT
- Connect AI services to actual ML models
- Add file upload for CVs and company documents
