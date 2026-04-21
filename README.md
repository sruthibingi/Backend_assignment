🚀 TaskFlow API

A production-ready REST API for task management with JWT Authentication, Role-Based Access Control (RBAC), and scalable architecture.

Built using Node.js, Express, MySQL, and Sequelize, with a lightweight frontend for quick interaction.

🌟 Highlights
🔐 Secure authentication with JWT (Access + Refresh Tokens)
👥 Role-based access control (User / Admin)
📋 Full Task Management System (CRUD + Filters + Pagination)
🛠 Admin dashboard for user management
📊 Built-in task analytics (stats endpoint)
📄 Interactive API docs with Swagger
🐳 Dockerized setup for easy deployment
⚡ Production-ready security & logging
🧰 Tech Stack
Category	Tech
Backend	Node.js, Express
Database	MySQL, Sequelize ORM
Auth	JWT, bcrypt
Validation	express-validator
Docs	Swagger (OpenAPI 3.0)
Security	Helmet, CORS, Rate Limiting
Logging	Winston
DevOps	Docker, Docker Compose
📁 Project Structure
taskflow-api/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── validators/
├── frontend/
├── docs/
├── docker-compose.yml
└── package.json
⚡ Getting Started
🐳 Run with Docker (Recommended)
git clone https://github.com/YOUR_USERNAME/taskflow-api.git
cd taskflow-api

docker-compose up --build

Access:

API → http://localhost:3000
Swagger Docs → http://localhost:3000/api-docs
💻 Local Setup
Prerequisites
Node.js ≥ 18
MySQL 8
npm install

cp .env.example .env
# Configure DB + JWT secrets

mysql -u root -p < docs/schema.sql

npm run dev
🔐 Environment Variables
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=taskflow_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

RATE_LIMIT_MAX=100
ALLOWED_ORIGINS=http://localhost:3000
📡 API Overview
🔑 Auth Routes
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
📋 Task Routes (Protected)
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/:id
PUT    /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
GET    /api/v1/tasks/stats   (Admin)
👑 Admin Routes
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PATCH  /api/v1/admin/users/:id/role
PATCH  /api/v1/admin/users/:id/status
DELETE /api/v1/admin/users/:id
🔍 Task Filtering Example
GET /api/v1/tasks?page=1&limit=10&status=todo&priority=high&sortBy=createdAt&order=DESC
🧪 Sample Request
curl -X POST http://localhost:3000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"password123"}'
🔒 Security Features
Password hashing using bcrypt
JWT with refresh token rotation
Input validation using express-validator
Helmet for secure HTTP headers
Rate limiting to prevent abuse
CORS configuration
Least privilege access control
📄 API Documentation
Swagger UI → http://localhost:3000/api-docs
OpenAPI JSON → http://localhost:3000/api-docs.json
📊 Database Design
UUID-based primary keys
ENUM constraints for status & priority
Indexed queries for performance
JSON field for flexible tags
Cascade delete (User → Tasks)
📈 Scalability
Stateless JWT authentication
Redis-ready caching layer
Horizontal scaling support
Microservices-ready structure
Docker + Kubernetes friendly
🤝 Contributing

Contributions are welcome!

# Fork the repo
# Create a feature branch
# Commit changes
# Open a Pull Request
📜 License

This project is open-source and available under the MIT License.
