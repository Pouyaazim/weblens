/**
 * موتور Technical SEO — کاملاً بدون هوش مصنوعی کار می‌کند.
 * هر بررسی نتیجه، شواهد واقعی و پیشنهاد اصلاح مشخص تولید می‌کند.
 */
import type { PageData } from '@/types/page';
import type { CheckResult, Severity } from '@/types/analysis';
import { textLength, normalizePersian } from '@/utils/text';

function check(partial: Partial<CheckResult> & Pick<CheckResult, 'id' | 'title' | 'status' | 'severity'>): CheckResult {
  return {
    category: 'technical-seo',
    description: '',
    evidence: [],
    recommendation: '',
    weight: 1,
    ...partial,
  };
}

function checkTitle(page: PageData): CheckResult {
  const len = textLength(page.title);
  if (!page.title) {
    return check({ id: 'seo.title.exists', title: 'وجود عنوان صفحه (Title)', status: 'fail', severity: 'critical',
      description: 'صفحه عنوان ندارد. موتورهای جست‌وجو و مرورگرها برای نمایش نتیجه به عنوان نیاز دارند.',
      evidence: ['تگ <title> خالی یا غایب است.'],
      recommendation: 'یک عنوان توصیفی و منحصربه‌فرد برای صفحه بنویسید که موضوع اصلی صفحه را در ابتدای آن بیاورد.', weight: 2 });
  }
  if (len < 20) {
    return check({ id: 'seo.title.length', title: 'طول عنوان صفحه', status: 'warning', severity: 'medium',
      description: `طول عنوان ${len} نویسه است و ممکن است برای توصیف کامل صفحه کوتاه باشد.`,
      evidence: [`طول فعلی: ${len} نویسه`, `عنوان: «${page.title}»`],
      recommendation: 'عنوان را بین ۳۰ تا ۶۰ نویسه نگه دارید و کلمه کلیدی اصلی را در ابتدای آن قرار دهید.', weight: 1 });
  }
  if (len > 70) {
    return check({ id: 'seo.title.length', title: 'طول عنوان صفحه', status: 'warning', severity: 'medium',
      description: `طول عنوان ${len} نویسه است و احتمال دارد در نتایج جست‌وجو بریده شود.`,
      evidence: [`طول فعلی: ${len} نویسه`, `عنوان: «${page.title}»`],
      recommendation: 'عنوان را کوتاه‌تر کنید تا در نتایج جست‌وجو کامل نمایش داده شود (حداکثر حدود ۶۰ نویسه).', weight: 1 });
  }
  return check({ id: 'seo.title.length', title: 'طول عنوان صفحه', status: 'pass', severity: 'info',
    description: `طول عنوان ${len} نویسه است و در محدوده مناسب قرار دارد.`,
    evidence: [`طول فعلی: ${len} نویسه`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkMetaDescription(page: PageData): CheckResult {
  const len = textLength(page.metaDescription);
  if (!page.metaDescription) {
    return check({ id: 'seo.meta.description', title: 'وجود Meta Description', status: 'fail', severity: 'high',
      description: 'صفحه توضیحات متا ندارد؛ موتور جست‌وجو ممکن است متن دلخواه از صفحه انتخاب کند.',
      evidence: ['تگ meta description یافت نشد.'],
      recommendation: 'توضیحی ۱۲۰ تا ۱۶۰ نویسه‌ای بنویسید که خلاصه صفحه و دلیل کلیک کاربر را بیان کند.', weight: 2 });
  }
  if (len < 70) {
    return check({ id: 'seo.meta.description', title: 'طول Meta Description', status: 'warning', severity: 'medium',
      description: `طول توضیحات ${len} نویسه است و ممکن است برای معرفی کامل صفحه کافی نباشد.`,
      evidence: [`طول فعلی: ${len} نویسه`],
      recommendation: 'توضیحات را به ۱۲۰ تا ۱۶۰ نویسه برسانید و شامل فراخوان به اقدام باشید.', weight: 1 });
  }
  if (len > 170) {
    return check({ id: 'seo.meta.description', title: 'طول Meta Description', status: 'warning', severity: 'low',
      description: `طول توضیحات ${len} نویسه است و احتمال دارد در نتایج جست‌وجو بریده شود.`,
      evidence: [`طول فعلی: ${len} نویسه`],
      recommendation: 'توضیحات را به حداکثر ۱۶۰ نویسه کوتاه کنید.', weight: 1 });
  }
  return check({ id: 'seo.meta.description', title: 'Meta Description', status: 'pass', severity: 'info',
    description: `طول توضیحات ${len} نویسه است و در محدوده مناسب قرار دارد.`,
    evidence: [`طول فعلی: ${len} نویسه`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkCanonical(page: PageData): CheckResult {
  if (!page.canonical) {
    return check({ id: 'seo.canonical', title: 'وجود Canonical', status: 'warning', severity: 'medium',
      description: 'تگ canonical وجود ندارد. اگر نسخه‌های تکراری از این صفحه وجود دارد، موتور جست‌وجو ممکن است نسخه اشتباه را ایندکس کند.',
      evidence: ['تگ link rel="canonical" یافت نشد.'],
      recommendation: 'اگر صفحه نسخه‌های تکراری (پارامتر UTM و...) دارد، canonical را به نسخه اصلی تنظیم کنید.', weight: 1 });
  }
  let valid = true;
  try { new URL(page.canonical, page.url); } catch { valid = false; }
  if (!valid) {
    return check({ id: 'seo.canonical', title: 'اعتبار Canonical', status: 'fail', severity: 'high',
      description: 'مقدار canonical معتبر نیست و قابل استفاده نخواهد بود.',
      evidence: [`مقدار فعلی: «${page.canonical}»`],
      recommendation: 'canonical را به یک URL کامل و معتبر تنظیم کنید.', weight: 2 });
  }
  return check({ id: 'seo.canonical', title: 'Canonical', status: 'pass', severity: 'info',
    description: 'تگ canonical وجود دارد و معتبر است.',
    evidence: [`canonical: ${page.canonical}`], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkRobots(page: PageData): CheckResult {
  const robots = page.robotsMeta.toLowerCase();
  if (robots.includes('noindex')) {
    return check({ id: 'seo.robots', title: 'وضعیت Robots Meta', status: 'warning', severity: 'high',
      description: 'صفحه با noindex از ایندکس شدن منع شده است. اگر این صفحه باید در نتایج جست‌وجو باشد، این تنظیم را بررسی کنید.',
      evidence: [`robots: ${page.robotsMeta}`],
      recommendation: 'اگر صفحه باید ایندکس شود، مقدار noindex را حذف کنید.', weight: 2 });
  }
  return check({ id: 'seo.robots', title: 'Robots Meta', status: 'pass', severity: 'info',
    description: page.robotsMeta ? `مقدار robots: ${page.robotsMeta}` : 'محدودیتی برای ایندکس شدن تنظیم نشده است.',
    evidence: [page.robotsMeta || 'بدون تگ robots'], recommendation: 'اقدامی لازم نیست.', weight: 1 });
}

function checkHeadings(page: PageData): CheckResult[] {
  const results: CheckResult[] = [];
  const h1s = page.headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    results.push(check({ id: 'seo.heading.h1.exists', title: 'وجود H1', status: 'fail', severity: 'critical',
      description: 'صفحه هیچ تگ H1 ندارد. H1 موضوع اصلی صفحه را مشخص می‌کند.',
      evidence: ['هیچ H1 در صفحه یافت نشد.'],
      recommendation: 'یک H1 واحد و توصیفی که موضوع اصلی صفحه را بیان می‌کند اضافه کنید.', weight: 2 }));
  } else if (h1s.length > 1) {
    results.push(check({ id: 'seo.heading.h1.count', title: 'تعداد H1', status: 'warning', severity: 'medium',
      description: `صفحه ${h1s.length} تگ H1 دارد؛ معمولاً یک H1 برای هر صفحه توصیه می‌شود.`,
      evidence: h1s.map((h) => `H1: «${h.text}»`),
      recommendation: 'فقط مهم‌ترین عنوان را H1 نگه دارید و بقیه را به H2 تنزل دهید.', weight: 1 }));
  } else {
    results.push(check({ id: 'seo.heading.h1.exists', title: 'ساختار H1', status: 'pass', severity: 'info',
      description: 'صفحه دقیقاً یک H1 دارد.',
      evidence: [`H1: «${h1s[0]?.text}»`], recommendation: 'اقدامی لازم نیست.', weight: 1 }));
  }

  // پرش سطح هدینگ
  let jump: string | null = null;
  let prev = 0;
  for (const h of page.headings) {
    if (prev > 0 && h.level > prev + 1) { jump = `از H${prev} به H${h.level} («${h.text}») پرش شده است.`; break; }
    prev = h.level;
  }
  results.push(jump
    ? check({ id: 'seo.heading.structure', title: 'سلسله‌مراتب هدینگ‌ها', status: 'warning', severity: 'medium',
        description: 'در ساختار هدینگ‌ها پرش غیرمنطقی وجود دارد که خوانایی ساختار صفحه را کاهش می‌دهد.',
        evidence: [jump], recommendation: 'سطح هدینگ‌ها را به‌صورت پیوسته افزایش دهید (H1 ← H2 ← H3).', weight: 1 })
    : check({ id: 'seo.heading.structure', title: 'سلسله‌مراتب هدینگ‌ها', status: 'pass', severity: 'info',
        description: 'سلسله‌مراتب هدینگ‌ها پیوسته و منطقی است.',
        evidence: [`تعداد هدینگ‌ها: ${page.headings.length}`], recommendation: 'اقدامی لازم نیست.', weight: 1 }));

  const empty = page.headings.filter((h) => !h.text);
  results.push(empty.length > 0
    ? check({ id: 'seo.heading.empty', title: 'هدینگ‌های خالی', status: 'warning', severity: 'low',
        description: `${empty.length} هدینگ خالی در صفحه وجود دارد.`,
        evidence: empty.map((h) => `H${h.level} خالی`),
        recommendation: 'هدینگ‌های خالی را حذف یا متن مناسب برای آن‌ها بنویسید.', weight: 1 })
    : check({ id: 'seo.heading.empty', title: 'هدینگ‌های خالی', status: 'pass', severity: 'info',
        description: 'هیچ هدینگ خالی وجود ندارد.', evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 }));

  // هدینگ‌های تکراری مشکوک
  const seen = new Map<string, number>();
  for (const h of page.headings) { const t = normalizePersian(h.text); seen.set(t, (seen.get(t) ?? 0) + 1); }
  const dupes = [...seen.entries()].filter((entry): entry is [string, number] => entry[1] > 2 && entry[0].length > 3);
  results.push(dupes.length > 0
    ? check({ id: 'seo.heading.duplicates', title: 'هدینگ‌های تکراری', status: 'warning', severity: 'low',
        description: 'برخی هدینگ‌ها بیش از دو بار تکرار شده‌اند که ممکن است نشانه محتوای قالبی باشد.',
        evidence: dupes.map(([t, c]) => `«${t}» × ${c}`),
        recommendation: 'هدینگ‌های تکراری را متنوع و توصیفی کنید.', weight: 1 })
    : check({ id: 'seo.heading.duplicates', title: 'هدینگ‌های تکراری', status: 'pass', severity: 'info',
        description: 'تکرار مشکوکی در هدینگ‌ها دیده نشد.', evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 }));

  return results;
}

function checkImages(page: PageData): CheckResult[] {
  const results: CheckResult[] = [];
  if (page.images.length === 0) {
    results.push(check({ id: 'seo.images.alt', title: 'Alt تصاویر', status: 'not-applicable', severity: 'info',
      description: 'در صفحه تصویری یافت نشد.', evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 }));
    return results;
  }
  const missingAlt = page.images.filter((i) => i.alt === null);
  const emptyAlt = page.images.filter((i) => i.alt === '');
  const longAlt = page.images.filter((i) => i.alt !== null && textLength(i.alt) > 125);
  const noDims = page.images.filter((i) => !i.width || !i.height);

  results.push(missingAlt.length > 0
    ? check({ id: 'seo.images.alt', title: 'تصاویر بدون Alt', status: 'fail', severity: 'high',
        description: `${missingAlt.length} تصویر فاقد ویژگی alt است؛ موتور جست‌وجو و کاربران نابینا از alt برای فهم تصویر استفاده می‌کنند.`,
        evidence: missingAlt.slice(0, 5).map((i) => i.src),
        recommendation: 'برای هر تصویر یک alt توصیفی و کوتاه بنویسید.', weight: 2 })
    : check({ id: 'seo.images.alt', title: 'Alt تصاویر', status: 'pass', severity: 'info',
        description: 'همه تصاویر ویژگی alt دارند.',
        evidence: [`تعداد تصاویر: ${page.images.length}`], recommendation: 'اقدامی لازم نیست.', weight: 1 }));

  if (emptyAlt.length > 0) {
    results.push(check({ id: 'seo.images.alt.empty', title: 'Alt خالی', status: 'warning', severity: 'low',
      description: `${emptyAlt.length} تصویر alt خالی دارد. اگر تصویر تزئینی است درست است، در غیر این صورت alt بنویسید.`,
      evidence: emptyAlt.slice(0, 5).map((i) => i.src),
      recommendation: 'برای تصاویر محتوایی alt توصیفی بنویسید؛ تصاویر صرفاً تزئینی می‌توانند alt خالی داشته باشند.', weight: 1 }));
  }
  if (longAlt.length > 0) {
    results.push(check({ id: 'seo.images.alt.length', title: 'طول Alt تصاویر', status: 'warning', severity: 'low',
      description: `${longAlt.length} تصویر alt بیش از حد طولانی دارد.`,
      evidence: longAlt.slice(0, 3).map((i) => `«${i.alt}»`),
      recommendation: 'alt را کوتاه و توصیفی نگه دارید (حداکثر حدود ۱۲۵ نویسه).', weight: 1 }));
  }
  results.push(noDims.length > 0
    ? check({ id: 'seo.images.dimensions', title: 'ابعاد تصاویر', status: 'warning', severity: 'low',
        description: `${noDims.length} تصویر width/height مشخص ندارند که می‌تواند باعث جابه‌جایی چیدمان (CLS) شود.`,
        evidence: noDims.slice(0, 5).map((i) => i.src),
        recommendation: 'برای تصاویر width و height (یا aspect-ratio) مشخص کنید.', weight: 1 })
    : check({ id: 'seo.images.dimensions', title: 'ابعاد تصاویر', status: 'pass', severity: 'info',
        description: 'ابعاد همه تصاویر مشخص است.', evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 }));
  return results;
}

function checkLinks(page: PageData): CheckResult[] {
  const results: CheckResult[] = [];
  const internal = page.links.filter((l) => l.isInternal);
  const external = page.links.filter((l) => !l.isInternal);
  const emptyText = page.links.filter((l) => !l.text);
  const suspicious = page.links.filter((l) => l.href.startsWith('http://') && page.protocol === 'https:');

  results.push(check({ id: 'seo.links.internal', title: 'لینک‌های داخلی', status: internal.length > 0 ? 'pass' : 'warning',
    severity: internal.length > 0 ? 'info' : 'medium',
    description: internal.length > 0 ? `صفحه ${internal.length} لینک داخلی دارد.` : 'هیچ لینک داخلی در صفحه یافت نشد؛ لینک‌سازی داخلی به خزش و رتبه‌بندی کمک می‌کند.',
    evidence: [`داخلی: ${internal.length} | خارجی: ${external.length}`],
    recommendation: internal.length > 0 ? 'اقدامی لازم نیست.' : 'به صفحات مرتبط سایت لینک داخلی اضافه کنید.', weight: 1 }));

  results.push(emptyText.length > 0
    ? check({ id: 'seo.links.text', title: 'لینک‌های بدون متن', status: 'warning', severity: 'medium',
        description: `${emptyText.length} لینک متن قابل دسترس ندارد (مثلاً فقط آیکون است).`,
        evidence: emptyText.slice(0, 5).map((l) => l.href),
        recommendation: 'برای لینک‌های آیکونی aria-label یا متن جایگزین اضافه کنید.', weight: 1 })
    : check({ id: 'seo.links.text', title: 'متن لینک‌ها', status: 'pass', severity: 'info',
        description: 'همه لینک‌ها متن قابل دسترس دارند.', evidence: [], recommendation: 'اقدامی لازم نیست.', weight: 1 }));

  if (suspicious.length > 0) {
    results.push(check({ id: 'seo.links.mixed-content', title: 'لینک‌های HTTP در صفحه HTTPS', status: 'warning', severity: 'medium',
      description: `${suspicious.length} لینک با http:// در صفحه https وجود دارد.`,
      evidence: suspicious.slice(0, 5).map((l) => l.href),
      recommendation: 'لینک‌ها را به نسخه https به‌روزرسانی کنید.', weight: 1 }));
  }
  return results;
}

function checkStructuredData(page: PageData): CheckResult[] {
  const results: CheckResult[] = [];
  if (page.jsonLd.length === 0) {
    results.push(check({ id: 'seo.schema.exists', title: 'داده ساختاریافته (Schema)', status: 'warning', severity: 'medium',
      description: 'هیچ داده ساختاریافته JSON-LD در صفحه یافت نشد. Schema به موتورهای جست‌وجو کمک می‌کند محتوای صفحه را بهتر بفهمند.',
      evidence: ['هیچ اسکریپت ld+json یافت نشد.'],
      recommendation: 'بر اساس نوع صفحه، Schema مناسب (Article، Product، FAQPage و...) اضافه کنید.', weight: 1 }));
    return results;
  }
  const broken = page.jsonLd.filter((j) => j.parseError);
  const allTypes = page.jsonLd.flatMap((j) => j.types);
  results.push(broken.length > 0
    ? check({ id: 'seo.schema.valid', title: 'اعتبار JSON-LD', status: 'fail', severity: 'high',
        description: `${broken.length} بلوک JSON-LD خطای نحوی دارد و قابل استفاده نیست.`,
        evidence: broken.map((j) => j.parseError ?? ''),
        recommendation: 'خطاهای نحوی JSON-LD را برطرف کنید تا داده ساختاریافته قابل خواندن باشد.', weight: 2 })
    : check({ id: 'seo.schema.valid', title: 'اعتبار JSON-LD', status: 'pass', severity: 'info',
        description: 'همه بلوک‌های JSON-LD معتبر هستند.',
        evidence: [`تعداد بلوک‌ها: ${page.jsonLd.length}`], recommendation: 'اقدامی لازم نیست.', weight: 1 }));
  results.push(check({ id: 'seo.schema.types', title: 'نوع‌های Schema', status: 'pass', severity: 'info',
    description: `نوع‌های شناسایی‌شده: ${allTypes.length > 0 ? allTypes.join('، ') : 'نامشخص'}`,
    evidence: allTypes, recommendation: 'اقدامی لازم نیست.', weight: 1 }));
  return results;
}

function checkBasics(page: PageData): CheckResult[] {
  const results: CheckResult[] = [];
  results.push(page.viewport
    ? check({ id: 'seo.viewport', title: 'Viewport', status: 'pass', severity: 'info',
        description: 'تگ viewport وجود دارد و صفحه برای موبایل آماده است.',
        evidence: [page.viewport], recommendation: 'اقدامی لازم نیست.', weight: 1 })
    : check({ id: 'seo.viewport', title: 'Viewport', status: 'fail', severity: 'high',
        description: 'تگ viewport وجود ندارد؛ نمایش صفحه در موبایل به‌درستی تنظیم نخواهد شد.',
        evidence: ['تگ meta viewport یافت نشد.'],
        recommendation: 'تگ <meta name="viewport" content="width=device-width, initial-scale=1"> را اضافه کنید.', weight: 2 }));

  results.push(page.lang
    ? check({ id: 'seo.lang', title: 'زبان صفحه (HTML Lang)', status: 'pass', severity: 'info',
        description: `زبان صفحه: ${page.lang}`,
        evidence: [`lang="${page.lang}"`], recommendation: 'اقدامی لازم نیست.', weight: 1 })
    : check({ id: 'seo.lang', title: 'زبان صفحه (HTML Lang)', status: 'warning', severity: 'medium',
        description: 'ویژگی lang روی تگ html تنظیم نشده است؛ موتور جست‌وجو و ابزارهای خواندن متن نیاز به آن دارند.',
        evidence: ['ویژگی lang یافت نشد.'],
        recommendation: 'ویژگی lang را روی تگ html تنظیم کنید (مثلاً lang="fa" یا lang="en").', weight: 1 }));

  results.push(page.protocol === 'https:'
    ? check({ id: 'seo.https', title: 'HTTPS', status: 'pass', severity: 'info',
        description: 'صفحه با HTTPS بارگذاری شده است.', evidence: [page.url], recommendation: 'اقدامی لازم نیست.', weight: 1 })
    : check({ id: 'seo.https', title: 'HTTPS', status: 'warning', severity: 'medium',
        description: 'صفحه با HTTP (بدون رمزنگاری) بارگذاری شده است.',
        evidence: [page.url],
        recommendation: 'برای امنیت و اعتماد کاربران، سایت را به HTTPS منتقل کنید.', weight: 1 }));

  const ogCount = Object.keys(page.openGraph).length;
  results.push(ogCount >= 3
    ? check({ id: 'seo.open-graph', title: 'Open Graph', status: 'pass', severity: 'info',
        description: `تعداد تگ‌های Open Graph: ${ogCount}`,
        evidence: Object.keys(page.openGraph), recommendation: 'اقدامی لازم نیست.', weight: 1 })
    : check({ id: 'seo.open-graph', title: 'Open Graph', status: 'warning', severity: 'low',
        description: 'تگ‌های Open Graph ناقص‌اند؛ اشتراک‌گذاری صفحه در شبکه‌های اجتماعی بدون پیش‌نمایش مناسب انجام می‌شود.',
        evidence: [`تعداد فعلی: ${ogCount}`],
        recommendation: 'تگ‌های og:title، og:description، og:image و og:url را اضافه کنید.', weight: 1 }));

  const twCount = Object.keys(page.twitterCard).length;
  results.push(twCount >= 2
    ? check({ id: 'seo.twitter-card', title: 'Twitter Card', status: 'pass', severity: 'info',
        description: `تعداد تگ‌های Twitter Card: ${twCount}`,
        evidence: Object.keys(page.twitterCard), recommendation: 'اقدامی لازم نیست.', weight: 1 })
    : check({ id: 'seo.twitter-card', title: 'Twitter Card', status: 'warning', severity: 'low',
        description: 'تگ‌های Twitter Card ناقص‌اند.',
        evidence: [`تعداد فعلی: ${twCount}`],
        recommendation: 'تگ‌های twitter:card، twitter:title و twitter:description را اضافه کنید.', weight: 1 }));

  return results;
}

/** اجرای همه بررسی‌های Technical SEO. */
export function runTechnicalSeoChecks(page: PageData): CheckResult[] {
  return [
    checkTitle(page),
    checkMetaDescription(page),
    checkCanonical(page),
    checkRobots(page),
    ...checkHeadings(page),
    ...checkImages(page),
    ...checkLinks(page),
    ...checkStructuredData(page),
    ...checkBasics(page),
  ];
}

export type { Severity };
