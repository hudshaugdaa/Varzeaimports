import { neon } from "@neondatabase/serverless";

let sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada. Adicione na Vercel: Settings > Environment Variables");
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function initDb() {
  const db = getDb();

  await db`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER REFERENCES admin_users(id),
      ip VARCHAR(50),
      device_info TEXT,
      location TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      last_seen TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS banned_ips (
      id SERIAL PRIMARY KEY,
      ip VARCHAR(50) UNIQUE NOT NULL,
      reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      parent_id INTEGER REFERENCES categories(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS products_db (
      id VARCHAR(100) PRIMARY KEY,
      slug VARCHAR(200) UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      original_price NUMERIC(10,2),
      images JSONB DEFAULT '[]',
      category VARCHAR(100) NOT NULL,
      subcategory VARCHAR(100),
      sizes JSONB DEFAULT '[]',
      brand VARCHAR(100),
      in_stock BOOLEAN DEFAULT true,
      badge VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id VARCHAR(100) NOT NULL,
      author VARCHAR(200) NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      date DATE DEFAULT CURRENT_DATE,
      verified BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_cpf VARCHAR(20),
      customer_phone VARCHAR(20),
      items JSONB NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      affiliate_ref VARCHAR(100),
      pix_transaction_id VARCHAR(200),
      address JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS affiliates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      ref_code VARCHAR(100) UNIQUE NOT NULL,
      percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
      balance NUMERIC(10,2) DEFAULT 0,
      pix_key VARCHAR(200),
      pix_name VARCHAR(200),
      pix_cpf VARCHAR(20),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS affiliate_sales (
      id SERIAL PRIMARY KEY,
      affiliate_id INTEGER REFERENCES affiliates(id),
      order_id INTEGER REFERENCES orders(id),
      amount NUMERIC(10,2) NOT NULL,
      commission NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
      id SERIAL PRIMARY KEY,
      affiliate_id INTEGER REFERENCES affiliates(id),
      amount NUMERIC(10,2) NOT NULL,
      pix_key VARCHAR(200),
      pix_name VARCHAR(200),
      pix_cpf VARCHAR(20),
      status VARCHAR(50) DEFAULT 'pending',
      requested_at TIMESTAMP DEFAULT NOW(),
      processed_at TIMESTAMP
    )
  `;

  return { ok: true };
}
