/**
 * موتور استخراج اطلاعات صفحه.
 *
 * اصول امنیتی:
 * - فقط محتوای قابل مشاهده خوانده می‌شود؛ اسکریپت‌ها، استایل‌ها و فرم‌ها نادیده گرفته می‌شوند.
 * - هیچ کد استخراج‌شده‌ای از صفحه اجرا نمی‌شود.
 * - داده‌های حساس (رمز عبور، توکن، کوکی) هرگز خوانده نمی‌شوند.
 * - برای صفحات بسیار بزرگ سقف پردازش اعمال می‌شود.
 */
import type { PageData, ExtractedHeading, ExtractedImage, ExtractedLink, ExtractedMeta, ExtractedJsonLd, ExtractedParagraph } from '@/types/page';
import { countWords, normalizePersian } from '@/utils/text';

const MAX_ELEMENTS = 5000;
const MAX_TEXT_CHARS = 200_000;
const MAX_PARAGRAPHS = 500;
const MAX_LINKS = 1000;
const MAX_IMAGES = 500;
const MAX_HEADINGS = 300;

function isVisible(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

function safeText(el: Element): string {
  return normalizePersian(el.textContent ?? '');
}

function extractHeadings(doc: Document): ExtractedHeading[] {
  const out: ExtractedHeading[] = [];
  const nodes = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');
  nodes.forEach((node) => {
    if (out.length >= MAX_HEADINGS) return;
    const level = Number(node.tagName[1]) as 1 | 2 | 3 | 4 | 5 | 6;
    out.push({ level, text: safeText(node) });
  });
  return out;
}

function extractImages(doc: Document): ExtractedImage[] {
  const out: ExtractedImage[] = [];
  doc.querySelectorAll('img').forEach((img) => {
    if (out.length >= MAX_IMAGES) return;
    const src = img.getAttribute('src') ?? img.getAttribute('data-src') ?? '';
    if (!src) return;
    out.push({
      src,
      alt: img.hasAttribute('alt') ? (img.getAttribute('alt') ?? '') : null,
      width: img.naturalWidth || img.width || null,
      height: img.naturalHeight || img.height || null,
    });
  });
  return out;
}

function extractLinks(doc: Document, pageUrl: string): ExtractedLink[] {
  const out: ExtractedLink[] = [];
  let pageHost = '';
  try { pageHost = new URL(pageUrl).hostname; } catch { /* نادیده */ }
  doc.querySelectorAll('a[href]').forEach((a) => {
    if (out.length >= MAX_LINKS) return;
    const href = a.getAttribute('href') ?? '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    let isInternal = true;
    try {
      const resolved = new URL(href, pageUrl);
      isInternal = resolved.hostname === pageHost;
    } catch { /* href نامعتبر؛ به‌عنوان خارجی ثبت می‌شود */ isInternal = false; }
    out.push({
      href,
      text: safeText(a).slice(0, 200),
      isInternal,
      rel: a.getAttribute('rel') ?? '',
      target: a.getAttribute('target'),
    });
  });
  return out;
}

function extractMetas(doc: Document): ExtractedMeta[] {
  const out: ExtractedMeta[] = [];
  doc.querySelectorAll('meta').forEach((m) => {
    const name = m.getAttribute('name') ?? '';
    const property = m.getAttribute('property') ?? '';
    const content = m.getAttribute('content') ?? '';
    if (!name && !property) return;
    out.push({ name, property, content });
  });
  return out;
}

function extractJsonLd(doc: Document): ExtractedJsonLd[] {
  const out: ExtractedJsonLd[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    const raw = (s.textContent ?? '').trim();
    if (!raw) return;
    let parsed: unknown = null;
    let parseError: string | null = null;
    try { parsed = JSON.parse(raw); } catch (e) { parseError = e instanceof Error ? e.message : 'خطای نامشخص'; }
    const types: string[] = [];
    const collect = (obj: unknown) => {
      if (Array.isArray(obj)) { obj.forEach(collect); return; }
      if (obj && typeof obj === 'object') {
        const rec = obj as Record<string, unknown>;
        if (typeof rec['@type'] === 'string') types.push(rec['@type']);
        else if (Array.isArray(rec['@type'])) rec['@type'].forEach((t) => { if (typeof t === 'string') types.push(t); });
        if (rec['@graph']) collect(rec['@graph']);
      }
    };
    if (parsed) collect(parsed);
    out.push({ raw: raw.slice(0, 20_000), parsed, parseError, types });
  });
  return out;
}

function extractParagraphs(doc: Document): ExtractedParagraph[] {
  const out: ExtractedParagraph[] = [];
  doc.querySelectorAll('p, li, blockquote').forEach((el) => {
    if (out.length >= MAX_PARAGRAPHS) return;
    if (!isVisible(el)) return;
    const text = safeText(el);
    if (text.length < 10) return;
    out.push({ text, wordCount: countWords(text) });
  });
  return out;
}

function extractVisibleText(doc: Document): { text: string; truncated: boolean } {
  const body = doc.body;
  if (!body) return { text: '', truncated: false };
  const clone = body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, noscript, iframe, form, input, textarea, select, button, svg').forEach((n) => n.remove());
  const raw = normalizePersian(clone.textContent ?? '');
  return { text: raw.slice(0, MAX_TEXT_CHARS), truncated: raw.length > MAX_TEXT_CHARS };
}

function metaValue(metas: ExtractedMeta[], key: string): string {
  const found = metas.find((m) => m.name.toLowerCase() === key || m.property.toLowerCase() === key);
  return found?.content ?? '';
}

/** استخراج کامل داده صفحه از یک سند DOM. */
export function extractPageData(doc: Document, url: string): PageData {
  const metas = extractMetas(doc);
  const { text: visibleText, truncated } = extractVisibleText(doc);
  const openGraph: Record<string, string> = {};
  const twitterCard: Record<string, string> = {};
  for (const m of metas) {
    if (m.property.startsWith('og:')) openGraph[m.property] = m.content;
    if (m.name.startsWith('twitter:')) twitterCard[m.name] = m.content;
  }
  let protocol: PageData['protocol'] = 'other';
  try {
    const p = new URL(url).protocol;
    protocol = p === 'http:' || p === 'https:' ? p : 'other';
  } catch { /* URL نامعتبر */ }

  const canonicalEl = doc.querySelector('link[rel="canonical"]');
  const canonical = canonicalEl?.getAttribute('href') ?? null;

  return {
    url,
    protocol,
    title: normalizePersian(doc.title ?? ''),
    lang: doc.documentElement.getAttribute('lang') ?? '',
    metaDescription: metaValue(metas, 'description'),
    canonical,
    robotsMeta: metaValue(metas, 'robots'),
    viewport: metaValue(metas, 'viewport') || null,
    headings: extractHeadings(doc),
    images: extractImages(doc),
    links: extractLinks(doc, url),
    metas,
    openGraph,
    twitterCard,
    jsonLd: extractJsonLd(doc),
    paragraphs: extractParagraphs(doc),
    visibleText,
    wordCount: countWords(visibleText),
    author: metaValue(metas, 'author') || null,
    publishedTime: openGraph['article:published_time'] ?? null,
    modifiedTime: openGraph['article:modified_time'] ?? null,
    extractedAt: new Date().toISOString(),
    truncated,
  };
}

/** اعتبارسنجی اولیه داده استخراج‌شده. */
export function validatePageData(data: PageData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.url) errors.push('URL صفحه خالی است.');
  if (typeof data.title !== 'string') errors.push('عنوان صفحه نامعتبر است.');
  if (!Array.isArray(data.headings)) errors.push('ساختار هدینگ‌ها نامعتبر است.');
  if (!Array.isArray(data.links)) errors.push('ساختار لینک‌ها نامعتبر است.');
  if (data.wordCount < 0) errors.push('تعداد کلمات نامعتبر است.');
  return { valid: errors.length === 0, errors };
}

export const EXTRACTION_LIMITS = { MAX_ELEMENTS, MAX_TEXT_CHARS };
