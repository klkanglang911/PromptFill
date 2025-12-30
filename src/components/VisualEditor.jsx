// VisualEditor 组件 - 可视化编辑器
import React, { useRef } from 'react';
import { CATEGORY_STYLES } from '../constants/styles';

export const VisualEditor = React.forwardRef(({ value, onChange, banks, categories, isDarkMode }, ref) => {
  const preRef = useRef(null);

  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // 变量解析工具函数：从变量名中提取 baseKey 和 groupId
  const parseVariableName = (varName) => {
    const match = varName.match(/^(.+?)(?:_(\d+))?$/);
    if (match) {
      return {
        baseKey: match[1],
        groupId: match[2] || null
      };
    }
    return { baseKey: varName, groupId: null };
  };

  const renderHighlights = (text) => {
    if (!text || typeof text !== 'string') return null;
    // Split by {{...}}
    const parts = text.split(/(\{\{[^{}\n]+\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const fullKey = part.slice(2, -2).trim();
        // 解析变量名，提取 baseKey（用于查找词库）
        const parsed = parseVariableName(fullKey);
        const baseKey = parsed.baseKey;
        
        // 使用 baseKey 查找词库，确保即使变量名是 fruit_1 也能找到 fruit 词库
        const bank = banks[baseKey] || banks[fullKey]; // 后备：如果 baseKey 找不到，尝试 fullKey
        const categoryId = bank?.category || 'other';
        const colorKey = categories[categoryId]?.color || 'slate';
        const style = CATEGORY_STYLES[colorKey];
        
        // Style needs to match font metrics exactly, so avoid padding/border that adds width
        return (
          <span key={i} className={`${isDarkMode ? (style.bg.replace('bg-', 'bg-') + '/20 ' + style.text.replace('text-', 'text-')) : (style.bg + ' ' + style.text)} font-bold rounded-sm`}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
      {/* Backdrop */}
      <pre
        ref={preRef}
        className={`absolute inset-0 p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-hidden m-0 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}
        style={{ fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} 
        aria-hidden="true"
      >
        {renderHighlights(value)}
        <br />
      </pre>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        className={`absolute inset-0 w-full h-full p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words bg-transparent text-transparent resize-none focus:outline-none overflow-auto z-10 m-0 selection:bg-orange-500/30 ${isDarkMode ? 'caret-white selection:text-white' : 'caret-gray-800 selection:bg-orange-200 selection:text-orange-900'}`}
        style={{ fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
        spellCheck={false}
      />
    </div>
  );
});

VisualEditor.displayName = 'VisualEditor';
