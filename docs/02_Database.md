# Database Architecture - Unorganized Employee Management System

## 1. Overview
The database is designed to handle multi-tenancy, real-time availability, and secure financial transactions. We use PostgreSQL as the primary relational engine with Prisma ORM for type safety.

## 2. Core Entities & Relationships

### Identity & Access
- **User**: Core user account (Email, Password, Role, TenantID).
- **Role & Permission**: Granular access control for different user types.
- **Tenant**: Multi-tenant isolation entity.

### Worker Module
- **Worker**: Profile data, verification status (Aadhaar, Face), skills.
- **Skill**: Master list of available service skills.
- **WorkerSkill**: Mapping between workers and their expertise levels.
- **Availability**: Time-slots and status of workers.

### Customer & Booking
- **Customer**: Profile data for those hiring workers.
- **Booking**: The core transaction (Worker, Customer, Time, Amount, Status).
- **BookingHistory**: Audit log of all state changes for a booking.

### Financials
- **Wallet**: Per-user digital wallet for payments and payouts.
- **WalletLedger**: Immutable record of all credits and debits.
- **Payment**: Integration with payment gateways (Razorpay/Stripe).
- **Payout**: Record of money sent to worker bank accounts.

### Location & Analytics
- **GeoLocation**: Real-time GPS pings from workers.
- **Review & Rating**: Feedback loop for quality control.
- **Report**: System-wide analytics for admins and tenants.

## 3. Multi-tenancy Strategy
- **Shared Database, Shared Schema**: All tenants share the same tables.
- **TenantID Isolation**: Every relevant table includes a `tenantId` column.
- **Indexing**: Composite indexes on `(tenantId, id)` to optimize tenant-specific queries.

## 4. Scalability & Performance
- **Indexing Strategy**: 
  - GIST indexes for `GeoLocation` to support "nearby" searches.
  - B-tree indexes on foreign keys and frequently filtered columns (`status`, `type`).
- **Query Optimization**: 
  - Use of Prisma includes sparingly; prefer targeted select for performance.
  - Read replicas for heavy reporting (future phase).

## 5. Security & Auditing
- **Soft Delete**: All major entities use `deletedAt` for audit trail preservation.
- **Audit Logs**: `AdminLogs` table to track sensitive admin actions.
- **Encryption**: Sensitive IDs and PII (Aadhaar) will be encrypted at rest if required.
