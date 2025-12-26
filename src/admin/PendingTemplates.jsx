/**
 * 待审核模板页面
 */
import React, { useState, useEffect } from 'react';
import {
  Clock, Check, X, User, Eye, RefreshCw, Image, Edit2, ChevronDown, ChevronUp
} from 'lucide-react';
import { adminTemplateApi } from '../services/adminApi';
import { PREMIUM_STYLES, TAG_STYLES } from '../constants/styles';

const PendingTemplates = ({ navigate, refresh }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // 加载待审核模板
  useEffect(() => {
    loadPendingTemplates();
  }, []);

  const loadPendingTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await adminTemplateApi.getPending();
      setTemplates(result.templates || []);
    } catch (error) {
      console.error('Load pending templates error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 审核通过
  const handleApprove = async (template) => {
    if (!confirm(`确定要通过模板「${template.name?.cn || template.id}」的审核吗？`)) {
      return;
    }

    setProcessingId(template.id);
    try {
      await adminTemplateApi.approve(template.id);
      loadPendingTemplates();
      refresh();
    } catch (error) {
      console.error('Approve template error:', error);
      alert('操作失败：' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // 拒绝
  const handleReject = async (template) => {
    if (!confirm(`确定要拒绝模板「${template.name?.cn || template.id}」吗？`)) {
      return;
    }

    setProcessingId(template.id);
    try {
      await adminTemplateApi.reject(template.id);
      loadPendingTemplates();
      refresh();
    } catch (error) {
      console.error('Reject template error:', error);
      alert('操作失败：' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">待审核模板</h1>
          <p className="text-gray-500 text-sm mt-1">审核用户提交的新模板</p>
        </div>
        <button
          onClick={loadPendingTemplates}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          <span>刷新</span>
        </button>
      </div>

      {/* 模板列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={32} className="text-amber-500 animate-spin" />
            <span className="text-gray-500">加载中...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">没有待审核的模板</h3>
          <p className="text-gray-500">所有模板都已审核完成</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 卡片头部 */}
              <div className="p-4 flex items-start gap-4">
                {/* 预览图 */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {template.imageUrl || template.imageUrls?.[0] ? (
                    <img
                      src={template.imageUrl || template.imageUrls[0]}
                      alt={template.name?.cn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Image size={28} />
                    </div>
                  )}
                </div>

                {/* 模板信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {template.name?.cn || '未命名'}
                      </h3>
                      <p className="text-gray-500 text-sm">{template.name?.en || ''}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>提交于 {new Date(template.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 提交者信息 */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                        <User size={12} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-violet-700">
                          {template.userNickname || '用户'}
                        </div>
                        <div className="text-xs text-violet-500">
                          {template.userEmail || ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 标签 */}
                  {template.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${TAG_STYLES[tag] || TAG_STYLES.default}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 展开/收起按钮 */}
              <button
                onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                className="w-full px-4 py-2 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {expandedId === template.id ? (
                  <>
                    <ChevronUp size={16} />
                    <span className="text-sm">收起内容</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span className="text-sm">查看内容</span>
                  </>
                )}
              </button>

              {/* 展开内容 */}
              {expandedId === template.id && (
                <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 中文内容 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">中文内容</label>
                      <div className="p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {template.content?.cn || '无内容'}
                      </div>
                    </div>

                    {/* 英文内容 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">英文内容</label>
                      <div className="p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {template.content?.en || '无内容'}
                      </div>
                    </div>
                  </div>

                  {/* 图片预览 */}
                  {template.imageUrls?.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">预览图片</label>
                      <div className="flex flex-wrap gap-2">
                        {template.imageUrls.map((url, idx) => (
                          <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={url}
                              alt={`图片 ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
                <button
                  onClick={() => navigate('template-edit', { template })}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                  <span>编辑</span>
                </button>
                <button
                  onClick={() => handleReject(template)}
                  disabled={processingId === template.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                >
                  <X size={16} />
                  <span>拒绝</span>
                </button>
                <button
                  onClick={() => handleApprove(template)}
                  disabled={processingId === template.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${PREMIUM_STYLES.emerald.from} 0%, ${PREMIUM_STYLES.emerald.to} 100%)`,
                    boxShadow: `0 2px 8px ${PREMIUM_STYLES.emerald.shadowColor}`
                  }}
                >
                  <Check size={16} />
                  <span>通过</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      <div className="mt-4 text-sm text-gray-500">
        共 {templates.length} 个待审核模板
      </div>
    </div>
  );
};

export default PendingTemplates;
