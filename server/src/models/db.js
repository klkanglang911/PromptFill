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
  // 先创建基本表结构（不包含可能导致问题的索引）
  db.exec(`
    -- 模板表（合并系统模板和用户模板）
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

    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 用户词库表（保留，用于用户自定义词库）
    CREATE TABLE IF NOT EXISTS user_banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      label_cn TEXT,
      label_en TEXT,
      category TEXT DEFAULT 'other',
      options TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, key)
    );

    -- 基础索引（不依赖新字段）
    CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);
    CREATE INDEX IF NOT EXISTS idx_templates_sort ON templates(sort_order);
    CREATE INDEX IF NOT EXISTS idx_banks_category ON banks(category);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_user_banks_user ON user_banks(user_id);
  `);

  // 迁移：检查 templates 表是否有 user_id 和 status 字段，没有则添加
  try {
    const columns = db.prepare("PRAGMA table_info(templates)").all();
    const hasUserId = columns.some(col => col.name === 'user_id');
    const hasStatus = columns.some(col => col.name === 'status');

    if (!hasUserId) {
      console.log('🔄 迁移：为 templates 表添加 user_id 字段...');
      db.exec('ALTER TABLE templates ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
    }

    if (!hasStatus) {
      console.log('🔄 迁移：为 templates 表添加 status 字段...');
      db.exec("ALTER TABLE templates ADD COLUMN status TEXT DEFAULT 'approved'");
    }

    // 创建依赖新字段的索引（如果字段存在）
    if (hasUserId || !hasUserId) { // 无论如何都尝试，因为上面可能刚添加
      try {
        db.exec('CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id)');
      } catch (e) { /* 忽略 */ }
    }
    if (hasStatus || !hasStatus) {
      try {
        db.exec('CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status)');
      } catch (e) { /* 忽略 */ }
    }

    // 迁移 user_templates 数据到 templates
    const userTemplatesExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_templates'").get();
    if (userTemplatesExists) {
      const userTemplatesCount = db.prepare('SELECT COUNT(*) as count FROM user_templates').get();
      if (userTemplatesCount.count > 0) {
        console.log(`🔄 迁移：将 ${userTemplatesCount.count} 个用户模板迁移到 templates 表...`);

        db.exec(`
          INSERT OR IGNORE INTO templates (id, user_id, name_cn, name_en, content_cn, content_en, image_url, image_urls, author, selections, tags, language, sort_order, is_active, status, created_at, updated_at)
          SELECT id, user_id, name_cn, name_en, content_cn, content_en, image_url, image_urls, author, selections, tags, language, sort_order, 1, 'approved', created_at, updated_at
          FROM user_templates
        `);

        console.log('✅ 用户模板迁移完成');
      }
    }
  } catch (error) {
    console.log('迁移检查:', error.message);
  }

  // 初始化版本信息
  const versionExists = db.prepare('SELECT COUNT(*) as count FROM version_info').get();
  if (versionExists.count === 0) {
    db.prepare('INSERT INTO version_info (id, data_version) VALUES (1, ?)').run('1.0.0');
  }

  console.log('✅ Database initialized');
}

// ============ 模板 CRUD ============

export function getAllTemplates(activeOnly = true, includeUserInfo = false) {
  let sql;
  if (includeUserInfo) {
    sql = activeOnly
      ? `SELECT t.*, u.email as user_email, u.nickname as user_nickname
         FROM templates t
         LEFT JOIN users u ON t.user_id = u.id
         WHERE t.is_active = 1
         ORDER BY t.sort_order ASC, t.created_at DESC`
      : `SELECT t.*, u.email as user_email, u.nickname as user_nickname
         FROM templates t
         LEFT JOIN users u ON t.user_id = u.id
         ORDER BY t.sort_order ASC, t.created_at DESC`;
  } else {
    sql = activeOnly
      ? 'SELECT * FROM templates WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC'
      : 'SELECT * FROM templates ORDER BY sort_order ASC, created_at DESC';
  }

  const rows = db.prepare(sql).all();
  return rows.map(row => formatTemplateRow(row, includeUserInfo));
}

export function getTemplateById(id, includeUserInfo = false) {
  let sql;
  if (includeUserInfo) {
    sql = `SELECT t.*, u.email as user_email, u.nickname as user_nickname
           FROM templates t
           LEFT JOIN users u ON t.user_id = u.id
           WHERE t.id = ?`;
  } else {
    sql = 'SELECT * FROM templates WHERE id = ?';
  }
  const row = db.prepare(sql).get(id);
  return row ? formatTemplateRow(row, includeUserInfo) : null;
}

export function createTemplate(template, userId = null) {
  const stmt = db.prepare(`
    INSERT INTO templates (id, user_id, name_cn, name_en, content_cn, content_en, image_url, image_urls, author, selections, tags, language, sort_order, is_active, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 用户创建的模板默认为待审核状态，系统模板默认为已通过
  const defaultStatus = userId ? 'pending' : 'approved';

  stmt.run(
    template.id,
    userId,
    template.name?.cn || template.name_cn || '',
    template.name?.en || template.name_en || '',
    template.content?.cn || template.content_cn || '',
    template.content?.en || template.content_en || '',
    template.imageUrl || template.image_url || '',
    JSON.stringify(template.imageUrls || template.image_urls || []),
    template.author || (userId ? '' : '官方'),
    JSON.stringify(template.selections || {}),
    JSON.stringify(template.tags || []),
    JSON.stringify(template.language || ['cn', 'en']),
    template.sort_order || 0,
    template.is_active !== undefined ? (template.is_active ? 1 : 0) : 1,
    template.status || defaultStatus
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

// 获取指定用户的模板
export function getTemplatesByUserId(userId) {
  const sql = `SELECT t.*, u.email as user_email, u.nickname as user_nickname
               FROM templates t
               LEFT JOIN users u ON t.user_id = u.id
               WHERE t.user_id = ?
               ORDER BY t.created_at DESC`;
  const rows = db.prepare(sql).all(userId);
  return rows.map(row => formatTemplateRow(row, true));
}

// 更新模板状态（审核功能）
export function updateTemplateStatus(id, status) {
  db.prepare(`
    UPDATE templates SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, id);
  updateDataVersion();
  return getTemplateById(id, true);
}

// 获取待审核的模板
export function getPendingTemplates() {
  const sql = `SELECT t.*, u.email as user_email, u.nickname as user_nickname
               FROM templates t
               LEFT JOIN users u ON t.user_id = u.id
               WHERE t.status = 'pending'
               ORDER BY t.created_at DESC`;
  const rows = db.prepare(sql).all();
  return rows.map(row => formatTemplateRow(row, true));
}

// 获取用户创建的模板（用户自己查看）
export function getUserCreatedTemplates(userId) {
  const sql = `SELECT * FROM templates
               WHERE user_id = ? AND status = 'approved'
               ORDER BY created_at DESC`;
  const rows = db.prepare(sql).all(userId);
  return rows.map(row => formatTemplateRow(row, false));
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

// ============ 用户 CRUD ============

export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createUser(email, passwordHash, nickname = null) {
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, nickname)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(email, passwordHash, nickname);
  return getUserById(result.lastInsertRowid);
}

export function updateUser(id, updates) {
  const fields = [];
  const values = [];

  if (updates.nickname !== undefined) {
    fields.push('nickname = ?');
    values.push(updates.nickname);
  }
  if (updates.avatar_url !== undefined) {
    fields.push('avatar_url = ?');
    values.push(updates.avatar_url);
  }

  if (fields.length === 0) return getUserById(id);

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getUserById(id);
}

// ============ 用户词库 CRUD ============
// 注意：用户模板已迁移到统一的 templates 表，使用 getTemplatesByUserId、createTemplate 等函数

export function getUserBanks(userId) {
  const rows = db.prepare('SELECT * FROM user_banks WHERE user_id = ? ORDER BY sort_order ASC').all(userId);
  return rows.reduce((acc, row) => {
    acc[row.key] = {
      label: { cn: row.label_cn, en: row.label_en },
      category: row.category,
      options: JSON.parse(row.options || '[]')
    };
    return acc;
  }, {});
}

export function createOrUpdateUserBank(userId, key, bank) {
  const existing = db.prepare('SELECT * FROM user_banks WHERE user_id = ? AND key = ?').get(userId, key);

  if (existing) {
    db.prepare(`
      UPDATE user_banks SET
        label_cn = ?, label_en = ?, category = ?, options = ?, sort_order = ?
      WHERE user_id = ? AND key = ?
    `).run(
      bank.label?.cn || '',
      bank.label?.en || '',
      bank.category || 'other',
      JSON.stringify(bank.options || []),
      bank.sort_order || 0,
      userId,
      key
    );
  } else {
    db.prepare(`
      INSERT INTO user_banks (user_id, key, label_cn, label_en, category, options, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      key,
      bank.label?.cn || '',
      bank.label?.en || '',
      bank.category || 'other',
      JSON.stringify(bank.options || []),
      bank.sort_order || 0
    );
  }
}

export function deleteUserBank(userId, key) {
  db.prepare('DELETE FROM user_banks WHERE user_id = ? AND key = ?').run(userId, key);
}

// ============ 辅助函数 ============

function formatTemplateRow(row, includeUserInfo = false) {
  const result = {
    id: row.id,
    userId: row.user_id,
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
    status: row.status || 'approved',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  if (includeUserInfo) {
    result.userEmail = row.user_email || null;
    result.userNickname = row.user_nickname || null;
  }

  return result;
}

// 初始化数据库
initDatabase();

export default db;
