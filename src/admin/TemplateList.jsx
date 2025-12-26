/**
 * 模板列表页面
 */
import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, MoreVertical,
  RefreshCw, Filter, ChevronDown, User, Clock, Check, X, Image
} from 'lucide-react';
import { adminTemplateApi } from '../services/adminApi';
import { PREMIUM_STYLES, TAG_STYLES } from '../constants/styles';

const TemplateList = ({ navigate, refresh }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, pending
  const [activeMenu, setActiveMenu] = useState(null);

  // 加载模板列表
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await adminTemplateApi.getAll();
      setTemplates(result.templates || []);
    } catch (error) {
      console.error('Load templates error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换模板状态
  const handleToggleActive = async (template) => {
    try {
      await adminTemplateApi.toggleActive(template.id);
      loadTemplates();
      refresh();
    } catch (error) {
      console.error('Toggle template error:', error);
      alert('操作失败：' + error.message);
    }
  };

  // 删除模板
  const handleDelete = async (template) => {
    if (!confirm(`确定要删除模板「${template.name?.cn || template.id}」吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await adminTemplateApi.delete(template.id);
      loadTemplates();
      refresh();
    } catch (error) {
      console.error('Delete template error:', error);
      alert('删除失败：' + error.message);
    }
  };

  // 过滤模板
  const filteredTemplates = templates.filter(t => {
    // 搜索过滤
    const matchSearch = !searchTerm ||
      t.name?.cn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchTerm.toLowerCase());

    // 状态过滤
    let matchStatus = true;
    if (filterStatus === 'active') matchStatus = t.isActive && t.status === 'approved';
    else if (filterStatus === 'inactive') matchStatus = !t.isActive;
    else if (filterStatus === 'pending') matchStatus = t.status === 'pending';

    return matchSearch && matchStatus;
  });

  // 获取状态标签
  const getStatusBadge = (template) => {
    if (template.status === 'pending') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
          待审核
        </span>
      );
    }
    if (template.status === 'rejected') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
          已拒绝
        </span>
      );
    }
    if (!template.isActive) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          未激活
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
        已发布
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">模板管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理和编辑所有提示词模板</p>
        </div>
        <button
          onClick={() => navigate('template-edit', { template: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${PREMIUM_STYLES.orange.from} 0%, ${PREMIUM_STYLES.orange.to} 100%)`,
            boxShadow: `0 4px 12px ${PREMIUM_STYLES.orange.shadowColor}`
          }}
        >
          <Plus size={18} />
          <span>新建模板</span>
        </button>
      </div>

      {/* 搜索和过滤栏 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索模板名称或ID..."
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>

        {/* 状态过滤 */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          >
            <option value="all">全部状态</option>
            <option value="active">已发布</option>
            <option value="inactive">未激活</option>
            <option value="pending">待审核</option>
          </select>
        </div>

        {/* 刷新按钮 */}
        <button
          onClick={loadTemplates}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">刷新</span>
        </button>
      </div>

      {/* 模板列表 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="text-orange-500 animate-spin" />
              <span className="text-gray-500">加载中...</span>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Image size={48} className="mb-4 opacity-50" />
            <p>暂无模板数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">预览</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">模板信息</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">创建者</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">标签</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* 预览图 */}
                    <td className="px-4 py-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {template.imageUrl || template.imageUrls?.[0] ? (
                          <img
                            src={template.imageUrl || template.imageUrls[0]}
                            alt={template.name?.cn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Image size={24} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 模板信息 */}
                    <td className="px-4 py-3">
                      <div className="min-w-[200px]">
                        <div className="font-semibold text-gray-800">{template.name?.cn || '未命名'}</div>
                        <div className="text-sm text-gray-500">{template.name?.en || ''}</div>
                        <div className="text-xs text-gray-400 mt-1 font-mono">{template.id}</div>
                      </div>
                    </td>

                    {/* 创建者 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {template.userId ? (
                          <>
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                              <User size={14} className="text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">
                                {template.userNickname || '用户'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {template.userEmail || ''}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">官方</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* 标签 */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(template.tags || []).slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${TAG_STYLES[tag] || TAG_STYLES.default}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {(template.tags?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 text-xs text-gray-400">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 状态 */}
                    <td className="px-4 py-3">
                      {getStatusBadge(template)}
                    </td>

                    {/* 操作 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate('template-edit', { template })}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(template)}
                          className={`p-2 rounded-lg transition-all ${
                            template.isActive
                              ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={template.isActive ? '停用' : '启用'}
                        >
                          {template.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(template)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="mt-4 text-sm text-gray-500">
        共 {filteredTemplates.length} 个模板
        {searchTerm && ` (已过滤，总共 ${templates.length} 个)`}
      </div>
    </div>
  );
};

export default TemplateList;
