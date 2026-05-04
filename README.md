# Incident Management System (NOC Dashboard)

A high-throughput incident management system built with NestJS and Next.js, featuring real-time signal processing, debouncing, and automated state management.

## 🚀 Setup & Execution

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### Steps
1. **Clone & Explore:**
   ```bash
   git clone <repo-url>
   cd incident-management-system
   ```

2. **Launch Infrastructure:**
   ```bash
   docker-compose up -d
   ```
   *This starts PostgreSQL, MongoDB, Redis, and BullMQ.*

3. **Backend Initialization:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run start:dev
   ```

4. **Frontend Initialization:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🏗 Architecture

The system is designed for **99.99% availability** under extreme load, using professional-grade data engineering patterns.

```mermaid
flowchart TD
    subgraph cluster [IMS Cluster]
        api[Ingestion API]
        queue[(BullMQ / Redis)]
        worker[Signal Processor]
        pg[(PostgreSQL)]
        mongo[(MongoDB)]
    end

    api -->|Push| queue
    queue -->|Process| worker
    worker -->|Log| mongo
    api -->|Create| pg
    worker -->|Update| pg
```

### High-Throughput Design Patterns
*   **Producer-Consumer Decoupling:** The API responds immediately (HTTP 202) after pushing to Redis, preventing database latency from cascading to upstream services.
*   **Debouncing Strategy:** Redis handles a 10s debounce window per `componentId`. 10,000 signals for one component result in exactly **1 Work Item** in SQL and **10,000 Audit Logs** in NoSQL.
*   **Rate Limiting:** Global throttler prevents brute-force or runaway ingestion scripts from saturating the event loop.

### Infrastructure Resilience

*   **MongoDB Capped Collections:** Configured via [infra/docker/mongo-init.js](infra/docker/mongo-init.js) (500MB limit). Ensures the NoSQL "Data Lake" stays within bounds while providing circular buffering for signals.
*   **PostgreSQL Pre-seeding:** Core components are initialized via [infra/docker/postgres-init.sql](infra/docker/postgres-init.sql).
*   **Work Item State Pattern:** Business logic strictly enforces state transitions (OPEN → INVESTIGATING → RESOLVED → CLOSED).
*   **Strategy Pattern (Alerting):** Swappable logic for P0/P1 vs P2 alerts (Critical vs Standard).

## 🏆 Bonus: Non-Functional Excellence

Beyond the core requirements, this system implements several production-grade optimizations:

### 🛡️ Security & Stability Layer
*   **API Rate Limiting:** Implemented `@nestjs/throttler` to prevent DDoS attacks on the ingestion endpoint.
*   **Payload Validation:** Strict DTO validation to ensure malformed signals never reach the processing queue.
*   **CORS Protection:** Configured to restrict access only to the trusted frontend.

### ⚡ Performance & Scalability
*   **O(1) Debouncing:** Used Redis `SETEX` for constant-time check-and-set debouncing, ensuring high-frequency bursts (10k/sec) never overwhelm the RDBMS.
*   **Zero-Block Ingestion:** The producer (API) never waits for NoSQL or RDBMS writes; it hands off to the worker via a distributed queue (BullMQ).
*   **Capped Audit Logs:** MongoDB is configured as a Capped Collection, guaranteeing stable disk usage and high-speed sequential writes.

### 🔍 Enhanced Observability
*   **Live Throughput Monitoring:** Internal metrics engine prints real-time "Signals Per Second" to the console.
*   **Health Surveillance:** Dedicated `/health` probe for automated uptime monitoring and orchestrator integration.

---
**GitHub Repository:** [https://github.com/KhaleefZ/Incident-Management-System-IMS-](https://github.com/KhaleefZ/Incident-Management-System-IMS-)

## 🧪 Testing

### Automated Tests
```bash
cd backend
npm test # Runs unit tests for RCA validation and state transitions
```

### High-Volume Simulation
Run the burst script to simulate **10,000 signals/second**:
```bash
# From the root directory
npx ts-node infra/scripts/mock-failure.ts
```

### Observability
*   **Health:** `GET http://localhost:3001/health`
*   **Metrics:** Check backend terminal for `Throughput: X signals/sec` (updated every 5s).
