// 合并策略函数
import { INITIAL_TEMPLATES_CONFIG } from '../data/templates';
import { INITIAL_BANKS, INITIAL_DEFAULTS } from '../data/banks';
import { deepClone, makeUniqueKey } from './helpers';

// 检查模板ID是否是某个系统模板的备份版本
const isBackupOfSystemTemplate = (templateId, systemIds) => {
  // 检查是否匹配 systemId_user, systemId_user1, systemId_custom 等模式
  for (const sysId of systemIds) {
    if (templateId === sysId) continue;
    if (templateId.startsWith(sysId + '_user') || templateId.startsWith(sysId + '_custom')) {
      return sysId;
    }
  }
  return null;
};

// 合并系统模板，系统模板强制更新，用户改动备份
// 支持传入远程系统模板（systemTemplates），如果未提供则使用本地的 INITIAL_TEMPLATES_CONFIG
export const mergeTemplatesWithSystem = (currentTemplates, { backupSuffix, systemTemplates } = {}) => {
  // 使用传入的远程模板或回退到本地内置模板
  const baseTemplates = systemTemplates || INITIAL_TEMPLATES_CONFIG;
  const systemMap = new Map(baseTemplates.map(t => [t.id, deepClone(t)]));
  const systemIds = new Set(baseTemplates.map(t => t.id));
  const merged = baseTemplates.map(t => deepClone(t));
  const notes = [];
  const existingIds = new Set(merged.map(t => t.id));

  // 记录已为哪些系统模板创建了备份（每个系统模板只保留一个最新备份）
  const backedUpSystemIds = new Set();

  // 先处理用户对系统模板的修改
  currentTemplates.forEach(t => {
    if (systemMap.has(t.id)) {
      const sys = systemMap.get(t.id);

      // 比较名称和内容（忽略 selections 等交互状态）
      const isDifferent = JSON.stringify(t.name) !== JSON.stringify(sys.name) ||
                          JSON.stringify(t.content) !== JSON.stringify(sys.content);

      // 在 merged 列表中找到对应的系统模板进行状态合并
      const targetInMerged = merged.find(m => m.id === t.id);
      if (targetInMerged && t.selections) {
        // 迁移用户的填空选择 (selections)，保留用户已填的内容
        targetInMerged.selections = {
          ...(targetInMerged.selections || {}),
          ...t.selections
        };
      }

      if (isDifferent && !backedUpSystemIds.has(t.id)) {
        // 为这个系统模板创建唯一备份（只创建一次）
        const backupId = makeUniqueKey(t.id, existingIds, "user");
        existingIds.add(backupId);
        backedUpSystemIds.add(t.id);

        const duplicateName = (name) => {
          if (typeof name === 'string') return `${name}${backupSuffix || ""}`;
          const newName = { ...name };
          Object.keys(newName).forEach(lang => {
            newName[lang] = `${newName[lang]}${backupSuffix || ""}`;
          });
          return newName;
        };

        merged.push({ ...deepClone(t), id: backupId, name: duplicateName(t.name) });
        notes.push(`模板 ${t.id} 已更新，旧版备份为 ${backupId}`);
      }
    }
  });

  // 再处理用户的自定义模板（非系统模板）
  currentTemplates.forEach(t => {
    // 跳过系统模板（已在上面处理）
    if (systemMap.has(t.id)) return;

    // 检查是否是旧的系统模板备份（如 tpl_xxx_user, tpl_xxx_custom 等）
    const originalSysId = isBackupOfSystemTemplate(t.id, systemIds);
    if (originalSysId) {
      // 如果这个系统模板已经创建了新备份，跳过旧备份（避免级联）
      if (backedUpSystemIds.has(originalSysId)) {
        // 静默跳过旧备份，不添加到合并结果中
        return;
      }
      // 如果系统模板没有变化，保留这个旧备份
    }

    let newId = t.id;
    if (existingIds.has(newId)) {
      // ID 冲突，生成新ID
      newId = makeUniqueKey(newId, existingIds, "custom");
      notes.push(`自定义模板 ${t.id} 与系统冲突，已重命名为 ${newId}`);
    }
    existingIds.add(newId);
    merged.push({ ...deepClone(t), id: newId });
  });

  return { templates: merged, notes };
};

// 合并系统词库与默认值，系统词库强制更新，用户改动内容合并
export const mergeBanksWithSystem = (currentBanks, currentDefaults, { backupSuffix }) => {
  const mergedBanks = deepClone(INITIAL_BANKS);
  const mergedDefaults = { ...INITIAL_DEFAULTS };
  const notes = [];
  const existingKeys = new Set(Object.keys(mergedBanks));

  Object.entries(currentBanks || {}).forEach(([key, bank]) => {
    if (INITIAL_BANKS[key]) {
      const sysBank = INITIAL_BANKS[key];
      
      // 检查是否有自定义选项（即不在系统预设中的选项）
      const sysOptionsSet = new Set(sysBank.options.map(opt => 
        typeof opt === 'string' ? opt : JSON.stringify(opt)
      ));
      
      const customOptions = (bank.options || []).filter(opt => {
        const optKey = typeof opt === 'string' ? opt : JSON.stringify(opt);
        return !sysOptionsSet.has(optKey);
      });

      // 如果有自定义选项，合并到系统词库中，而不是触发整体备份
      if (customOptions.length > 0) {
        mergedBanks[key].options = [...mergedBanks[key].options, ...customOptions];
        notes.push(`词库 ${key} 已同步系统更新，并保留了您的自定义选项`);
      }
      
      // 如果词库的其他属性（如分类）发生变化，仍可考虑是否备份，但通常以系统为准
    } else {
      let newKey = key;
      if (existingKeys.has(newKey)) {
        newKey = makeUniqueKey(newKey, existingKeys, "custom");
        notes.push(`自定义词库 ${key} 与系统冲突，已重命名为 ${newKey}`);
      }
      existingKeys.add(newKey);
      mergedBanks[newKey] = deepClone(bank);
      if (currentDefaults && key in currentDefaults) mergedDefaults[newKey] = currentDefaults[key];
    }
  });

  Object.entries(currentDefaults || {}).forEach(([key, val]) => {
    if (!(key in mergedDefaults) && mergedBanks[key]) {
      mergedDefaults[key] = val;
    }
  });

  return { banks: mergedBanks, defaults: mergedDefaults, notes };
};
