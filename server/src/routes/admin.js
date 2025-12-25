import { Router } from 'express';
import { validateAdmin, requireAuth, skipIfAuth } from '../middleware/auth.js';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAllBanks,
  getAllCategories,
  getVersion,
  setDataVersion
} from '../models/db.js';

const router = Router();

// 可用的模板标签
const TEMPLATE_TAGS = ["建筑", "人物", "摄影", "产品", "图表", "卡通", "宠物", "游戏", "创意"];

// ============ 登录/登出 ============

// 登录页面
router.get('/login', skipIfAuth, (req, res) => {
  res.render('admin/login', {
    title: '管理员登录',
    error: null
  });
});

// 处理登录
router.post('/login', skipIfAuth, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('admin/login', {
        title: '管理员登录',
        error: '请输入用户名和密码'
      });
    }

    const admin = await validateAdmin(username, password);
    if (!admin) {
      return res.render('admin/login', {
        title: '管理员登录',
        error: '用户名或密码错误'
      });
    }

    req.session.admin = admin;
    res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', {
      title: '管理员登录',
      error: '登录失败，请重试'
    });
  }
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ============ 模板管理 ============

// 模板列表（首页）
router.get('/', requireAuth, (req, res) => {
  const templates = getAllTemplates(false); // 包括未激活的
  const version = getVersion();

  res.render('admin/templates', {
    title: '模板管理',
    templates,
    version,
    admin: req.session.admin,
    success: req.query.success,
    error: req.query.error
  });
});

// 新建模板页面
router.get('/templates/new', requireAuth, (req, res) => {
  const categories = getAllCategories();
  const banks = getAllBanks();

  res.render('admin/template-edit', {
    title: '新建模板',
    template: null,
    categories,
    banks,
    tags: TEMPLATE_TAGS,
    admin: req.session.admin,
    error: null
  });
});

// 编辑模板页面
router.get('/templates/:id/edit', requireAuth, (req, res) => {
  const template = getTemplateById(req.params.id);
  if (!template) {
    return res.redirect('/admin?error=模板不存在');
  }

  const categories = getAllCategories();
  const banks = getAllBanks();

  res.render('admin/template-edit', {
    title: '编辑模板',
    template,
    categories,
    banks,
    tags: TEMPLATE_TAGS,
    admin: req.session.admin,
    error: null
  });
});

// 保存模板（新建或更新）
router.post('/templates/:id?', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // 解析表单数据
    const templateData = {
      id: body.id || id,
      name_cn: body.name_cn,
      name_en: body.name_en,
      content_cn: body.content_cn,
      content_en: body.content_en,
      image_url: body.image_url,
      image_urls: body.image_urls ? body.image_urls.split('\n').filter(u => u.trim()) : [],
      author: body.author || '官方',
      selections: body.selections ? JSON.parse(body.selections) : {},
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []),
      language: Array.isArray(body.language) ? body.language : (body.language ? [body.language] : ['cn', 'en']),
      sort_order: parseInt(body.sort_order) || 0,
      is_active: body.is_active === 'on' || body.is_active === '1'
    };

    // 验证必填字段
    if (!templateData.id) {
      throw new Error('模板 ID 不能为空');
    }
    if (!templateData.name_cn) {
      throw new Error('中文名称不能为空');
    }
    if (!templateData.content_cn) {
      throw new Error('中文内容不能为空');
    }

    if (id) {
      // 更新
      updateTemplate(id, templateData);
      res.redirect('/admin?success=模板已更新');
    } else {
      // 新建
      if (getTemplateById(templateData.id)) {
        throw new Error('模板 ID 已存在');
      }
      createTemplate(templateData);
      res.redirect('/admin?success=模板已创建');
    }
  } catch (error) {
    console.error('Save template error:', error);

    const categories = getAllCategories();
    const banks = getAllBanks();

    res.render('admin/template-edit', {
      title: req.params.id ? '编辑模板' : '新建模板',
      template: req.body,
      categories,
      banks,
      tags: TEMPLATE_TAGS,
      admin: req.session.admin,
      error: error.message
    });
  }
});

// 删除模板
router.post('/templates/:id/delete', requireAuth, (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.redirect('/admin?error=模板不存在');
    }

    deleteTemplate(req.params.id);
    res.redirect('/admin?success=模板已删除');
  } catch (error) {
    console.error('Delete template error:', error);
    res.redirect('/admin?error=删除失败');
  }
});

// 切换模板状态
router.post('/templates/:id/toggle', requireAuth, (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    if (!template) {
      return res.redirect('/admin?error=模板不存在');
    }

    updateTemplate(req.params.id, {
      ...template,
      is_active: !template.isActive
    });

    res.redirect('/admin?success=模板状态已更新');
  } catch (error) {
    console.error('Toggle template error:', error);
    res.redirect('/admin?error=操作失败');
  }
});

// ============ 词库管理 ============

router.get('/banks', requireAuth, (req, res) => {
  const banks = getAllBanks();
  const categories = getAllCategories();

  res.render('admin/banks', {
    title: '词库管理',
    banks,
    categories,
    admin: req.session.admin
  });
});

// ============ 版本管理 ============

router.post('/version', requireAuth, (req, res) => {
  try {
    const { version } = req.body;
    if (!version) {
      return res.redirect('/admin?error=版本号不能为空');
    }

    setDataVersion(version);
    res.redirect('/admin?success=版本已更新');
  } catch (error) {
    console.error('Update version error:', error);
    res.redirect('/admin?error=更新版本失败');
  }
});

export default router;
