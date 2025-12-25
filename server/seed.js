/**
 * 数据迁移脚本
 * 将 src/data/templates.js 和 src/data/banks.js 的初始数据导入 SQLite
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库路径
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data/promptfill.db');

// 确保 data 目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('🔄 Starting data migration...\n');

// ============ 初始化表结构 ============

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

console.log('✅ Database tables created\n');

// ============ 动态导入前端数据 ============

async function importData() {
  try {
    // 导入模板数据
    const templatesModule = await import('../src/data/templates.js');
    const { INITIAL_TEMPLATES_CONFIG, SYSTEM_DATA_VERSION } = templatesModule;

    // 导入词库数据
    const banksModule = await import('../src/data/banks.js');
    const { INITIAL_BANKS, INITIAL_CATEGORIES } = banksModule;

    // ============ 导入模板 ============
    console.log('📝 Importing templates...');

    const insertTemplate = db.prepare(`
      INSERT OR REPLACE INTO templates
      (id, name_cn, name_en, content_cn, content_en, image_url, image_urls, author, selections, tags, language, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertManyTemplates = db.transaction((templates) => {
      templates.forEach((t, index) => {
        const nameCn = typeof t.name === 'object' ? t.name.cn : t.name;
        const nameEn = typeof t.name === 'object' ? t.name.en : '';
        const contentCn = typeof t.content === 'object' ? t.content.cn : t.content;
        const contentEn = typeof t.content === 'object' ? t.content.en : '';

        insertTemplate.run(
          t.id,
          nameCn,
          nameEn,
          contentCn,
          contentEn,
          t.imageUrl || '',
          JSON.stringify(t.imageUrls || []),
          t.author || '官方',
          JSON.stringify(t.selections || {}),
          JSON.stringify(t.tags || []),
          JSON.stringify(t.language || ['cn', 'en']),
          index
        );
      });
    });

    insertManyTemplates(INITIAL_TEMPLATES_CONFIG);
    console.log(`   ✅ Imported ${INITIAL_TEMPLATES_CONFIG.length} templates\n`);

    // ============ 导入分类 ============
    console.log('📂 Importing categories...');

    const insertCategory = db.prepare(`
      INSERT OR REPLACE INTO categories (id, name_cn, name_en, color, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertManyCategories = db.transaction((categories) => {
      Object.values(categories).forEach((cat, index) => {
        insertCategory.run(
          cat.id,
          cat.label?.cn || '',
          cat.label?.en || '',
          cat.color || 'blue',
          index
        );
      });
    });

    insertManyCategories(INITIAL_CATEGORIES);
    console.log(`   ✅ Imported ${Object.keys(INITIAL_CATEGORIES).length} categories\n`);

    // ============ 导入词库 ============
    console.log('📚 Importing banks...');

    const insertBank = db.prepare(`
      INSERT OR REPLACE INTO banks (key, label_cn, label_en, category, options, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertManyBanks = db.transaction((banks) => {
      Object.entries(banks).forEach(([key, bank], index) => {
        insertBank.run(
          key,
          bank.label?.cn || '',
          bank.label?.en || '',
          bank.category || 'other',
          JSON.stringify(bank.options || []),
          index
        );
      });
    });

    insertManyBanks(INITIAL_BANKS);
    console.log(`   ✅ Imported ${Object.keys(INITIAL_BANKS).length} banks\n`);

    // ============ 设置版本 ============
    console.log('🔢 Setting version...');

    const versionExists = db.prepare('SELECT COUNT(*) as count FROM version_info').get();
    if (versionExists.count === 0) {
      db.prepare('INSERT INTO version_info (id, data_version) VALUES (1, ?)').run(SYSTEM_DATA_VERSION);
    } else {
      db.prepare('UPDATE version_info SET data_version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(SYSTEM_DATA_VERSION);
    }
    console.log(`   ✅ Version set to ${SYSTEM_DATA_VERSION}\n`);

    // ============ 创建默认管理员 ============
    console.log('👤 Creating default admin...');

    const adminExists = db.prepare('SELECT COUNT(*) as count FROM admins').get();
    if (adminExists.count === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(password, 10);

      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
      console.log(`   ✅ Admin user created: ${username}`);
      console.log(`   ⚠️  Default password: ${password} (please change in production!)\n`);
    } else {
      console.log('   ℹ️  Admin user already exists\n');
    }

    // ============ 完成 ============
    console.log('🎉 Data migration completed successfully!\n');

    // 统计信息
    const stats = {
      templates: db.prepare('SELECT COUNT(*) as count FROM templates').get().count,
      banks: db.prepare('SELECT COUNT(*) as count FROM banks').get().count,
      categories: db.prepare('SELECT COUNT(*) as count FROM categories').get().count,
      admins: db.prepare('SELECT COUNT(*) as count FROM admins').get().count
    };

    console.log('📊 Database Statistics:');
    console.log(`   Templates:  ${stats.templates}`);
    console.log(`   Banks:      ${stats.banks}`);
    console.log(`   Categories: ${stats.categories}`);
    console.log(`   Admins:     ${stats.admins}`);
    console.log(`\n   Database: ${dbPath}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

importData().then(() => {
  db.close();
  process.exit(0);
});
