/**
 * 模板编辑页面
 */
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Image, Plus, X, Loader2, Eye, EyeOff, Trash2
} from 'lucide-react';
import { adminTemplateApi, adminBankApi } from '../services/adminApi';
import { PREMIUM_STYLES, TAG_STYLES } from '../constants/styles';

// 可用标签
const TEMPLATE_TAGS = ["建筑", "人物", "摄影", "产品", "图表", "卡通", "宠物", "游戏", "创意"];

const TemplateEdit = ({ template, navigate, refresh }) => {
  const isNew = !template?.id;

  // 表单数据
  const [formData, setFormData] = useState({
    id: '',
    name_cn: '',
    name_en: '',
    content_cn: '',
    content_en: '',
    image_url: '',
    image_urls: [],
    author: '官方',
    tags: [],
    language: ['cn', 'en'],
    sort_order: 0,
    is_active: true
  });

  // UI 状态
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // 初始化表单数据
  useEffect(() => {
    if (template) {
      setFormData({
        id: template.id || '',
        name_cn: template.name?.cn || '',
        name_en: template.name?.en || '',
        content_cn: template.content?.cn || '',
        content_en: template.content?.en || '',
        image_url: template.imageUrl || '',
        image_urls: template.imageUrls || [],
        author: template.author || '官方',
        tags: template.tags || [],
        language: template.language || ['cn', 'en'],
        sort_order: template.sortOrder || 0,
        is_active: template.isActive !== false
      });
    }
  }, [template]);

  // 更新表单字段
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 切换标签
  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // 添加图片 URL
  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  // 删除图片 URL
  const removeImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  // 保存模板
  const handleSave = async () => {
    setError('');

    // 验证
    if (!formData.id.trim()) {
      setError('模板 ID 不能为空');
      return;
    }
    if (!formData.name_cn.trim()) {
      setError('中文名称不能为空');
      return;
    }
    if (!formData.content_cn.trim()) {
      setError('中文内容不能为空');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        name: { cn: formData.name_cn, en: formData.name_en },
        content: { cn: formData.content_cn, en: formData.content_en }
      };

      if (isNew) {
        await adminTemplateApi.create(data);
      } else {
        await adminTemplateApi.update(template.id, data);
      }

      refresh();
      navigate('templates');
    } catch (error) {
      console.error('Save template error:', error);
      setError(error.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('templates')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? '新建模板' : '编辑模板'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isNew ? '创建一个新的提示词模板' : `编辑模板: ${template?.name?.cn || template?.id}`}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${PREMIUM_STYLES.orange.from} 0%, ${PREMIUM_STYLES.orange.to} 100%)`,
            boxShadow: `0 4px 12px ${PREMIUM_STYLES.orange.shadowColor}`
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>保存</span>
            </>
          )}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息卡片 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">基本信息</h2>

            <div className="space-y-4">
              {/* 模板 ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  模板 ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => updateField('id', e.target.value)}
                  disabled={!isNew}
                  placeholder="例如: character-design"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400">唯一标识符，创建后不可修改</p>
              </div>

              {/* 中文名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  中文名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_cn}
                  onChange={(e) => updateField('name_cn', e.target.value)}
                  placeholder="输入中文名称"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                />
              </div>

              {/* 英文名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  英文名称
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => updateField('name_en', e.target.value)}
                  placeholder="Enter English name"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                />
              </div>

              {/* 作者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  作者/来源
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  placeholder="官方"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                />
              </div>

              {/* 排序 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  排序权重
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                />
                <p className="mt-1 text-xs text-gray-400">数值越小越靠前</p>
              </div>
            </div>
          </div>

          {/* 内容卡片 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">模板内容</h2>

            <div className="space-y-4">
              {/* 中文内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  中文内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content_cn}
                  onChange={(e) => updateField('content_cn', e.target.value)}
                  placeholder="使用 {{variable}} 插入变量"
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-mono text-sm resize-none"
                />
              </div>

              {/* 英文内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  英文内容
                </label>
                <textarea
                  value={formData.content_en}
                  onChange={(e) => updateField('content_en', e.target.value)}
                  placeholder="Use {{variable}} to insert variables"
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-mono text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：配置 */}
        <div className="space-y-6">
          {/* 状态卡片 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">状态</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-12 h-7 rounded-full transition-all duration-300 ${
                  formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
                onClick={() => updateField('is_active', !formData.is_active)}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 mt-1 ${
                    formData.is_active ? 'ml-6' : 'ml-1'
                  }`}
                />
              </div>
              <span className="text-sm text-gray-700">
                {formData.is_active ? '已发布' : '未发布'}
              </span>
            </label>
          </div>

          {/* 标签卡片 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">标签</h2>

            <div className="flex flex-wrap gap-2">
              {TEMPLATE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formData.tags.includes(tag)
                      ? TAG_STYLES[tag] || TAG_STYLES.default
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 图片卡片 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">预览图片</h2>

            {/* 主图 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                主图 URL
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => updateField('image_url', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-sm"
              />
            </div>

            {/* 主图预览 */}
            {formData.image_url && (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={formData.image_url}
                  alt="主图预览"
                  className="w-full h-32 object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {/* 更多图片 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                更多图片
              </label>

              {/* 已添加的图片 */}
              <div className="space-y-2 mb-3">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={url}
                        alt={`图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                    <input
                      type="text"
                      value={url}
                      readOnly
                      className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
                    />
                    <button
                      onClick={() => removeImageUrl(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* 添加新图片 */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="输入图片 URL"
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
                />
                <button
                  onClick={addImageUrl}
                  className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 危险操作 */}
          {!isNew && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <h2 className="text-lg font-bold text-red-700 mb-4">危险操作</h2>
              <button
                onClick={() => {
                  if (confirm('确定要删除此模板吗？此操作不可撤销。')) {
                    adminTemplateApi.delete(template.id).then(() => {
                      refresh();
                      navigate('templates');
                    }).catch((err) => {
                      alert('删除失败：' + err.message);
                    });
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl font-medium transition-all"
              >
                <Trash2 size={18} />
                <span>删除此模板</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEdit;
