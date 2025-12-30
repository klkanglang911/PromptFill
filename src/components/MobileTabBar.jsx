import React from 'react';
import { Home, List, Edit3, Database, Sun, Moon } from 'lucide-react';

const MobileTabBar = ({ activeTab, onTabChange, t, isDarkMode, onToggleDarkMode }) => {
  const tabs = [
    { id: 'home', icon: Home, label: t('home') || '主页' },
    { id: 'templates', icon: List, label: t('templates') || '模版列表' },
    { id: 'editor', icon: Edit3, label: t('editor') || '模版编辑' },
    { id: 'banks', icon: Database, label: t('banks') || '词库' },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t px-2 pb-safe z-[90] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-300 ${isDarkMode ? 'bg-[#181716]/95 border-white/5 shadow-black/20' : 'bg-white/95 border-gray-200'}`}>
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                isActive ? 'text-orange-600' : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                isActive ? (isDarkMode ? 'bg-orange-500/10 transform -translate-y-1' : 'bg-orange-50 transform -translate-y-1') : ''
              }`}>
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full animate-in zoom-in duration-300"></div>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${
                isActive ? 'opacity-100 transform translate-y-0' : 'opacity-80'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="relative p-1.5 rounded-xl transition-all duration-300">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <span className="text-[10px] font-bold tracking-wide opacity-80">
            {isDarkMode ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileTabBar;
