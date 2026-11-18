/** استور Zustand برای تنظیمات کاربر. */
import { create } from 'zustand';
import type { UserSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { loadSettings, saveSettings } from '@/services/storage/settings';

interface SettingsState {
  settings: UserSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<UserSettings>) => Promise<void>;
  updateAi: (patch: Partial<UserSettings['ai']>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: structuredClone(DEFAULT_SETTINGS),
  loaded: false,
  load: async () => {
    const settings = await loadSettings();
    set({ settings, loaded: true });
  },
  update: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    await saveSettings(next);
  },
  updateAi: async (patch) => {
    const next = { ...get().settings, ai: { ...get().settings.ai, ...patch } };
    set({ settings: next });
    await saveSettings(next);
  },
}));
