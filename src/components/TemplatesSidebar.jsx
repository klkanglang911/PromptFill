import React from 'react';
import {
  LayoutGrid, FileText, Search, RotateCcw, Globe, Settings,
  ChevronRight, ChevronDown, ImageIcon, ArrowUpRight, Plus,
  Pencil, Copy as CopyIcon, Download, ArrowUpDown, Home, User, Trash2
} from 'lucide-react';
import { PremiumButton } from './PremiumButton';
import { getLocalized } from '../utils/helpers';

/**
 * TemplatesSidebar 组件 - 负责展示左侧模版列表
 */
export const TemplatesSidebar = React.memo(({
  mobileTab,
  isTemplatesDrawerOpen,
  setIsTemplatesDrawerOpen,
  setDiscoveryView,
  activeTemplateId,
  setActiveTemplateId,
  filteredTemplates,
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  TEMPLATE_TAGS,
  displayTag,
  handleRefreshSystemData,
  language,
  setLanguage,
  setIsSettingsOpen,
  t,
  isSortMenuOpen,
  setIsSortMenuOpen,
  sortOrder,
  setSortOrder,
  setRandomSeed,
  handleResetTemplate,
  startRenamingTemplate,
  handleDuplicateTemplate,
  handleExportTemplate,
  handleDeleteTemplate,
  handleAddTemplate,
  INITIAL_TEMPLATES_CONFIG,
  editingTemplateNameId,
  tempTemplateName,
  setTempTemplateName,
  tempTemplateAuthor,
  setTempTemplateAuthor,
  saveTemplateName,
  setEditingTemplateNameId,
  currentUser,
  onLoginClick,
  globalContainerStyle,
  isDarkMode
}) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isTemplatesDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[290] animate-in fade-in duration-300"
          onClick={() => setIsTemplatesDrawerOpen(false)}
        />
      )}

      <div 
        style={!isMobile ? globalContainerStyle : {}}
        className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-[300] w-[75%] max-w-[320px] transform transition-transform duration-500 ease-out shadow-2xl ${isTemplatesDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'relative md:flex flex-col flex-shrink-0 h-full w-[340px] overflow-hidden'
        } 
        flex overflow-hidden
        ${!isMobile ? 'bg-transparent' : (isDarkMode ? 'bg-[#242120]' : 'bg-white')}
        ${!isMobile && mobileTab !== 'editor' && mobileTab !== 'banks' ? 'hidden md:flex' : ''}
      `}
      >
        <div className={`flex flex-col w-full h-full ${isMobile ? (isDarkMode ? 'bg-[#242120]' : 'bg-white') : 'bg-transparent'} backdrop-blur-sm rounded-2xl`}>
          {/* --- Sidebar Header with Tools --- */}
      <div className="flex-shrink-0 p-6">
         <div className="flex items-center justify-between mb-6">
             <div className="flex flex-col items-start gap-1">
                  <h1 className={`${isMobile ? 'text-[18px]' : 'text-[22px]'} font-black tracking-tight text-orange-500 flex items-baseline gap-2`}>
                      提示词填空器
                      <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-400'} text-xs font-bold tracking-widest`}>V0.6.0</span>
                  </h1>
             </div>
             
             <div className="flex items-center gap-1.5">
                  {/* Discovery View Toggle (Home button) */}
                  <button
                    onClick={() => setDiscoveryView(true)}
                    className={`p-1.5 rounded-lg transition-all shadow-sm ${isDarkMode ? 'text-orange-400 bg-orange-500/10 hover:text-orange-300 hover:bg-orange-500/20' : 'text-orange-500 bg-orange-50/50 hover:text-orange-600 hover:bg-orange-100'}`}
                    title={t('back_to_discovery')}
                  >
                    <Home size={18} />
                  </button>

                  <button onClick={handleRefreshSystemData} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-500 hover:text-orange-400 hover:bg-white/5' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`} title={t('refresh_desc')}><RotateCcw size={16} /></button>

                  {/* Sort Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                      className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-500 hover:text-orange-400 hover:bg-white/5' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                      title={t('sort')}
                    >
                      <ArrowUpDown size={16} />
                    </button>
                    {isSortMenuOpen && (
                      <div className={`absolute top-full mt-2 right-0 rounded-xl shadow-xl border py-2 min-w-[140px] z-[100] ${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white border-gray-100'}`}>
                        {[
                          { value: 'newest', label: t('sort_newest') },
                          { value: 'oldest', label: t('sort_oldest') },
                          { value: 'a-z', label: t('sort_az') },
                          { value: 'z-a', label: t('sort_za') },
                          { value: 'random', label: t('sort_random') }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortOrder(option.value);
                              if (option.value === 'random') setRandomSeed(Date.now());
                              setIsSortMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortOrder === option.value ? 'text-orange-600 font-semibold' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-orange-50'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')} className={`text-[10px] px-2 py-1 rounded-full border transition-colors flex items-center gap-1 shadow-sm ${isDarkMode ? 'bg-transparent text-gray-500 border-gray-700 hover:text-orange-400 hover:bg-white/5' : 'bg-transparent text-gray-400 border-gray-200 hover:text-orange-600 hover:bg-orange-50'}`}><Globe size={10} />{language.toUpperCase()}</button>

                  {/* 用户按钮 */}
                  {currentUser ? (
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-orange-500/30 hover:scale-105 transition-transform"
                      title={currentUser.nickname || currentUser.email}
                    >
                      {currentUser.nickname?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </button>
                  ) : (
                    <button
                      onClick={onLoginClick}
                      className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-500 hover:text-orange-400 hover:bg-white/5' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                      title={language === 'cn' ? '登录' : 'Sign In'}
                    >
                      <User size={16} />
                    </button>
                  )}

                  <button onClick={() => setIsSettingsOpen(true)} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-500 hover:text-orange-400 hover:bg-white/5' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`} title={t('settings')}><Settings size={16} /></button>
             </div>
         </div>

         <div className="flex flex-col gap-4">
            {/* 极简搜索框 */}
            <div className="relative group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${isDarkMode ? 'text-gray-600 group-focus-within:text-orange-500' : 'text-gray-400 group-focus-within:text-orange-500'}`} size={16} />
                <input 
                  type="text" 
                  placeholder={t('search_templates')} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  style={isDarkMode ? {
                    background: '#2A2726',
                    border: '1px solid transparent',
                    backgroundImage: 'linear-gradient(#2A2726, #2A2726), linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  } : {
                    background: '#E8E3DD',
                    border: '1px solid transparent',
                    backgroundImage: 'linear-gradient(#E8E3DD, #E8E3DD), linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  }}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl text-[14px] font-medium transition-all outline-none focus:ring-4 focus:ring-orange-500/5 ${isDarkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-700 placeholder-gray-400'}`} 
                />
            </div>
            
            {/* 极简标签选择 */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1 px-1">
                <button 
                  onClick={() => setSelectedTags("")} 
                  className={`px-3 py-1 rounded-xl tracking-widest capitalize transition-all ${
                    language === 'cn' 
                      ? 'text-[11px] font-black' 
                      : 'text-[8px] font-medium'
                  } ${selectedTags === "" ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')}`}
                >
                  {t('all_templates')}
                </button>
                {TEMPLATE_TAGS.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => setSelectedTags(selectedTags === tag ? "" : tag)} 
                    className={`px-3 py-1 rounded-xl tracking-widest capitalize transition-all ${
                      language === 'cn' 
                        ? 'text-[11px] font-black' 
                        : 'text-[8px] font-medium'
                    } ${selectedTags === tag ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')}`}
                  >
                    {displayTag(tag)}
                  </button>
                ))}
            </div>
         </div>
      </div>

      {/* --- Template List --- */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <div className="flex flex-col gap-1">
              {filteredTemplates.map(t_item => (
                  <div 
                      key={t_item.id} 
                      onClick={() => {
                          setActiveTemplateId(t_item.id);
                          if (isMobile) setIsTemplatesDrawerOpen(false);
                      }} 
                      className={`group flex flex-col p-4 rounded-2xl transition-all duration-300 relative text-left cursor-pointer ${t_item.id === activeTemplateId ? (isDarkMode ? 'bg-orange-500/20' : 'bg-[#FFE9D0]') : `bg-transparent ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-[#F2EDE7]'}`}`}
                  >
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                              {editingTemplateNameId === t_item.id ? (
                                <div className="flex-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={tempTemplateName}
                                        onChange={(e) => setTempTemplateName(e.target.value)}
                                        className={`w-full px-2 py-1 text-base font-black border-b-2 border-orange-500 bg-transparent focus:outline-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                        placeholder={t('label_placeholder')}
                                        onKeyDown={(e) => e.key === 'Enter' && saveTemplateName()}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={saveTemplateName}
                                            className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-lg hover:bg-orange-600 transition-colors"
                                        >
                                            {t('confirm')}
                                        </button>
                                        <button 
                                            onClick={() => setEditingTemplateNameId(null)}
                                            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {t('cancel')}
                                        </button>
                                    </div>
                                </div>
                              ) : (
                                <span className={`truncate text-[14px] tracking-tight leading-tight transition-all ${activeTemplateId === t_item.id ? (isDarkMode ? 'font-bold text-orange-400' : 'font-bold text-gray-900') : (isDarkMode ? 'font-semibold text-gray-500 group-hover:text-gray-300' : 'font-semibold text-gray-600 group-hover:text-gray-800')}`}>
                                  {getLocalized(t_item.name, language)}
                                </span>
                              )}
                          </div>

                          {!editingTemplateNameId && (
                            <div className={`flex items-center gap-1.5 ${activeTemplateId === t_item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300`}>
                                {INITIAL_TEMPLATES_CONFIG.some(cfg => cfg.id === t_item.id) && (
                                    <button
                                        title={t('reset_template')}
                                        onClick={(e) => { e.stopPropagation(); handleResetTemplate(t_item.id, e); }}
                                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-white/10 text-gray-500 hover:text-orange-400' : 'hover:bg-orange-100 text-gray-400 hover:text-orange-500'}`}
                                    >
                                        <RotateCcw size={13} />
                                    </button>
                                )}
                                <button
                                    title={t('rename')}
                                    onClick={(e) => { e.stopPropagation(); startRenamingTemplate(t_item, e); }}
                                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-white/10 text-gray-500 hover:text-orange-400' : 'hover:bg-gray-100 text-gray-400 hover:text-orange-600'}`}
                                >
                                    <Pencil size={13} />
                                </button>
                                <button
                                    title={t('duplicate')}
                                    onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(t_item, e); }}
                                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-white/10 text-gray-500 hover:text-orange-400' : 'hover:bg-gray-100 text-gray-400 hover:text-orange-600'}`}
                                >
                                    <CopyIcon size={13} />
                                </button>
                                <button
                                    title={t('export_template')}
                                    onClick={(e) => { e.stopPropagation(); handleExportTemplate(t_item); }}
                                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-white/10 text-gray-500 hover:text-blue-400' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'}`}
                                >
                                    <Download size={13} />
                                </button>
                                {/* 删除按钮已移除 - 用户不能删除模板，仅管理员可以 */}
                            </div>
                          )}
                      </div>

                      {/* 选中时展开的功能行 */}
                      {activeTemplateId === t_item.id && !editingTemplateNameId && (
                        <div className={`flex items-center gap-1 mt-3 pt-3 border-t animate-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'border-white/5' : 'border-orange-200/30'}`}>
                            {INITIAL_TEMPLATES_CONFIG.some(cfg => cfg.id === t_item.id) && (
                                <button 
                                    title={t('reset_template')}
                                    onClick={(e) => { e.stopPropagation(); handleResetTemplate(t_item.id, e); }}
                                    className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-white/50 text-gray-500 hover:text-orange-600'}`}
                                >
                                    <RotateCcw size={14} />
                                </button>
                            )}
                            <button 
                                title={t('rename')}
                                onClick={(e) => { e.stopPropagation(); startRenamingTemplate(t_item, e); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-white/50 text-gray-500 hover:text-orange-600'}`}
                            >
                                <Pencil size={14} />
                            </button>
                            <button 
                                title={t('duplicate')}
                                onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(t_item, e); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-white/50 text-gray-500 hover:text-orange-600'}`}
                            >
                                <CopyIcon size={14} />
                            </button>
                            <button 
                                title={t('export_template')}
                                onClick={(e) => { e.stopPropagation(); handleExportTemplate(t_item); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-blue-400' : 'hover:bg-white/50 text-gray-500 hover:text-blue-600'}`}
                            >
                                <Download size={14} />
                            </button>
                            <button 
                                title={t('delete')}
                                onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t_item.id, e); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-red-400' : 'hover:bg-white/50 text-gray-500 hover:text-red-600'}`}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* --- Footer & Create Button --- */}
      <div className="flex-shrink-0">
          <div className="p-6 pb-10 md:pb-8">
            <PremiumButton
                onClick={handleAddTemplate}
                icon={Plus}
                color="orange"
                active={true}
                isDarkMode={isDarkMode}
                className="w-full !py-3 text-[15px] font-black transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/20"
            >
                {t('new_template')}
            </PremiumButton>
          </div>
      </div>
    </div>
  </div>
  </>
  );
});

TemplatesSidebar.displayName = 'TemplatesSidebar';
