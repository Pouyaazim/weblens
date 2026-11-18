/**
 * ابزارهای پردازش متن با پشتیبانی کامل از فارسی.
 * - نرمال‌سازی ي/ك عربی به ی/ک فارسی
 * - شمارش کلمات فارسی و انگلیسی و ترکیبی
 * - تشخیص نیم‌فاصله
 */

const ARABIC_YEH = /ي/g;
const ARABIC_KAF = /ك/g;
const ARABIC_TEH_MARBUTA = /ة/g;
const ZWNJ = /‌/g;
const MULTIPLE_SPACES = /\s+/g;

/** نرمال‌سازی متن فارسی برای مقایسه و تحلیل. */
export function normalizePersian(text: string): string {
  return text
    .replace(ARABIC_YEH, 'ی')
    .replace(ARABIC_KAF, 'ک')
    .replace(ARABIC_TEH_MARBUTA, 'ه')
    .replace(ZWNJ, ' ')
    .replace(MULTIPLE_SPACES, ' ')
    .trim();
}

/** شمارش کلمات؛ از کلمات فارسی، انگلیسی و ترکیبی پشتیبانی می‌کند. */
export function countWords(text: string): number {
  const normalized = normalizePersian(text);
  if (!normalized) return 0;
  return normalized.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** طول متن برحسب نویسه (بدون فاصله‌های اضافی). */
export function textLength(text: string): number {
  return normalizePersian(text).replace(/\s/g, '').length;
}

/** بررسی وجود نیم‌فاصله در متن. */
export function hasZwnj(text: string): boolean {
  return /‌/.test(text);
}

/** تشخیص اینکه متن عمدتاً فارسی است یا انگلیسی. */
export function detectLanguage(text: string): 'fa' | 'en' | 'mixed' | 'unknown' {
  const fa = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const en = (text.match(/[A-Za-z]/g) ?? []).length;
  if (fa === 0 && en === 0) return 'unknown';
  if (fa > 0 && en > 0) {
    const ratio = fa / (fa + en);
    return ratio > 0.15 && ratio < 0.85 ? 'mixed' : ratio >= 0.85 ? 'fa' : 'en';
  }
  return fa > 0 ? 'fa' : 'en';
}

/** برش امن متن برای نمایش یا ارسال به AI. */
export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '…';
}

/** استخراج جمله‌های پرسشی از متن. */
export function extractQuestions(text: string): string[] {
  const matches = text.match(/[^.!؟?؟\n]{2,200}[؟?]/g) ?? [];
  return matches.map((m) => m.trim()).filter(Boolean).slice(0, 20);
}
