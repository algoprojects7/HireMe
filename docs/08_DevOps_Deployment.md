# Phase 8: DevOps & Deployment Documentation

The platform is optimized for deployment on VPS instances using Docker and modern deployment tools like Dokploy.

## 🐳 Dockerization
Each component is containerized:
- **API**: Node.js base image, optimized for NestJS.
- **Admin**: Next.js standalone build.
- **Database**: PostgreSQL with PostGIS extension.
- **Redis**: Caching and Socket.io adapter.

## 🚀 Deployment Workflow (Dokploy & Hostinger)

### 1. Server Preparation
- Purchase a VPS from **Hostinger** (Ubuntu 22.04 LTS recommended).
- Install **Dokploy** by running their one-line installer:
  ```bash
  curl -sSL https://dokploy.com/install.sh | sh
  ```

### 2. Database Setup
- Use Dokploy's "Databases" feature to spin up a **PostgreSQL** instance.
- Copy the Connection String for the next step.

### 3. Application Deployment
- Create two "Applications" in Dokploy: one for the **API** and one for the **Admin Portal**.
- **Source**: Connect your GitHub repository.
- **Root Directory**: Keep it as `./`.
- **Dockerfile Path**: 
  - For API: `apps/api/Dockerfile`
  - For Admin: `apps/admin/Dockerfile`

### 4. Environment Variables
Set the following in Dokploy's Environment tab:
- **API**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `JWT_SECRET`: A strong random string.
- **Admin**:
  - `NEXT_PUBLIC_API_URL`: The public domain of your API (e.g., `https://api.yourdomain.com`).

### 5. Domain & SSL
- Point your Hostinger DNS records to the VPS IP.
- Use Dokploy's "Domains" feature to assign your domain and enable Let's Encrypt SSL.

## 🛡 Security Hardening
- **SSL**: Mandatory for all endpoints.
- **Rate Limiting**: Throttler in NestJS.
- **Headers**: Helmet.js for secure headers.
- **Secrets**: Encrypted environment variables.

## 📊 Monitoring
- **Logs**: Centralized logging via Docker.
- **Health Checks**: `/health` endpoint for uptime monitoring.
