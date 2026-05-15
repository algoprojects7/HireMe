# HireMe Platform — Official System Documentation Report

**Document Type:** Confidential Founder's Technical Report  
**Platform Name:** HireMe — Unorganized Workers' Professional Trust Ecosystem  
**Version:** 1.0.0 (Production-Ready)  
**Report Date:** May 15, 2026  
**Prepared By:** Core Engineering Team  
**Repository:** https://github.com/algoprojects7/HireMe  

---

> **NOTICE:** This document is confidential and intended solely for the founding team and authorized technical personnel. It serves as the master reference for the system architecture, financial flows, security policies, and roadmap. Any new module additions must be reviewed against this document before implementation.

---

## Table of Contents

1. [Project Vision and Mission](#1-project-vision-and-mission)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema & Data Models](#4-database-schema--data-models)
5. [Authentication & Identity Management](#5-authentication--identity-management)
6. [KYC & Document Verification Module](#6-kyc--document-verification-module)
7. [Worker & Group Leader Module](#7-worker--group-leader-module)
8. [Live Map Tracking & Discovery Module](#8-live-map-tracking--discovery-module)
9. [Booking & Escrow Module](#9-booking--escrow-module)
10. [Wallet & Financial Module](#10-wallet--financial-module)
11. [Support & Helpdesk Module](#11-support--helpdesk-module)
12. [Skills Management Module](#12-skills-management-module)
13. [Security Architecture](#13-security-architecture)
14. [Platform Fee & Revenue Model](#14-platform-fee--revenue-model)
15. [Visitor-to-Provider Conversion Flow](#15-visitor-to-provider-conversion-flow)
16. [API Reference Summary](#16-api-reference-summary)
17. [Legal & Compliance Provisions](#17-legal--compliance-provisions)
18. [Deployment & Environment Configuration](#18-deployment--environment-configuration)
19. [Roadmap for Future Modules](#19-roadmap-for-future-modules)
20. [Glossary](#20-glossary)

---

## 1. Project Vision and Mission

### Vision
HireMe envisions a world where every skilled worker, regardless of their background, community, or gender, has equal access to professional opportunities through a fair and transparent digital platform.

### Mission
To create a trust-based, bias-free marketplace that connects unorganized workers and organized labor agencies (Group Leaders) with service providers (customers/hirers) across Guwahati and beyond, leveraging technology to ensure identity verification, secure payments, and real-time discovery.

### Core Principles
- **Zero Bias**: The platform is strictly free from gender, religion, caste, and community discrimination in its matching and discovery algorithms.
- **Privacy First**: Worker personal data (phone numbers, home addresses) is never exposed to providers. Only skill and location are visible.
- **Trust by Design**: Every worker must complete KYC before appearing on the platform's live map. Every financial transaction is secured by a mutual-confirmation escrow mechanism.
- **Inclusivity**: The platform caters equally to individual workers AND organized groups under a Group Leader / Agency Head hierarchy.

---

## 2. System Architecture Overview

HireMe is built as a **Turborepo Monorepo**, a modern multi-application architecture that allows the frontend, backend, database layer, and shared UI library to be developed, tested, and deployed as a cohesive single unit while maintaining independent scalability.

```
HireMe/
├── apps/
│   ├── admin/          # Next.js 14 Frontend (Dashboard, Auth, Public Map)
│   └── api/            # NestJS Backend (REST API, Business Logic)
├── packages/
│   ├── database/       # Prisma ORM + PostgreSQL Schema
│   ├── ui/             # Shared React Component Library (MapView, Buttons, etc.)
│   └── types/          # Shared TypeScript Types & Enums
└── docs/               # Project Documentation (this file)
```

### Communication Flow
```
Provider/Worker Browser (Next.js)
         │
         │  HTTPS / REST API calls
         ▼
   NestJS REST API (Port 3001)
         │
         │  Prisma Client Queries
         ▼
   PostgreSQL Database (Port 5432)
         │
         │  (Future) Redis for session caching
         ▼
   Redis Cache (Port 6379)
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | 14.x | Server components, routing, SSR |
| **Frontend Language** | TypeScript | 5.x | Type safety across all components |
| **Frontend Styling** | Tailwind CSS | 3.x | Utility-first design system |
| **Map Integration** | Google Maps / Leaflet | Latest | Real-time worker tracking |
| **Backend Framework** | NestJS | 10.x | Modular REST API architecture |
| **Backend Language** | TypeScript | 5.x | Consistent language across stack |
| **ORM** | Prisma | 6.x | Type-safe database queries |
| **Database** | PostgreSQL | 15.x | Primary relational database |
| **Cache / Queue** | Redis | 7.x | Session tokens, future job queues |
| **Authentication** | JWT (JSON Web Tokens) | — | Stateless auth tokens |
| **Monorepo Tool** | Turborepo | Latest | Unified builds, caching |
| **Package Manager** | pnpm | Latest | Fast, disk-efficient dependency management |
| **Payment Gateway** | Razorpay | Latest | Payment processing and payouts |
| **Deployment** | To be configured | — | Vercel (Frontend), Railway/Render (API) |

---

## 4. Database Schema & Data Models

All models are defined in `packages/database/prisma/schema.prisma`.

### Core Models

#### User
The root identity record for every person on the platform.
| Field | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary identifier |
| `name` | String | Display name |
| `phone` | String (unique) | Login credential |
| `role` | Enum | `ADMIN`, `PROVIDER`, `WORKER` |
| `kycStatus` | Enum | `NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED` |

#### Worker
Extended profile for users with the `WORKER` role.
| Field | Type | Description |
|---|---|---|
| `userId` | String | FK → User |
| `isAvailable` | Boolean | Live availability toggle |
| `currentLat/Lng` | Float | GPS coordinates |
| `isGroupLeader` | Boolean | Group leadership flag |
| `groupSize` | Int | Number of workers in group |
| `leaderId` | String (nullable) | FK → Self (Leader's Worker ID) |

#### Booking
Central transaction record linking Providers, Workers, and financial data.
| Field | Type | Description |
|---|---|---|
| `amount` | Float | Total amount charged to Provider (incl. 5% fee) |
| `platformFee` | Float | Total platform revenue from this booking |
| `workerEarning` | Float | Net amount released to Worker/Leader |
| `isAdvancePaid` | Boolean | Whether advance payment is confirmed |
| `paymentStatus` | String | `UNPAID`, `ADVANCE_PAID`, `PAID_FULL` |
| `workerFeedback` | Boolean | Worker confirms "No Issues" |
| `providerFeedback` | Boolean | Provider confirms "No Issues" |

#### Wallet
Financial account for every user.
| Field | Type | Description |
|---|---|---|
| `balance` | Float | Current available balance in INR |
| `ledger` | WalletLedger[] | Full transaction history |
| `withdrawals` | WithdrawalRequest[] | Payout request records |

#### WithdrawalRequest
Tracks every request made by a worker/leader to withdraw funds.
| Field | Type | Description |
|---|---|---|
| `amount` | Float | Amount requested for withdrawal |
| `fee` | Float | 2.5% gateway service charge |
| `netAmount` | Float | Amount actually transferred |
| `status` | String | `PENDING`, `APPROVED`, `COMPLETED`, `REJECTED` |
| `accountInfo` | String | UPI ID or Bank Account details |

#### SupportTicket & SupportMessage
Internal helpdesk for platform disputes and queries.

#### Skill & WorkerSkill
Structured skill taxonomy linked to workers with proficiency levels (1–5 scale).

---

## 5. Authentication & Identity Management

### Login Method
- **OTP-Based Phone Login**: Workers and providers log in using their registered mobile number + OTP.
- **JWT Tokens**: Upon successful login, a signed JWT is issued containing `userId`, `role`, and `tenantId`. All subsequent API requests must include this token in the `Authorization: Bearer <token>` header.

### QR-Code Quick Login
- Approved KYC workers receive a unique QR code.
- Scanning the QR code on a browser session initiates a passwordless login, validated via a unique token linked to the worker's KYC record.
- **Use case**: Workers operating in environments with shared devices (labor centers, community hubs).

### Role-Based Access Control (RBAC)
| Role | Permissions |
|---|---|
| `ADMIN` | Full system access: KYC approval, support resolution, financial oversight |
| `PROVIDER` | Browse map (public), book workers, manage own bookings |
| `WORKER` | Manage own profile, availability, skills, KYC, wallet |

---

## 6. KYC & Document Verification Module

### Purpose
To ensure every worker visible on the platform's live map is a verified, real individual.

### Workflow
1. **Submission**: Worker uploads Aadhaar card number, PAN card number, and a selfie/photo via the KYC dashboard.
2. **Pending Review**: KYC status transitions from `NOT_SUBMITTED` → `PENDING`.
3. **Admin Review**: Admin reviews the documents in the Admin KYC dashboard.
4. **Decision**:
   - `APPROVED`: Worker's `kycStatus` is updated. Worker becomes eligible to appear on the live map and receive bookings.
   - `REJECTED`: Admin adds a comment explaining the rejection. Worker can resubmit.

### Privacy Note
KYC document images (Aadhaar, PAN) are stored in a secure file storage system (future: AWS S3 or Vercel Blob). They are never transmitted to Providers or displayed on the public map.

---

## 7. Worker & Group Leader Module

### Individual Worker
- A standard worker who registers, completes KYC, and makes themselves available for hire.
- Appears as a single marker on the live map.
- Earns money directly into their own wallet.

### Group Leader / Agency Head
- A worker who registers as a "Group Leader" representing a team of workers.
- Provides the `groupSize` (number of workers in their team) during registration.
- Appears on the map with a **Purple "Group Leader" indicator** and the team count badge.
- **All earnings** for any worker in the group are automatically directed to the Leader's wallet.
- Providers can hire an entire team by contacting the Leader, negotiating in person, and settling the total team cost through the platform.

### Self-Referential Database Relation
Workers are connected via a self-referential `leaderId` field in the `Worker` model:
```prisma
leader   Worker?  @relation("GroupMembers", fields: [leaderId], references: [id])
members  Worker[] @relation("GroupMembers")
```

---

## 8. Live Map Tracking & Discovery Module

### Features
- **Interactive Map**: Built using Google Maps / Leaflet.js, centered on Guwahati.
- **Skill-Based Filtering**: Providers can filter the map by skill (Electrician, Plumber, Carpenter, etc.).
- **Area-Based Filtering**: 12 predefined areas of Guwahati can be selected.
- **Live Markers**: Workers are shown as colored markers. Group Leaders have a distinctive purple highlight.

### Supported Areas
Hatigaon, Bhangagarh, Ganeshguri, Noonmati, Beltola, Basistha, Dispur, Zoo Road, Sundarbari, Jalukbari, Adabari, Khanapara.

### Visitor (Public) Access
- The map is publicly accessible **without login** for browsing and discovery.
- When a visitor attempts to contact a worker (Message or Call), the system captures their **Booking Intent** and redirects them to Register / Login.
- After authentication, the system restores the intent, returning them to the exact worker they were viewing.

### Privacy & Anti-Bias Enforcement
- Phone numbers are **never** shown on the map.
- Worker's religion, gender, and caste are not data fields on the platform.
- Discovery is driven purely by: **Skill + Location + Availability + KYC Verified Status**.

---

## 9. Booking & Escrow Module

### Booking Lifecycle

```
Provider Books Worker
         │
         ▼
  [PENDING] Booking Created
  (isAdvancePaid = false)
         │
         ▼
  Provider Pays Advance
  POST /bookings/:id/advance-pay
  (isAdvancePaid = true, paymentStatus = ADVANCE_PAID)
         │
         ▼
  Work is Performed
         │
         ▼
  Worker Submits Feedback: "No Issues"
  POST /bookings/:id/feedback
  (workerFeedback = true)
         │
         ▼
  Provider Submits Feedback: "No Issues"
  POST /bookings/:id/feedback
  (providerFeedback = true)
         │
         ▼
  BOTH Confirmed → finalizeBooking() triggered
  (status = COMPLETED, paymentStatus = PAID_FULL)
  Worker Earning credited to Worker/Leader Wallet
```

### Unresolved Dispute
If either party does not submit "No Issues," the funds remain in escrow. A **Support Ticket** can be raised, and the Admin may intervene to resolve the dispute manually.

---

## 10. Wallet & Financial Module

### Wallet Overview
Every registered user has an associated `Wallet` auto-created upon registration. The wallet tracks:
- **Balance**: Current available funds (INR).
- **Ledger**: Complete history of every CREDIT and DEBIT transaction.
- **Withdrawals**: All payout requests and their statuses.

### Credit Events
| Event | Amount Credited |
|---|---|
| Booking Finalized (Mutual Confirmation) | `workerEarning` (Base Amount - 5% Platform Fee) |

### Debit Events
| Event | Amount Debited |
|---|---|
| Withdrawal Request | Requested Amount (2.5% Fee is auto-deducted) |

### Withdrawal Process
1. Worker/Leader navigates to Wallet Dashboard → "Withdraw Funds."
2. Enters the withdrawal amount and UPI/Bank details.
3. System calculates and displays: **Net Payout = Amount - 2.5% Fee.**
4. On confirmation, balance is immediately debited, a `WithdrawalRequest` record is created, and a ledger entry is made.
5. Admin processes the actual bank transfer via Razorpay.

---

## 11. Support & Helpdesk Module

### Purpose
Provides a structured, traceable channel for resolving disputes, reporting issues, and getting platform support.

### Ticket Lifecycle
1. **Created**: User raises a ticket with a subject and message.
2. **Open**: Ticket is visible in Admin's support dashboard.
3. **In Progress**: Automatically triggered when an Admin replies to the ticket.
4. **Resolved**: Admin explicitly marks the ticket as resolved.

### Access Control
- **Users (Worker/Provider)**: Can view and reply only to their own tickets.
- **Admin**: Can view all tickets, filter by status, and send official resolution replies.

---

## 12. Skills Management Module

### Purpose
Allows workers to maintain a structured, verifiable skill profile.

### Skill Taxonomy
Skills are centrally managed by the Admin and include categories like:
- Electrician, Plumber, Carpenter, Mason, Painter
- Domestic Worker, Gardener, Cook, Driver
- Security Guard, Loader/Unloader, etc.

### Worker Skill Profile
- Workers can add skills from the predefined taxonomy.
- Each skill is assigned a **Proficiency Level** from 1 to 5 (1=Beginner, 5=Expert).
- Skills are used by the map's filtering system for accurate discovery.

---

## 13. Security Architecture

### Authentication
- All sensitive endpoints are protected by `JwtAuthGuard`.
- Role-specific endpoints use `RolesGuard` with the `@Roles()` decorator.
- Public endpoints (map search, disclaimer, skill listing) explicitly bypass auth guards.

### Data Protection
- Passwords are hashed using bcrypt.
- JWT secrets are stored in environment variables, never in code.
- KYC documents use presigned URLs for secure, time-limited access.

### Financial Security
- All wallet mutations (credit, debit) are wrapped in **Prisma Transactions** (`$transaction`) to ensure atomicity. If any step fails, the entire operation is rolled back.

---

## 14. Platform Fee & Revenue Model

| Party | Fee Type | Percentage | Trigger |
|---|---|---|---|
| **Provider** | Convenience Fee (Platform Surcharge) | +5% | Added on top of quoted booking amount |
| **Worker/Leader** | Service Fee (Platform Deduction) | -5% | Deducted from worker's earning |
| **Worker/Leader** | Withdrawal Fee (Gateway Cost) | -2.5% | Applied on every withdrawal request |

### Revenue Example
For a ₹1,000 booking:
- Provider pays: **₹1,050** (₹1,000 + 5%)
- Worker receives: **₹950** into wallet (₹1,000 - 5%)
- **Platform Revenue: ₹100 (10%)**

For a ₹950 withdrawal:
- Worker receives: **₹926.25** in bank (₹950 - 2.5%)
- **Gateway Cost: ₹23.75**

---

## 15. Visitor-to-Provider Conversion Flow

This flow is exclusive to the **web-based application**.

```
Visitor opens Map → Browses Workers (No Login Required)
         │
         ▼
Visitor clicks "Message" or "Hire"
         │
         ▼
System detects: User NOT authenticated
         │
         ▼
Booking Intent saved to localStorage:
{ worker, skillId, area, action }
         │
         ▼
Visitor redirected to: /auth/login?redirect=/dashboard/map&reason=auth_required
         │
         ▼
Visitor Registers (if new) → Logs In
         │
         ▼
System detects intent in localStorage → Restores selected worker
         │
         ▼
Visitor is now a registered Provider → Proceeds to Booking Confirmation
```

---

## 16. API Reference Summary

All API routes are prefixed with `/api/v1`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Login with phone + OTP |
| `POST` | `/auth/register` | Public | New user registration |
| `GET` | `/workers/search` | Public | Search workers by skill/area |
| `GET` | `/workers/skills` | Public | List all available skills |
| `POST` | `/bookings` | JWT | Create a new booking |
| `POST` | `/bookings/:id/advance-pay` | JWT | Mark advance payment done |
| `POST` | `/bookings/:id/feedback` | JWT | Submit mutual confirmation |
| `GET` | `/bookings/disclaimer` | Public | Get platform legal disclaimer |
| `GET` | `/wallets/me` | JWT | Get own wallet & ledger |
| `POST` | `/wallets/withdraw` | JWT | Request withdrawal |
| `GET` | `/wallets/withdrawals` | JWT | View withdrawal history |
| `POST` | `/kyc` | JWT | Submit KYC documents |
| `PATCH` | `/kyc/:id/review` | Admin JWT | Admin approve/reject KYC |
| `POST` | `/support` | JWT | Create support ticket |
| `POST` | `/support/:id/message` | JWT | Reply to ticket |
| `GET` | `/support/admin` | Admin JWT | View all tickets |

---

## 17. Legal & Compliance Provisions

### Platform Liability Disclaimer
*"HireMe is only responsible for bookings and payments that have been formally approved and processed through this platform. In the event that work is commenced without a confirmed advance payment or explicit booking approval within the application, HireMe — the platform — will bear no responsibility for any inconvenience, financial disputes, theft, security issues, or any other unsocial activities that may arise between the hiring party and the worker or group leader."*

This disclaimer is:
1. Displayed on the **Wallet Dashboard** for all registered users.
2. Available as a **public API endpoint** `/bookings/disclaimer` for visitor access before registration.
3. Shown in the **Booking Confirmation Form** before any payment is processed.

### Data Privacy
- Worker personal information (phone number, home address, document details) is never exposed to Providers.
- All KYC document images are stored in a secure, encrypted cloud storage bucket with access restricted to Admin accounts only.

---

## 18. Deployment & Environment Configuration

### Required Environment Variables (`.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hireme_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRY="7d"

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID="rzp_live_xxxxxx"
RAZORPAY_KEY_SECRET="xxxxxx"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."

# File Storage (KYC Documents)
STORAGE_BUCKET_URL="https://your-bucket.s3.amazonaws.com"
STORAGE_ACCESS_KEY="your-key"
STORAGE_SECRET_KEY="your-secret"
```

### Running the Platform (Development)
```bash
# Install dependencies
pnpm install

# Push database schema
cd packages/database && npx prisma db push

# Start all services
pnpm run dev
```

---

## 19. Roadmap for Future Modules

The following modules have been identified and must be reviewed against this document before implementation:

| Priority | Module | Description |
|---|---|---|
| **High** | Real GPS Integration | Connect mobile GPS feeds from Worker app to `currentLat/Lng` fields |
| **High** | Razorpay Webhooks | Automate bank transfers upon Admin approval of `WithdrawalRequest` |
| **High** | Mobile App (React Native) | Native Android/iOS app for workers to manage availability on the go |
| **Medium** | AI Worker Matching | Suggest the best worker based on skill, proximity, and rating |
| **Medium** | Rating & Review System | Post-booking ratings to build a Trust Score for each worker |
| **Medium** | Messaging System | In-app secure chat between Provider and Worker/Leader |
| **Low** | Analytics Dashboard | Admin revenue dashboard showing daily/monthly earnings |
| **Low** | Multi-city Expansion | Extend GUWAHATI_AREAS config to support other cities |
| **Low** | Aadhaar OTP Verification | Integrate UIDAI API for real-time Aadhaar number validation |

### Module Addition Protocol
Before any new module is built:
1. The feature must be documented in the **Proposed Modules** section of this report.
2. A new database schema migration must be reviewed and approved.
3. API endpoints must follow the existing RBAC and security patterns.
4. The walkthrough document at `docs/walkthrough.md` must be updated.

---

## 20. Glossary

| Term | Definition |
|---|---|
| **Worker** | A registered, KYC-verified individual available for hire on the platform |
| **Provider** | A customer/hirer who books workers for services |
| **Group Leader** | A worker who represents and manages a team of workers |
| **Escrow** | A financial arrangement where payment is held by the platform and released only upon mutual confirmation |
| **Mutual Confirmation** | The mechanism where both Worker and Provider must confirm "No Issues" to release held funds |
| **KYC** | Know Your Customer — the identity verification process using government-issued documents |
| **Wallet** | The digital account holding a user's platform earnings and available balance |
| **Withdrawal Request** | A formal request to transfer wallet funds to an external bank/UPI account |
| **Platform Fee** | The percentage charged by HireMe from both parties per transaction |
| **Booking Intent** | The preserved data about a visitor's hiring interest, retained across the auth flow |
| **RBAC** | Role-Based Access Control — the system for restricting API access based on user roles |
| **Tenant** | An organizational entity within the multi-tenant system structure |

---

*End of HireMe System Documentation Report v1.0*  
*This document must be updated whenever a new module is added or an existing module is significantly modified.*  
*Next Review Date: As required, before any major feature release.*

---

**Prepared and certified by the HireMe Engineering Team.**  
**Date:** May 15, 2026
