/** تنظیمات کاربر که در Chrome Storage ذخیره می‌شوند. */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en';
  autoSaveReports: boolean;
  /** حداکثر طول متنی که برای تحلیل AI ارسال می‌شود */
  aiContextLimit: number;
  ai: import('./ai').AiSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'fa',
  autoSaveReports: true,
  aiContextLimit: 6000,
  ai: {
    enabled: false,
    apiKey: '',
    model: 'openrouter/auto',
    fallbackModel: 'google/gemini-2.0-flash-001',
    language: 'fa',
  },
};
