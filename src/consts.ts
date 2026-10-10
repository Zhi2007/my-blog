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
  { href: '/search/', label: '搜索' },
  { href: '/about/', label: '关于' },
];

// Giscus 评论：基于 GitHub Discussions，数据存在自己仓库里，不需要服务器。
// 配置步骤见 README「评论」一节；categoryId 留空时文章页只显示提示，不会报错。
export const GISCUS = {
  /** 仓库全名：owner/repo（必须是 public 仓库） */
  repo: 'Zhi2007/my-blog',
  /** 仓库 node_id，可直接用 GitHub API 或 giscus.app 生成的结果核对 */
  repoId: 'R_kgDOVCbYDg',
  /** Discussions 里的分类名，要和 giscus.app 里选的保持一致 */
  category: 'Comments',
  /** ← 关键：在 giscus.app 生成后把 data-category-id 填到这里 */
  categoryId: '',
  /** 文章与讨论的对应方式：pathname 表示按页面路径一一对应 */
  mapping: 'pathname',
  inputPosition: 'bottom',
  lang: 'zh-CN',
};
