# Enterprise System Architecture - Unorganized Employee Management System

## 1. Overview
The platform is built as a multi-tenant SaaS application to manage unorganized workers. It follows a clean architecture pattern with a monorepo approach for shared logic, types, and UI components.

## 2. High-Level Architecture
```mermaid
graph TD
    subgraph ClientLayer [Client Layer]
        AdminUI[Admin Dashboard - Next.js]
        WorkerUI[Worker App - Expo/React Native]
        CustomerUI[Customer App - Next.js]
    end

    subgraph APILayer [API & Logic Layer]
        Gateway[API Gateway / NestJS API]
        AuthService[Auth Service - JWT/RBAC]
        BookingService[Booking & Matching Engine]
        WalletService[Wallet & Payment Service]
        AIService[AI Recommendation & Analytics]
    end

    subgraph DataLayer [Data Layer]
        Postgres[(PostgreSQL - Primary DB)]
        Redis[(Redis - Caching & Real-time)]
        S3[(S3/Storage - Aadhaar/Face Photos)]
    end

    subgraph SharedPackages [Shared Packages]
        Types[Shared Types]
        UIComp[Shared UI Components]
        Database[Prisma Client]
    end

    AdminUI --> Gateway
    WorkerUI --> Gateway
    CustomerUI --> Gateway

    Gateway --> AuthService
    Gateway --> BookingService
    Gateway --> WalletService
    Gateway --> AIService

    AuthService --> Postgres
    BookingService --> Postgres
    WalletService --> Postgres
    AIService --> Postgres

    Gateway --> Redis
    SharedPackages -.-> AdminUI
    SharedPackages -.-> WorkerUI
    SharedPackages -.-> CustomerUI
    SharedPackages -.-> Gateway
```

## 3. Technology Stack
- **Monorepo**: Turborepo
- **Backend**: NestJS, Prisma, PostgreSQL, Redis, Socket.io
- **Frontend**: Next.js, ShadCN UI, Tailwind CSS
- **Mobile**: Expo (React Native)
- **AI**: Gemini API / OpenAI API / LangChain
- **DevOps**: Docker, Dokploy, NGINX

## 4. Multi-tenancy Strategy
- **Isolation**: Tenant ID column in shared tables (Row-Level Security / Application Level filtering).
- **Configuration**: Tenant-specific branding and settings stored in `TenantSettings` table.

## 5. Security
- **Authentication**: JWT with Refresh Token Rotation.
- **Authorization**: RBAC (Role-Based Access Control).
- **Compliance**: Input sanitization, rate limiting, and encrypted storage for sensitive data.
