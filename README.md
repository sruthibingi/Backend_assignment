# TaskFlow API 🚀

> Scalable REST API with JWT Authentication, Role-Based Access Control, and a built-in React-style frontend. Built with **Node.js + Express + MySQL + Sequelize**.

---

## ✨ Features

| Area | Details |
|---|---|
| **Auth** | JWT access tokens + refresh tokens, bcrypt password hashing |
| **RBAC** | `user` and `admin` roles with middleware-enforced route guards |
| **Tasks CRUD** | Full Create / Read / Update / Delete with filtering, pagination, sorting |
| **Admin Panel** | User management — list, view, change role, toggle status, delete |
| **Validation** | `express-validator` on every input; sanitised and typed |
| **API Docs** | Swagger UI at `/api-docs` (OpenAPI 3.0) |
| **Security** | Helmet, CORS, rate-limiting, input size limits |
| **Logging** | Winston structured logs to console + file |
| **Docker** | Multi-stage Dockerfile + `docker-compose.yml` (MySQL + Redis) |

---

## 🏗 Project Structure

```
taskflow-api/
├── src/
│   ├── app.js                  # Express entry point
│   ├── config/
│   │   ├── database.js         # Sequelize + MySQL connection
│   │   └── swagger.js          # OpenAPI 3.0 spec config
│   ├── controllers/
│   │   ├── authController.js   # register, login, refresh, logout, me
│   │   ├── taskController.js   # CRUD + stats
│   │   └── adminController.js  # User management (admin only)
│   ├── middleware/
│   │   ├── auth.js             # authenticate + authorize(role)
│   │   ├── errorHandler.js     # Global error handler + 404
│   │   └── validate.js         # express-validator runner
│   ├── models/
│   │   ├── User.js             # Sequelize User model
│   │   └── Task.js             # Sequelize Task model + associations
│   ├── routes/
│   │   ├── authRoutes.js       # /api/v1/auth/*
│   │   ├── taskRoutes.js       # /api/v1/tasks/*
│   │   └── adminRoutes.js      # /api/v1/admin/*
│   ├── utils/
│   │   ├── logger.js           # Winston logger
│   │   └── response.js         # sendSuccess / sendError / sendPaginated
│   └── validators/
│       ├── authValidators.js
│       └── taskValidators.js
├── frontend/
│   └── index.html              # Single-page frontend UI
├── docs/
│   ├── schema.sql              # MySQL DDL + seed admin user
│   └── SCALABILITY.md         # Architecture & scaling notes
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 🚀 Quick Start

### Option A — Docker (recommended)

```bash
git clone https://github.com/YOUR_USERNAME/taskflow-api.git
cd taskflow-api

# Start everything (API + MySQL + Redis)
docker-compose up --build

# API:      http://localhost:3000
# Swagger:  http://localhost:3000/api-docs
# Frontend: http://localhost:3000
```

### Option B — Local setup

**Prerequisites:** Node.js ≥ 18, MySQL 8

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and a strong JWT_SECRET

# 3. Create the database
mysql -u root -p < docs/schema.sql

# 4. Start dev server (auto-reload)
npm run dev
```

---

## 🔐 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `taskflow_db` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | — |
| `JWT_SECRET` | Access token secret (≥32 chars) | — |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | `http://localhost:3000` |

---

## 📡 API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Auth Endpoints (no token required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, receive JWT tokens |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Logout (invalidate refresh token) |
| `GET`  | `/auth/me` | Get current user profile |

### Task Endpoints (JWT required)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET`    | `/tasks`        | user/admin | List tasks (paginated, filterable) |
| `POST`   | `/tasks`        | user/admin | Create a task |
| `GET`    | `/tasks/:id`    | user/admin | Get single task |
| `PUT`    | `/tasks/:id`    | user/admin | Update task |
| `DELETE` | `/tasks/:id`    | user/admin | Delete task |
| `GET`    | `/tasks/stats`  | admin only | Task stats by status/priority |

### Admin Endpoints (admin JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/admin/users`           | List all users |
| `GET`    | `/admin/users/:id`       | Get user + tasks |
| `PATCH`  | `/admin/users/:id/role`  | Change user role |
| `PATCH`  | `/admin/users/:id/status`| Toggle active/inactive |
| `DELETE` | `/admin/users/:id`       | Delete user |

### Query Parameters for `GET /tasks`

```
?page=1&limit=10
&status=todo|in_progress|done
&priority=low|medium|high
&sortBy=createdAt|dueDate|priority|title
&order=ASC|DESC
&search=keyword
```

---

## 🔒 Security Practices

1. **Password hashing** — bcrypt with cost factor 12 (`beforeCreate` / `beforeUpdate` Sequelize hooks)
2. **JWT rotation** — short-lived access tokens (7d default) + refresh tokens stored hashed in DB
3. **Input validation** — `express-validator` chains on every mutating endpoint; 422 on failure
4. **Helmet** — sets secure HTTP headers (CSP, HSTS, X-Frame, etc.)
5. **Rate limiting** — global 100 req/15 min; auth routes capped at 20 req/15 min
6. **CORS** — explicit allow-list via `ALLOWED_ORIGINS`
7. **Body size limit** — 10 kb max payload
8. **Principle of least privilege** — users can only access/modify their own tasks

---

## 🧪 Example Requests

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secret123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secret123"}'

# Create task
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Build API","priority":"high","dueDate":"2024-12-31"}'

# List tasks
curl http://localhost:3000/api/v1/tasks?status=todo&priority=high \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📄 API Documentation

Interactive Swagger UI is available at:
```
http://localhost:3000/api-docs
```
Raw OpenAPI JSON:
```
http://localhost:3000/api-docs.json
```

---

## 📐 Database Schema

See [`docs/schema.sql`](./docs/schema.sql) for full DDL.

**Key design decisions:**
- UUIDs as primary keys (no sequential ID enumeration attacks)
- `ENUM` columns for status/priority (DB-level constraint)
- `JSON` column for tags (flexible, no join table needed at this scale)
- Composite indexes on `user_id`, `status`, `priority`, `due_date` for common query patterns
- `ON DELETE CASCADE` from users → tasks

---

## 📈 Scalability

See [`docs/SCALABILITY.md`](./docs/SCALABILITY.md) for a detailed breakdown covering:
- Horizontal scaling with stateless JWT
- Read replicas & connection pooling
- Redis caching strategy
- Microservices decomposition path
- Docker + Kubernetes autoscaling
- Observability (Prometheus, OpenTelemetry)

---

## 🛠 Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express 4
- **ORM:** Sequelize 6
- **Database:** MySQL 8
- **Auth:** jsonwebtoken + bcryptjs
- **Validation:** express-validator
- **Docs:** swagger-jsdoc + swagger-ui-express
- **Security:** helmet + express-rate-limit + cors
- **Logging:** winston
- **Containers:** Docker + Docker Compose

---

## 📝 License

MIT
