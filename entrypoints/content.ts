/**
 * Content Script — استخراج داده صفحه برای صفحات خاص.
 * (استخراج اصلی از طریق scripting API در Background انجام می‌شود؛
 * این اسکریپت برای صفحاتی که نیاز به استخراج خودکار دارند استفاده می‌شود.)
 */
import { extractPageData } from '../src/services/extraction/extractor';
import { PageDataSchema } from '../src/services/extraction/validator';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'weblens:extract-page') {
        try {
          const data = extractPageData(document, location.href);
          const parsed = PageDataSchema.safeParse(data);
          if (parsed.success) sendResponse({ ok: true, data: parsed.data });
          else sendResponse({ ok: false, error: 'داده استخراج‌شده معتبر نیست.' });
        } catch (e) {
          sendResponse({ ok: false, error: e instanceof Error ? e.message : 'خطا' });
        }
        return true;
      }
      return false;
    });
  },
});
