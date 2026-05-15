# Phase 4: Frontend Documentation

The administrative and tenant dashboards are built with **Next.js 15+** and **Tailwind CSS v4**.

## 🎨 Design Language
- **Aesthetics**: Premium "Glassmorphic" UI with dark mode as default.
- **Components**: Built with a custom design system in `@repo/ui`, utilizing `class-variance-authority` (CVA) for styling variants.
- **Animations**: Subtle micro-interactions and smooth transitions.

## 🏗 App Structure
- **App Router**: Using the latest Next.js patterns for routing and layouts.
- **Dashboard Layouts**: Persistent sidebar and header with role-based navigation.
- **Client Components**: Optimized for interactivity (Forms, Maps, Stats).

## 🧠 State Management
- **Zustand**: Lightweight, persistent store for user authentication and session data.
- **Auth Interceptor**: Axios instance automatically attaches JWT tokens to outgoing requests.

## 📊 Pages
- **Auth UI**: High-fidelity login and registration pages.
- **Overview**: Real-time stats and analytics cards.
- **Worker Management**: Tabular view with filtering and verification status.
- **Live Tracking**: Map-based visualization of worker locations.
