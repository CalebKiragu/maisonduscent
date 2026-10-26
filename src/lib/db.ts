import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedDatabase } from "./seed";

const globalForDb = globalThis as unknown as {
  __maisonDb?: DatabaseSync;
  __maisonDbSeeding?: boolean;
};

export function getDbPath(): string {
  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  return path.join(dataDir, "maison.db");
}

function migrate(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'unisex',
      family TEXT NOT NULL,
      concentration TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      story TEXT NOT NULL DEFAULT '',
      top_notes TEXT NOT NULL DEFAULT '[]',
      heart_notes TEXT NOT NULL DEFAULT '[]',
      base_notes TEXT NOT NULL DEFAULT '[]',
      price_2 INTEGER NOT NULL DEFAULT 0,
      price_5 INTEGER NOT NULL DEFAULT 0,
      price_8 INTEGER NOT NULL DEFAULT 0,
      price_30 INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'in_stock',
      badge TEXT,
      bestseller INTEGER NOT NULL DEFAULT 0,
      new_arrival INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 4.5,
      review_count INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL DEFAULT '/images/products/p01.jpg',
      gallery TEXT NOT NULL DEFAULT '[]',
      collections TEXT NOT NULL DEFAULT '[]',
      type TEXT NOT NULL DEFAULT 'perfume',
      bundle_items TEXT NOT NULL DEFAULT '[]',
      cost_price INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      theme TEXT NOT NULL DEFAULT '#b9a17d',
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      phone TEXT,
      membership_tier TEXT NOT NULL DEFAULT 'Guest',
      store_credit INTEGER NOT NULL DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL DEFAULT 'Home',
      line1 TEXT NOT NULL,
      line2 TEXT,
      city TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      subtotal INTEGER NOT NULL DEFAULT 0,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      discount INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'mpesa',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT,
      medium TEXT,
      campaign TEXT,
      courier TEXT,
      tracking_number TEXT,
      rider TEXT,
      amount_collected INTEGER NOT NULL DEFAULT 0,
      collected_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      size TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      image TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL DEFAULT 'System',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      page_type TEXT NOT NULL,
      product_id INTEGER,
      session_id TEXT NOT NULL,
      referrer TEXT,
      source TEXT NOT NULL DEFAULT 'direct',
      medium TEXT NOT NULL DEFAULT 'none',
      campaign TEXT,
      device TEXT NOT NULL DEFAULT 'desktop',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_views_created ON page_views(created_at);
    CREATE INDEX IF NOT EXISTS idx_views_product ON page_views(product_id);
    CREATE INDEX IF NOT EXISTS idx_views_session ON page_views(session_id);

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      session_id TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function getDb(): DatabaseSync {
  if (globalForDb.__maisonDb) return globalForDb.__maisonDb;

  const dbPath = getDbPath();
  mkdirSync(path.dirname(dbPath), { recursive: true });
  // Build workers and server instances may open the same fresh database at once.
  // Wait for each other instead of failing the build with SQLITE_BUSY.
  const db = new DatabaseSync(dbPath, { timeout: 30_000 });
  migrate(db);

  if (!globalForDb.__maisonDbSeeding) {
    globalForDb.__maisonDbSeeding = true;
    try {
      seedDatabase(db);
    } finally {
      globalForDb.__maisonDbSeeding = false;
    }
  }

  globalForDb.__maisonDb = db;
  return db;
}

export function nowSql(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function resetDbConnection() {
  globalForDb.__maisonDb = undefined;
}
