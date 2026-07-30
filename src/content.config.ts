import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cronicas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cronicas' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    categoria: z.enum(['cronicas', 'aliados']).default('cronicas'),
  }),
});

export const collections = { cronicas };
