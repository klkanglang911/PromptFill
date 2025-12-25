# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Prompt Fill（提示词填空器）是一个 AI 绘画提示词生成工具，通过可视化"填空"交互帮助用户构建和管理 Prompt。采用 React 18 + Vite 5 + Tailwind CSS 技术栈，支持 Web 和 Tauri 桌面应用。

## 常用命令

```bash
npm run dev          # 启动开发服务器 (localhost:1420)
npm run dev:open     # 启动并自动打开浏览器
npm run build        # 生产构建
npm run preview      # 预览生产版本
npm run lint         # ESLint 代码检查 (零容错模式)
```

## 架构概览

### 核心组件关系

```
App.jsx (全局状态中心: 模板、词库、分类、UI状态)
├── DiscoveryView      # 瀑布流模板展示（移动端首页）
├── TemplatesSidebar   # 模板列表管理
├── BanksSidebar       # 词库/分类管理
└── TemplatePreview    # 模板预览与编辑
    ├── VisualEditor   # 代码编辑器（变量高亮、拖拽插入）
    └── Variable       # 交互式变量选择器
```

### 状态管理

- **无集中状态管理库**：使用 React useState + 自定义 `useStickyState` Hook
- **useStickyState** (`src/hooks/useStickyState.js`)：LocalStorage 持久化封装
- **App.jsx** 管理所有全局状态，通过 props 向下传递

### 核心数据结构

**模板 (Template)**:
```javascript
{
  id: string,
  title: { cn: string, en: string },
  content: string,           // Markdown + {{variable}} 语法
  imageUrls: string[],       // 预览图数组
  variables: object,         // 变量当前值
  cloudId?: string           // 云端版本标识
}
```

**词库 (Bank)**:
```javascript
{
  id: string,
  name: { cn: string, en: string },
  category: string,          // 关联 categories 中的 id
  options: Array<{ cn: string, en: string }>
}
```

### 样式系统

- `src/constants/styles.js`：12 种颜色方案 (PREMIUM_STYLES, CATEGORY_STYLES)
- 变量在编辑器中根据所属分类自动着色
- 支持 Tailwind 自定义类和 CSS 变量

### 国际化

- 双语支持：中文 (cn) / 英文 (en)
- 数据格式：`{ cn: "中文", en: "English" }`
- 工具函数：`getLocalized(item, language)` 在 `src/utils/helpers.js`
- 翻译配置：`src/constants/translations.js`

### 导出功能

使用 html2canvas 将模板转换为高清长图：
- 自动提取图片主色调作为背景
- 嵌入二维码和版本信息
- 输出 JPG 格式 (92% 质量)

## 文件组织

```
src/
├── components/     # React 组件（App.jsx 是主入口，约 3000 行）
├── constants/      # 样式、翻译、标语等常量
├── data/           # 模板和词库初始数据
├── hooks/          # 自定义 Hooks (useStickyState)
└── utils/          # 工具函数 (helpers.js, merge.js)
```

## 开发注意事项

- **App.jsx 体量大**：大部分业务逻辑集中于此，修改时注意状态依赖关系
- **变量语法**：`{{variableName}}` 在 content 中定义，支持同名变量多实例 (color-0, color-1)
- **响应式**：移动端有专门组件 (MobileTabBar, MobileSettingsView, DiscoveryView)
- **Tauri 配置**：vite.config.js 中有桌面应用构建配置
