import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/promptfill.db');
const db = new Database(dbPath);

// 启用 WAL 模式提高并发性能
db.pragma('journal_mode = WAL');

// 初始化数据库表
export function initDatabase() {
  db.exec(`
    -- 模板表
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name_cn TEXT NOT NULL,
      name_en TEXT,
      content_cn TEXT NOT NULL,
      content_en TEXT,
      image_url TEXT,
      image_urls TEXT,
      author TEXT DEFAULT '官方',
      selections TEXT,
      tags TEXT,
      language TEXT DEFAULT '["cn","en"]',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 词库表
    CREATE TABLE IF NOT EXISTS banks (
      key TEXT PRIMARY KEY,
      label_cn TEXT NOT NULL,
      label_en TEXT,
      category TEXT DEFAULT 'other',
      options TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 分类表
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_cn TEXT NOT NULL,
      name_en TEXT,
      color TEXT DEFAULT 'blue',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 版本控制表
    CREATE TABLE IF NOT EXISTS version_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data_version TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 管理员表
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 索引
    CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);
    CREATE INDEX IF NOT EXISTS idx_templates_sort ON templates(sort_order);
    CREATE INDEX IF NOT EXISTS idx_banks_category ON banks(category);
  `);

  // 初始化版本信息
  const versionExists = db.prepare('SELECT COUNT(*) as count FROM version_info').get();
  if (versionExists.count === 0) {
    db.prepare('INSERT INTO version_info (id, data_version) VALUES (1, ?)').run('1.0.0');
  }

  console.log('✅ Database initialized');
}

// ============ 模板 CRUD ============

export function getAllTemplates(activeOnly = true) {
  const sql = activeOnly
    ? 'SELECT * FROM templates WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC'
    : 'SELECT * FROM templates ORDER BY sort_order ASC, created_at DESC';

  const rows = db.prepare(sql).all();
  return rows.map(formatTemplateRow);
}

export function getTemplateById(id) {
  const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
  return row ? formatTemplateRow(row) : null;
}

export function createTemplate(template) {
  const stmt = db.prepare(`
    INSERT INTO templates (id, name_cn, name_en, content_cn, content_en, image_url, image_urls, author, selections, tags, language, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    template.id,
    template.name?.cn || template.name_cn || '',
    template.name?.en || template.name_en || '',
    template.content?.cn || template.content_cn || '',
    template.content?.en || template.content_en || '',
    template.imageUrl || template.image_url || '',
    JSON.stringify(template.imageUrls || template.image_urls || []),
    template.author || '官方',
    JSON.stringify(template.selections || {}),
    JSON.stringify(template.tags || []),
    JSON.stringify(template.language || ['cn', 'en']),
    template.sort_order || 0,
    template.is_active !== undefined ? (template.is_active ? 1 : 0) : 1
  );

  updateDataVersion();
  return getTemplateById(template.id);
}

export function updateTemplate(id, template) {
  const stmt = db.prepare(`
    UPDATE templates SET
      name_cn = ?, name_en = ?, content_cn = ?, content_en = ?,
      image_url = ?, image_urls = ?, author = ?, selections = ?,
      tags = ?, language = ?, sort_order = ?, is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    template.name?.cn || template.name_cn || '',
    template.name?.en || template.name_en || '',
    template.content?.cn || template.content_cn || '',
    template.content?.en || template.content_en || '',
    template.imageUrl || template.image_url || '',
    JSON.stringify(template.imageUrls || template.image_urls || []),
    template.author || '官方',
    JSON.stringify(template.selections || {}),
    JSON.stringify(template.tags || []),
    JSON.stringify(template.language || ['cn', 'en']),
    template.sort_order || 0,
    template.is_active !== undefined ? (template.is_active ? 1 : 0) : 1,
    id
  );

  updateDataVersion();
  return getTemplateById(id);
}

export function deleteTemplate(id) {
  db.prepare('DELETE FROM templates WHERE id = ?').run(id);
  updateDataVersion();
}

// ============ 词库 CRUD ============

export function getAllBanks() {
  const rows = db.prepare('SELECT * FROM banks ORDER BY sort_order ASC').all();
  return rows.reduce((acc, row) => {
    acc[row.key] = {
      label: { cn: row.label_cn, en: row.label_en },
      category: row.category,
      options: JSON.parse(row.options || '[]')
    };
    return acc;
  }, {});
}

export function getBankByKey(key) {
  const row = db.prepare('SELECT * FROM banks WHERE key = ?').get(key);
  if (!row) return null;
  return {
    key: row.key,
    label: { cn: row.label_cn, en: row.label_en },
    category: row.category,
    options: JSON.parse(row.options || '[]')
  };
}

export function createBank(key, bank) {
  const stmt = db.prepare(`
    INSERT INTO banks (key, label_cn, label_en, category, options, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    key,
    bank.label?.cn || '',
    bank.label?.en || '',
    bank.category || 'other',
    JSON.stringify(bank.options || []),
    bank.sort_order || 0
  );

  updateDataVersion();
  return getBankByKey(key);
}

export function updateBank(key, bank) {
  const stmt = db.prepare(`
    UPDATE banks SET
      label_cn = ?, label_en = ?, category = ?, options = ?,
      sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE key = ?
  `);

  stmt.run(
    bank.label?.cn || '',
    bank.label?.en || '',
    bank.category || 'other',
    JSON.stringify(bank.options || []),
    bank.sort_order || 0,
    key
  );

  updateDataVersion();
  return getBankByKey(key);
}

export function deleteBank(key) {
  db.prepare('DELETE FROM banks WHERE key = ?').run(key);
  updateDataVersion();
}

// ============ 分类 CRUD ============

export function getAllCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
}

export function createCategory(category) {
  const stmt = db.prepare(`
    INSERT INTO categories (id, name_cn, name_en, color, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    category.id,
    category.name?.cn || category.name_cn || '',
    category.name?.en || category.name_en || '',
    category.color || 'blue',
    category.sort_order || 0
  );

  return category;
}

// ============ 版本管理 ============

export function getVersion() {
  const row = db.prepare('SELECT * FROM version_info WHERE id = 1').get();
  return {
    dataVersion: row?.data_version || '1.0.0',
    updatedAt: row?.updated_at
  };
}

export function updateDataVersion() {
  const current = getVersion();
  const parts = current.dataVersion.split('.');
  parts[2] = String(parseInt(parts[2] || '0') + 1);
  const newVersion = parts.join('.');

  db.prepare('UPDATE version_info SET data_version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(newVersion);
  return newVersion;
}

export function setDataVersion(version) {
  db.prepare('UPDATE version_info SET data_version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(version);
}

// ============ 管理员 ============

export function getAdminByUsername(username) {
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
}

export function createAdmin(username, passwordHash) {
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
}

export function getAdminCount() {
  const row = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  return row.count;
}

// ============ 辅助函数 ============

function formatTemplateRow(row) {
  return {
    id: row.id,
    name: { cn: row.name_cn, en: row.name_en },
    content: { cn: row.content_cn, en: row.content_en },
    imageUrl: row.image_url,
    imageUrls: JSON.parse(row.image_urls || '[]'),
    author: row.author,
    selections: JSON.parse(row.selections || '{}'),
    tags: JSON.parse(row.tags || '[]'),
    language: JSON.parse(row.language || '["cn","en"]'),
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// 初始化数据库
initDatabase();

export default db;
