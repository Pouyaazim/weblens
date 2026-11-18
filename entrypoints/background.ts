/**
 * Service Worker افزونه (Manifest V3).
 * وظایف:
 * - باز کردن Side Panel با کلیک روی آیکون افزونه
 * - پاسخ به درخواست استخراج از Content Script
 */
import { browser } from 'wxt/browser';
import type { ExtensionMessage, ExtractResponse } from '../src/types/messages';
import { PageDataSchema } from '../src/services/extraction/validator';
export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id !== undefined) {
      await browser.sidePanel.open({ tabId: tab.id }).catch(() => undefined);
    }
  });

  browser.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'weblens:extract-page') {
      (async () => {
        try {
          const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
          if (!tab?.id) {
            sendResponse({ ok: false, error: 'تب فعالی یافت نشد.' } satisfies ExtractResponse);
            return;
          }
          const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              // این تابع در صفحه اجرا می‌شود؛ فقط DOM خوانده می‌شود و هیچ کد صفحه‌ای اجرا نمی‌شود.
              const doc = document;
              const get = (sel: string) => doc.querySelector(sel);
              const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
              const metas = [...doc.querySelectorAll('meta')].map((m) => ({
                name: m.getAttribute('name') ?? '',
                property: m.getAttribute('property') ?? '',
                content: m.getAttribute('content') ?? '',
              }));
              const metaVal = (key: string) => metas.find((m) => m.name.toLowerCase() === key || m.property.toLowerCase() === key)?.content ?? '';
              const og: Record<string, string> = {};
              const tw: Record<string, string> = {};
              for (const m of metas) {
                if (m.property.startsWith('og:')) og[m.property] = m.content;
                if (m.name.startsWith('twitter:')) tw[m.name] = m.content;
              }
              const clone = doc.body?.cloneNode(true) as HTMLElement | undefined;
              clone?.querySelectorAll('script,style,noscript,iframe,form,input,textarea,select,button,svg').forEach((n) => n.remove());
              const visibleText = (clone?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 200000);
              const pageHost = location.hostname;
              const links = [...doc.querySelectorAll('a[href]')].slice(0, 1000).map((a) => {
                const href = a.getAttribute('href') ?? '';
                let internal = true;
                try { internal = new URL(href, location.href).hostname === pageHost; } catch { internal = false; }
                return { href, text: text(a).slice(0, 200), isInternal: internal, rel: a.getAttribute('rel') ?? '', target: a.getAttribute('target') };
              }).filter((l) => l.href && !l.href.startsWith('#') && !l.href.startsWith('javascript:') && !l.href.startsWith('mailto:') && !l.href.startsWith('tel:'));
              const jsonLd = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
                const raw = (s.textContent ?? '').trim();
                let parsed: unknown = null; let parseError: string | null = null;
                try { parsed = JSON.parse(raw); } catch (e) { parseError = e instanceof Error ? e.message : 'خطا'; }
                const types: string[] = [];
                const collect = (o: unknown) => {
                  if (Array.isArray(o)) { o.forEach(collect); return; }
                  if (o && typeof o === 'object') {
                    const r = o as Record<string, unknown>;
                    if (typeof r['@type'] === 'string') types.push(r['@type']);
                    else if (Array.isArray(r['@type'])) r['@type'].forEach((t) => { if (typeof t === 'string') types.push(t); });
                    if (r['@graph']) collect(r['@graph']);
                  }
                };
                if (parsed) collect(parsed);
                return { raw: raw.slice(0, 20000), parsed, parseError, types };
              });
              const paragraphs = [...doc.querySelectorAll('p,li,blockquote')].slice(0, 500).map((el) => {
                const t = text(el);
                return { text: t, wordCount: t ? t.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0 };
              }).filter((p) => p.text.length >= 10);
              return {
                url: location.href,
                protocol: location.protocol === 'http:' || location.protocol === 'https:' ? location.protocol : 'other',
                title: doc.title.replace(/\s+/g, ' ').trim(),
                lang: doc.documentElement.getAttribute('lang') ?? '',
                metaDescription: metaVal('description'),
                canonical: get('link[rel="canonical"]')?.getAttribute('href') ?? null,
                robotsMeta: metaVal('robots'),
                viewport: metaVal('viewport') || null,
                headings: [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].slice(0, 300).map((h) => ({ level: Number(h.tagName[1]) as 1|2|3|4|5|6, text: text(h) })),
                images: [...doc.querySelectorAll('img')].slice(0, 500).map((img) => ({
                  src: img.getAttribute('src') ?? img.getAttribute('data-src') ?? '',
                  alt: img.hasAttribute('alt') ? (img.getAttribute('alt') ?? '') : null,
                  width: (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width || null,
                  height: (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height || null,
                })).filter((i) => i.src),
                links,
                metas,
                openGraph: og,
                twitterCard: tw,
                jsonLd,
                paragraphs,
                visibleText,
                wordCount: visibleText ? visibleText.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0,
                author: metaVal('author') || null,
                publishedTime: og['article:published_time'] ?? null,
                modifiedTime: og['article:modified_time'] ?? null,
                extractedAt: new Date().toISOString(),
                truncated: (clone?.textContent ?? '').length > 200000,
              };
            },
          });
          const raw = results[0]?.result;
          if (!raw) {
            sendResponse({ ok: false, error: 'استخراج اطلاعات صفحه ناموفق بود. ممکن است صفحه محدودیت داشته باشد.' } satisfies ExtractResponse);
            return;
          }
          const parsed = PageDataSchema.safeParse(raw);
          if (!parsed.success) {
            sendResponse({ ok: false, error: 'داده استخراج‌شده معتبر نیست.' } satisfies ExtractResponse);
            return;
          }
          sendResponse({ ok: true, data: parsed.data } satisfies ExtractResponse);
        } catch (e) {
          sendResponse({ ok: false, error: e instanceof Error ? e.message : 'خطای نامشخص در استخراج' } satisfies ExtractResponse);
        }
      })();
      return true; // پاسخ ناهمگام
    }
    if (message.type === 'weblens:open-panel') {
      const tabId = sender.tab?.id;
      if (tabId !== undefined) {
        browser.sidePanel.open({ tabId }).catch(() => undefined);
      }
    }
    return false;
  });
});
