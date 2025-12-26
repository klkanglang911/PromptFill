/**
 * 管理后台主应用组件
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, FileText, Clock, Database, Settings, LogOut,
  Menu, X, ChevronRight, User
} from 'lucide-react';
import { adminAuthApi, adminStatsApi } from '../services/adminApi';
import { PREMIUM_STYLES } from '../constants/styles';
import AdminLogin from './AdminLogin';
import TemplateList from './TemplateList';
import TemplateEdit from './TemplateEdit';
import PendingTemplates from './PendingTemplates';

// 导航菜单配置
const NAV_ITEMS = [
  { id: 'templates', label: '模板管理', icon: FileText, color: 'orange' },
  { id: 'pending', label: '待审核', icon: Clock, color: 'amber', showBadge: true },
  { id: 'banks', label: '词库管理', icon: Database, color: 'emerald' },
  { id: 'settings', label: '系统设置', icon: Settings, color: 'slate' }
];

const AdminApp = () => {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  // 导航状态
  const [currentPage, setCurrentPage] = useState('templates');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 编辑状态
  const [editingTemplate, setEditingTemplate] = useState(null);

  // 统计数据
  const [stats, setStats] = useState({ pendingCount: 0, totalTemplates: 0 });

  // 检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const result = await adminAuthApi.checkAuth();
      if (result.authenticated) {
        setIsAuthenticated(true);
        setAdmin(result.admin);
        loadStats();
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const result = await adminStatsApi.get();
      setStats(result);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  // 登录成功
  const handleLoginSuccess = (adminData) => {
    setIsAuthenticated(true);
    setAdmin(adminData);
    loadStats();
  };

  // 登出
  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    setAdmin(null);
  };

  // 导航
  const navigate = useCallback((page, params = {}) => {
    if (page === 'template-edit') {
      setEditingTemplate(params.template || null);
    }
    setCurrentPage(page);
  }, []);

  // 刷新数据
  const refresh = useCallback(() => {
    loadStats();
  }, []);

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">加载中...</span>
        </div>
      </div>
    );
  }

  // 未认证 - 显示登录页
  if (!isAuthenticated) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  // 渲染当前页面
  const renderPage = () => {
    switch (currentPage) {
      case 'templates':
        return <TemplateList navigate={navigate} refresh={refresh} />;
      case 'pending':
        return <PendingTemplates navigate={navigate} refresh={refresh} />;
      case 'template-edit':
        return (
          <TemplateEdit
            template={editingTemplate}
            navigate={navigate}
            refresh={refresh}
          />
        );
      case 'banks':
        return (
          <div className="p-8 text-center text-gray-500">
            <Database size={48} className="mx-auto mb-4 opacity-50" />
            <p>词库管理功能开发中...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center text-gray-500">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <p>系统设置功能开发中...</p>
          </div>
        );
      default:
        return <TemplateList navigate={navigate} refresh={refresh} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50">
        <div className="h-full flex items-center justify-between px-4">
          {/* 左侧 Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PREMIUM_STYLES.orange.from} 0%, ${PREMIUM_STYLES.orange.to} 100%)`
                }}
              >
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 hidden sm:block">管理后台</span>
            </div>
          </div>

          {/* 右侧用户信息 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
              <User size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{admin?.username || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium hidden sm:block">退出</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* 侧边导航栏 */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white/50 backdrop-blur-xl
            border-r border-slate-200/50 transition-all duration-300 z-40
            ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
          `}
        >
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id || (item.id === 'templates' && currentPage === 'template-edit');
              const premium = PREMIUM_STYLES[item.color];

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive
                      ? 'text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${premium.from} 0%, ${premium.to} 100%)`,
                    boxShadow: `0 4px 12px ${premium.shadowColor}`
                  } : {}}
                >
                  <item.icon size={20} />
                  <span className={`font-medium flex-1 text-left ${sidebarOpen ? '' : 'lg:hidden'}`}>
                    {item.label}
                  </span>
                  {item.showBadge && stats.pendingCount > 0 && (
                    <span className={`
                      px-2 py-0.5 text-xs font-bold rounded-full
                      ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}
                    `}>
                      {stats.pendingCount}
                    </span>
                  )}
                  {isActive && <ChevronRight size={16} className={sidebarOpen ? '' : 'lg:hidden'} />}
                </button>
              );
            })}
          </nav>

          {/* 统计信息 */}
          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
              <div className="text-xs text-slate-500 mb-2">数据统计</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{stats.totalTemplates || 0}</div>
                  <div className="text-xs text-slate-500">模板总数</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <div className="text-lg font-bold text-amber-600">{stats.pendingCount || 0}</div>
                  <div className="text-xs text-slate-500">待审核</div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* 主内容区 */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : ''}`}>
          {renderPage()}
        </main>
      </div>

      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminApp;
