// EditorToolbar 组件 - 编辑器工具栏
import React from 'react';
import { Plus, Undo, Redo, Link, Unlink } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

export const EditorToolbar = ({ 
  onInsertClick, 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo, 
  t, 
  isDarkMode,
  // 分组功能相关
  cursorInVariable = false,
  currentGroupId = null,
  onSetGroup,
  onRemoveGroup
}) => {
  return (
    <div className={`h-12 border-b backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0 z-20 ${isDarkMode ? 'border-white/5 bg-black/20 text-gray-300' : 'border-gray-200 bg-white/80'}`}>
      {/* Left: Undo/Redo & Grouping */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <PremiumButton 
            onClick={onUndo} 
            disabled={!canUndo} 
            title={t('undo') || "撤消"} 
            icon={Undo} 
            color={isDarkMode ? "slate" : "slate"} 
            isDarkMode={isDarkMode}
            className="!px-2 !py-1.5" 
          />
          <PremiumButton 
            onClick={onRedo} 
            disabled={!canRedo} 
            title={t('redo') || "重做"} 
            icon={Redo} 
            color={isDarkMode ? "slate" : "slate"} 
            isDarkMode={isDarkMode}
            className="!px-2 !py-1.5" 
          />
        </div>

        {/* Divider */}
        <div className={`h-6 w-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`} />

        {/* Grouping Buttons */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            联动组:
          </span>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => onSetGroup(num)}
              disabled={!cursorInVariable}
              className={`
                min-w-[28px] h-7 px-2 rounded-md text-xs font-bold transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                ${currentGroupId === num.toString()
                  ? (isDarkMode 
                    ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50 shadow-sm' 
                    : 'bg-orange-100 text-orange-600 ring-1 ring-orange-300 shadow-sm')
                  : (isDarkMode
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800')
                }
              `}
              title={cursorInVariable ? `设置为联动组 ${num}` : '请将光标置于变量内'}
            >
              {num}
            </button>
          ))}
          
          {/* Remove Group Button */}
          {currentGroupId && (
            <button
              onClick={onRemoveGroup}
              disabled={!cursorInVariable}
              className={`
                h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1
                ${isDarkMode
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 ring-1 ring-red-500/30'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200'
                }
              `}
              title="解除联动"
            >
              <Unlink size={12} />
              解除
            </button>
          )}
        </div>
      </div>

      {/* Right: Insert & Tools */}
      <div className="flex items-center gap-2">
        <PremiumButton 
          onClick={onInsertClick} 
          icon={Plus} 
          color="orange"
          isDarkMode={isDarkMode}
        >
          {t('insert')}
        </PremiumButton>
      </div>
    </div>
  );
};
