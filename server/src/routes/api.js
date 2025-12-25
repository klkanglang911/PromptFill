import { Router } from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAllBanks,
  getAllCategories,
  getVersion
} from '../models/db.js';

const router = Router();

// ============ 模板 API ============

// 获取所有模板
router.get('/templates', (req, res) => {
  try {
    const activeOnly = req.query.all !== 'true';
    const templates = getAllTemplates(activeOnly);

    // 过滤标签
    let filtered = templates;
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(t => t.trim());
      filtered = templates.filter(t =>
        t.tags.some(tag => tags.includes(tag))
      );
    }

    // 过滤语言
    if (req.query.lang) {
      filtered = filtered.filter(t =>
        t.language.includes(req.query.lang)
      );
    }

    res.json({
      success: true,
      templates: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, error: '获取模板失败' });
  }
});

// 获取单个模板
router.get('/templates/:id', (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }
    res.json({ success: true, template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ success: false, error: '获取模板失败' });
  }
});

// 创建模板（需要管理员权限）
router.post('/templates', requireAdmin, (req, res) => {
  try {
    const template = req.body;

    if (!template.id) {
      return res.status(400).json({ success: false, error: '模板 ID 不能为空' });
    }

    // 检查 ID 是否已存在
    if (getTemplateById(template.id)) {
      return res.status(400).json({ success: false, error: '模板 ID 已存在' });
    }

    const created = createTemplate(template);
    res.status(201).json({ success: true, template: created });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, error: '创建模板失败' });
  }
});

// 更新模板（需要管理员权限）
router.put('/templates/:id', requireAdmin, (req, res) => {
  try {
    const existing = getTemplateById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }

    const updated = updateTemplate(req.params.id, req.body);
    res.json({ success: true, template: updated });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ success: false, error: '更新模板失败' });
  }
});

// 删除模板（需要管理员权限）
router.delete('/templates/:id', requireAdmin, (req, res) => {
  try {
    const existing = getTemplateById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '模板不存在' });
    }

    deleteTemplate(req.params.id);
    res.json({ success: true, message: '模板已删除' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, error: '删除模板失败' });
  }
});

// ============ 词库 API ============

// 获取所有词库
router.get('/banks', (req, res) => {
  try {
    const banks = getAllBanks();
    res.json({ success: true, banks });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ success: false, error: '获取词库失败' });
  }
});

// ============ 分类 API ============

// 获取所有分类
router.get('/categories', (req, res) => {
  try {
    const categories = getAllCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: '获取分类失败' });
  }
});

// ============ 版本 API ============

// 获取版本信息
router.get('/version', (req, res) => {
  try {
    const version = getVersion();
    res.json({
      success: true,
      appVersion: process.env.APP_VERSION || '0.5.1',
      dataVersion: version.dataVersion,
      updatedAt: version.updatedAt
    });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ success: false, error: '获取版本信息失败' });
  }
});

// ============ 中间件 ============

function requireAdmin(req, res, next) {
  // 检查是否已登录
  if (req.session && req.session.admin) {
    return next();
  }

  // 检查 API Key（用于自动化脚本）
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    return next();
  }

  res.status(401).json({ success: false, error: '需要管理员权限' });
}

export default router;
