# 我的博客 · Astro + Cloudflare Workers

一个可以直接部署到 Cloudflare 免费额度的个人博客：静态生成、自动 HTTPS、全球 CDN，不需要服务器。
写完 Markdown 敲一行命令就上线。

## 技术栈

| 部分 | 说明 |
| --- | --- |
| 框架 | [Astro 7](https://astro.build)（默认静态输出，`dist/` 里全是纯 HTML/CSS） |
| 内容 | Astro 内容集合（Content Collections），文章就是 `src/content/blog/*.md` |
| 搜索 | [Pagefind](https://pagefind.app) 1.5：构建时扫一遍 HTML 生成静态索引，浏览器里检索，**不需要服务器或数据库** |
| 评论 | 未内置，可自行接 Giscus（零维护，需 GitHub 账号）或 Waline / Workers+D1（访客免登录） |
| 托管 | Cloudflare Workers 静态资源（`wrangler deploy`，免费额度：每天 10 万请求、2 万个静态文件） |
| 附加能力 | `/rss.xml` 订阅、`sitemap-index.xml` 站点地图、站内搜索、404 页面 |

## 目录结构

```
my-blog/
├─ astro.config.mjs          # Astro 配置（site 域名、sitemap、Vite 依赖预构建）
├─ wrangler.jsonc            # Cloudflare 部署配置（把 dist/ 作为静态资源发布）
├─ package.json              # 脚本与依赖
├─ .github/workflows/deploy.yml  # push 到 main 自动构建并部署
├─ public/                   # 原样拷贝到 dist/ 的静态文件（favicon、图片）
└─ src/
   ├─ consts.ts              # 站点标题、描述、作者、导航（改这里）
   ├─ content.config.ts      # 文章集合的字段定义（frontmatter schema）
   ├─ content/blog/*.md      # 文章本体
   ├─ layouts/BaseLayout.astro   # 全站 HTML 骨架（head、导航、页脚）
   ├─ components/PostList.astro  # 文章列表组件
   ├─ pages/
   │  ├─ index.astro         # 首页（最新 8 篇）
   │  ├─ blog/index.astro    # 全部文章
   │  ├─ blog/[slug].astro   # 文章详情页
   │  ├─ search.astro        # 站内搜索页
   │  ├─ about.astro         # 关于页
   │  ├─ 404.astro           # 404 页面
   │  └─ rss.xml.js          # RSS 订阅
   └─ styles/global.css      # 全站样式（自带浅色/深色自适应）
```

> `npm run build` 的顺序是：Astro 构建出 `dist/`，然后用 Pagefind 扫一遍生成搜索索引到 `dist/pagefind/`。索引本身也是静态文件，一起被部署，不产生任何服务端成本。

## 1. 本地跑起来

需要 **Node.js ≥ 22.12**（Astro 7 的最低要求，建议直接用当前 LTS 或更新版本）。

```sh
npm install
npm run dev          # http://localhost:4321
```

## 2. 写一篇新文章

在 `src/content/blog/` 新建一个 `.md` 文件，例如 `my-first-post.md`：

```markdown
---
title: 文章标题
description: 一句话摘要，会出现在列表页、RSS 和搜索结果里
pubDate: 2026-10-09
tags: ['随笔', 'Cloudflare']
draft: false
---

正文用 Markdown 写。支持标题、列表、引用、代码块（自动语法高亮）、表格、图片。
```

字段说明（在 `src/content.config.ts` 里定义，缺少 `title` 或 `pubDate` 或类型不对，构建时会直接报错）：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `pubDate` | 是 | 发布日期，`2026-10-09` 这种写法即可 |
| `description` | 否 | 摘要，默认空字符串 |
| `updatedDate` | 否 | 更新日期，会显示在标题下方 |
| `tags` | 否 | 字符串数组 |
| `draft` | 否 | `true` 时只在 `npm run dev` 可见，部署时自动隐藏 |

文件名决定 URL：`my-first-post.md` → `/blog/my-first-post/`。

## 3. 站内搜索（已内置 Pagefind）

搜页面在 `/search/`，导航栏也加了入口。工作方式：

- **不需要服务器、不需要数据库**：索引在构建时生成，就是 `dist/pagefind/` 下的一堆静态文件。
- **只索引正文**：文章页和关于页的 `<article>` 上标了 `data-pagefind-body`，所以导航、页脚、列表页、搜索页本身都不会进入索引，搜索结果更干净。
- **中文可用**：构建时识别到 `lang="zh-CN"`，按词切分（例如 `每個月都` 会被切成 `每個`/`月`/`都`），支持多词组合和引号精确匹配。
- **发新文章不用额外操作**：`npm run build` 会自动重建索引，GitHub Actions 部署时同理。

本地要试搜索必须用构建后的产物（开发服务器里没有索引）：

```sh
npm run build
npm run preview      # 打开 http://localhost:4321/search/ 试搜索
```

想把某些内容排除出索引，给元素加 `data-pagefind-ignore` 即可；想让别的页面也能被搜到，给它加上 `data-pagefind-body`。

## 4. 部署到 Cloudflare（免费）

```sh
npm run deploy       # = astro build + pagefind 建索引 + wrangler deploy
```

第一次运行会打开浏览器让你登录 Cloudflare 账号并授权。成功后终端会打印：

```
https://my-blog.<你的 workers.dev 子域>.workers.dev
```

这个地址已经自动带 HTTPS，可以直接访问和分享。

> **注意**：`wrangler.jsonc` 里的 `name`（这里是 `my-blog`）决定 `workers.dev` 子域名，必须全局唯一。
> 如果提示名字被占用，改成 `my-blog-你的昵称` 之类再执行 `npm run deploy` 即可。

### 绑定自己的域名

1. 在 Cloudflare 控制台 **Workers & Pages → 你的 Worker → Settings → Domains & Routes → Add → Custom Domain**，填 `blog.example.com`。
2. 如果域名不在 Cloudflare：先在控制台 **Add site** 添加域名，然后到域名注册商处把 NS 改成 Cloudflare 提供的两个名称服务器（几分钟到 24 小时生效）。
3. 证书由 Cloudflare 自动签发，通常 1～15 分钟生效；绑定后记得把下面两处改成真实域名，RSS 和 sitemap 里的链接才正确：
   - `astro.config.mjs` 的 `site`
   - `src/consts.ts` 的 `url`

### 上线后建议打开的开关

- **SSL/TLS → Edge Certificates**：Always Use HTTPS、Automatic HTTPS Rewrites、HSTS（最低 TLS 1.2）。
- **Speed**：Brotli、HTTP/3、Early Hints。
- **Web Analytics**：免费，无需在页面里塞第三方统计脚本。
- 想连 Git 自动部署：Workers & Pages 里连接 GitHub 仓库，构建命令 `npm run build`、输出目录 `dist`，以后 `git push` 即上线。

## 5. 改成你自己的样子

| 想改什么 | 改哪里 |
| --- | --- |
| 站点标题、描述、作者、导航 | `src/consts.ts` |
| 域名（用于 RSS/sitemap 绝对链接） | `astro.config.mjs` 的 `site` + `src/consts.ts` 的 `url` |
| 关于页文字、联系方式 | `src/pages/about.astro` |
| 配色、字体、间距 | `src/styles/global.css`（颜色都在顶部 CSS 变量里，含深色模式） |
| 网站图标 | `public/favicon.svg` |
| 搜索页的样式 | `src/styles/global.css` 里 `.search-*` 那几段 |
| 首页显示的文章条数 | `src/pages/index.astro` 里的 `posts.slice(0, 8)` |

## 常见问题

**构建时报 `require is not defined`（与 yaml / picomatch 有关）**
这是 Astro 7 + Vite 8 在当前依赖组合下加载内容配置时的已知坑：Vite 的模块运行器会内联 CJS 依赖。
`astro.config.mjs` 里已经用 `vite.environments.*.optimizeDeps.include` 让这些依赖预构建成 ESM，**不要删掉这段**。
如果将来升级 Astro 后报出新的包名，把那个包名加进这个数组即可。

**`npm run dev` 报 `require is not defined`、启动很慢或 `transport invoke timed out`**
多半是 Vite 的依赖预构建还没完成，内容配置就先被加载了。先跑一次 `npm run build`（它会把依赖预构建进 `node_modules/.vite`），再启动 `npm run dev`；也可以删掉 `node_modules/.vite`，用 `npm run dev -- --force` 强制重建缓存。
在受限容器/沙箱里，Vite 的模块运行器可能拿不到进程间通道导致 dev 起不来，这时用 `npm run build` 构建后拿任意静态服务器预览 `dist/` 即可（构建产物就是最终上线的文件）。

**搜索页提示"搜索索引尚未生成"**
`npm run dev` 的开发服务器里没有索引（索引是构建产物）。跑 `npm run build` 后 `npm run preview`，或等部署上线后再试。

**线上搜索无反应或控制台报模块 / MIME 错误**
先确认 `dist/pagefind/` 已经一起部署（Actions 构建时会自动生成）。如果只有 `pagefind.js` 报 MIME 类型错误，说明托管方没把它当 JS 返回，可以在项目根目录加一个 `_headers` 文件（Workers 静态资源支持）：
```
/pagefind/pagefind.js
  Content-Type: text/javascript
```

**`wrangler deploy` 提示 Worker 名称被占用**
改 `wrangler.jsonc` 的 `name`。名称决定 `*.workers.dev` 子域，全局唯一。

**`wrangler` 提示 Node 版本过低**
升级 Node 到 22.12+（`node -v` 查看）。

**国内访问偏慢**
Cloudflare 免费套餐在中国大陆没有本地节点，通常走香港/日本/新加坡。这是免费方案的固有代价，想做大陆加速需要备案 + 国内 CDN。

**想删掉某篇文章 / 改 URL**
删除或重命名 `src/content/blog/` 里的 Markdown 文件后重新 `npm run deploy`；URL 跟着文件名走，旧链接会变成 404。

## 成本

- Cloudflare Workers 免费额度：每天 10 万次请求，静态资源文件 2 万个/版本（单文件 ≤ 25MiB），一个个人博客很难用满。
- 免费 `*.workers.dev` 子域零成本；自有域名按年付注册费（可用 Cloudflare Registrar 成本价续费）。
