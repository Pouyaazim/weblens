/**
 * موتور GEO Intelligence — آمادگی ساختاری و محتوایی صفحه برای سیستم‌های جست‌وجوی مبتنی بر هوش مصنوعی.
 *
 * توجه: GEO مفهومی در حال تحول است. امتیاز داخلی WebLens معیار رسمی هیچ موتور جست‌وجویی نیست
 * و هیچ تضمینی برای نمایش در پاسخ‌های ChatGPT، Gemini یا Google AI ارائه نمی‌شود.
 * معیارها شفاف و مستند هستند (SCORING_METHODOLOGY.md).
 */
import type { PageData } from '@/types/page';
import type { CheckResult } from '@/types/analysis';
import { extractQuestions, normalizePersian, countWords } from '@/utils/text';

function check(partial: Partial<CheckResult> & Pick<CheckResult, 'id' | 'title' | 'status' | 'severity'>): CheckResult {
  return { category: 'geo', description: '', evidence: [], recommendation: '', weight: 1, ...partial };
}

function checkDirectAnswers(page: PageData): CheckResult {
  // پاسخ مستقیم: پاراگراف کوتاه و مشخص در ابتدای متن یا بعد از H1
  const firstParas = page.paragraphs.slice(0, 3);
  const hasShortIntro = firstParas.some((p) => p.wordCount >= 20 && p.wordCount <= 80);
  if (hasShortIntro) {
    return check({ id: 'geo.direct-answer', title: 'پاسخ مستقیم', status: 'pass', severity: 'info',
      description: 'در ابتدای صفحه پاراگراف کوتاهی وجود دارد که می‌تواند به‌عنوان پاسخ مستقیم استفاده شود.',
      evidence: firstParas.map((p) => p.text.slice(0, 80) + '…'),
      recommendation: 'اقدامی لازم نیست.', weight: 2 });
  }
  return check({ id: 'geo.direct-answer', title: 'پاسخ مستقیم', status: 'warning', severity: 'medium',
    description: 'پاسخ مستقیم و کوتاهی در ابتدای صفحه دیده نشد. سیستم‌های AI برای استخراج پاسخ، به متن واضح و مختصر نیاز دارند.',
    evidence: ['پاراگراف آغازین کوتاه و مشخص یافت نشد.'],
    recommendation: 'در ابتدای صفحه، در ۲ تا ۳ جمله، پاسخ اصلی موضوع را به‌صورت مستقیم بنویسید.', weight: 2 });
}

function checkQaStructure(page: PageData): CheckResult {
  const questions = extractQuestions(page.visibleText);
  const faqSchema = page.jsonLd.some((j) => j.types.includes('FAQPage'));
  if (questions.length >= 2 && faqSchema) {
    return check({ id: 'geo.qa-structure', title: 'ساختار پرسش و پاسخ', status: 'pass', severity: 'info',
      description: `صفحه ${questions.length} پرسش و Schema از نوع FAQPage دارد.`,
      evidence: questions.slice(0, 3), recommendation: 'اقدامی لازم نیست.', weight: 2 });
  }
  if (questions.length >= 2) {
    return check({ id: 'geo.qa-structure', title: 'ساختار پرسش و پاسخ', status: 'warning', severity: 'medium',
      description: `صفحه ${questions.length} پرسش دارد اما Schema از نوع FAQPage ندارد.`,
      evidence: questions.slice(0, 3),
      recommendation: 'برای پرسش‌های صفحه، Schema از نوع FAQPage اضافه کنید تا ساختار آن برای سیستم‌های AI مشخص باشد.', weight: 2 });
  }
  return check({ id: 'geo.qa-structure', title: 'ساختار پرسش و پاسخ', status: 'warning', severity: 'low',
    description: 'ساختار پرسش‌وپاسخ مشخصی در صفحه دیده نشد.',
    evidence: [`پرسش‌های شناسایی‌شده: ${questions.length}`],
    recommendation: 'اگر صفحه ماهیت آموزشی دارد، پرسش‌ها را به‌صورت عنوان (H2/H3) و پاسخ را در پاراگراف بعدی بنویسید.', weight: 1 });
}

function checkEntityClarity(page: PageData): CheckResult {
  const h1 = page.headings.find((h) => h.level === 1)?.text ?? page.title;
  if (!h1) {
    return check({ id: 'geo.entity-clarity', title: 'وضوح موجودیت اصلی', status: 'not-applicable', severity: 'info',
      description: 'عنوان یا H1 برای تشخیص موجودیت اصلی در دسترس نیست.', evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  const entityWords = normalizePersian(h1).split(' ').filter((w) => w.length > 3);
  const body = normalizePersian(page.visibleText);
  const mentions = entityWords.reduce((s, w) => s + (body.split(w).length - 1), 0);
  if (mentions >= 2) {
    return check({ id: 'geo.entity-clarity', title: 'وضوح موجودیت اصلی', status: 'pass', severity: 'info',
      description: `موجودیت اصلی صفحه («${h1}») در متن چند بار به‌صورت مشخص تکرار شده است.`,
      evidence: [`تعداد اشاره: ${mentions}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  return check({ id: 'geo.entity-clarity', title: 'وضوح موجودیت اصلی', status: 'warning', severity: 'medium',
    description: 'موجودیت اصلی صفحه در متن به‌صورت مشخص و مکرر ذکر نشده است؛ سیستم‌های AI ممکن است در تشخیص موضوع صفحه دچار ابهام شوند.',
    evidence: [`موجودیت: «${h1}» | تعداد اشاره: ${mentions}`],
    recommendation: 'نام موجودیت اصلی را در پاراگراف‌های کلیدی صفحه به‌صورت کامل و مشخص تکرار کنید.', weight: 1 });
}

function checkStructuredData(page: PageData): CheckResult {
  const types = page.jsonLd.flatMap((j) => j.types);
  if (types.length > 0) {
    return check({ id: 'geo.structured-data', title: 'داده ساختاریافته', status: 'pass', severity: 'info',
      description: `داده ساختاریافته با نوع‌های ${types.join('، ')} وجود دارد.`,
      evidence: types, recommendation: 'اقدامی لازم نیست.', weight: 2 });
  }
  return check({ id: 'geo.structured-data', title: 'داده ساختاریافته', status: 'warning', severity: 'medium',
    description: 'داده ساختاریافته‌ای در صفحه وجود ندارد؛ این داده‌ها به سیستم‌های AI کمک می‌کنند اطلاعات صفحه را دقیق استخراج کنند.',
    evidence: ['هیچ JSON-LD یافت نشد.'],
    recommendation: 'بر اساس نوع صفحه، Schema مناسب (Article، Product، Organization و...) اضافه کنید.', weight: 2 });
}

function checkCitations(page: PageData): CheckResult {
  const externalLinks = page.links.filter((l) => !l.isInternal && l.text.length > 0);
  const hasSourceWords = /(منبع|مرجع|مطالعه|گزارش|آمار|source|reference|study|report)/i.test(page.visibleText);
  if (externalLinks.length >= 2 || hasSourceWords) {
    return check({ id: 'geo.citations', title: 'ارجاعات و منابع', status: 'pass', severity: 'info',
      description: `صفحه ${externalLinks.length} لینک خارجی به منابع دارد${hasSourceWords ? ' و به منابع اشاره می‌کند' : ''}.`,
      evidence: externalLinks.slice(0, 3).map((l) => l.href),
      recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  return check({ id: 'geo.citations', title: 'ارجاعات و منابع', status: 'warning', severity: 'low',
    description: 'ارجاع یا لینک به منبع خارجی در صفحه دیده نشد. ارجاع به منابع معتبر، اعتبار محتوا را برای سیستم‌های AI تقویت می‌کند.',
    evidence: [`لینک‌های خارجی: ${externalLinks.length}`],
    recommendation: 'در صورت امکان، به منابع معتبر و مرتبط لینک دهید و آن‌ها را در متن معرفی کنید.', weight: 1 });
}

function checkAuthor(page: PageData): CheckResult {
  const hasAuthor = Boolean(page.author) || page.jsonLd.some((j) => j.types.includes('Person') || j.types.includes('Organization'));
  if (hasAuthor) {
    return check({ id: 'geo.author', title: 'نویسنده یا ناشر', status: 'pass', severity: 'info',
      description: 'اطلاعات نویسنده یا ناشر در صفحه مشخص است.',
      evidence: page.author ? [`نویسنده: ${page.author}`] : ['Schema نویسنده/ناشر وجود دارد'],
      recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  return check({ id: 'geo.author', title: 'نویسنده یا ناشر', status: 'warning', severity: 'low',
    description: 'نویسنده یا ناشر صفحه مشخص نیست. مشخص بودن نویسنده، اعتماد سیستم‌های AI و کاربران را افزایش می‌دهد.',
    evidence: ['اطلاعات نویسنده یافت نشد.'],
    recommendation: 'نام نویسنده را در صفحه و در Schema از نوع Person مشخص کنید.', weight: 1 });
}

function checkContextCompleteness(page: PageData): CheckResult {
  const words = countWords(page.visibleText);
  const hasDates = Boolean(page.publishedTime || page.modifiedTime);
  const hasHeadings = page.headings.length >= 3;
  const score = (words > 300 ? 1 : 0) + (hasDates ? 1 : 0) + (hasHeadings ? 1 : 0);
  if (score === 3) {
    return check({ id: 'geo.context', title: 'کامل بودن زمینه اطلاعات', status: 'pass', severity: 'info',
      description: 'صفحه از نظر حجم محتوا، تاریخ و ساختار بخش‌ها زمینه کاملی دارد.',
      evidence: [`کلمات: ${words} | تاریخ: ${hasDates ? 'دارد' : 'ندارد'} | هدینگ‌ها: ${page.headings.length}`],
      recommendation: 'اقدامی لازم نیست.', weight: 1 });
  }
  const missing: string[] = [];
  if (words <= 300) missing.push('حجم محتوا کم است');
  if (!hasDates) missing.push('تاریخ انتشار/به‌روزرسانی مشخص نیست');
  if (!hasHeadings) missing.push('ساختار بخش‌ها ناقص است');
  return check({ id: 'geo.context', title: 'کامل بودن زمینه اطلاعات', status: 'warning', severity: 'low',
    description: 'زمینه اطلاعات صفحه ناقص است: ' + missing.join('، ') + '.',
    evidence: missing,
    recommendation: 'تاریخ انتشار و به‌روزرسانی را مشخص کنید و محتوا را با ساختار بخش‌بندی‌شده ارائه دهید.', weight: 1 });
}

function checkAmbiguity(page: PageData): CheckResult {
  // جملات بسیار کوتاه و مبهم (کمتر از ۴ کلمه) در متن اصلی
  const sentences = page.visibleText.split(/[.!؟?\n]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const vague = sentences.filter((s) => countWords(s) < 4 && s.length > 3);
  if (vague.length > sentences.length * 0.3 && sentences.length > 10) {
    return check({ id: 'geo.ambiguity', title: 'بخش‌های مبهم', status: 'warning', severity: 'low',
      description: 'بخش زیادی از متن از جمله‌های بسیار کوتاه تشکیل شده که ممکن است برای سیستم‌های AI مبهم باشد.',
      evidence: vague.slice(0, 3),
      recommendation: 'جمله‌ها را کامل و مشخص بنویسید و از عبارت‌های مبهم پرهیز کنید.', weight: 1 });
  }
  return check({ id: 'geo.ambiguity', title: 'بخش‌های مبهم', status: 'pass', severity: 'info',
    description: 'متن صفحه به‌طور کلی واضح و مشخص است.',
    evidence: [`جمله‌های بررسی‌شده: ${sentences.length}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

/** اجرای همه بررسی‌های GEO. */
export function runGeoChecks(page: PageData): CheckResult[] {
  return [
    checkDirectAnswers(page),
    checkQaStructure(page),
    checkEntityClarity(page),
    checkStructuredData(page),
    checkCitations(page),
    checkAuthor(page),
    checkContextCompleteness(page),
    checkAmbiguity(page),
  ];
}
