/**
 * موتور Content Intelligence — ارزیابی ساختاری و محتوایی صفحه.
 * تفاوت بین موارد قابل اندازه‌گیری و تحلیل‌های احتمالی رعایت می‌شود.
 * هیچ صفحه‌ای صرفاً به دلیل کم بودن تعداد کلمات بی‌کیفیت اعلام نمی‌شود.
 */
import type { PageData } from '@/types/page';
import type { CheckResult } from '@/types/analysis';
import { normalizePersian, detectLanguage, extractQuestions, hasZwnj } from '@/utils/text';

function check(partial: Partial<CheckResult> & Pick<CheckResult, 'id' | 'title' | 'status' | 'severity'>): CheckResult {
  return { category: 'content', description: '', evidence: [], recommendation: '', weight: 1, ...partial };
}

function checkWordCount(page: PageData): CheckResult {
  const words = page.wordCount;
  if (words < 50) {
    return check({ id: 'content.word-count', title: 'حجم محتوای صفحه', status: 'warning', severity: 'low',
      description: `صفحه حدود ${words} کلمه محتوای قابل مشاهده دارد. حجم کم همیشه به معنی بی‌کیفیتی نیست، اما اگر صفحه قرار است موضوعی را پوشش دهد، ممکن است ناکافی باشد.`,
      evidence: [`تعداد کلمات: ${words}`],
      recommendation: 'اگر هدف صفحه پاسخ کامل به یک نیاز است، محتوای بیشتری اضافه کنید؛ در غیر این صورت حجم کم طبیعی است.', weight: 1 });
  }
  if (words >= 300) {
    return check({ id: 'content.word-count', title: 'حجم محتوای صفحه', status: 'pass', severity: 'info',
      description: `صفحه حدود ${words} کلمه محتوای قابل مشاهده دارد.`,
      evidence: [`تعداد کلمات: ${words}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  return check({ id: 'content.word-count', title: 'حجم محتوای صفحه', status: 'pass', severity: 'info',
    description: `صفحه حدود ${words} کلمه محتوای قابل مشاهده دارد؛ برای بسیاری از صفحات کافی است.`,
    evidence: [`تعداد کلمات: ${words}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkParagraphs(page: PageData): CheckResult {
  const paras = page.paragraphs;
  if (paras.length === 0) {
    return check({ id: 'content.paragraphs', title: 'ساختار پاراگراف‌ها', status: 'warning', severity: 'medium',
      description: 'پاراگراف قابل توجهی در صفحه یافت نشد؛ ممکن است محتوا به‌صورت تصویر یا ساختار غیرمتنی باشد.',
      evidence: ['هیچ پاراگراف متنی شناسایی نشد.'],
      recommendation: 'محتوای اصلی را به‌صورت متن قابل خواندن (نه فقط تصویر) ارائه کنید.', weight: 1 });
  }
  const avg = paras.reduce((s, p) => s + p.wordCount, 0) / paras.length;
  const veryShort = paras.filter((p) => p.wordCount < 15).length;
  const veryLong = paras.filter((p) => p.wordCount > 200).length;
  if (avg > 120 || veryLong > paras.length * 0.3) {
    return check({ id: 'content.paragraphs', title: 'طول پاراگراف‌ها', status: 'warning', severity: 'low',
      description: `میانگین طول پاراگراف‌ها ${Math.round(avg)} کلمه است؛ پاراگراف‌های بسیار طولانی خواندن را سخت می‌کنند.`,
      evidence: [`میانگین: ${Math.round(avg)} کلمه | پاراگراف‌های خیلی طولانی: ${veryLong}`],
      recommendation: 'پاراگراف‌های طولانی را به بخش‌های کوتاه‌تر تقسیم کنید.', weight: 1 });
  }
  if (veryShort > paras.length * 0.6 && paras.length > 5) {
    return check({ id: 'content.paragraphs', title: 'طول پاراگراف‌ها', status: 'warning', severity: 'low',
      description: `بخش زیادی از پاراگراف‌ها بسیار کوتاه‌اند (${veryShort} از ${paras.length})؛ ممکن است محتوا پراکنده باشد.`,
      evidence: [`پاراگراف‌های کوتاه: ${veryShort} از ${paras.length}`],
      recommendation: 'پاراگراف‌های کوتاه مرتبط را در یک پاراگراف منسجم ترکیب کنید.', weight: 1 });
  }
  return check({ id: 'content.paragraphs', title: 'ساختار پاراگراف‌ها', status: 'pass', severity: 'info',
    description: `تعداد پاراگراف‌ها: ${paras.length} | میانگین طول: ${Math.round(avg)} کلمه`,
    evidence: [`پاراگراف‌ها: ${paras.length}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkRepetition(page: PageData): CheckResult {
  const sentences = page.visibleText.split(/[.!؟?\n]+/).map((s) => normalizePersian(s)).filter((s) => s.length > 20);
  const seen = new Map<string, number>();
  for (const s of sentences) seen.set(s, (seen.get(s) ?? 0) + 1);
  const dupes = [...seen.entries()].filter(([, c]) => c >= 3);
  if (dupes.length > 0) {
    return check({ id: 'content.repetition', title: 'تکرار در محتوای صفحه', status: 'warning', severity: 'medium',
      description: `${dupes.length} جمله بیش از دو بار در صفحه تکرار شده است؛ این می‌تواند نشانه محتوای قالبی یا پر کردن صفحه باشد.`,
      evidence: dupes.slice(0, 3).map(([s, c]) => `«${s.slice(0, 60)}…» × ${c}`),
      recommendation: 'جملات تکراری را حذف یا با محتوای منحصربه‌فرد جایگزین کنید.', weight: 1 });
  }
  return check({ id: 'content.repetition', title: 'تکرار در محتوای صفحه', status: 'pass', severity: 'info',
    description: 'تکرار غیرعادی در جمله‌های صفحه دیده نشد.',
    evidence: [`جمله‌های بررسی‌شده: ${sentences.length}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkTitleContentAlignment(page: PageData): CheckResult {
  if (!page.title || !page.visibleText) {
    return check({ id: 'content.title-alignment', title: 'ارتباط عنوان با محتوا', status: 'not-applicable', severity: 'info',
      description: 'عنوان یا متن صفحه برای بررسی ارتباط در دسترس نیست.', evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  const titleWords = normalizePersian(page.title).split(' ').filter((w) => w.length > 3);
  const body = normalizePersian(page.visibleText);
  const matched = titleWords.filter((w) => body.includes(w));
  const ratio = titleWords.length > 0 ? matched.length / titleWords.length : 0;
  if (ratio < 0.3) {
    return check({ id: 'content.title-alignment', title: 'ارتباط عنوان با محتوا', status: 'warning', severity: 'medium',
      description: 'کلمات کلیدی عنوان صفحه در متن اصلی صفحه به‌خوبی دیده نمی‌شوند؛ ممکن است عنوان با محتوای واقعی صفحه هم‌خوان نباشد.',
      evidence: [`عنوان: «${page.title}»`, `کلمات مشترک: ${matched.length} از ${titleWords.length}`],
      recommendation: 'عنوان را با موضوع واقعی و کلمات کلیدی محتوای صفحه هم‌خوان کنید.', weight: 1 });
  }
  return check({ id: 'content.title-alignment', title: 'ارتباط عنوان با محتوا', status: 'pass', severity: 'info',
    description: 'عنوان صفحه با محتوای اصلی آن هم‌خوانی دارد.',
    evidence: [`کلمات مشترک: ${matched.length} از ${titleWords.length}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkQaStructure(page: PageData): CheckResult {
  const questions = extractQuestions(page.visibleText);
  const faqSchema = page.jsonLd.some((j) => j.types.includes('FAQPage'));
  if (questions.length >= 2) {
    return check({ id: 'content.qa-structure', title: 'ساختار پرسش و پاسخ', status: 'pass', severity: 'info',
      description: `صفحه شامل ${questions.length} جمله پرسشی است که ساختار پرسش‌وپاسخ را تقویت می‌کند.`,
      evidence: questions.slice(0, 3),
      recommendation: faqSchema ? 'اقدامی لازم نیست.' : 'برای این پرسش‌ها می‌توانید Schema از نوع FAQPage اضافه کنید.', weight: 1 });
  }
  return check({ id: 'content.qa-structure', title: 'ساختار پرسش و پاسخ', status: 'not-applicable', severity: 'info',
    description: 'ساختار پرسش‌وپاسخ مشخصی در صفحه دیده نشد؛ این برای همه صفحات لازم نیست.',
    evidence: [`جمله‌های پرسشی: ${questions.length}`],
    recommendation: 'اگر صفحه ماهیت آموزشی یا راهنما دارد، بخش پرسش‌های متداول اضافه کنید.', weight: 1 });
}

function checkPersianQuality(page: PageData): CheckResult {
  const lang = detectLanguage(page.visibleText);
  if (lang !== 'fa' && lang !== 'mixed') {
    return check({ id: 'content.persian-quality', title: 'کیفیت متن فارسی', status: 'not-applicable', severity: 'info',
      description: 'متن صفحه فارسی نیست؛ این بررسی برای صفحات فارسی اعمال می‌شود.',
      evidence: [`زبان شناسایی‌شده: ${lang}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  const hasArabicChars = /[ي ك ة]/.test(page.visibleText);
  const zwnj = hasZwnj(page.visibleText);
  const issues: string[] = [];
  if (hasArabicChars) issues.push('حروف عربی (ي، ك) به‌جای حروف فارسی (ی، ک) استفاده شده است.');
  if (!zwnj && page.wordCount > 100) issues.push('نیم‌فاصله در متن دیده نشد؛ استفاده درست از نیم‌فاصله خوانایی فارسی را بهبود می‌دهد.');
  if (issues.length > 0) {
    return check({ id: 'content.persian-quality', title: 'کیفیت متن فارسی', status: 'warning', severity: 'low',
      description: 'در متن فارسی چند نکته نگارشی دیده شد.',
      evidence: issues,
      recommendation: 'حروف را به ی/ک فارسی تبدیل کنید و از نیم‌فاصله در ترکیب‌هایی مثل «می‌شود» و «نمی‌کند» استفاده کنید.', weight: 1 });
  }
  return check({ id: 'content.persian-quality', title: 'کیفیت متن فارسی', status: 'pass', severity: 'info',
    description: 'نگارش فارسی صفحه (حروف و نیم‌فاصله) مناسب است.',
    evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkHeadingCoverage(page: PageData): CheckResult {
  const h2 = page.headings.filter((h) => h.level === 2).length;
  if (page.wordCount > 500 && h2 === 0) {
    return check({ id: 'content.heading-coverage', title: 'پوشش هدینگ‌ها', status: 'warning', severity: 'medium',
      description: `صفحه ${page.wordCount} کلمه دارد اما هیچ H2 ندارد؛ ساختار بخش‌ها برای خواننده و موتور جست‌وجو مشخص نیست.`,
      evidence: [`کلمات: ${page.wordCount} | H2: ${h2}`],
      recommendation: 'محتوا را به بخش‌های موضوعی تقسیم کنید و برای هر بخش یک H2 بنویسید.', weight: 1 });
  }
  return check({ id: 'content.heading-coverage', title: 'پوشش هدینگ‌ها', status: 'pass', severity: 'info',
    description: `تعداد H2: ${h2} | تعداد کل هدینگ‌ها: ${page.headings.length}`,
    evidence: [`H2: ${h2}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

/** اجرای همه بررسی‌های Content Intelligence. */
export function runContentChecks(page: PageData): CheckResult[] {
  return [
    checkWordCount(page),
    checkParagraphs(page),
    checkRepetition(page),
    checkTitleContentAlignment(page),
    checkQaStructure(page),
    checkPersianQuality(page),
    checkHeadingCoverage(page),
  ];
}
