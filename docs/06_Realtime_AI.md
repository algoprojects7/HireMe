# Phase 6: Real-time & AI Documentation

## 🧠 AI Recommendation Engine
The platform uses a proprietary scoring algorithm to ensure the best matches:
- **Scoring Weights**:
  - Distance (50%): Preference for nearest workers.
  - Rating (30%): Preference for high-rated workers.
  - Verification (20%): Priority for verified workers.
- **Intelligent Search**: LLM-powered parsing of natural language queries to extract worker skills and intent.

## ⚡ Real-time Notifications
- **Socket.io Gateway**: Bi-directional communication channel.
- **Triggers**:
  - New Booking Request (sent to worker).
  - Booking Accepted (sent to owner).
  - Payment Confirmed (sent to all parties).
- **Persistence**: Every socket event is backed by a database record in the `Notification` table.

## 📍 Live Maps Integration
- **Live Tracking**: Real-time worker GPS pings visualized on the admin dashboard.
- **Nearby Search**: Radius-based querying to find workers within a specific KM range.
