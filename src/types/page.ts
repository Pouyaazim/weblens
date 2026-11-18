/**
 * تایپ‌های مربوط به داده استخراج‌شده از صفحه وب.
 * این تایپ‌ها قرارداد بین ماژول استخراج و موتورهای تحلیل هستند.
 */

export interface ExtractedHeading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ExtractedImage {
  src: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface ExtractedLink {
  href: string;
  text: string;
  isInternal: boolean;
  rel: string;
  target: string | null;
}

export interface ExtractedMeta {
  name: string;
  property: string;
  content: string;
}

export interface ExtractedJsonLd {
  raw: string;
  parsed: unknown;
  parseError: string | null;
  types: string[];
}

export interface ExtractedParagraph {
  text: string;
  wordCount: number;
}

/** داده خام و اعتبارسنجی‌شده صفحه که موتورهای تحلیل روی آن کار می‌کنند. */
export interface PageData {
  url: string;
  protocol: 'http:' | 'https:' | 'other';
  title: string;
  lang: string;
  metaDescription: string;
  canonical: string | null;
  robotsMeta: string;
  viewport: string | null;
  headings: ExtractedHeading[];
  images: ExtractedImage[];
  links: ExtractedLink[];
  metas: ExtractedMeta[];
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  jsonLd: ExtractedJsonLd[];
  paragraphs: ExtractedParagraph[];
  visibleText: string;
  wordCount: number;
  author: string | null;
  publishedTime: string | null;
  modifiedTime: string | null;
  extractedAt: string;
  truncated: boolean;
}
