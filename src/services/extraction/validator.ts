/** اعتبارسنجی داده ورودی از Content Script با Zod. */
import { z } from 'zod';

export const PageDataSchema = z.object({
  url: z.string().min(1),
  protocol: z.enum(['http:', 'https:', 'other']),
  title: z.string(),
  lang: z.string(),
  metaDescription: z.string(),
  canonical: z.string().nullable(),
  robotsMeta: z.string(),
  viewport: z.string().nullable(),
  headings: z.array(z.object({ level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]), text: z.string() })),
  images: z.array(z.object({ src: z.string(), alt: z.string().nullable(), width: z.number().nullable(), height: z.number().nullable() })),
  links: z.array(z.object({ href: z.string(), text: z.string(), isInternal: z.boolean(), rel: z.string(), target: z.string().nullable() })),
  metas: z.array(z.object({ name: z.string(), property: z.string(), content: z.string() })),
  openGraph: z.record(z.string(), z.string()),
  twitterCard: z.record(z.string(), z.string()),
  jsonLd: z.array(z.object({ raw: z.string(), parsed: z.unknown(), parseError: z.string().nullable(), types: z.array(z.string()) })),
  paragraphs: z.array(z.object({ text: z.string(), wordCount: z.number() })),
  visibleText: z.string(),
  wordCount: z.number().nonnegative(),
  author: z.string().nullable(),
  publishedTime: z.string().nullable(),
  modifiedTime: z.string().nullable(),
  extractedAt: z.string(),
  truncated: z.boolean(),
});

export type ValidatedPageData = z.infer<typeof PageDataSchema>;
