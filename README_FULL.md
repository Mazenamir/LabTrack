# LabTrack — Full Project Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Purpose](#purpose)
- [Key Features](#key-features)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Scripts](#project-scripts)
- [Development Workflow](#development-workflow)
- [Testing & Validation](#testing--validation)
- [Possible Enhancements](#possible-enhancements)
- [Contacts & Credits](#contacts--credits)

---

## Project Overview

**LabTrack** is a role-aware full-stack web application designed to manage medical laboratory test requests and results.

It enables doctors, lab technicians, patients, and administrators to interact within a unified digital workflow, supporting:

- creating and tracking lab test requests,
- processing samples,
- uploading and reviewing results,
- releasing final reports,
- enforcing access control per role,
- providing patient access to their own reports.

This documentation covers the entire project from backend services through frontend user experience.

---

## Purpose

LabTrack aims to digitize the healthcare lab workflow by removing manual paper processes and creating a transparent, auditable system where each request moves through clearly defined stages.

The application is useful for clinical laboratories, hospitals, and health centers that need a secure way to coordinate doctors, technicians, and patients.

---

## Key Features

- JWT-based authentication and secure role-based authorization
- User management for admins, doctors, technicians, and patients
- Test catalog management by admins
- Multi-step lab request lifecycle tracking
- Result upload and abnormal-value flagging by technicians
- Doctor review and final report release
- Patient access to released reports
- Notification system for status updates and result availability
- Email notifications for result release and status changes via nodemailer
- Clean separation of backend and frontend responsibilities

---

## User Roles and Permissions

LabTrack supports four distinct roles:

- **Admin**: full access to all data, user management, and test catalog administration
- **Doctor**: creates and manages lab requests, reviews results, and releases final reports
- **Technician**: processes sample collection, uploads results, and manages the lab queue
- **Patient**: views own requests, status, and released reports only

### Email Notifications

The application uses **nodemailer** to send email notifications at key workflow stages:

- **Result Release Notification**: Patient receives an email when a doctor releases their final lab report.
- **Results Ready Notification**: Doctor receives an email when a technician marks results as ready for review.
- **Urgent Request Notification**: Lab technician receives an email when a new urgent lab request is submitted.

Email functionality is implemented in `backend/utils/sendEmail.js` and integrated into the request and result controllers. Email configuration (SMTP settings, sender address, templates) is managed via environment variables.

### Access rules

- Unauthenticated users may only access login and registration.
- Doctors can only view requests they created and manage their own patients.
- Technicians can only view requests that are either unassigned or already assigned to them. Once a technician claims a request by collecting the sample, it is reserved and hidden from other technicians.
- Patients can only view requests belonging to them.
- Admins can view and manage the whole system.

---

## Technology Stack

### Backend

- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcrypt` / `bcryptjs`)
- File upload support with `multer`
- PDF generation with `pdfkit`
- Email notifications with `nodemailer`
- Environment variables with `dotenv`

### Frontend

- React 19
- Vite
- React Router DOM 7
- Axios for HTTP requests

### Tools and Utilities

- `nodemon` for backend development
- `concurrently` for running backend and frontend together
- `eslint` for frontend linting

---

## Repository Structure

```
LabTrack/
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── README.md
│   ├── controllers/
│   │   ├── requestController.js
│   │   ├── testTypeController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── roleMiddleware.js
│   │   └── userMiddleware.js
│   ├── models/
│   │   ├── TestRequest.js
│   │   ├── TestRequestItem.js
│   │   ├── TestType.js
│   │   └── User.js
│   ├── routes/
│   │   ├── requestRoutes.js
│   │   ├── test.js
│   │   ├── testTypeRoutes.js
│   │   └── userRoutes.js
│   └── utils/
│       ├── generateResultsPdf.js
│       └── sendEmail.js
├── frontend/
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       │   └── axios.jsx
│       ├── assets/
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   └── RoleGuard.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── AuthContextConstants.js
│       │   └── useAuth.js
│       └── pages/
│           ├── AdminDashboard.jsx
│           ├── CreateRequest.jsx
│           ├── DoctorDashboard.jsx
│           ├── Login.jsx
│           ├── PatientDashboard.jsx
│           ├── Register.jsx
│           ├── RequestDetail.jsx
│           ├── TechnicianQueue.jsx
│           └── Unauthorized.jsx
├── package.json
└── README.md
```

---

## Backend Architecture

The backend is located in `backend/` and is implemented with Express.

### Main backend files

- `backend/app.js`: creates the Express app, enables middleware, sets CORS, configures route handlers, and starts the server in development mode.
- `backend/package.json`: defines backend dependencies and scripts.

### Core backend folders

- `controllers/`: request handling logic for user, test type, and request APIs.
- `middleware/`: authorization and authentication middleware.
- `models/`: Mongoose schemas defining User, TestType, TestRequest, and TestRequestItem.
- `routes/`: HTTP route definitions mapping endpoints to controllers.
- `utils/`: helper utilities including PDF generation (`generateResultsPdf.js`) and email sending (`sendEmail.js` via nodemailer).

### Backend flow

1. Request enters Express and passes global middleware.
2. Route definitions determine the controller method.
3. Middleware verifies JWT and role permissions.
4. Controller executes business logic and interacts with MongoDB models.
5. Response is returned as JSON.

---

## Frontend Architecture

The frontend is a React application built with Vite.

### Main frontend files

- `frontend/src/main.jsx`: application entry point that renders the React app.
- `frontend/src/App.jsx`: route definitions and app-level layout.
- `frontend/src/api/axios.jsx`: Axios instance used throughout the app.
- `frontend/src/context/AuthContext.jsx`: authentication state provider.

### Pages and components

- `pages/`: role-specific views and authentication pages.
- `components/ProtectedRoute.jsx`: protects routes for authenticated users.
- `components/RoleGuard.jsx`: restricts UI elements and pages by role.
- `context/useAuth.js`: custom hook to access auth state.

### Frontend flow

- User logs in or registers.
- JWT token is stored within auth context.
- Axios attaches authorization token to API requests.
- Pages render based on route and current user role.

---

## Data Model

### User model

Fields likely include:

- `name`
- `email`
- `password` (stored hashed)
- `role` (`admin`, `doctor`, `technician`, `patient`)
- `specialization`
- `phone`
- `isActive`

### TestType model

Fields likely include:

- `name`
- `category`
- `description`
- `normalRange`
- `unit`
- `turnaroundDays`
- `isActive`

### TestRequest model

Fields likely include:

- `patientId`
- `doctorId`
- `technicianId`
- `status`
- `urgency`
- `clinicalNotes`
- `createdAt`

### TestRequestItem model

Fields likely include:

- `testRequestId`
- `testTypeId`
- `resultValue`
- `resultFile`
- `isAbnormal`
- `notes`

---

## API Reference

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `PUT /api/admin/users/:id/role`
- `GET /api/users/:id`

### Tests

- `GET /api/tests`
- `POST /api/tests`
- `PUT /api/tests/:id`
- `DELETE /api/tests/:id`

### Requests

- `POST /api/requests`
- `GET /api/requests`
- `GET /api/requests/:id`
- `PATCH /api/requests/:id/status`

### Results

- `PUT /api/requests/:id/results`
- `POST /api/requests/:id/interpret`
- `PATCH /api/requests/:id/release`
- `GET /api/requests/:i/report`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

---

## Installation

### Prerequisites

- Node.js 18+ or compatible version
- npm 10+ or compatible package manager
- MongoDB instance (local or Atlas)

### Root project setup

From the root project folder:

```bash
cd d:\WORK\Digilians\LabTrack
npm install
```

This installs workspace-level dependencies only.

### Backend setup

```bash
cd backend
npm install
```

### Frontend setup

```bash
cd frontend
npm install
```

---

## Environment Configuration

Create `.env` in the `backend/` folder with the following values:

```env
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secret_key>
```

If the backend uses any additional environment variables, add them here as needed for email or PDF generation.

---

## Running the Application

### Start backend only

```bash
cd backend
npm run dev
```

### Start frontend only

```bash
cd frontend
npm run dev
```

### Start backend + frontend together

From the root folder:

```bash
npm start
```

This root command uses `concurrently` to run both backend and frontend in parallel.

---

## Project Scripts

### Root scripts

- `npm start`: runs both backend and frontend concurrently
- `npm run server`: starts backend development server
- `npm run client`: starts frontend development server

### Backend scripts

- `npm run dev`: runs `nodemon app.js`
- `npm start`: runs `node app.js`

### Frontend scripts

- `npm run dev`: runs Vite development server
- `npm run build`: builds the production bundle
- `npm run preview`: previews the built app locally
- `npm run lint`: runs ESLint checks

---

## Development Workflow

1. Start the backend and frontend servers.
2. Register a new user or login with an existing account.
3. Use role-specific pages to create lab requests, process samples, upload results, review reports, and view patient results.
4. Admin users should manage test types and user roles via the admin dashboard.
5. Monitor backend logs for request validation and error handling during development.

---

## Testing & Validation

- Use the frontend UI to validate core flows for each role.
- Test API endpoints with Postman or Insomnia.
- Validate JWT authentication by attempting to call protected routes without a token.
- Ensure role guards block unauthorized access by attempting doctor-only and admin-only endpoints with wrong roles.
- Check form validation behavior on login, registration, request creation, and result upload.

---

## Possible Enhancements

- Add database seeding for initial admin, doctors, technicians, patients, and test types.
- Implement role-based dashboard analytics and charts.
- Enable file storage using S3 or cloud storage for result files.
- Add email notifications for result release and status changes.
- Add pagination and filtering to request lists.
- Create mobile-responsive frontend views.
- Add unit tests for backend controllers and frontend components.

---

## Contacts & Credits

This project was developed as a complete full-stack lab tracking system.

For updates or contributions, edit the files in the `backend/` and `frontend/` folders, and keep this documentation synchronized with new routes, models, and UI changes.
