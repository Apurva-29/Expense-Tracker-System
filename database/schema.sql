-- ============================================================
--  Expense Tracker System — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- ────────────────────────────────────────────
--  1. Users
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Users (
  user_id    INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────
--  2. Category
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Category (
  category_id INT         AUTO_INCREMENT PRIMARY KEY,
  user_id     INT         NOT NULL,
  name        VARCHAR(100) NOT NULL,
  type        ENUM('income','expense') NOT NULL,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_category_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE
);

-- ────────────────────────────────────────────
--  3. Income
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Income (
  income_id   INT            AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  category_id INT            DEFAULT NULL,
  amount      DECIMAL(10,2)  NOT NULL CHECK (amount > 0),
  description VARCHAR(255)   DEFAULT NULL,
  date        DATE           NOT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_income_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_income_category
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
    ON DELETE SET NULL
);

-- ────────────────────────────────────────────
--  4. Expense
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Expense (
  expense_id  INT            AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  category_id INT            DEFAULT NULL,
  amount      DECIMAL(10,2)  NOT NULL CHECK (amount > 0),
  description VARCHAR(255)   DEFAULT NULL,
  date        DATE           NOT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_expense_user
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_expense_category
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
    ON DELETE SET NULL
);


