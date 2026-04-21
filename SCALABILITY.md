# TaskFlow API — Scalability & Architecture Notes

## Current Architecture

```
Client (Browser / Mobile)
        │
        ▼
  Load Balancer (Nginx / AWS ALB)
        │
   ┌────┴────┐
   │  Node   │  ← Horizontally scalable stateless instances
   │ Express │
   └────┬────┘
        │
   ┌────┴────────────────────┐
   │     MySQL (Primary)     │
   │   + Read Replicas       │
   └─────────────────────────┘
```

---

## Scaling Strategies

### 1. Horizontal Scaling (Stateless API)
- JWT is **stateless** — no session state stored in the app process.
- Any number of Node.js instances can run in parallel behind a load balancer.
- Deploy multiple containers/pods (Docker + Kubernetes) with zero changes to application code.

### 2. Database Scaling
| Strategy | When to apply |
|---|---|
| **Read replicas** | Read-heavy workloads (e.g. dashboard queries) |
| **Connection pooling** (already configured via Sequelize pool) | High concurrency |
| **Database sharding** | 10M+ records per table |
| **Archiving old tasks** | Historical data growth |

### 3. Caching Layer (Redis)
```
Hot paths to cache:
  GET /api/v1/tasks        → Cache per user, TTL 30s
  GET /api/v1/admin/users  → Cache 60s, invalidate on write
  GET /api/v1/tasks/stats  → Cache 5 min
```
Implementation: `ioredis` + a simple cache middleware that checks Redis before hitting MySQL.

### 4. Microservices Decomposition (future)
When the monolith grows, split along domain boundaries:

```
Auth Service       → handles register/login/token refresh
Task Service       → CRUD for tasks
Notification Svc   → email/push on task due dates
Admin Service      → user management dashboards
API Gateway        → single entry-point, JWT validation
```
Communication: REST (synchronous) or message queue (async) via RabbitMQ / Kafka.

### 5. Message Queue / Background Jobs
- Send welcome emails asynchronously via **BullMQ** (Redis-backed).
- Process task due-date reminders on a cron schedule.
- Decouple heavy operations from the request lifecycle.

### 6. Docker & Container Orchestration
```dockerfile
# Multi-stage build already included in Dockerfile
# Production image: ~120 MB
# Kubernetes HPA autoscales on CPU > 60%
```

### 7. Rate Limiting & DDoS Protection
- Implemented at the app level (`express-rate-limit`).
- For production: move to the gateway layer (Nginx, Cloudflare, AWS WAF).

### 8. Observability
| Layer | Tool |
|---|---|
| Structured logging | Winston → CloudWatch / Datadog |
| Metrics | Prometheus + Grafana |
| Tracing | OpenTelemetry + Jaeger |
| Uptime monitoring | UptimeRobot / Pingdom |

---

## Load Estimate

| Tier | RPS | Setup |
|---|---|---|
| Starter | < 100 | Single Node + MySQL |
| Growth | 100–2 000 | 3 Node pods + Read replica + Redis |
| Scale | 2 000–20 000 | Microservices + Kafka + Sharding |
| Enterprise | 20 000+ | Multi-region + CDN + CQRS |
