import { describe, it, expect } from 'vitest';
import { extractPageData, validatePageData } from '@/services/extraction/extractor';
import { PageDataSchema } from '@/services/extraction/validator';

function makeDoc(html: string): Document {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc;
}

describe('Page Extraction', () => {
  it('اطلاعات پایه صفحه را استخراج می‌کند', () => {
    const doc = makeDoc(`<!DOCTYPE html><html lang="fa"><head>
      <title>عنوان نمونه</title>
      <meta name="description" content="توضیحات نمونه">
      <meta name="viewport" content="width=device-width">
      <link rel="canonical" href="https://example.com/a">
    </head><body><h1>تیتر اصلی</h1><p>متن پاراگراف نمونه برای تست استخراج اطلاعات صفحه وب.</p></body></html>`);
    const data = extractPageData(doc, 'https://example.com/a');
    expect(data.title).toBe('عنوان نمونه');
    expect(data.metaDescription).toBe('توضیحات نمونه');
    expect(data.lang).toBe('fa');
    expect(data.canonical).toBe('https://example.com/a');
    expect(data.headings).toEqual([{ level: 1, text: 'تیتر اصلی' }]);
    expect(data.wordCount).toBeGreaterThan(0);
  });

  it('اسکریپت‌ها و فرم‌ها را استخراج نمی‌کند', () => {
    const doc = makeDoc(`<!DOCTYPE html><html><head><title>t</title></head><body>
      <script>var secret = "token123";</script>
      <form><input type="password" value="hunter2"><input type="text" value="user"></form>
      <p>محتوای واقعی صفحه</p></body></html>`);
    const data = extractPageData(doc, 'https://example.com/');
    expect(data.visibleText).not.toContain('token123');
    expect(data.visibleText).not.toContain('hunter2');
    expect(data.visibleText).toContain('محتوای واقعی صفحه');
  });

  it('لینک‌های داخلی و خارجی را تفکیک می‌کند', () => {
    const doc = makeDoc(`<!DOCTYPE html><html><head><title>t</title></head><body>
      <a href="/internal">داخلی</a><a href="https://other.com/x">خارجی</a>
      <a href="#anchor">لنگر</a><a href="mailto:a@b.com">ایمیل</a></body></html>`);
    const data = extractPageData(doc, 'https://example.com/');
    expect(data.links).toHaveLength(2);
    expect(data.links.find((l) => l.href === '/internal')?.isInternal).toBe(true);
    expect(data.links.find((l) => l.href === 'https://other.com/x')?.isInternal).toBe(false);
  });

  it('JSON-LD را استخراج و نوع آن را تشخیص می‌دهد', () => {
    const doc = makeDoc(`<!DOCTYPE html><html><head><title>t</title>
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"خبر"}</script>
    </head><body></body></html>`);
    const data = extractPageData(doc, 'https://example.com/');
    expect(data.jsonLd).toHaveLength(1);
    expect(data.jsonLd[0]?.types).toContain('Article');
    expect(data.jsonLd[0]?.parseError).toBeNull();
  });

  it('JSON-LD نامعتبر را با خطا گزارش می‌کند', () => {
    const doc = makeDoc(`<!DOCTYPE html><html><head><title>t</title>
      <script type="application/ld+json">{invalid json}</script>
    </head><body></body></html>`);
    const data = extractPageData(doc, 'https://example.com/');
    expect(data.jsonLd[0]?.parseError).not.toBeNull();
  });

  it('داده استخراج‌شده با اسکیما اعتبارسنجی می‌شود', () => {
    const doc = makeDoc(`<!DOCTYPE html><html><head><title>t</title></head><body><p>متن</p></body></html>`);
    const data = extractPageData(doc, 'https://example.com/');
    expect(PageDataSchema.safeParse(data).success).toBe(true);
    expect(validatePageData(data).valid).toBe(true);
  });

  it('Open Graph و Twitter Card را استخراج می‌کند', () => {
    const doc = makeDoc(`<!DOCTYPE html><html><head><title>t</title>
      <meta property="og:title" content="عنوان OG">
      <meta name="twitter:card" content="summary">
    </head><body></body></html>`);
    const data = extractPageData(doc, 'https://example.com/');
    expect(data.openGraph['og:title']).toBe('عنوان OG');
    expect(data.twitterCard['twitter:card']).toBe('summary');
  });
});
