# معماری WebLens

## نمای کلی

WebLens یک افزونه Chrome (Manifest V3) است که با WXT، React و TypeScript ساخته شده است.
معماری بر اساس **جداسازی کامل منطق تجاری از رابط کاربری** طراحی شده است:

```
┌─────────────────────────────────────────────────────────┐
│                    Side Panel (React UI)                 │
│  Dashboard │ Technical │ Content │ GEO │ AI │ Reports   │
└──────────────────────┬──────────────────────────────────┘
                       │ Zustand Store
┌──────────────────────┴──────────────────────────────────┐
│              Analysis Service (Orchestrator)             │
│   SEO Engine │ Content Engine │ GEO Engine │ Scoring    │
└──────────────────────┬──────────────────────────────────┘
                       │ PageData (اعتبارسنجی‌شده با Zod)
┌──────────────────────┴──────────────────────────────────┐
│              Background Service Worker                   │
│        استخراج از تب فعال با scripting API              │
└──────────────────────┬──────────────────────────────────┘
                       │ chrome.scripting.executeScript
┌──────────────────────┴──────────────────────────────────┐
│                    صفحه وب فعال                         │
│         فقط DOM خوانده می‌شود؛ هیچ کدی اجرا نمی‌شود     │
└─────────────────────────────────────────────────────────┘

لایه‌های مستقل:
- AI Provider (OpenRouter) — فقط با اقدام صریح کاربر
- Storage — Chrome Storage (تنظیمات) + IndexedDB (گزارش‌ها)
- Reporting — خروجی JSON / HTML / چاپ
```

## ماژول‌ها

| ماژول | مسیر | مسئولیت |
|---|---|---|
| Extension Core | `entrypoints/` | Background، Content Script، Side Panel |
| Page Extraction | `src/services/extraction/` | استخراج امن DOM و اعتبارسنجی با Zod |
| Technical SEO | `src/engines/seo/` | بررسی‌های فنی بدون AI |
| Content Intelligence | `src/engines/content/` | کیفیت ساختاری و محتوایی |
| GEO Intelligence | `src/engines/geo/` | آمادگی برای جست‌وجوی AI |
| Scoring | `src/engines/scoring/` | امتیازدهی قابل توضیح و مستند |
| Recommendations | `src/engines/recommendations/` | تبدیل یافته‌ها به پیشنهاد عملی |
| AI Provider | `src/services/ai/` | OpenRouter، مدل‌ها، پرامپت‌ها، اعتبارسنجی خروجی |
| Storage | `src/services/storage/` | تنظیمات (Chrome Storage) و گزارش‌ها (IndexedDB) |
| Reporting | `src/services/reporting/` | خروجی JSON و HTML مستقل |
| UI | `src/features/` و `src/components/` | رابط فارسی RTL با React و Tailwind |

## قراردادهای ارتباطی

- **PageData** (`src/types/page.ts`): قرارداد بین استخراج و موتورهای تحلیل
- **CheckResult** (`src/types/analysis.ts`): خروجی هر بررسی — وضعیت، شدت، شواهد، پیشنهاد
- **AnalysisResult**: نتیجه نهایی تحلیل شامل امتیازها و پیشنهادها
- **ExtensionMessage** (`src/types/messages.ts`): پیام‌های بین اجزای افزونه

## قوانین معماری

1. منطق تجاری هرگز داخل کامپوننت React قرار نمی‌گیرد
2. موتورهای تحلیل توابع خالص (Pure) هستند: ورودی PageData، خروجی CheckResult[]
3. اتصال AI مستقل از موتورهای تحلیل است؛ تحلیل فنی بدون AI کار می‌کند
4. هیچ ماژولی به جزئیات داخلی ماژول دیگر وابسته نیست
5. خطاها با کلاس استاندارد `AiError` و کدهای مشخص مدیریت می‌شوند
6. محتوای صفحه وب همیشه «داده غیرقابل اعتماد» محسوب می‌شود

## جریان داده

```
کاربر روی «تحلیل صفحه» کلیک می‌کند
  → Side Panel پیام weblens:extract-page به Background می‌فرستد
  → Background با scripting API روی تب فعال تابع استخراج را اجرا می‌کند
  → داده خام با PageDataSchema (Zod) اعتبارسنجی می‌شود
  → Analysis Service همه موتورها را اجرا می‌کند
  → امتیازها و پیشنهادها محاسبه می‌شوند
  → نتیجه در Zustand Store قرار می‌گیرد و UI به‌روزرسانی می‌شود
  → گزارش (در صورت فعال بودن) در IndexedDB ذخیره می‌شود
```

## امنیت

- حداقل مجوزهای Chrome: `activeTab`، `sidePanel`، `storage`، `scripting`
- هیچ کد خارجی یا Remote Hosted Code اجرا نمی‌شود
- کلید API فقط در Chrome Storage محلی است
- درخواست AI فقط با اقدام صریح کاربر انجام می‌شود
- پرامپت‌ها شامل دستورالعمل ضد Prompt Injection هستند
