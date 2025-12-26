/**
 * 管理后台 API 服务
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/admin${endpoint}`;

  const config = {
    ...options,
    credentials: 'include',
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
 * 管理员认证 API
 */
export const adminAuthApi = {
  async login(username, password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async logout() {
    return request('/logout', { method: 'POST' });
  },

  async checkAuth() {
    return request('/check-auth');
  }
};

/**
 * 模板管理 API
 */
export const adminTemplateApi = {
  async getAll() {
    return request('/templates');
  },

  async getById(id) {
    return request(`/templates/${id}`);
  },

  async create(template) {
    return request('/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  },

  async update(id, template) {
    return request(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template)
    });
  },

  async delete(id) {
    return request(`/templates/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleActive(id) {
    return request(`/templates/${id}/toggle`, {
      method: 'POST'
    });
  },

  async approve(id) {
    return request(`/templates/${id}/approve`, {
      method: 'POST'
    });
  },

  async reject(id) {
    return request(`/templates/${id}/reject`, {
      method: 'POST'
    });
  },

  async getPending() {
    return request('/templates/pending');
  }
};

/**
 * 词库管理 API
 */
export const adminBankApi = {
  async getAll() {
    return request('/banks');
  }
};

/**
 * 版本管理 API
 */
export const adminVersionApi = {
  async get() {
    return request('/version');
  },

  async update(version) {
    return request('/version', {
      method: 'POST',
      body: JSON.stringify({ version })
    });
  }
};

/**
 * 统计数据 API
 */
export const adminStatsApi = {
  async get() {
    return request('/stats');
  }
};

export default {
  auth: adminAuthApi,
  template: adminTemplateApi,
  bank: adminBankApi,
  version: adminVersionApi,
  stats: adminStatsApi
};
