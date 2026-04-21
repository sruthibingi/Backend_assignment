-- ============================================================
-- TaskFlow API — MySQL Database Schema
-- Run this ONCE to bootstrap the database.
-- Sequelize will handle auto-sync in development mode.
-- ============================================================

CREATE DATABASE IF NOT EXISTS taskflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskflow_db;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)        NOT NULL PRIMARY KEY,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password      VARCHAR(255)    NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  last_login    DATETIME        NULL,
  refresh_token TEXT            NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          CHAR(36)        NOT NULL PRIMARY KEY,
  title       VARCHAR(200)    NOT NULL,
  description TEXT            NULL,
  status      ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  priority    ENUM('low','medium','high')       NOT NULL DEFAULT 'medium',
  due_date    DATE            NULL,
  tags        JSON            NULL,
  user_id     CHAR(36)        NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_tasks_user_id  (user_id),
  INDEX idx_tasks_status   (status),
  INDEX idx_tasks_priority (priority),
  INDEX idx_tasks_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed: default admin account ───────────────────────────────
-- Password: Admin123  (bcrypt hash — change after first login!)
INSERT IGNORE INTO users (id, name, email, password, role, is_active, created_at, updated_at)
VALUES (
  UUID(),
  'Super Admin',
  'admin@taskflow.dev',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5lzoe',
  'admin',
  1,
  NOW(),
  NOW()
);
