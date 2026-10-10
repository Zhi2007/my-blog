import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 文章集合：src/content/blog/*.md 里的 Markdown 会自动成为文章
const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    // 用文件名（去掉 .md）当文章 id，于是 URL 就是 /blog/文件名/
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().default(''),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      /** 封面图：图片放 src/assets/，这里写相对本文文件的路径，构建时自动压缩转 WebP */
      cover: image().optional(),
      /** draft: true 的文章只在本地开发时可见，不会部署上线 */
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
