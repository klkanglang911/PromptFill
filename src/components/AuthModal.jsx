import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';

/**
 * 登录/注册弹窗组件
 * 延续现有 UI 风格：橙色主题、圆角、毛玻璃效果
 */
export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  t = (key) => key // 国际化函数
}) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setError('');
      setEmail('');
      setPassword('');
      setNickname('');
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // 锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 验证
      if (!email || !password) {
        throw new Error('请填写邮箱和密码');
      }

      if (mode === 'register' && password.length < 6) {
        throw new Error('密码长度至少6位');
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, nickname: nickname || email.split('@')[0] };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '操作失败');
      }

      // 登录成功
      onLoginSuccess?.(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login' ? '登录以同步你的模板到云端' : '创建账号开始使用'}
          </p>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* 邮箱 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                         outline-none transition-all text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? '至少6位字符' : '输入密码'}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                         outline-none transition-all text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 昵称（仅注册） */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">昵称（可选）</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="你的昵称"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                           outline-none transition-all text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#FDBA74] to-[#F97316]
                     text-white font-bold rounded-xl shadow-lg
                     hover:shadow-orange-500/25 hover:scale-[1.02]
                     active:scale-[0.98] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>处理中...</span>
              </>
            ) : (
              <span>{mode === 'login' ? '登录' : '注册'}</span>
            )}
          </button>
        </form>

        {/* 底部切换 */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={toggleMode}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
          >
            {mode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
