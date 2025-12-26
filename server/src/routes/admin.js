import { Router } from 'express';
import { validateAdmin, requireAuth, skipIfAuth } from '../middleware/auth.js';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  updateTemplateStatus,
  getPendingTemplates,
  getAllBanks,
  getAllCategories,
  getVersion,
  setDataVersion
} from '../models/db.js';

const router = Router();

// 可用的模板标签
const TEMPLATE_TAGS = ["建筑", "人物", "摄影", "产品", "图表", "卡通", "宠物", "游戏", "创意"];

// ============ JSON API 路由 ============

// API: 检查认证状态
router.get('/check-auth', (req, res) => {
  if (req.session.admin) {
    res.json({
      authenticated: true,
      admin: { username: req.session.admin.username }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// API: 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '请输入用户名和密码'
      });
    }

    const admin = await validateAdmin(username, password);
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
    }

    req.session.admin = admin;
    res.json({
      success: true,
      admin: { username: admin.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请重试'
    });
  }
});

// API: 登出
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// API: 获取统计数据
router.get('/stats', requireAuth, (req, res) => {
  try {
    const templates = getAllTemplates(false, false);
    const pendingTemplates = getPendingTemplates();

    res.json({
      totalTemplates: templates.length,
      pendingCount: pendingTemplates.length,
      activeTemplates: templates.filter(t => t.isActive).length
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// API: 获取所有模板
router.get('/templates', requireAuth, (req, res) => {
  try {
    const templates = getAllTemplates(false, true); // 包括未激活的，包含用户信息
    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: '获取模板列表失败' });
  }
});

// API: 获取待审核模板
router.get('/templates/pending', requireAuth, (req, res) => {
  try {
    const templates = getPendingTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Get pending templates error:', error);
    res.status(500).json({ error: '获取待审核模板失败' });
  }
});

// API: 获取单个模板
router.get('/templates/:id', requireAuth, (req, res) => {
  try {
    const template = getTemplateById(req.params.id, true);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }
    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: '获取模板失败' });
  }
});

// API: 创建模板
router.post('/templates', requireAuth, (req, res) => {
  try {
    const body = req.body;

    // 解析表单数据
    const templateData = {
      id: body.id,
      name_cn: body.name_cn || body.name?.cn || '',
      name_en: body.name_en || body.name?.en || '',
      content_cn: body.content_cn || body.content?.cn || '',
      content_en: body.content_en || body.content?.en || '',
      image_url: body.image_url || '',
      image_urls: body.image_urls || [],
      author: body.author || '官方',
      selections: body.selections || {},
      tags: body.tags || [],
      language: body.language || ['cn', 'en'],
      sort_order: parseInt(body.sort_order) || 0,
      is_active: body.is_active !== false
    };

    // 验证
    if (!templateData.id) {
      return res.status(400).json({ error: '模板 ID 不能为空' });
    }
    if (!templateData.name_cn) {
      return res.status(400).json({ error: '中文名称不能为空' });
    }

    // 检查 ID 是否存在
    if (getTemplateById(templateData.id)) {
      return res.status(400).json({ error: '模板 ID 已存在' });
    }

    const template = createTemplate(templateData);
    res.json({ success: true, template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: error.message || '创建模板失败' });
  }
});

// API: 更新模板
router.put('/templates/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = getTemplateById(id);
    if (!existing) {
      return res.status(404).json({ error: '模板不存在' });
    }

    const templateData = {
      name_cn: body.name_cn || body.name?.cn || '',
      name_en: body.name_en || body.name?.en || '',
      content_cn: body.content_cn || body.content?.cn || '',
      content_en: body.content_en || body.content?.en || '',
      image_url: body.image_url || '',
      image_urls: body.image_urls || [],
      author: body.author || '官方',
      selections: body.selections || {},
      tags: body.tags || [],
      language: body.language || ['cn', 'en'],
      sort_order: parseInt(body.sort_order) || 0,
      is_active: body.is_active !== false
    };

    const template = updateTemplate(id, templateData);
    res.json({ success: true, template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: error.message || '更新模板失败' });
  }
});

// API: 删除模板
router.delete('/templates/:id', requireAuth, (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    deleteTemplate(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: '删除模板失败' });
  }
});

// API: 切换模板激活状态
router.post('/templates/:id/toggle', requireAuth, (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    updateTemplate(req.params.id, {
      ...template,
      is_active: !template.isActive
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Toggle template error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// API: 审核通过模板
router.post('/templates/:id/approve', requireAuth, (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    updateTemplateStatus(req.params.id, 'approved');
    res.json({ success: true });
  } catch (error) {
    console.error('Approve template error:', error);
    res.status(500).json({ error: '审核失败' });
  }
});

// API: 拒绝模板
router.post('/templates/:id/reject', requireAuth, (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    updateTemplateStatus(req.params.id, 'rejected');
    res.json({ success: true });
  } catch (error) {
    console.error('Reject template error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// API: 获取词库
router.get('/banks', requireAuth, (req, res) => {
  try {
    const banks = getAllBanks();
    const categories = getAllCategories();
    res.json({ banks, categories });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ error: '获取词库失败' });
  }
});

// API: 获取版本
router.get('/version', requireAuth, (req, res) => {
  try {
    const version = getVersion();
    res.json({ version });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ error: '获取版本失败' });
  }
});

// API: 更新版本
router.post('/version', requireAuth, (req, res) => {
  try {
    const { version } = req.body;
    if (!version) {
      return res.status(400).json({ error: '版本号不能为空' });
    }

    setDataVersion(version);
    res.json({ success: true, version });
  } catch (error) {
    console.error('Update version error:', error);
    res.status(500).json({ error: '更新版本失败' });
  }
});

export default router;
