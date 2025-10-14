DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_kind') THEN
    CREATE TYPE transaction_kind AS ENUM ('income', 'expense');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  color VARCHAR(16) NOT NULL DEFAULT '#888888',
  icon VARCHAR(40) NOT NULL DEFAULT 'Tag',
  kind transaction_kind NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (lower(name), kind)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  type transaction_kind NOT NULL,
  date DATE NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
