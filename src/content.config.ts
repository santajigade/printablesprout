import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_NAMES, OCCASION_SLUGS } from './lib/site';

const printables = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/printables' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(CATEGORY_NAMES),
    occasion: z.enum(OCCASION_SLUGS).optional(),
    tags: z.array(z.string()).default([]),
    keywords: z.string().optional(),
    ages: z.string(),
    time: z.string(),
    // Editable text on the sheet. key must match data-field in the SVG.
    fields: z.array(z.object({ key: z.string(), label: z.string(), placeholder: z.string().default(''), max: z.number().default(20) })).default([]),
    // Alternative versions of the sheet. key must match data-variant in the SVG; the first is shown by default.
    tool: z.enum(['fill', 'draw']).default('fill'),
    variants: z.array(z.object({ key: z.string(), label: z.string() })).default([]),
    image: z.string(),
    imageAlt: z.string(),
    author: z.string().default('Santaji Gadepatil'),
    sources: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), slug: z.string(), description: z.string() }),
});

export const collections = { printables, pages };
