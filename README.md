# 我的博客 · Astro + Cloudflare Workers

一个可以直接部署到 Cloudflare 免费额度的个人博客：静态生成、自动 HTTPS、全球 CDN，不需要服务器。
写完 Markdown 敲一行命令就上线。

## 技术栈

| 部分 | 说明 |
| --- | --- |
| 框架 | [Astro 7](https://astro.build)（默认静态输出，`dist/` 里全是纯 HTML/CSS） |
| 内容 | Astro 内容集合（Content Collections），文章就是 `src/content/blog/*.md` |
| 搜索 | [Pagefind](https://pagefind.app) 1.5：构建时扫一遍 HTML 生成静态索引，浏览器里检索，**不需要服务器或数据库** |
| 代码块 | [Expressive Code](https://expressive-code.com)：复制按钮、语言标签、行号，深浅两套主题自动跟随系统 |
| 图片 | Astro 内置 `astro:assets` + sharp：文章里的图片构建时自动压缩、转 WebP、输出多档尺寸 |
| 评论 | [Giscus](https://giscus.app)：基于 GitHub Discussions，评论存在自己仓库里，**不需要服务器**；访客需登录 GitHub |
| 统计 | Cloudflare Web Analytics（可选）：免费、无 cookie，填入 token 即启用 |
| 托管 | Cloudflare Workers 静态资源（`wrangler deploy`，免费额度：每天 10 万请求、2 万个静态文件） |
| 附加能力 | `/rss.xml` 订阅、`sitemap-index.xml` 站点地图、站内搜索、404 页面 |

## 目录结构

```
my-blog/
├─ astro.config.mjs          # Astro 配置（site 域名、sitemap、Vite 依赖预构建）
├─ wrangler.jsonc            # Cloudflare 部署配置（把 dist/ 作为静态资源发布）
├─ package.json              # 脚本与依赖
├─ ec.config.mjs             # 代码块（Expressive Code）主题与插件配置
├─ .github/workflows/deploy.yml  # push 到 main 自动构建并部署
├─ public/                   # 原样拷贝到 dist/ 的静态文件（favicon、图片）
└─ src/
   ├─ consts.ts              # 站点标题、描述、作者、导航、统计 token（改这里）
   ├─ assets/                # 需要优化的图片放这里（构建时自动转 WebP）
   ├─ content.config.ts      # 文章集合的字段定义（frontmatter schema）
   ├─ content/blog/*.md      # 文章本体
   ├─ layouts/BaseLayout.astro   # 全站 HTML 骨架（head、导航、页脚）
   ├─ components/PostList.astro  # 文章列表组件
   ├─ components/Comments.astro  # Giscus 评论区（滚动到附近才加载）
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

## 5. 评论（Giscus，已接入）

文章页底部的评论区用 [Giscus](https://giscus.app) 实现：评论以 GitHub Discussions 的形式存在**你自己的仓库**里，前端只是一个 iframe，不需要服务器、不需要数据库、也没有第三方账号。

### 还需要你手动做 4 步（约 3 分钟）

1. **给仓库装 giscus App**：打开 <https://github.com/apps/giscus> → Install → 选择 `Zhi2007/my-blog`（只勾这一个仓库最安全）。
2. **开启 Discussions**：仓库 → Settings → General → Features → 勾上 **Discussions**。
3. **建一个讨论分类**：仓库 → Discussions → Categories 旁的编辑按钮 → New category，名字填 `Comments`，类型选 **Announcements**（只有维护者能发起新讨论，能挡掉一部分垃圾内容）。
4. **拿 categoryId 并填进来**：打开 <https://giscus.app/zh-CN>，Repository 填 `Zhi2007/my-blog`，Discussion Category 选刚建的 `Comments`，Mapping 选 `pathname`；页面下方会生成一段 `<script>`，把里面的 `data-category-id`（形如 `DIC_kwDOVCbYDs4C...`）复制到 `src/consts.ts` 的 `GISCUS.categoryId`。

改完提交推送即可：

```sh
git add .
git commit -m "配置 Giscus 评论"
git push
```

> `GISCUS.categoryId` 为空时，文章页只显示一段配置提示，不会报错；填好后自动变成真实评论区。

### 说明与注意

- **仓库必须保持 public**：Giscus 用公开仓库的 Discussions 存评论，转成私有后评论区会失效。
- **访客需要 GitHub 账号**才能评论（技术博客通常没问题）。
- **评论区懒加载**：滚动到页面底部附近才请求 `giscus.app`，不拖慢正文；主题跟随系统深浅色（`preferred_color_scheme`）。
- **管理评论**：直接在仓库的 Discussions 里回复、删除、锁定，没有额外后台。
- 如果读者主要在国内且大多没有 GitHub 账号，可以换成 **Cloudflare Workers + D1** 自建评论（访客免登录、数据也在你自己账号里），跟我说一声即可。

## 6. 改成你自己的样子

| 想改什么 | 改哪里 |
| --- | --- |
| 站点标题、描述、作者、导航 | `src/consts.ts` |
| 域名（用于 RSS/sitemap 绝对链接） | `astro.config.mjs` 的 `site` + `src/consts.ts` 的 `url` |
| 关于页文字、联系方式 | `src/pages/about.astro` |
| 配色、字体、间距 | `src/styles/global.css`（颜色都在顶部 CSS 变量里，含深色模式） |
| 网站图标 | `public/favicon.svg` |
| 搜索页的样式 | `src/styles/global.css` 里 `.search-*` 那几段 |
| 代码块主题、行号、复制按钮 | `ec.config.mjs` |
| 首页显示的文章条数 | `src/pages/index.astro` 里的 `posts.slice(0, 8)` |

## 7. 代码块、图片与访问统计

### 代码块增强（Expressive Code）

所有 Markdown 代码块由 [Expressive Code](https://expressive-code.com) 渲染：**复制按钮、语言标签、行号**一应俱全，深浅两套主题（github-light / github-dark）自动跟随系统设置。配置在 `ec.config.mjs`：

- 全局关掉行号：把 `defaultProps.showLineNumbers` 改成 `false`
- 单个代码块关掉行号：在代码围栏后写 `showLineNumbers=false`
- 换主题：改 `themes` 数组（第一个是浅色、第二个是深色）
- 想加折叠区块等插件：装 `@expressive-code/plugin-collapsible-sections` 后加进 `plugins`

### 图片自动优化（astro:assets）

不需要手动压图。把图片放进 `src/assets/`，在文章 frontmatter 里写相对路径：

```yaml
cover: ../../assets/cover-demo.png
```

构建时会自动生成 480 / 760 / 1200 三档 WebP 并输出 `srcset`，浏览器按屏幕宽度挑最合适的一张。示例见 `hello-world.md` 与 `src/assets/cover-demo.png`（换成自己的图或直接删掉都行）。

- 建议原图宽度 ≥ 1200px、体积 ≤ 2MB，PNG / JPG 都可以
- 想放到页面其它位置，用 `<Image src={...} alt="..." />`（从 `astro:assets` 导入）
- 只有 `src/` 里的图片会被优化；`public/` 里的文件是原样拷贝、不做处理

### 访问统计（Cloudflare Web Analytics，可选）

免费、无 cookie、不收集个人信息，脚本由 Cloudflare 自己的 CDN 提供：

1. Cloudflare 控制台 → **Web Analytics** → **Add a site** → hostname 填 `my-blog.mc20070831.workers.dev`（或你的自有域名）
2. 创建后点 **Manage site**，从给出的 JS 片段里复制 `data-cf-beacon` 中的 **token**
3. 把 token 填到 `src/consts.ts` 的 `SITE.cfAnalyticsToken`，提交推送

`cfAnalyticsToken` 留空时**不会加载任何脚本**，所以不配置也没有额外请求。注意 `workers.dev` 不在你自己的 Cloudflare zone 下，只能用这种"手动填 token"的方式，无法用自动注入。

## 8. 小特效（人生倒计时 / 标签页标题）

两个纯前端效果，配置都在 `src/consts.ts`，不需要服务器、不发任何请求。

### 人生倒计时（页脚）

```ts
export const LIFE = {
  birthDate: '',     // 出生日期 'YYYY-MM-DD'，留空则整块不渲染
  lifeExpectancy: 80 // 预期寿命（岁）
};
```

- 页脚显示「人生进度 xx.xx% · 还剩 N 天」加一条进度条，每分钟刷新一次
- 纯本地日期计算（`(end - now) / 86400000`），不依赖任何接口
- **`birthDate` 留空时组件完全不渲染**，所以不填就不会公开这个信息
- 组件在 `src/components/LifeCountdown.astro`，样式是 `global.css` 里的 `.life*`

### 切换标签页时改标题

```ts
export const AWAY_TITLES = ['喂，别走啊 👀', '快回来看看嘛', '页面还在，人没了？'];
```

- 用 Page Visibility API 判断访客是否切走：离开时每 2.5 秒轮播一条，回来立刻恢复原标题
- 数组留空就不启用；想换成「(1) 新消息」之类只改这个数组
- 组件在 `src/components/TabTitle.astro`

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

**文章页底部没有评论区，或者一直转圈**
① 确认已给仓库安装 giscus App 并开启了 Discussions；② 确认 `src/consts.ts` 里 `GISCUS.categoryId` 已填写、且和 giscus.app 生成的一致；③ 评论区依赖 `giscus.app` 与 `github.com`，国内网络可能需要代理——加载失败只影响评论区，正文照常。

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
