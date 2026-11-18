import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// WebLens — افزونه تحلیل SEO/GEO/محتوا (Manifest V3)
export default defineConfig({
  modules: [],
  // WXT به‌صورت پیش‌فرض @ را به srcDir مپ می‌کند؛ با srcDir='src'، ایمپورت @/ به پوشه src اشاره می‌کند.
  srcDir: 'src',
  entrypointsDir: '../entrypoints',
  vite: () => ({
    plugins: [react(), tailwindcss()],
  }),
  manifest: {
    name: 'WebLens — وب‌لنز',
    short_name: 'WebLens',
    description: 'افزونه متن‌باز و کاملاً رایگان برای تحلیل SEO فنی، کیفیت محتوا و آمادگی GEO صفحات وب',
    version: '0.1.0',
    permissions: ['activeTab', 'sidePanel', 'storage', 'scripting'],
    host_permissions: ['https://openrouter.ai/*'],
    action: {
      default_title: 'WebLens — تحلیل صفحه',
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
});
