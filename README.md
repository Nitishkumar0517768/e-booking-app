# e-Booking — Equipment & Resource Booking Management System

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2058-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.88.1-61DAFB.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/atlas)
[![Design](https://img.shields.io/badge/Design-Coinbase%20Design%20System-0052FF.svg)](https://brand.coinbase.com)

**e-Booking** is an institutional-grade, full-stack mobile application engineered for universities and educational institutions to manage, reserve, issue, and track shared resources — including high-performance laptops, camera kits, lab testing oscilloscopes, sports tournament equipment, and executive seminar halls.

It eliminates double-booking through an **interval sweep-line event algorithm** and MongoDB transaction write-guards, while delivering a modern mobile UI adhering to the **Coinbase Design System** (`#0052ff` voltage blue, pure `#ffffff` canvas, subtle `#f7f7f7` elevation bands, and geometric typography).

---

## 1. Architecture & Repository Structure

The frontend and backend reside in two strictly separate sibling directories at the root with independent dependencies and configuration:

```text
e-booking-app/
│
├── frontend/                     # React Native + Expo Mobile Application
│   ├── assets/                   # Icons, splash art, and tab assets
│   ├── src/
│   │   ├── components/           # Reusable UI (Button, Card, Badge, Input, EmptyState, Header)
│   │   ├── constants/            # Theme, Coinbase tokens, typography, radii
│   │   ├── context/              # AuthContext (token storage, role guards, reactive state)
│   │   ├── navigation/           # RootNavigator (role dispatcher & 5-tab student/admin layout)
│   │   ├── screens/
│   │   │   ├── auth/             # LoginScreen, RegisterScreen
│   │   │   ├── student/          # Home, Explore, Details, BookingForm, MyBookings, Notifications, Profile
│   │   │   └── admin/            # Dashboard, Resources, AddEditResource, Requests, History, Profile
│   │   ├── services/             # Axios API client, auth, resources, bookings, notifications, admin
│   │   └── utils/                # Expo SecureStore session persistence
│   ├── app.json                  # Expo application configuration
│   ├── package.json              # Frontend-only dependencies
│   ├── .env.example              # Frontend environment variables template
│   └── .env                      # Local frontend environment config
│
├── backend/                      # Node.js + Express.js + MongoDB Application
│   ├── src/
│   │   ├── config/               # MongoDB Atlas connection (Mongoose)
│   │   ├── controllers/          # authController, resourceController, bookingController, adminController, etc.
│   │   ├── middleware/           # auth.js (JWT verify + requireRole), validate.js, errorHandler.js
│   │   ├── models/               # User, Resource, Booking, Notification
│   │   ├── routes/               # authRoutes, resourceRoutes, bookingRoutes, notificationRoutes, adminRoutes
│   │   ├── services/             # availabilityService (Sweep-Line), notificationService
│   │   ├── utils/                # Standardized JSON response utilities
│   │   └── validators/           # Zod schema request validation
│   ├── scripts/                  # seedAdmin.js (database seeding for admin & resources)
│   ├── server.js                 # Express server entry point & health check
│   ├── package.json              # Backend-only dependencies
│   ├── .env.example              # Backend environment variables template
│   └── .env                      # Private backend environment secrets
│
├── docs/
│   ├── PRD.md                    # Complete Product Requirements Document
│   └── API_DOCUMENTATION.md      # Full REST API specification & payloads
│
├── README.md                     # Comprehensive setup and run guide
└── .gitignore                    # Root gitignore protecting secrets & dependencies
```

---

## 2. Key Features

### For Students
- **Personalized Home Hub**: Dynamic greeting, search bar, category shortcuts, upcoming reservation banner, and featured inventory.
- **Resource Discovery**: Real-time keyword search, category filtering (Electronics, Lab Equipment, Sports, Facilities), condition badges, and total available quantities.
- **Accurate Availability Checker**: Preview exact remaining inventory for specific time slots before submitting.
- **Booking Engine**: Date presets, morning/afternoon/evening/full-day time slots, quantity selector with inventory limits, and purpose statement.
- **Digital Access Pass**: Generates unique `EB-2026-XXXX` codes with a digital pass layout for equipment desk checkouts.
- **Booking Management**: Multi-status filter tabs (All, Pending, Approved, Issued, Returned, Cancelled, Overdue) with self-service cancellation for eligible bookings.
- **In-App Notification Feed**: Live notifications on submission, approval, rejection, checkout, and return.
- **Profile Management**: Displays enrollment ID, department, contact information, and editable student profile.

### For Resource Administrators
- **Executive Dashboard**: Live metrics for Total Resources, Active Inventory, Maintenance, Total Bookings, Pending Approvals, Issued Equipment, and Overdue Returns.
- **Resource Inventory CRUD**: Create new items, edit specifications, update total quantities, toggle operational statuses (`Available`, `Maintenance`, `Inactive`), and soft-delete/archive.
- **Approval Workflow**: Review pending booking requests with student academic details; approve with optional remarks or reject with mandatory justification.
- **Equipment Custody Management**: One-click handover ("Issue Equipment") and check-in ("Return Equipment") tracking with custody timestamps and notes.
- **Overdue Monitoring**: Immediate visual indicators for unreturned equipment that has exceeded its reservation window.

---

## 3. Concurrency & Double-Booking Prevention Algorithm

e-Booking implements a **Sweep-Line Interval Event Algorithm** combined with **MongoDB Transactions** and a resource-level `bookingVersion` concurrency write-guard:

1. **Overlap Condition**: An existing reservation overlaps a requested window `[requestedStart, requestedEnd)` if and only if:
   $$\text{existing.startAt} < \text{requested.endAt} \quad \text{AND} \quad \text{existing.endAt} > \text{requested.startAt}$$
2. **Active Inventory Reservation**: Only `Pending`, `Approved`, and `Issued` bookings consume inventory. `Rejected`, `Cancelled`, and `Returned` release inventory immediately.
3. **Interval Sweep-Line**: Rather than naively summing overlapping quantities, all critical transition points in the interval are converted to chronological events ($+\text{qty}$ on start, $-\text{qty}$ on end). The maximum concurrent quantity $\text{MaxConcurrent}$ at any point in the interval is determined.
4. **Guaranteed Availability**:
   $$\text{Available Quantity} = \text{Total Inventory} - \text{MaxConcurrent}$$
5. **Atomic Transaction Write-Guard**:
   - `Resource.findOneAndUpdate({ _id: resourceId }, { $inc: { bookingVersion: 1 } }, { session })` establishes a write-lock conflict point.
   - Availability is re-verified inside the session.
   - If $\text{Available Quantity} \ge \text{Requested Quantity}$, the booking is inserted with status `Pending` and the transaction commits.
   - If inventory is insufficient, the transaction aborts and returns `409 Conflict`.

---

## 4. Setup & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended; v22 supported)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go app](https://expo.dev/go) on your Android device (or an Android Studio emulator)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string (or local MongoDB)

---

### Step 1: Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/e-booking
   JWT_SECRET=ebooking_super_secure_jwt_secret_key_2026_x!
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ADMIN_NAME="System Administrator"
   ADMIN_EMAIL=admin@college.edu
   ADMIN_PASSWORD=Admin@123456
   FRONTEND_ORIGIN=*
   ```
4. Seed the database with the default administrator and sample resources:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm start
   # or with auto-reload:
   npm run dev
   ```
   *Verify backend health at: [http://localhost:5000/api/health](http://localhost:5000/api/health)*

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `frontend/.env`:
   - **For Android Emulator**:
     ```env
     EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
     ```
   - **For Physical Android Phone (Expo Go)**:
     Set your development computer's local Wi-Fi IP address (e.g. `http://192.168.1.100:5000/api`):
     ```env
     EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api
     ```
   - **For Web Preview**:
     ```env
     EXPO_PUBLIC_API_URL=http://localhost:5000/api
     ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Run on your target platform:
   - Press **`a`** for Android Emulator.
   - Scan the QR code with **Expo Go** on your physical Android device.
   - Press **`w`** for Web preview.

---

## 5. Demo Credentials

Quick demo buttons are embedded on the Login screen for 1-tap testing:

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@college.edu` | `Admin@123456` |
| **Student** | `jane.doe@college.edu` (or register any new account) | `Password123!` |

*(Public registration creates verified `student` accounts exclusively. Administrators are provisioned via secure seed scripts).*

---

## 6. Android APK Generation

To generate an installable standalone Android `.apk` file for testing:

### Option A: Using EAS Build (Recommended Cloud Build)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Configure build profile in `frontend/eas.json`:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         },
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-deployed-backend.com/api"
         }
       }
     }
   }
   ```
4. Run the APK build:
   ```bash
   cd frontend
   eas build --platform android --profile preview
   ```
5. When complete, EAS provides a direct download link for the installable `.apk` file.

### Option B: Local Android Build (Android Studio & Gradle)
1. Generate native Android project:
   ```bash
   cd frontend
   npx expo run:android
   ```
2. Build standalone release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. The APK will be generated at:
   `frontend/android/app/build/outputs/apk/release/app-release.apk`

---

## 7. Cloud Backend Deployment Guide

### Deploying the Node.js API to Render (Free Tier)
1. Push this repository to your GitHub account.
2. Sign in to [Render](https://render.com) and click **New + > Web Service**.
3. Connect your `e-booking-app` repository.
4. Set the configuration:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. In **Environment Variables**, add:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = your secure JWT random string
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `CLOUDINARY_CLOUD_NAME` = your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` = your Cloudinary API key
   - `CLOUDINARY_API_SECRET` = your Cloudinary API secret
   - `ADMIN_EMAIL` = `admin@college.edu`
   - `ADMIN_PASSWORD` = `Admin@123456`
6. Click **Deploy Web Service**. Once live, Render gives you a public URL (e.g., `https://e-booking-backend.onrender.com`).
7. Update `EXPO_PUBLIC_API_URL` in `frontend/.env` and `frontend/eas.json` to point to `https://e-booking-backend.onrender.com/api`.

---

## 8. License & Compliance
This software was developed according to institutional equipment management standards and product requirements. All credentials and backend secrets are strictly excluded from version control.
