# e-Booking
## Product Requirements Document (PRD)

**Project Name:** e-Booking  
**Full Name:** Equipment & Resource Booking Management System  
**Project Type:** Full-Stack Mobile Application  
**Target Users:** College Students and Resource Administrators  
**Platform:** Android  
**Frontend:** React Native + Expo  
**Backend:** Node.js + Express.js  
**Database:** MongoDB Atlas  
**Authentication:** JWT + bcrypt  
**Project Deadline:** 22 November 2026  
**Repository Structure:** Separate Frontend and Backend folders

---

# 1. Project Overview

## 1.1 Introduction

e-Booking is a mobile-based Equipment and Resource Booking Management System designed specifically for colleges and educational institutions.

Colleges have multiple shared resources such as laptops, cameras, projectors, microphones, laboratory equipment, sports equipment, seminar halls, and meeting rooms.

These resources are often managed manually through registers, spreadsheets, phone calls, or verbal communication.

Such manual processes create several problems:

- Double booking of the same equipment.
- Difficulty checking real-time availability.
- No centralized booking management system.
- Delayed booking approvals.
- Difficulty tracking issued and returned equipment.
- Poor inventory management.
- No proper booking history.
- Lack of transparency between students and resource managers.

e-Booking solves these problems by providing a centralized mobile application where students can browse resources, check availability, submit booking requests, and track reservations.

Administrators can manage inventory, process booking requests, approve or reject reservations, issue equipment, and record returns.

## 1.2 Project Vision

To digitize and simplify the process of managing, booking, issuing, and returning shared institutional resources through a single mobile application.

## 1.3 Project Objectives

1. Digitize the college resource booking process.
2. Prevent overlapping and conflicting bookings.
3. Provide accurate resource availability.
4. Simplify booking approvals.
5. Maintain centralized resource inventory.
6. Track equipment issuing and returning.
7. Provide booking history and notifications.
8. Improve transparency and resource utilization.
9. Provide separate experiences for students and administrators.

---

# 2. Target Users and Roles

The initial release will support one college or educational institution with two primary roles.

## 2.1 Student / User

Students can:

- Register and log in.
- Browse all available resources.
- Search resources by name.
- Filter resources by category.
- View resource details.
- Check availability for selected dates and times.
- Select the required quantity.
- Submit booking requests.
- Track booking status.
- View upcoming bookings.
- View booking history.
- Cancel eligible bookings.
- Receive notifications.
- Manage their profiles.

Students cannot:

- Add or edit resources.
- Approve or reject bookings.
- Issue equipment.
- Record equipment returns.
- Access administrative dashboards.

## 2.2 Admin / Resource Manager

Admins are responsible for managing the institution's resources and booking operations.

Admin permissions:

- Access the admin dashboard.
- View resource inventory.
- Add new resources.
- Edit resource information.
- Update resource quantities.
- Upload or update resource images.
- Categorize resources.
- Mark resources as available or under maintenance.
- Archive inactive resources.
- View all booking requests.
- Approve or reject requests.
- Provide rejection reasons.
- Issue approved equipment.
- Mark equipment as returned.
- Monitor overdue bookings.
- View booking history.
- View dashboard statistics.

### Admin Account Creation

A normal student must never be able to register as an admin.

Admin accounts must be created through a secure database seed script or another authorized administrative process.

The mobile application must verify user roles through the authenticated backend session.

---

# 3. Application Modules

## Module 1: Authentication and User Management

### Student Registration

Fields:

- Full Name
- Email Address
- Password
- Confirm Password
- Student ID / Enrollment Number
- Department
- Phone Number (optional)

### Login

Fields:

- Email
- Password

### Features

- Splash screen.
- Registration.
- Login.
- Logout.
- JWT authentication.
- Secure password hashing.
- Role-based access.
- Persistent authenticated session.
- User profile.
- Edit profile.

### Validation

- Valid email format.
- Required fields.
- Unique email address.
- Valid password length.
- Confirm password must match.
- Passwords stored using bcrypt hashing.
- Never accept an admin role from public registration requests.

Use secure token storage on the mobile application, preferably Expo SecureStore.

---

## Module 2: Resource Management

Students should be able to discover and explore available resources.

### Resource Categories

**1. Electronics**
- Laptops
- Projectors
- Cameras
- Microphones
- Speakers

**2. Laboratory Equipment**
- Scientific instruments
- Electronics components
- Lab kits
- Testing equipment

**3. Sports Equipment**
- Footballs
- Cricket kits
- Badminton rackets
- Sports accessories

**4. Rooms and Facilities**
- Seminar halls
- Meeting rooms
- Conference rooms

**5. Other Resources**
- Other institution-owned resources.

### Resource Information

Each resource must contain:

- Resource ID
- Resource Name
- Description
- Category
- Resource Type
- Image URL
- Department
- Location
- Total Quantity
- Condition
- Operational Status
- Requires Issue/Return flag
- Created At
- Updated At

### Resource Status

- Available
- Maintenance
- Inactive

The currently bookable quantity must be calculated from the booking data and resource inventory. Do not permanently maintain an inaccurate availability number.

### Student Features

- View all resources.
- Search resources.
- Filter by category.
- Filter by availability.
- View resource details.
- View total quantity and available quantity.
- Check date-specific availability.

### Admin Features

- Add resource.
- Edit resource.
- Update quantity.
- Update operational status.
- Change resource category.
- Update resource image.
- Archive resource.

Resources with historical bookings should be archived rather than permanently deleted.

---

## Module 3: Booking Management

Booking management is the core functionality of e-Booking.

### Booking Workflow

1. Student opens the Explore screen.
2. Student selects a resource.
3. Student views resource details.
4. Student selects start date and time.
5. Student selects end date and time.
6. Student selects required quantity.
7. Student enters the booking purpose.
8. Application checks availability.
9. Student submits a booking request.
10. Backend validates the request.
11. Booking is created with Pending status.
12. Admin reviews the request.
13. Admin approves or rejects it.
14. Student receives an in-app notification.
15. Admin issues the equipment where applicable.
16. Admin records equipment return.

### Booking Information

Each booking must contain:

- Booking ID
- Booking Code
- User ID
- Resource ID
- Quantity
- Start Date and Time
- End Date and Time
- Booking Purpose
- Booking Status
- Admin Remarks
- Rejection Reason
- Approved By
- Issued By
- Issued At
- Returned At
- Created At
- Updated At

### Booking Status

Persisted booking statuses:

- Pending
- Approved
- Rejected
- Cancelled
- Issued
- Returned

Additional displayed states:

- Overdue: An issued equipment booking whose end time has passed without being returned.
- Completed: A room or facility reservation whose approved booking period has ended, or an equipment booking that has been returned.

Overdue and Completed can be computed by the backend rather than requiring a separate background scheduler for the MVP.

### Booking Rules

1. Users can only request future bookings.
2. End date and time must be later than start date and time.
3. Requested quantity must be greater than zero.
4. Requested quantity cannot exceed total inventory.
5. The resource must be active.
6. Resources under maintenance cannot be booked.
7. The backend must validate availability at booking submission.
8. Pending, Approved, and Issued bookings reserve inventory.
9. Rejected, Cancelled, and Returned bookings must not reserve future inventory.
10. Students can cancel eligible Pending or Approved requests before their start time.
11. Admins must provide a reason when rejecting a request.
12. Only admins can issue or return equipment.
13. A Returned booking cannot be issued again.
14. A booking must not be returned more than once.
15. The booking must belong to the authenticated user when a student views or modifies their booking.

### Resource-Specific Workflow

For physical equipment:

Pending → Approved → Issued → Returned

For a resource that does not require physical issuing or returning, such as a seminar hall:

Pending → Approved → Completed

The `requiresIssueReturn` property on a resource determines which workflow applies.

---

# 4. Availability and Double Booking Prevention

This is one of the most important business requirements.

e-Booking must calculate availability from resource quantity and overlapping reservations.

### Example

A college has 5 laptops.

Student A books 2 laptops from 10 AM to 12 PM.

Student B requests 2 laptops from 11 AM to 1 PM.

Student C requests 2 laptops from 11:30 AM to 12:30 PM.

Availability:

- Student A: 2 units reserved.
- Student B: 2 units reserved.
- Combined reservation during the overlap: 4 units.
- Student C can only reserve 1 unit during the overlapping period.

A request for 2 units must be rejected.

### Time Overlap Rule

Two bookings overlap when:

Existing booking start < Requested booking end

AND

Existing booking end > Requested booking start

Treat booking intervals as half-open intervals: the end time of one booking can equal the start time of the next booking.

### Accurate Availability Calculation

For a requested time interval, the backend must:

1. Fetch all relevant overlapping active bookings.
2. Calculate reserved quantities at each overlapping time interval.
3. Find the maximum concurrent reserved quantity.
4. Calculate available quantity.
5. Compare the requested quantity with available inventory.

Formula:

Available Quantity = Total Quantity - Maximum Concurrent Reserved Quantity

Do not simply add every overlapping booking's quantity, because bookings may overlap different portions of the requested interval.

### Concurrency Protection

Two students may submit booking requests at almost the same time.

The backend must prevent both requests from reserving the same remaining inventory.

Use MongoDB transactions with a resource-level concurrency guard, such as atomically updating a booking version field on the resource document inside the same transaction before rechecking availability and creating the booking.

Use a transaction retry strategy for transient write conflicts.

MongoDB transactions must be supported by the chosen database deployment. MongoDB Atlas is the preferred database for this project.

Frontend availability checks are only for display. The backend is always the final authority.

---

# 5. Admin Dashboard

The admin dashboard must provide a complete overview of booking and resource operations.

### Dashboard Statistics

- Total Resources
- Active Resources
- Resources Under Maintenance
- Total Bookings
- Pending Requests
- Approved Bookings
- Currently Issued Equipment
- Overdue Equipment

### Dashboard Sections

1. Statistics cards.
2. Recent booking activity.
3. Pending booking requests.
4. Recently issued equipment.
5. Overdue returns.
6. Quick action buttons.

### Admin Actions

- View pending request.
- Open booking details.
- Approve request.
- Reject request.
- Issue equipment.
- Return equipment.
- Add resource.
- Manage inventory.
- View booking history.

All statistics must come from backend database queries, not hardcoded values.

---

# 6. Notification Management

Implement a database-backed in-app notification system.

### Notification Events

- Booking successfully submitted.
- Booking approved.
- Booking rejected.
- Booking cancelled.
- Equipment issued.
- Equipment returned.
- Booking approaching its end time, where reminders are implemented.
- Booking overdue.

### Notification Features

- Notification list.
- Read/unread indicator.
- Mark notification as read.
- Mark all as read.
- Open related booking details.
- Display unread notification count.

Push notifications using Expo Notifications are an optional enhancement after in-app notifications are working.

---

# 7. Profile and Booking History

## Student Profile

Display:

- Full Name
- Email
- Student ID
- Department
- Phone Number
- Profile Information
- Edit Profile
- Logout

## Student Booking History

Display:

- Booking Code
- Resource Image
- Resource Name
- Booking Date
- Start Time
- End Time
- Quantity
- Purpose
- Current Status

### Booking Filters

- All
- Pending
- Approved
- Rejected
- Issued
- Returned
- Cancelled
- Overdue

## Admin Booking History

Admins must be able to view all institution bookings and filter them by status, resource, student, or date range.

Use pagination to handle larger booking histories.

---

# 8. Application Screens and Navigation

## Student Navigation

Use a bottom tab navigation layout.

Tabs:

1. Home
2. Explore
3. My Bookings
4. Notifications
5. Profile

### Student Screens

**Authentication**
- Splash
- Login
- Registration

**Main Application**
- Home Dashboard
- Explore Resources
- Resource Details
- Availability Selection
- Booking Form
- Booking Confirmation
- My Bookings
- Booking Details
- Notifications
- Profile
- Edit Profile

## Admin Navigation

Use a separate bottom tab or equivalent admin navigation structure.

Tabs:

1. Dashboard
2. Resources
3. Requests
4. History
5. Profile

### Admin Screens

- Admin Dashboard
- Resource Inventory
- Resource Details
- Add Resource
- Edit Resource
- Booking Requests
- Booking Details
- Approve / Reject Request
- Issue Equipment
- Return Equipment
- Overdue Bookings
- Booking History
- Admin Profile

Student and admin navigation must be separated based on the authenticated user role.

---

# 9. UI/UX Design Requirements

The application must have a clean, modern, premium, and professional design.

### Design Direction

Use modern mobile SaaS applications as visual inspiration.

### Color Palette

- use DESIGN-coinbase.md that is present in folder
use this command to access design "npx getdesign@latest add coinbase"

### UI Requirements

1. Clean typography.
2. Consistent spacing.
3. Rounded cards.
4. Subtle shadows and borders.
5. Consistent icons.
6. Clear status indicators.
7. Smooth navigation transitions.
8. Responsive layouts.
9. Proper Android status bar and safe-area handling.
10. Keyboard-aware forms.
11. Accessible touch targets.
12. Loading states.
13. Empty states.
14. Error states.
15. Confirmation dialogs for important actions.

### Student Home Screen

Must include:

- Personalized greeting.
- Search bar.
- Resource categories.
- Featured resources.
- Available resources.
- Upcoming booking summary.
- Recent booking activity.

### Admin Dashboard

Must include:

- Overview statistics.
- Pending requests.
- Inventory overview.
- Issued equipment.
- Overdue bookings.
- Quick actions.

The application must not look like a generic template. Maintain a consistent visual design system across all screens.

---

# 10. Technology Stack

## Frontend — frontend/

- React Native
- Expo
- JavaScript
- React Navigation
- Axios
- Redux Toolkit where needed
- React Native Safe Area Context
- Expo SecureStore
- Expo-compatible date/time picker
- Expo Notifications for optional push notifications
- Expo Image Picker if image selection is implemented

Use the Expo SDK and React Native versions already present in the project where possible.

Install Expo-compatible dependencies using `npx expo install` when applicable.

## Backend — backend/

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Token
- bcrypt
- Joi or Zod for validation
- CORS
- dotenv
- Helmet
- Express Rate Limit

Use modular architecture with clear separation of responsibilities.

## Development Tools

- VS Code
- Antigravity
- Android Studio
- Expo
- Postman
- MongoDB Atlas
- Git
- GitHub

---

# 11. Mandatory Project Folder Architecture

The root directory must be named `e-booking`.

Frontend and backend must be separate sibling directories.

Required architecture:

e-booking/
│
├── frontend/
│   ├── assets/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   └── admin/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── constants/
│   │   ├── theme/
│   │   └── utils/
│   ├── app.json
│   ├── package.json
│   ├── eas.json
│   ├── .env.example
│   └── .gitignore
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── docs/
│   ├── PRD.md
│   └── API_DOCUMENTATION.md
│
├── README.md
└── .gitignore

### Folder Separation Rules

- All React Native code must remain inside `frontend/`.
- All Node.js and Express code must remain inside `backend/`.
- Frontend and backend must each have an independent `package.json`.
- Each project must manage its own dependencies.
- Each project must have its own `node_modules`.
- Backend environment secrets must remain inside `backend/.env`.
- Frontend public configuration must remain inside `frontend/.env`.
- Never expose backend secrets in frontend configuration.
- Frontend must communicate with backend only through API requests.
- Do not import backend modules directly into frontend.
- Do not place React Native screens inside backend.
- Do not place Express controllers or database models inside frontend.
- Keep shared documentation at the root or inside docs/.

---

# 12. Database Design

Use MongoDB Atlas with Mongoose.

Create the following collections.

## 12.1 Users

Fields:

- _id
- name
- email
- passwordHash
- studentId
- department
- phone
- role: student / admin
- isActive
- createdAt
- updatedAt

Email must have a unique index.

## 12.2 Resources

Fields:

- _id
- name
- description
- category
- resourceType: equipment / room / facility
- imageUrl
- department
- location
- totalQuantity
- condition
- operationalStatus: available / maintenance / inactive
- requiresIssueReturn
- bookingVersion
- createdAt
- updatedAt

For rooms and facilities, total quantity will normally be 1.

## 12.3 Bookings

Fields:

- _id
- bookingCode
- userId
- resourceId
- quantity
- startAt
- endAt
- purpose
- status
- adminRemarks
- rejectionReason
- approvedBy
- issuedBy
- issuedAt
- returnedAt
- createdAt
- updatedAt

Use references to Users and Resources.

## 12.4 Notifications

Fields:

- _id
- userId
- bookingId
- title
- message
- type
- isRead
- createdAt

### Indexing

Create appropriate indexes for:

- Unique email.
- Resource category.
- Resource operational status.
- Booking resourceId and time fields.
- Booking userId and createdAt.
- Notification userId and read status.

Use pagination for resource and booking listings.

---

# 13. Backend API Requirements

Base URL:

`/api`

All APIs should follow a consistent JSON response structure.

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register | Student registration |
| POST | /auth/login | Login |
| GET | /auth/me | Current user |
| PATCH | /auth/profile | Update profile |

## Resources

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /resources | Get resources |
| GET | /resources/:id | Get resource details |
| GET | /resources/:id/availability | Check availability |
| POST | /resources | Create resource (Admin) |
| PATCH | /resources/:id | Update resource (Admin) |
| PATCH | /resources/:id/status | Update status (Admin) |
| DELETE | /resources/:id | Archive resource (Admin) |

## Bookings

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /bookings | Create booking |
| GET | /bookings/my | Student booking history |
| GET | /bookings | All bookings (Admin) |
| GET | /bookings/:id | Booking details |
| PATCH | /bookings/:id/cancel | Cancel booking |
| PATCH | /bookings/:id/decision | Approve or reject |
| PATCH | /bookings/:id/issue | Issue equipment |
| PATCH | /bookings/:id/return | Return equipment |

## Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /notifications | Get notifications |
| PATCH | /notifications/:id/read | Mark as read |
| PATCH | /notifications/read-all | Mark all as read |

## Admin Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /admin/dashboard-summary | Dashboard statistics |

All admin endpoints must have both authentication and admin authorization.

All user-specific operations must check ownership.

---

# 14. Environment Configuration

## Backend Environment

`backend/.env.example`

Include:

- PORT
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- NODE_ENV
- ADMIN_NAME
- ADMIN_EMAIL
- ADMIN_PASSWORD
- FRONTEND_ORIGIN (where applicable)

The actual `.env` must never be committed to GitHub.

## Frontend Environment

`frontend/.env.example`

Include:

- EXPO_PUBLIC_API_URL

The API URL must be configurable for local development and production.

Do not put secrets in Expo public environment variables.

### Android Connectivity

Do not assume `localhost` will work from a physical Android device.

Configure the development machine's reachable LAN address when testing on a physical device, and use the appropriate emulator host address when using an Android emulator.

The production APK must use a deployed backend URL.

---

# 15. Security Requirements

1. Hash passwords with bcrypt.
2. Use JWT authentication.
3. Protect private API endpoints.
4. Implement role-based authorization.
5. Validate request bodies on the backend.
6. Check booking ownership.
7. Prevent students from accessing admin operations.
8. Never trust frontend role information.
9. Keep database credentials in environment variables.
10. Configure CORS appropriately.
11. Avoid exposing password hashes.
12. Use proper HTTP status codes.
13. Add reasonable rate limits to authentication endpoints.
14. Validate resource and booking IDs.
15. Handle transaction conflicts safely.

---

# 16. Non-Functional Requirements

### Performance

- Use pagination.
- Optimize resource images.
- Avoid unnecessary API calls.
- Use efficient queries and indexes.
- Provide loading indicators.

### Reliability

- Prevent overbooking.
- Maintain valid booking status transitions.
- Handle concurrent booking requests.
- Handle API failures.
- Maintain consistent inventory data.

### Usability

- Easy navigation.
- Simple booking workflow.
- Clear availability status.
- Consistent design.
- Meaningful messages.

### Maintainability

- Modular frontend architecture.
- Modular backend architecture.
- Reusable UI components.
- Centralized API client.
- Centralized error handling.
- Clear naming conventions.
- Independent frontend and backend projects.

---

# 17. Testing Requirements

Test the following:

## Authentication
- Student registration.
- Login.
- Invalid credentials.
- Duplicate email.
- Admin login.
- Student access restriction.

## Resource Management
- Resource listing.
- Resource search.
- Category filters.
- Resource details.
- Admin resource creation.
- Resource editing.
- Maintenance status.
- Resource archiving.

## Booking System
- Valid booking.
- Invalid date range.
- Invalid quantity.
- Unavailable inventory.
- Non-overlapping bookings.
- Partially overlapping bookings.
- Fully overlapping bookings.
- Concurrent booking requests.
- Cancellation.
- Booking ownership.

## Admin Workflow
- Approve booking.
- Reject booking.
- Mandatory rejection reason.
- Issue equipment.
- Return equipment.
- Prevent invalid status transitions.
- Identify overdue bookings.

## Notifications
- Create booking notification.
- Approve notification.
- Reject notification.
- Read notification.
- Notification ownership.

Test both frontend and backend independently, then test the complete application integration.

---

# 18. Features Outside MVP Scope

To finish the assignment within the submission deadline, these features are optional future enhancements:

- QR code equipment issuing and return.
- Push notifications.
- Online payments.
- Recurring bookings.
- Advanced analytics.
- Automated fines.
- Multi-college management.
- Advanced maintenance scheduling.

Complete all mandatory MVP features before implementing enhancements.

---

# 19. Development Priorities

## Priority 1 — Mandatory

- Frontend/backend separation.
- Backend setup.
- Database connection.
- Authentication.
- Role-based access.
- Resource management.
- Resource listing and filtering.
- Booking creation.
- Availability calculation.
- Double booking prevention.
- Admin approval and rejection.
- Equipment issuing and return.
- Booking history.
- In-app notifications.
- Admin dashboard.
- Backend integration.
- APK generation.

## Priority 2 — Enhancements

- Push notifications.
- QR code.
- Advanced booking calendar.
- Analytics.
- Advanced resource image upload.

---

# 20. Final Acceptance Criteria

The project will be considered complete when:

1. Frontend exists exclusively inside `frontend/`.
2. Backend exists exclusively inside `backend/`.
3. Both folders have independent package files.
4. React Native application runs successfully.
5. Express server runs successfully.
6. MongoDB Atlas connection works.
7. Student registration and login work.
8. Admin authentication works.
9. Role-based authorization works.
10. Students can browse and search resources.
11. Admins can manage resources.
12. Students can submit booking requests.
13. Backend calculates accurate availability.
14. Backend prevents overbooking.
15. Admins can approve and reject requests.
16. Admins can issue and return equipment.
17. Students can view booking history.
18. In-app notifications work.
19. Admin dashboard statistics are database-driven.
20. Application handles loading, errors, and empty states.
21. The production mobile application communicates with the deployed backend.
22. Android APK is generated and installable.
23. Complete GitHub source code and documentation are available.

---

# 21. Final Deliverables

The final submission must contain:

- Complete React Native frontend.
- Complete Node.js backend.
- MongoDB integration.
- Separate frontend and backend folders.
- `.env.example` files.
- Admin seed script.
- API documentation.
- Complete README.
- GitHub repository link.
- Android APK.
- Google Drive APK link.

**Final Product Goal:**

Build e-Booking as a professional, fully functional, secure and user-friendly mobile resource booking platform that replaces manual institutional booking processes with a centralized digital system.