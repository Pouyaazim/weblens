import type { PageData } from '@/types/page';

/** ساخت داده صفحه نمونه برای تست‌ها. */
export function makePage(overrides: Partial<PageData> = {}): PageData {
  return {
    url: 'https://example.com/page',
    protocol: 'https:',
    title: 'راهنمای کامل سئو برای وب‌سایت‌های فارسی',
    lang: 'fa',
    metaDescription: 'در این راهنما با اصول سئو، بهینه‌سازی محتوا و افزایش ترافیک وب‌سایت خود آشنا شوید و نتایج بهتری بگیرید.',
    canonical: 'https://example.com/page',
    robotsMeta: '',
    viewport: 'width=device-width, initial-scale=1',
    headings: [
      { level: 1, text: 'راهنمای کامل سئو' },
      { level: 2, text: 'سئو چیست؟' },
      { level: 2, text: 'چرا سئو مهم است؟' },
      { level: 3, text: 'مراحل سئو' },
    ],
    images: [
      { src: 'https://example.com/a.jpg', alt: 'تصویر آموزشی سئو', width: 800, height: 600 },
    ],
    links: [
      { href: '/other', text: 'صفحه دیگر', isInternal: true, rel: '', target: null },
      { href: 'https://other.com', text: 'منبع خارجی', isInternal: false, rel: 'noopener', target: '_blank' },
    ],
    metas: [],
    openGraph: { 'og:title': 'راهنمای سئو', 'og:description': 'توضیح', 'og:image': 'https://example.com/a.jpg', 'og:url': 'https://example.com/page' },
    twitterCard: { 'twitter:card': 'summary', 'twitter:title': 'راهنمای سئو' },
    jsonLd: [{ raw: '{"@type":"Article"}', parsed: { '@type': 'Article' }, parseError: null, types: ['Article'] }],
    paragraphs: [
      { text: 'سئو بهینه‌سازی وب‌سایت برای موتورهای جست‌وجو است و به شما کمک می‌کند در نتایج بهتر دیده شوید.', wordCount: 15 },
      { text: 'در این مقاله مراحل کامل سئو را به‌صورت گام‌به‌گام بررسی می‌کنیم تا بتوانید وب‌سایت خود را بهینه کنید.', wordCount: 16 },
    ],
    visibleText: 'راهنمای کامل سئو برای وب‌سایت‌های فارسی. سئو بهینه‌سازی وب‌سایت برای موتورهای جست‌وجو است. چرا سئو مهم است؟ چون ترافیک ارگانیک افزایش می‌یابد. مراحل سئو چیست؟ ابتدا تحقیق کلمات کلیدی انجام می‌شود. منبع: https://example.org',
    wordCount: 400,
    author: 'نویسنده نمونه',
    publishedTime: '2026-01-01T00:00:00Z',
    modifiedTime: null,
    extractedAt: new Date().toISOString(),
    truncated: false,
    ...overrides,
  };
}
