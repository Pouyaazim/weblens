import type { PageData } from './page';

/** پیام‌های بین اجزای افزونه (Side Panel ↔ Content Script ↔ Background). */
export type ExtensionMessage =
  | { type: 'weblens:extract-page' }
  | { type: 'weblens:page-data'; payload: PageData }
  | { type: 'weblens:open-panel' };

export type ExtractResponse =
  | { ok: true; data: PageData }
  | { ok: false; error: string };
