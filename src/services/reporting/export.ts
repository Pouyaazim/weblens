/**
 * سرویس گزارش و خروجی — JSON، HTML مستقل و چاپ.
 */
import type { AnalysisResult } from '@/types/analysis';
import { formatDateFa, formatScore } from '@/utils/format';

export function exportJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
}

/** تولید گزارش HTML مستقل و قابل اشتراک‌گذاری. */
export function exportHtml(result: AnalysisResult): string {
  const rows = result.checks.map((c) => `
    <tr>
      <td>${escapeHtml(c.title)}</td>
      <td>${c.status === 'pass' ? 'موفق' : c.status === 'fail' ? 'مشکل' : c.status === 'warning' ? 'هشدار' : 'قابل ارزیابی نیست'}</td>
      <td>${escapeHtml(c.description)}</td>
      <td>${escapeHtml(c.recommendation)}</td>
    </tr>`).join('');
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>گزارش WebLens — ${escapeHtml(result.title)}</title>
<style>
  body { font-family: Tahoma, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 14px; }
  th { background: #f5f5f5; }
  .scores { display: flex; gap: 1rem; flex-wrap: wrap; }
  .score { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; min-width: 120px; text-align: center; }
  .score b { font-size: 2rem; display: block; }
</style>
</head>
<body>
<h1>گزارش تحلیل WebLens</h1>
<p>صفحه: ${escapeHtml(result.url)}<br>زمان تحلیل: ${formatDateFa(result.analyzedAt)}</p>
<div class="scores">
  <div class="score"><b>${formatScore(result.scores.overall)}</b>امتیاز کلی</div>
  <div class="score"><b>${formatScore(result.scores.technicalSeo)}</b>سئوی فنی</div>
  <div class="score"><b>${formatScore(result.scores.contentQuality)}</b>کیفیت محتوا</div>
  <div class="score"><b>${formatScore(result.scores.geoReadiness)}</b>آمادگی GEO</div>
  <div class="score"><b>${formatScore(result.scores.metadata)}</b>متادیتا</div>
</div>
<table>
<thead><tr><th>بررسی</th><th>وضعیت</th><th>توضیح</th><th>پیشنهاد</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p style="margin-top:2rem;color:#666;font-size:12px">این گزارش توسط WebLens تولید شده است. امتیازها معیار رسمی موتورهای جست‌وجو نیستند.</p>
</body>
</html>`;
}

export function downloadFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
