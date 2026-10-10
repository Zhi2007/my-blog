import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

// 部署上线后，把 site 改成你的真实域名（先用免费的 *.workers.dev 也可以）。
// 站点标题、作者等信息在 src/consts.ts 里改。
export default defineConfig({
  site: 'https://my-blog.mc20070831.workers.dev',
  output: 'static',
  integrations: [
    sitemap(),
    // 代码块增强（复制按钮、语言标签、行号），主题等配置在 ec.config.mjs
    expressiveCode(),
  ],
  vite: {
    // 内容集合的 glob loader 会牵出几个 CJS 依赖（picomatch / yaml / p-limit 等）。
    // Vite 8 的模块运行器直接内联它们时会报 "require is not defined"，
    // 所以让服务端各环境先把这些依赖预构建成 ESM 再加载。
    environments: {
      ssr: { optimizeDeps: { include: ['picomatch', 'yaml', 'p-limit', 'tinyglobby', 'piccolore'] } },
      astro: { optimizeDeps: { include: ['picomatch', 'yaml', 'p-limit', 'tinyglobby', 'piccolore'] } },
      prerender: { optimizeDeps: { include: ['picomatch', 'yaml', 'p-limit', 'tinyglobby', 'piccolore'] } },
    },
  },
});
