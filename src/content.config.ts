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

// Illustrated stories for kids (blog style). Images live in public/stories/<slug>/<n>.svg
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    level: z.enum(['Read aloud', 'Early reader', 'Confident reader']),
    ages: z.string(),
    type: z.enum(['original', 'classic']).default('original'),   // classic = retelling of a public domain tale
    retoldFrom: z.string().optional(),                // classic only, e.g. "Aesop's Fables"
    theme: z.enum(['Good Habits', 'Family and Respect', 'Kindness and Friends', 'Good Communication', 'Learning and Science', 'Classic Tales', 'Jungle Tales', 'Holiday Stories']),
    hero: z.string().optional(),                      // original stories: name readers can swap for their child's
    heroIs: z.enum(['girl', 'boy']).default('girl'),   // hero pronouns in the text are marked <span data-p="subj|obj|poss">                 // the hero's name in the text; readers can swap in their child's name
    occasion: z.enum(OCCASION_SLUGS).optional(),
    tags: z.array(z.string()).default([]),
    keywords: z.string().optional(),
    image: z.string(),                // first illustration, used on cards
    imageAlt: z.string(),
    lesson: z.array(z.string()).min(2).max(4),            // "What We Learn From This Story" points
    quiz: z.array(z.object({ q: z.string(), options: z.array(z.string()).length(4), answer: z.number().int().min(0).max(3) })).min(4).max(5),
    questions: z.array(z.string()).default([]),           // optional open talk prompts
    words: z.array(z.object({ word: z.string(), meaning: z.string() })).default([]),
    author: z.string().default('Santaji Gadepatil'),
    sources: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
  }),
});

export const collections = { printables, pages, stories };
