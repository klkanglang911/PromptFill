/**
 * API 服务层
 * 用于与后端服务通信
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 通用请求函数
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    ...options,
    credentials: 'include', // 携带 cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * 模板 API
 */
export const templateApi = {
  /**
   * 获取所有模板
   * @param {Object} options - 查询选项
   * @param {string} options.lang - 语言过滤 (cn/en)
   * @param {string[]} options.tags - 标签过滤
   * @param {boolean} options.all - 是否包含未激活模板
   */
  async getAll(options = {}) {
    const params = new URLSearchParams();
    if (options.lang) params.set('lang', options.lang);
    if (options.tags?.length) params.set('tags', options.tags.join(','));
    if (options.all) params.set('all', 'true');

    const query = params.toString();
    return request(`/templates${query ? '?' + query : ''}`);
  },

  /**
   * 获取单个模板
   * @param {string} id - 模板 ID
   */
  async getById(id) {
    return request(`/templates/${id}`);
  },

  /**
   * 创建模板（需要管理员权限）
   * @param {Object} template - 模板数据
   */
  async create(template) {
    return request('/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  },

  /**
   * 更新模板（需要管理员权限）
   * @param {string} id - 模板 ID
   * @param {Object} template - 模板数据
   */
  async update(id, template) {
    return request(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template)
    });
  },

  /**
   * 删除模板（需要管理员权限）
   * @param {string} id - 模板 ID
   */
  async delete(id) {
    return request(`/templates/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * 词库 API
 */
export const bankApi = {
  /**
   * 获取所有词库
   */
  async getAll() {
    return request('/banks');
  }
};

/**
 * 版本 API
 */
export const versionApi = {
  /**
   * 获取版本信息
   */
  async get() {
    // 添加时间戳避免缓存
    return request(`/version?t=${Date.now()}`);
  }
};

/**
 * 用户认证 API
 */
export const authApi = {
  /**
   * 用户注册
   */
  async register(email, password, nickname) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nickname })
    });
  },

  /**
   * 用户登录
   */
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  /**
   * 用户登出
   */
  async logout() {
    return request('/auth/logout', { method: 'POST' });
  },

  /**
   * 获取当前用户信息
   */
  async me() {
    return request('/auth/me');
  }
};

/**
 * 用户模板 API
 */
export const userTemplateApi = {
  /**
   * 获取用户所有模板
   */
  async getAll() {
    return request('/user/templates');
  },

  /**
   * 创建用户模板
   */
  async create(template) {
    return request('/user/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  },

  /**
   * 更新用户模板
   */
  async update(id, template) {
    return request(`/user/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template)
    });
  },

  /**
   * 删除用户模板
   */
  async delete(id) {
    return request(`/user/templates/${id}`, { method: 'DELETE' });
  },

  /**
   * 同步本地模板到云端
   */
  async sync(templates) {
    return request('/user/templates/sync', {
      method: 'POST',
      body: JSON.stringify({ templates })
    });
  }
};

/**
 * 用户词库 API
 */
export const userBankApi = {
  /**
   * 获取用户所有词库
   */
  async getAll() {
    return request('/user/banks');
  },

  /**
   * 同步词库到云端
   */
  async sync(banks) {
    return request('/user/banks/sync', {
      method: 'POST',
      body: JSON.stringify({ banks })
    });
  }
};

/**
 * 图片上传 API
 */
export const uploadApi = {
  /**
   * 上传单张图片
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '上传失败' }));
      throw new Error(error.error || '上传失败');
    }

    return response.json();
  }
};

export default {
  template: templateApi,
  bank: bankApi,
  version: versionApi,
  auth: authApi,
  userTemplate: userTemplateApi,
  userBank: userBankApi,
  upload: uploadApi
};
