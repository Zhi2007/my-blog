// 站点全局配置：改这里就能换标题、作者、导航和页脚
export const SITE = {
  title: '我的博客',
  description: '用 Astro + Cloudflare Workers 搭建的个人博客',
  author: '博主',
  lang: 'zh-CN',
  // 与 astro.config.mjs 里的 site 保持一致
  url: 'https://my-blog.mc20070831.workers.dev',
  /**
   * Cloudflare Web Analytics 的 token（免费、无 cookie）。
   * 留空则不加载统计脚本；在 Cloudflare 控制台 Web Analytics → 添加站点后，
   * 从给出的 JS 片段里把 token 复制到这里即可。步骤见 README。
   */
  cfAnalyticsToken: '67aa9433062f4bfda024d65f7f1bfb40',
};

export const NAV = [
  { href: '/', label: '首页' },
  { href: '/blog/', label: '文章' },
  { href: '/search/', label: '搜索' },
  { href: '/about/', label: '关于' },
];

/**
 * 页脚「人生倒计时」。
 * birthDate 留空则整块不渲染（避免线上出现占位数据）；填上后自动显示进度条和剩余天数。
 */
export const LIFE = {
  /** 出生日期，格式 YYYY-MM-DD，例如 '2007-03-15'；留空则页脚不显示倒计时 */
  birthDate: '',
  /** 预期寿命（岁），用来计算进度和剩余天数 */
  lifeExpectancy: 80,
};

/** 切到别的标签页时，浏览器标题轮播的文案；留空数组则不启用这个效果 */
export const AWAY_TITLES = ['喂，别走啊 👀', '快回来看看嘛', '页面还在，人没了？'];

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
  categoryId: 'DIC_kwDOVCbYDs4DHdxL',
  /** 文章与讨论的对应方式：pathname 表示按页面路径一一对应 */
  mapping: 'pathname',
  inputPosition: 'bottom',
  lang: 'zh-CN',
};
