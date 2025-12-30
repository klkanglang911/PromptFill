import React, { useState, useEffect } from 'react';
import { X, Shield, User, FileText, CreditCard, Check, Loader2, ExternalLink } from 'lucide-react';

/**
 * 版权存证表单弹窗
 * 包含：作品名称、作者姓名、身份证号、声明确认
 */
export const CopyrightModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  templateName = '',
  t = (key) => key
}) => {
  const [workName, setWorkName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 初始化数据
  useEffect(() => {
    if (isOpen) {
      setWorkName(templateName || '');
      setAuthorName(initialData.author || '');
      setIdNumber('');
      setAgreedToTerms(false);
      setShowSuccess(false);
    }
  }, [isOpen, templateName, initialData]);

  // 锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!workName.trim() || !authorName.trim() || !idNumber.trim()) {
      return;
    }
    if (!agreedToTerms) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 显示成功提示
      setShowSuccess(true);

      // 2秒后关闭弹窗
      setTimeout(() => {
        onSubmit?.({
          workName,
          authorName,
          idNumber,
          submittedAt: new Date().toISOString()
        });
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('版权申请失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 验证身份证号格式（简单验证）
  const isValidIdNumber = (id) => {
    return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(id);
  };

  const isFormValid = workName.trim() && authorName.trim() && idNumber.trim() && agreedToTerms;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 成功提示覆盖层 */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {t('copyright_submitted') || '版权申请已提交'}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {t('copyright_submitted_desc') || '我们将尽快处理您的申请'}
            </p>
          </div>
        )}

        {/* 头部 */}
        <div className="relative p-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">
              {t('copyright_title') || '申请版权存证'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            {t('copyright_provider') || '版权保护服务提供方：'}
            <a
              href="https://blusea.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
            >
              青鸾印 blusea.cn
              <ExternalLink size={12} />
            </a>
          </p>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-4">
          {/* 作品名称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              {t('work_name') || '作品名称'}
            </label>
            <input
              type="text"
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
              placeholder={t('work_name_placeholder') || '请输入作品名称'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                       outline-none transition-all text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* 作者姓名 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              {t('author_real_name') || '作者姓名'}
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t('author_real_name_placeholder') || '请输入真实姓名'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                       outline-none transition-all text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* 身份证号 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CreditCard size={16} className="text-gray-400" />
              {t('id_number') || '作者身份证号'}
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
              placeholder={t('id_number_placeholder') || '请输入18位身份证号'}
              maxLength={18}
              className={`w-full px-4 py-3 border rounded-xl
                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                       outline-none transition-all text-sm ${
                         idNumber && !isValidIdNumber(idNumber)
                           ? 'border-red-300 bg-red-50'
                           : 'border-gray-200'
                       }`}
              disabled={isSubmitting}
            />
            {idNumber && !isValidIdNumber(idNumber) && (
              <p className="text-xs text-red-500 mt-1">
                {t('invalid_id_number') || '请输入有效的身份证号'}
              </p>
            )}
          </div>

          {/* 声明确认 */}
          <div
            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              agreedToTerms ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => !isSubmitting && setAgreedToTerms(!agreedToTerms)}
          >
            <div className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              agreedToTerms
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300'
            }`}>
              {agreedToTerms && (
                <Check size={14} className="text-white" strokeWidth={3} />
              )}
            </div>
            <span className="text-sm text-gray-600 leading-relaxed">
              {t('copyright_agreement') || '我已阅读'}
              <a
                href="https://blusea.cn/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 mx-1"
                onClick={(e) => e.stopPropagation()}
              >
                {t('copyright_terms_link') || '青鸾印作品保护声明'}
              </a>
            </span>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl
                     hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('cancel') || '取消'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || (idNumber && !isValidIdNumber(idNumber))}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600
                     text-white font-bold rounded-xl shadow-lg shadow-blue-500/30
                     hover:shadow-blue-500/40 hover:scale-[1.02]
                     active:scale-[0.98] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{t('submitting') || '提交中...'}</span>
              </>
            ) : (
              <>
                <Shield size={18} />
                <span>{t('apply_copyright_btn') || '申请版权'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyrightModal;
