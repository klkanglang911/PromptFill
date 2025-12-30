import React, { useState } from 'react';
import { X, Lightbulb, Sparkles, Shield } from 'lucide-react';

/**
 * 完成编辑确认对话框
 * 用户可以选择：
 * 1. 灵感来源于（输入贡献者）
 * 2. 原创（可申请版权）
 */
export const FinishEditDialog = ({
  isOpen,
  onClose,
  onConfirm,
  onOpenCopyright,
  t = (key) => key
}) => {
  const [sourceType, setSourceType] = useState('inspired'); // 'inspired' | 'original'
  const [inspirationSource, setInspirationSource] = useState('');
  const [originalAuthor, setOriginalAuthor] = useState('');
  const [applyCopyright, setApplyCopyright] = useState(false);

  // 重置状态
  const handleClose = () => {
    setSourceType('inspired');
    setInspirationSource('');
    setOriginalAuthor('');
    setApplyCopyright(false);
    onClose();
  };

  const handleConfirm = () => {
    if (applyCopyright && sourceType === 'original') {
      // 打开版权申请弹窗
      onOpenCopyright({
        author: originalAuthor,
        sourceType,
        inspirationSource
      });
    } else {
      // 直接完成编辑
      onConfirm({
        sourceType,
        inspirationSource: sourceType === 'inspired' ? inspirationSource : '',
        originalAuthor: sourceType === 'original' ? originalAuthor : '',
        applyCopyright: false
      });
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {t('finish_edit_title') || '完成编辑'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {t('finish_edit_subtitle') || '请选择作品来源类型'}
          </p>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 选项1: 灵感来源于 */}
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              sourceType === 'inspired'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSourceType('inspired')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                sourceType === 'inspired'
                  ? 'border-orange-500'
                  : 'border-gray-300'
              }`}>
                {sourceType === 'inspired' && (
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                )}
              </div>
              <Lightbulb size={20} className={sourceType === 'inspired' ? 'text-orange-500' : 'text-gray-400'} />
              <span className={`font-medium ${sourceType === 'inspired' ? 'text-orange-700' : 'text-gray-700'}`}>
                {t('inspired_by') || '灵感来源于'}
              </span>
            </div>
            {sourceType === 'inspired' && (
              <div className="mt-3 ml-8">
                <input
                  type="text"
                  value={inspirationSource}
                  onChange={(e) => setInspirationSource(e.target.value)}
                  placeholder={t('inspiration_source_placeholder') || '请输入灵感来源/贡献者'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                           outline-none transition-all text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>

          {/* 选项2: 原创 */}
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              sourceType === 'original'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSourceType('original')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                sourceType === 'original'
                  ? 'border-orange-500'
                  : 'border-gray-300'
              }`}>
                {sourceType === 'original' && (
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                )}
              </div>
              <Sparkles size={20} className={sourceType === 'original' ? 'text-orange-500' : 'text-gray-400'} />
              <span className={`font-medium ${sourceType === 'original' ? 'text-orange-700' : 'text-gray-700'}`}>
                {t('original_work') || '原创'}
              </span>
            </div>
            {sourceType === 'original' && (
              <div className="mt-3 ml-8 space-y-3">
                <input
                  type="text"
                  value={originalAuthor}
                  onChange={(e) => setOriginalAuthor(e.target.value)}
                  placeholder={t('author_name_placeholder') || '请输入作者名称'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                           outline-none transition-all text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                {/* 申请版权选项 */}
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setApplyCopyright(!applyCopyright);
                  }}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    applyCopyright
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {applyCopyright && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Shield size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {t('apply_copyright') || '申请版权'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl
                     hover:bg-gray-50 transition-colors"
          >
            {t('cancel') || '取消'}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600
                     text-white font-bold rounded-xl shadow-lg shadow-orange-500/30
                     hover:shadow-orange-500/40 hover:scale-[1.02]
                     active:scale-[0.98] transition-all"
          >
            {t('confirm') || '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishEditDialog;
