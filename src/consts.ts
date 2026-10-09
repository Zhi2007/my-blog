// 站点全局配置：改这里就能换标题、作者、导航和页脚
export const SITE = {
  title: '我的博客',
  description: '用 Astro + Cloudflare Workers 搭建的个人博客',
  author: '博主',
  lang: 'zh-CN',
  // 与 astro.config.mjs 里的 site 保持一致
  url: 'https://my-blog.mc20070831.workers.dev',
};

export const NAV = [
  { href: '/', label: '首页' },
  { href: '/blog/', label: '文章' },
  { href: '/about/', label: '关于' },
];
