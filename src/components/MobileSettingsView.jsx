import React, { useState } from 'react';
import {
  Settings, Globe, Database, Download, Upload,
  RotateCcw, Trash2, Mail, MessageCircle, Github,
  ChevronRight, RefreshCw, FileText, Info, User, LogOut, Cloud, X, Sun, Moon
} from 'lucide-react';

export const MobileSettingsView = ({
  language, setLanguage,
  storageMode, setStorageMode,
  handleImportTemplate, handleExportAllTemplates,
  handleCompleteBackup, handleImportAllData,
  handleResetSystemData, handleClearAllData,
  SYSTEM_DATA_VERSION, t,
  currentUser, onLoginClick, onLogout,
  isDarkMode, setIsDarkMode
}) => {
  const [showWechatQR, setShowWechatQR] = useState(false);
  
  // 完善后的更新日志 (同步桌面端内容)
  const updateLogs = language === 'cn' ? [
    { 
      version: 'V0.6.0', 
      date: '2025-12-23', 
      title: 'UI 全面升级与极简重构',
      content: [
        '侧边栏采用 Morandi 色系重构，视觉更温暖优雅',
        '模版列表引入极简标签与搜索框设计',
        '词库配置卡片重绘，支持左侧主题色条',
        '设置面板增加更新日志时间轴，风格高度统一'
      ]
    },
    { 
      version: 'V0.5.1', 
      date: '2025-12-22', 
      title: '移动端架构优化',
      content: [
        '全新移动端交互架构，引入侧滑抽屉与沉浸式预览',
        '首页引入 Mesh Gradient 彻底根治背景闪烁',
        '优化了 LocalStorage 存储配额满时的静默处理'
      ]
    },
    { 
      version: 'V0.5.0', 
      date: '2025-12-20', 
      title: '功能增强与性能重构',
      content: [
        '深度架构重构，引入发现页瀑布流展示',
        '导出功能增强，支持 Base64 预取解决图片空白',
        '模版多图编辑功能初步上线'
      ]
    }
  ] : [
    { 
      version: 'V0.6.0', 
      date: '2025-12-23', 
      title: 'UI Upgrade & Minimalist Refactor',
      content: [
        'Sidebar refactored with Morandi palette for a warmer feel',
        'Minimalist tags and search box for template list',
        'Redrawn bank cards with theme color bars',
        'Unified update log timeline in settings'
      ]
    },
    { 
      version: 'V0.5.1', 
      date: '2025-12-22', 
      title: 'Mobile Architecture Optimization',
      content: [
        'New mobile drawer and immersive preview interaction',
        'Mesh Gradient for smooth background transition',
        'Silent handling for storage quota exceeded errors'
      ]
    },
    { 
      version: 'V0.5.0', 
      date: '2025-12-20', 
      title: 'Features & Performance',
      content: [
        'Discovery view with masonry layout',
        'Enhanced export with Base64 prefetching',
        'Multiple image editing support'
      ]
    }
  ];

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="mb-8 px-6">
      <div className={`flex items-center gap-2 mb-4 ${isDarkMode ? 'opacity-60 text-white/60' : 'opacity-40'}`}>
        <Icon size={14} strokeWidth={2.5} />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/60'} backdrop-blur-md rounded-3xl border overflow-hidden shadow-sm`}>
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ icon: Icon, label, value, onClick, disabled = false, danger = false }) => (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 transition-all border-b last:border-0 ${
        isDarkMode ? 'border-white/5' : 'border-gray-100/50'
      } ${
        disabled ? 'opacity-30 cursor-not-allowed' : (isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-white/50 active:bg-white/80')
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : (isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-50 text-gray-600')}`}>
          <Icon size={18} />
        </div>
        <span className={`text-sm font-bold ${danger ? 'text-red-500' : (isDarkMode ? 'text-gray-200' : 'text-gray-700')}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{value}</span>}
        {!disabled && <ChevronRight size={14} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />}
      </div>
    </button>
  );

  return (
    <div className={`flex-1 overflow-y-auto pb-32 relative transition-colors duration-300 ${isDarkMode ? 'bg-[#181716]' : 'bg-white'}`}>
      <div className="pt-12 pb-8 px-8">
        <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('settings')}</h1>
        <p className={`text-xs font-medium mt-1 uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('template_subtitle')}</p>
      </div>

      {/* 0. 用户账户 */}
      <SettingSection title={language === 'cn' ? '账户' : 'Account'} icon={User}>
        {currentUser ? (
          <>
            <div className="px-5 py-4 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/30">
                  {currentUser.nickname?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{currentUser.nickname || currentUser.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full">
                  <Cloud size={12} />
                  <span className="text-[10px] font-bold">{language === 'cn' ? '已同步' : 'Synced'}</span>
                </div>
              </div>
            </div>
            <SettingItem
              icon={LogOut}
              label={language === 'cn' ? '退出登录' : 'Sign Out'}
              onClick={onLogout}
              danger={true}
            />
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="w-full flex items-center justify-between px-5 py-5 hover:bg-orange-50/50 active:bg-orange-100/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                <User size={20} />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-gray-800 block">{language === 'cn' ? '登录 / 注册' : 'Sign In / Sign Up'}</span>
                <span className="text-[10px] text-gray-400">{language === 'cn' ? '登录后可将模板同步到云端' : 'Sync templates to cloud after login'}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-orange-400" />
          </button>
        )}
      </SettingSection>

      {/* 1. 系统设置 */}
      <SettingSection title={t('general_settings')} icon={Settings}>
        <SettingItem 
          icon={Globe} 
          label={t('language')} 
          value={language === 'cn' ? '简体中文' : 'English'} 
          onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
        />
        <SettingItem 
          icon={Database} 
          label={t('storage_mode')} 
          value={t('use_browser_storage')} 
          disabled={true} // 移动端暂不支持本地文件夹
        />
      </SettingSection>

      {/* 2. 数据管理 */}
      <SettingSection title={t('data_management')} icon={RefreshCw}>
        <div className="w-full">
          <label className="block cursor-pointer">
            <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" />
            <div className={`w-full flex items-center justify-between px-5 py-4 transition-all border-b ${
              isDarkMode ? 'border-white/5 hover:bg-white/5 active:bg-white/10' : 'border-gray-100/50 hover:bg-white/50 active:bg-white/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                  <Download size={18} />
                </div>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('import_template')}</span>
              </div>
              <ChevronRight size={14} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
            </div>
          </label>
          <SettingItem icon={Upload} label={t('export_all_templates')} onClick={handleExportAllTemplates} />
          <SettingItem icon={RefreshCw} label={t('refresh_system')} onClick={handleResetSystemData} />
          <SettingItem icon={Trash2} label={t('clear_all_data')} onClick={handleClearAllData} danger={true} />
        </div>
      </SettingSection>

      {/* 3. 更新日志 */}
      <SettingSection title={t('what_is_new')} icon={FileText}>
        <div className="p-5 space-y-8">
          {updateLogs.map((log, idx) => (
            <div key={idx} className={`relative pl-5 border-l-2 ${isDarkMode ? 'border-orange-500/40' : 'border-orange-500/20'}`}>
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-orange-500" />
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[13px] font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{log.title}</span>
                <span className={`text-[10px] font-bold tabular-nums ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{log.date}</span>
              </div>
              <ul className="space-y-1.5">
                {log.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SettingSection>

      {/* 4. 关于与联系 */}
      <SettingSection title={t('connect_author')} icon={Info}>
        <SettingItem 
          icon={Mail} 
          label={t('contact_author')} 
          value="tanshilong@gmail.com" 
          onClick={() => window.location.href = 'mailto:tanshilong@gmail.com'}
        />
        <SettingItem 
          icon={MessageCircle} 
          label="微信反馈" 
          value="tanshilongmario" 
          onClick={() => setShowWechatQR(true)}
        />
        <SettingItem 
          icon={Github} 
          label={t('github_link')} 
          onClick={() => window.open('https://github.com/TanShilongMario/PromptFill', '_blank')}
        />
      </SettingSection>

      {/* WeChat QR Popover (Mobile Style) */}
      {showWechatQR && (
        <div 
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-6"
          onClick={() => setShowWechatQR(false)}
        >
          <div 
            className={`${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-white/60'} w-full max-w-sm p-8 rounded-[40px] shadow-2xl border relative animate-in zoom-in-95 duration-300`}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowWechatQR(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center">
              <div className={`w-56 h-56 ${isDarkMode ? 'bg-black' : 'bg-gray-50'} rounded-3xl overflow-hidden mb-6 border ${isDarkMode ? 'border-white/5' : 'border-gray-100'} p-3 shadow-inner`}>
                <img 
                  src="/Wechat.jpg" 
                  alt="WeChat QR Code" 
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
              <p className={`text-lg font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>扫码添加作者微信</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Connect on WeChat</p>
            </div>
          </div>
        </div>
      )}

      <div className={`text-center pb-8 ${isDarkMode ? 'opacity-10' : 'opacity-20'}`}>
        <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>Prompt Fill V0.6.0</p>
        <p className={`text-[9px] font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>Made by CornerStudio</p>
      </div>
    </div>
  );
};
