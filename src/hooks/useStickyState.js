// 持久化存储 Hook
import { useState, useEffect } from 'react';

export const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.error(`读取 localStorage 失败 (${key}):`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      const storageMode = window.localStorage.getItem('app_storage_mode') || 'browser';
      // 在使用本地文件夹模式时，不再写入 localStorage，避免大图触发配额弹窗
      if (storageMode === 'folder') return;

      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage 存储空间已满！请考虑切换到“本地文件夹”模式以存储更多数据。');
        // 不再显示 alert 对话框，避免打断用户操作
      } else {
        console.error(`保存到 localStorage 失败 (${key}):`, error);
      }
    }
  }, [key, value]);

  return [value, setValue];
};
