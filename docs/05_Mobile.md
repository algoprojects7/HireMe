# Phase 5: Mobile App Documentation

The mobile application is a unified platform for both **Workers** and **Owners**, built with **Expo (React Native)**.

## 📱 Unified Experience
- **Role-Based Entry**: Users select their role (Worker/Owner) upon first entry, tailoring the entire UX.
- **Shared Code**: Leverages `@repo/types` and `@repo/api` clients for a single source of truth.

## 👷 Worker Features
- **Registration**: Quick KYC and skill selection.
- **Availability**: One-tap "Go Online" toggle with GPS tracking.
- **Wallet**: Real-time earnings view and withdrawal requests.

## 🏠 Owner Features
- **Worker Search**: Search by skill and distance.
- **Booking**: Instant booking with payment integration.
- **Ratings**: Post-service feedback loop.

## 🛠 Mobile Tech Stack
- **Framework**: Expo (SDK 52+).
- **Navigation**: React Navigation (Stack and Tab).
- **Icons**: Lucide React Native.
- **Location**: Expo Location for real-time GPS.
