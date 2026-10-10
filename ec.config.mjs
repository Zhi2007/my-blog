import { defineEcConfig } from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

// Expressive Code：Markdown 里所有代码块的渲染方式（语法高亮 + 复制按钮 + 语言标签 + 行号）
export default defineEcConfig({
  // 深浅两套主题，自动跟随系统的 prefers-color-scheme，和站点主题一致
  themes: ['github-light', 'github-dark'],
  plugins: [pluginLineNumbers()],
  defaultProps: {
    // 默认显示行号；单个代码块可用 ```js showLineNumbers=false 关掉
    showLineNumbers: true,
  },
  styleOverrides: {
    borderRadius: '10px',
    codeFontSize: '0.88rem',
    codeLineHeight: '1.65',
    frames: {
      shadowColor: 'transparent',
    },
  },
});
