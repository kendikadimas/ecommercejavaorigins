import mysql from 'mysql2/promise';
import {
  INITIAL_PRODUCTS,
  INITIAL_PAYMENT_METHODS,
  INITIAL_BANNERS,
  type ProductType,
  type PaymentMethodType,
  type BannerType,
} from './seed-data';

let pool: mysql.Pool | null = null;
let initPromise: Promise<mysql.Pool> | null = null;

function getPool(): mysql.Pool {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    try {
      // jalankan di luar `next build` (script/standalone); di cPanel env lewat UI
      process.loadEnvFile?.();
    } catch {
      // file .env tidak ada — env pasti dari sistem/cPanel
    }
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL belum diset. Buat database MySQL lalu set DATABASE_URL di .env (atau cPanel > Node.js App > env).'
    );
  }
  pool = mysql.createPool(url);
  return pool;
}

/** MySQL DATETIME/Date → ISO string yang sama seperti dulu di db.json */
export function toISO(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(64) DEFAULT '',
  address VARCHAR(500) DEFAULT '',
  city VARCHAR(128) DEFAULT '',
  postal_code VARCHAR(32) DEFAULT '',
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(128) DEFAULT '',
  image VARCHAR(500) DEFAULT '',
  ingredients VARCHAR(500) DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_products_slug (slug),
  INDEX idx_products_active (active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  bank_name VARCHAR(128) DEFAULT '',
  account_number VARCHAR(64) DEFAULT '',
  account_name VARCHAR(128) DEFAULT '',
  qr_code_url VARCHAR(500) DEFAULT '',
  instructions TEXT,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url VARCHAR(500) DEFAULT '',
  link_url VARCHAR(255) DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL DEFAULT 5,
  comment TEXT,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uniq_review_product_user (product_id, user_id),
  INDEX idx_reviews_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_resets (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_resets_token (token),
  INDEX idx_resets_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) DEFAULT '',
  customer_phone VARCHAR(64) DEFAULT '',
  address VARCHAR(500) DEFAULT '',
  city VARCHAR(128) DEFAULT '',
  postal_code VARCHAR(32) DEFAULT '',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_method VARCHAR(16) DEFAULT '',
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method_id VARCHAR(64),
  payment_proof_url VARCHAR(500) DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PAYMENT',
  checkout_type VARCHAR(16) NOT NULL DEFAULT 'WEB',
  notes VARCHAR(500) DEFAULT '',
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_orders_customer_email (customer_email),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64),
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  INDEX idx_items_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_logs (
  id VARCHAR(64) PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_email_logs_to (to_email)
) ENGINE=InnoDB;
`;

async function seedIfEmpty(conn: mysql.PoolConnection) {
  const [productRows] = await conn.query('SELECT COUNT(*) AS n FROM products');
  if (Number((productRows as any[])[0].n) === 0) {
    for (const p of INITIAL_PRODUCTS) {
      await conn.query(
        'INSERT INTO products (id, name, slug, description, price, stock, category, image, ingredients, active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [p.id, p.name, p.slug, p.description, p.price, p.stock, p.category, p.image, p.ingredients ?? '', p.active ? 1 : 0, p.createdAt, p.updatedAt]
      );
    }
  }

  const [payRows] = await conn.query('SELECT COUNT(*) AS n FROM payment_methods');
  if (Number((payRows as any[])[0].n) === 0) {
    for (const m of INITIAL_PAYMENT_METHODS) {
      await conn.query(
        'INSERT INTO payment_methods (id, name, bank_name, account_number, account_name, qr_code_url, instructions, active, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [m.id, m.name, m.bankName ?? '', m.accountNumber ?? '', m.accountName ?? '', m.qrCodeUrl ?? '', m.instructions ?? '', m.active ? 1 : 0, m.createdAt]
      );
    }
  }

  const [bannerRows] = await conn.query('SELECT COUNT(*) AS n FROM banners');
  if (Number((bannerRows as any[])[0].n) === 0) {
    for (const b of INITIAL_BANNERS) {
      await conn.query(
        'INSERT INTO banners (id, title, subtitle, image_url, link_url, active, sort_order, created_at) VALUES (?,?,?,?,?,?,?,?)',
        [b.id, b.title, b.subtitle ?? '', b.imageUrl, b.linkUrl, b.active ? 1 : 0, b.sortOrder, b.createdAt]
      );
    }
  }
}

export async function getDb(): Promise<mysql.Pool> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const p = getPool();
    const conn = await p.getConnection();
    try {
      for (const stmt of SCHEMA.split(';').map((s) => s.trim()).filter(Boolean)) {
        await conn.query(stmt);
      }
      await seedIfEmpty(conn);
    } finally {
      conn.release();
    }
    return p;
  })();
  return initPromise;
}

export type { ProductType, PaymentMethodType, BannerType };
