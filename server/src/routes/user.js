import { Router } from 'express';
import {
  getUserTemplates,
  getUserTemplateById,
  createUserTemplate,
  updateUserTemplate,
  deleteUserTemplate,
  syncUserTemplates,
  getUserBanks,
  createOrUpdateUserBank,
  deleteUserBank
} from '../models/db.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();

// 所有路由都需要用户登录
router.use(requireUser);

// ============ 用户模板 ============

// 获取用户所有模板
router.get('/templates', (req, res) => {
  try {
    const templates = getUserTemplates(req.session.user.id);
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get user templates error:', error);
    res.status(500).json({
      success: false,
      error: '获取模板失败'
    });
  }
});

// 创建用户模板
router.post('/templates', (req, res) => {
  try {
    const template = createUserTemplate(req.session.user.id, req.body);
    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Create user template error:', error);
    res.status(500).json({
      success: false,
      error: '创建模板失败'
    });
  }
});

// 更新用户模板
router.put('/templates/:id', (req, res) => {
  try {
    const existing = getUserTemplateById(req.session.user.id, req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: '模板不存在'
      });
    }

    const template = updateUserTemplate(req.session.user.id, req.params.id, req.body);
    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Update user template error:', error);
    res.status(500).json({
      success: false,
      error: '更新模板失败'
    });
  }
});

// 删除用户模板
router.delete('/templates/:id', (req, res) => {
  try {
    const existing = getUserTemplateById(req.session.user.id, req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: '模板不存在'
      });
    }

    deleteUserTemplate(req.session.user.id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user template error:', error);
    res.status(500).json({
      success: false,
      error: '删除模板失败'
    });
  }
});

// 同步本地模板到云端
router.post('/templates/sync', (req, res) => {
  try {
    const { templates } = req.body;

    if (!Array.isArray(templates)) {
      return res.status(400).json({
        success: false,
        error: '无效的模板数据'
      });
    }

    const synced = syncUserTemplates(req.session.user.id, templates);
    res.json({
      success: true,
      templates: synced,
      syncedCount: templates.length
    });
  } catch (error) {
    console.error('Sync user templates error:', error);
    res.status(500).json({
      success: false,
      error: '同步失败'
    });
  }
});

// ============ 用户词库 ============

// 获取用户所有词库
router.get('/banks', (req, res) => {
  try {
    const banks = getUserBanks(req.session.user.id);
    res.json({
      success: true,
      banks
    });
  } catch (error) {
    console.error('Get user banks error:', error);
    res.status(500).json({
      success: false,
      error: '获取词库失败'
    });
  }
});

// 创建或更新用户词库
router.put('/banks/:key', (req, res) => {
  try {
    createOrUpdateUserBank(req.session.user.id, req.params.key, req.body);
    const banks = getUserBanks(req.session.user.id);
    res.json({
      success: true,
      banks
    });
  } catch (error) {
    console.error('Update user bank error:', error);
    res.status(500).json({
      success: false,
      error: '更新词库失败'
    });
  }
});

// 删除用户词库
router.delete('/banks/:key', (req, res) => {
  try {
    deleteUserBank(req.session.user.id, req.params.key);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user bank error:', error);
    res.status(500).json({
      success: false,
      error: '删除词库失败'
    });
  }
});

// 批量同步词库
router.post('/banks/sync', (req, res) => {
  try {
    const { banks } = req.body;

    if (!banks || typeof banks !== 'object') {
      return res.status(400).json({
        success: false,
        error: '无效的词库数据'
      });
    }

    for (const [key, bank] of Object.entries(banks)) {
      createOrUpdateUserBank(req.session.user.id, key, bank);
    }

    const synced = getUserBanks(req.session.user.id);
    res.json({
      success: true,
      banks: synced
    });
  } catch (error) {
    console.error('Sync user banks error:', error);
    res.status(500).json({
      success: false,
      error: '同步失败'
    });
  }
});

export default router;
