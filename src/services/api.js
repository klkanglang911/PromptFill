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

export default {
  template: templateApi,
  bank: bankApi,
  version: versionApi
};
