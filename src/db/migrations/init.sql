-- ─────────────────────────────────────────────────────────────
-- Bitespeed Identity Reconciliation
-- Initial Migration: Create Contact table
-- ─────────────────────────────────────────────────────────────

CREATE TYPE link_precedence AS ENUM ('primary', 'secondary');

CREATE TABLE IF NOT EXISTS contact (
  id               SERIAL PRIMARY KEY,
  phone_number     VARCHAR(20),
  email            VARCHAR(255),
  linked_id        INT REFERENCES contact(id) ON DELETE SET NULL,
  link_precedence  link_precedence NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at       TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Index for fast lookups by email and phone
CREATE INDEX IF NOT EXISTS idx_contact_email        ON contact(email)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_phone        ON contact(phone_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_linked_id    ON contact(linked_id)    WHERE deleted_at IS NULL;