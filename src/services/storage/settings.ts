/**
 * ذخیره‌سازی تنظیمات با Chrome Storage API.
 * API Key فقط در فضای ذخیره‌سازی محلی مرورگر نگه داشته می‌شود و هرگز به سرویس دیگری ارسال نمی‌شود
 * (به‌جز درخواست صریح کاربر به OpenRouter).
 */
import { browser } from 'wxt/browser';
import type { UserSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

const STORAGE_KEY = 'weblens.settings.v1';

export async function loadSettings(): Promise<UserSettings> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as Partial<UserSettings> | undefined;
    if (!stored) return structuredClone(DEFAULT_SETTINGS);
    const ai = { ...DEFAULT_SETTINGS.ai, ...(stored.ai ?? {}) };
    if (typeof ai.apiKey === 'string') {
      ai.apiKey = ai.apiKey
        .replace(/^\uFEFF/, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .replace(/^["']+|["']+$/g, '')
        .replace(/\s+/g, '');
    }
    return {
      ...structuredClone(DEFAULT_SETTINGS),
      ...stored,
      ai,
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
}

export async function clearAllLocalData(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY);
}
