# Full-Stack PROJECT
## Idea Proposal & Planning Report

**Project Title**

# 🧬 LabTrack
### *Medical Lab Test Request & Results Platform*

**Full Stack Web Application | Node.js + React.js**

*Submitted as part of the Full Stack Development Graduation Requirements*

Date: February 2026

---

## 1. Project Idea Description

LabTrack is a full stack web application that digitizes and streamlines the entire medical laboratory testing process — from the moment a doctor requests a test, through sample collection and lab processing, all the way to the patient receiving their results online.

In most healthcare settings, lab test workflows are still handled manually or through disconnected paper-based systems. LabTrack addresses this by providing a unified, role-aware digital platform where doctors, lab technicians, and patients interact through a structured, trackable pipeline.

The platform goes far beyond simple CRUD by implementing a real-world clinical state machine, multi-party interactions, access-controlled result viewing, and doctor-written medical interpretations attached to every result report.

**Core value propositions of LabTrack:**

- Eliminates paper-based test request forms with a structured digital workflow
- Gives patients secure, on-demand access to their own lab history
- Provides doctors with a complete view of all tests they requested and their current status
- Allows lab technicians to manage their workload queue and upload results efficiently
- Gives admins full oversight of the platform, users, and test catalog

---

## 2. Roles & Permissions

LabTrack defines four distinct user roles. Each role has its own dashboard, data visibility scope, and set of permitted actions.

| Role | Who They Are | Key Permissions |
|------|-------------|----------------|
| **Admin** | Platform administrator | Manage users & roles, manage test catalog, view all requests platform-wide, deactivate accounts, view analytics dashboard |
| **Doctor** | Licensed physician requesting tests | Create test requests for patients, track request statuses, write result interpretations, release reports to patients, view full own request history |
| **Lab Technician** | Lab staff who process samples and results | View assigned request queue, update request status at each stage, upload result files, flag abnormal values |
| **Patient** | Individual receiving medical care | View own test requests and their current status, access own finalized result reports with doctor interpretation, download result PDFs |

### 2.1 Role-Based Access Control Rules

- Unauthenticated users: access to login and registration pages only
- Doctors: can only see and act on requests they personally created
- Lab Technicians: can only see requests that are unassigned or assigned to themselves; requests claimed by another technician are hidden.
- Patients: can only view their own requests and results
- Admins: full read/write access across all platform data

---

## 3. Core Features

### 3.1 Authentication & User Management

- Registration with role assignment (Doctor, Patient; Lab Technician created by Admin)
- JWT-based login with secure token handling using `jsonwebtoken` and `bcrypt`
- Profile management: personal info, specialization (doctors), contact details
- Admin can activate, deactivate, or change roles of any user

### 3.2 Test Catalog Management

- Admins maintain a catalog of available lab tests (e.g. CBC, Lipid Panel, HbA1c, Urinalysis)
- Each test has a name, category, description, normal value ranges, and turnaround time
- Doctors select from the catalog when creating requests

### 3.3 Test Request Workflow — 6-Stage State Machine

| Stage | Triggered By | Description |
|-------|-------------|-------------|
| **1. Requested** | Doctor | Doctor selects patient, chooses tests from catalog, adds clinical notes and urgency level |
| **2. Sample Collected** | Lab Technician | Technician confirms physical sample received; logs collection timestamp and sample ID |
| **3. Processing** | Lab Technician | Sample is actively being analyzed; technician marks processing start |
| **4. Results Ready** | Lab Technician | Technician uploads result values, attaches result file, flags any abnormal values |
| **5. Reviewed** | Doctor | Doctor reviews results and writes a medical interpretation note for the patient |
| **6. Released** | Doctor | Doctor releases the final report; patient is notified and gains full access |

### 3.4 Result Reports

- Each finalized report contains: test values, reference ranges, abnormal flags, result file, and doctor's interpretation
- Patients can view and download their reports
- Abnormal values are visually highlighted in the patient-facing report

### 3.5 Notification System

- Patients notified when their results are released by the doctor
- Doctors notified when a technician marks results as ready for review
- Technicians notified when a new urgent request is submitted
- In-app notification bell with read/unread state per user

### 3.6 Dashboards Per Role

- **Doctor Dashboard:** active request overview, results awaiting review, patient history
- **Technician Dashboard:** prioritized work queue sorted by urgency, daily workload summary
- **Patient Portal:** timeline of all requests with status badges, locked/unlocked result cards
- **Admin Panel:** user management, test catalog editor, platform analytics

---

## 4. High-Level System Structure

### 4.1 Backend Architecture

The backend is built with Node.js and Express.js using a clean 4-layer architecture. Every request flows through the same predictable pipeline:

```
Incoming Request
       ↓
Middleware (auth check, role guard, input validation)
       ↓
Routes (map URL + method to the right controller function)
       ↓
Controllers (handle request, apply logic, build response)
       ↓
Models (read/write data from MongoDB)
```

| Layer | File Location | Responsibility |
|-------|--------------|---------------|
| **Middleware** | `src/middleware/` | Runs before every protected route. Handles: (1) JWT verification — reads the token from the Authorization header and attaches the user to `req.user`. (2) Role guard — checks `req.user.role` against the allowed roles for that route. (3) Input validation — uses `express-validator` to validate and sanitize all incoming fields. (4) Global error handler — catches any thrown errors and returns a consistent JSON error response. |
| **Routes** | `src/routes/` | Defines every API endpoint (URL + HTTP method). Applies the correct middleware chain to each route before calling the controller function. Acts as the entry-point map of the entire API — nothing is exposed without going through a route first. |
| **Controllers** | `src/controllers/` | Contains all the logic for each endpoint. Reads data from `req.body` / `req.params` / `req.user`, interacts directly with Models to query or mutate the database, handles all business rules (e.g. status transition validation, access ownership checks), and sends the final JSON response with the appropriate HTTP status code. |
| **Models** | `src/models/` | Mongoose schemas that define the shape of every document in MongoDB. Enforce field types, required fields, enums, and default values at the database layer. Controllers import Models directly to run queries (find, create, update, delete). |

### 4.2 Folder Structure

| Folder / File | Contents |
|--------------|---------|
| `src/middleware/` | `authMiddleware.js` — verifies JWT, attaches `req.user`; `roleMiddleware.js` — checks `req.user.role`, rejects unauthorized access; `validationMiddleware.js` — express-validator rules for each route group; `errorHandler.js` — global error catcher, returns `{ message, status }` |
| `src/routes/` | `authRoutes.js`, `userRoutes.js`, `testTypeRoutes.js`, `requestRoutes.js`, `resultRoutes.js`, `notificationRoutes.js` |
| `src/controllers/` | `authController.js` — register, login, getMe; `userController.js` — listUsers, updateStatus, updateRole, getProfile; `testTypeController.js` — createTest, listTests, updateTest, deleteTest; `requestController.js` — createRequest, listRequests, getRequest, updateStatus; `resultController.js` — uploadResults, writeInterpretation, releaseReport, getReport; `notificationController.js` — listNotifications, markRead, markAllRead |
| `src/models/` | `User.js`, `TestType.js`, `TestRequest.js`, `TestRequestItem.js`, `ResultReport.js`, `Notification.js` |
| `src/` | `app.js` — Express setup, register all routers, attach error handler; `server.js` — connect to MongoDB, start listening on PORT |
| `.env` | `PORT`, `MONGO_URI`, `JWT_SECRET` |

### 4.3 Database Models — MongoDB + Mongoose

| Model | Key Fields | Relationships |
|-------|-----------|--------------|
| **User** | `name`, `email`, `password` (bcrypt hashed), `role` (enum: admin/doctor/technician/patient), `specialization`, `phone`, `isActive` | One User → many TestRequests (as doctor or patient) |
| **TestType** | `name`, `category`, `description`, `normalRange`, `unit`, `turnaroundDays`, `isActive` | Referenced by many TestRequestItems |
| **TestRequest** | `patientId` (ref: User), `doctorId` (ref: User), `technicianId` (ref: User), `status` (enum: 6 stages), `urgency`, `clinicalNotes` | Has many TestRequestItems; has one ResultReport |
| **TestRequestItem** | `testRequestId` (ref: TestRequest), `testTypeId` (ref: TestType), `resultValue`, `resultFile`, `isAbnormal`, `notes` | Belongs to TestRequest and TestType |
| **ResultReport** | `testRequestId` (ref: TestRequest), `interpretationNote`, `releasedAt`, `releasedBy` (ref: User), `isReleased` | Belongs to TestRequest; unlocked for Patient after release |
| **Notification** | `userId` (ref: User), `message`, `type`, `isRead`, `relatedRequestId` (ref: TestRequest), `createdAt` | Belongs to User; linked to a TestRequest |

### 4.4 API Endpoints

| Route File | Method | Endpoint | Middleware Applied | Controller Function |
|-----------|--------|---------|-------------------|-------------------|
| authRoutes | POST | `/api/auth/register` | validateRegistration | `authController.register` |
| authRoutes | POST | `/api/auth/login` | validateLogin | `authController.login` |
| authRoutes | GET | `/api/auth/me` | verifyToken | `authController.getMe` |
| userRoutes | GET | `/api/admin/users` | verifyToken, allowRoles(admin) | `userController.listUsers` |
| userRoutes | PATCH | `/api/admin/users/:id/status` | verifyToken, allowRoles(admin) | `userController.updateStatus` |
| userRoutes | PUT | `/api/admin/users/:id/role` | verifyToken, allowRoles(admin) | `userController.updateRole` |
| userRoutes | GET | `/api/users/:id` | verifyToken | `userController.getProfile` |
| testTypeRoutes | GET | `/api/tests` | verifyToken | `testTypeController.listTests` |
| testTypeRoutes | POST | `/api/tests` | verifyToken, allowRoles(admin), validate | `testTypeController.createTest` |
| testTypeRoutes | PUT | `/api/tests/:id` | verifyToken, allowRoles(admin), validate | `testTypeController.updateTest` |
| testTypeRoutes | DELETE | `/api/tests/:id` | verifyToken, allowRoles(admin) | `testTypeController.deleteTest` |
| requestRoutes | POST | `/api/requests` | verifyToken, allowRoles(doctor), validate | `requestController.createRequest` |
| requestRoutes | GET | `/api/requests` | verifyToken | `requestController.listRequests` |
| requestRoutes | GET | `/api/requests/:id` | verifyToken | `requestController.getRequest` |
| requestRoutes | PATCH | `/api/requests/:id/status` | verifyToken, allowRoles(doctor, technician) | `requestController.updateStatus` |
| resultRoutes | PUT | `/api/requests/:id/results` | verifyToken, allowRoles(technician) | `resultController.uploadResults` |
| resultRoutes | POST | `/api/requests/:id/interpret` | verifyToken, allowRoles(doctor) | `resultController.writeInterpretation` |
| resultRoutes | PATCH | `/api/requests/:id/release` | verifyToken, allowRoles(doctor) | `resultController.releaseReport` |
| resultRoutes | GET | `/api/requests/:id/report` | verifyToken | `resultController.getReport` |
| notificationRoutes | GET | `/api/notifications` | verifyToken | `notificationController.listNotifications` |
| notificationRoutes | PATCH | `/api/notifications/:id/read` | verifyToken | `notificationController.markRead` |
| notificationRoutes | PATCH | `/api/notifications/read-all` | verifyToken | `notificationController.markAllRead` |

### 4.5 Frontend Structure — React.js

The frontend is a single-page application built with React.js (Vite), React Router v6, Axios, and Tailwind CSS.

| Folder / File | Contents |
|--------------|---------|
| `src/pages/` | `Login.jsx`, `Register.jsx`, `DoctorDashboard.jsx`, `CreateRequest.jsx`, `RequestDetail.jsx`, `TechnicianQueue.jsx`, `UploadResults.jsx`, `WriteInterpretation.jsx`, `PatientPortal.jsx`, `ReportViewer.jsx`, `AdminDashboard.jsx` |
| `src/components/` | `Navbar.jsx`, `ProtectedRoute.jsx`, `RequestCard.jsx`, `StatusTimeline.jsx`, `NotificationBell.jsx`, `ResultForm.jsx`, `RoleGuard.jsx` |
| `src/context/` | `AuthContext.jsx` — stores logged-in user, token, login/logout functions |
| `src/api/` | `axios.js` — base Axios instance with Authorization header interceptor; `auth.js`, `requests.js`, `results.js`, `notifications.js` — API call functions per module |
| `src/` | `App.jsx` — React Router routes with ProtectedRoute wrappers; `main.jsx` — app entry point |

---

## 5. Development Plan — 4 Weeks

The project is planned to be completed in exactly 4 weeks (30 days). Each week has a clear focus area and each day has a specific task to ensure steady, on-time delivery.

| Week | Focus | Daily Tasks |
|------|-------|------------|
| **Week 1** (Days 1–7) | Setup & Authentication | **Day 1:** Initialize Node.js + Express, create folder structure (middleware / routes / controllers / models), connect to MongoDB Atlas, setup `.env`. **Day 2:** Build User model (name, email, password, role, isActive). Write `authController.register` with bcrypt hashing. **Day 3:** Write `authController.login` with JWT generation. Write `authMiddleware.js` (verifyToken). Write `authController.getMe`. **Day 4:** Write `roleMiddleware.js` (allowRoles). Wire up `authRoutes.js`. Test all auth endpoints in Postman. **Day 5:** Initialize React (Vite) frontend, setup React Router, create Axios instance with token interceptor, build AuthContext. **Day 6:** Build `Login.jsx` and `Register.jsx` pages with form validation. Implement `ProtectedRoute` and `RoleGuard` components. **Day 7:** End-to-end auth test (register → login → protected route). Fix bugs. Clean up code. |
| **Week 2** (Days 8–14) | Core Workflow & State Machine | **Day 8:** Build TestType model. Write testTypeController (list, create, update, delete). Wire testTypeRoutes with admin-only guards. **Day 9:** Build TestRequest model + TestRequestItem model. Write `requestController.createRequest` (doctor only). **Day 10:** Write `requestController.listRequests` (filtered by role: doctor sees own, technician sees queue, admin sees all). Write `requestController.getRequest`. **Day 11:** Write `requestController.updateStatus` with stage transition validation (enforce correct order: Requested → Sample Collected → Processing → Results Ready → Reviewed → Released). **Day 12:** Write `resultController.uploadResults` (Multer file upload, result values, abnormal flags). Wire resultRoutes. **Day 13:** Frontend — Build `AdminDashboard.jsx` (user table + test catalog editor). Connect to API. **Day 14:** Frontend — Build `CreateRequest.jsx` (multi-step form) and `TechnicianQueue.jsx` (work queue list). Connect to API. |
| **Week 3** (Days 15–21) | Reports, Patient Layer & Notifications | **Day 15:** Build ResultReport model. Write `resultController.writeInterpretation` and `resultController.releaseReport`. **Day 16:** Write `resultController.getReport` with ownership guard (patient sees own only, doctor sees own requests only). **Day 17:** Build Notification model. Add notification creation logic inside `requestController.updateStatus` and `resultController.releaseReport`. **Day 18:** Write notificationController (list, markRead, markAllRead). Wire notificationRoutes. **Day 19:** Frontend — Build `RequestDetail.jsx` (status timeline + action buttons). Build `UploadResults.jsx` form. Connect to API. **Day 20:** Frontend — Build `PatientPortal.jsx` (requests list with status badges, locked/unlocked result cards). Connect to API. **Day 21:** Frontend — Build `ReportViewer.jsx` (full report display with abnormal flags + interpretation). Build `WriteInterpretation.jsx`. Add `NotificationBell.jsx` dropdown. |
| **Week 4** (Days 22–30) | Polish, Testing & Deployment | **Day 22:** Write `validationMiddleware.js` — add express-validator rules for all POST/PUT routes (register, login, createRequest, uploadResults, createTest). **Day 23:** Write global `errorHandler.js` middleware. Ensure all controllers use try/catch and pass errors to `next()`. Standardize HTTP status codes across all endpoints. **Day 24:** Frontend — Add loading spinners, empty state messages, and error toast notifications across all pages. **Day 25:** Frontend — Responsive layout polish with Tailwind CSS. Ensure all pages work on mobile screens. **Day 26:** Full Postman testing — test every endpoint for all 4 roles. Verify middleware blocks unauthorized access correctly. **Day 27:** Fix all bugs found during testing. Final code review and cleanup (remove console.logs, unused imports). **Day 28:** Deploy backend to Render. Set production environment variables. Verify API is reachable. **Day 29:** Deploy frontend to Vercel. Connect to production API URL. Verify all pages work in production. **Day 30:** Final end-to-end test on production with all 4 roles. Write README on GitHub. Submit. |

### 5.1 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend Runtime | Node.js + Express.js | REST API server — routing, middleware, request handling |
| Database | MongoDB + Mongoose | Data storage, schema modeling, and relationships |
| Authentication | jsonwebtoken + bcrypt | JWT token generation/verification, password hashing |
| Validation | express-validator | Input sanitization and server-side field validation |
| File Uploads | Multer | Handling result file uploads on the server |
| Frontend Library | React.js (Vite) | Component-based SPA with fast development server |
| Routing | React Router v6 | Client-side navigation and protected route handling |
| Styling | Tailwind CSS | Utility-first responsive UI styling |
| State Management | React Context API | Global auth state, user session, notification count |
| HTTP Client | Axios | API calls from React to Express with token interceptors |
| Environment Vars | dotenv | Secure config for DB URI, JWT secret, and PORT |
| Version Control | Git + GitHub | Source control and public portfolio repository |
| Deployment | Render (API) + Vercel (React) + MongoDB Atlas | Cloud hosting — all free tiers, production-ready |

### 5.2 Why LabTrack Meets All Graduation Requirements

| Requirement | How LabTrack Covers It |
|------------|----------------------|
| JWT Authentication | Register + Login with `jsonwebtoken`; every protected route passes through `verifyToken` middleware |
| Role-Based Authorization | 4 roles enforced by `allowRoles()` middleware on every route; different data returned per role in controllers |
| Real-World Business Logic | 6-stage status machine with strict transition validation inside `requestController`; report release gate; abnormal value flagging |
| Multiple Related Models | 6 Mongoose models with clear One-to-Many relationships (User→Requests, Request→Items, Request→Report) |
| Validation & Error Handling | `express-validator` middleware on all write endpoints; global `errorHandler` middleware; consistent HTTP status codes |
| Clean Backend Architecture | Strict 4-layer structure: Middleware → Routes → Controllers → Models; dotenv for all secrets; modular file per feature |
| Frontend Auth Screens | Login + Register pages with client-side validation, role selection, and JWT token storage in Context |
| Role-Based UI | `ProtectedRoute` + `RoleGuard` components; each role sees a completely different dashboard and set of actions |
| CRUD + API Integration | Full CRUD on Test Catalog, Test Requests, Users; all wired to REST API via Axios with auth interceptor |
| Completable in 1 Month | 30-day plan with a specific daily task for every day, from project setup to deployed production application |
