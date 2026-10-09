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
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** draft: true 的文章只在本地开发时可见，不会部署上线 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
