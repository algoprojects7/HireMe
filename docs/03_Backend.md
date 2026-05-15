# Phase 3: Backend API Documentation

The backend is built with **NestJS**, following an enterprise-grade modular architecture.

## 🔑 Authentication & Authorization
- **JWT Strategy**: Secure token-based auth with refresh rotation support.
- **RBAC**: Role-Based Access Control using custom decorators and guards.
  - `ADMIN`: Platform-wide access.
  - `TENANT_ADMIN`: Restricted to specific tenant data.
  - `WORKER`: Access to jobs and wallet.
  - `CUSTOMER`: Access to booking workers.

## 📦 Core Modules
- **AuthModule**: Handles login, registration, and token validation.
- **WorkersModule**: Profile management, KYC verification, and availability toggling.
- **BookingsModule**: Lifecycle management (Pending → Confirmed → In Progress → Completed).
- **WalletsModule**: Ledger-based financial system with strict credit/debit validation.

## 🛠 Database Integration
- **Prisma 7 Client**: Type-safe database operations.
- **Global DatabaseModule**: Singleton instance of the Prisma client shared across all modules.

## 📡 API Standards
- **Global Validation**: All inputs validated via `class-validator` DTOs.
- **Exception Handling**: Standardized JSON error responses.
- **Versioning**: API versioning supported via URL prefix (e.g., `/api/v1`).
