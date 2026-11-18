import { useEffect, useState } from 'react';
import { listReports, deleteReport, clearReports } from '@/services/storage/reports';
import { exportJson, exportHtml, downloadFile } from '@/services/reporting/export';
import type { StoredReport } from '@/types/report';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { formatDateFa, formatScore } from '@/utils/format';

export function ReportsTab() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [minScore, setMinScore] = useState('');
  const [selected, setSelected] = useState<StoredReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listReports({
      query: query || undefined,
      minScore: minScore ? Number(minScore) : undefined,
    }).then((data) => {
      if (!cancelled) setReports(data);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [query, minScore]);

  async function handleDelete(id: string) {
    await deleteReport(id);
    if (selected?.id === id) setSelected(null);
    setReports(await listReports({ query: query || undefined, minScore: minScore ? Number(minScore) : undefined }));
  }

  async function handleClear() {
    if (window.confirm('همه گزارش‌های ذخیره‌شده حذف شوند؟ این کار قابل بازگشت نیست.')) {
      await clearReports();
      setSelected(null);
      setReports(await listReports({ query: query || undefined, minScore: minScore ? Number(minScore) : undefined }));
    }
  }

  if (loading) return <Spinner label="در حال بارگذاری گزارش‌ها..." />;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap gap-2">
          <input
            className="flex-1 rounded-lg border border-slate-300 bg-transparent p-2 text-sm dark:border-slate-600"
            placeholder="جست‌وجو در گزارش‌ها (URL یا عنوان)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            className="w-28 rounded-lg border border-slate-300 bg-transparent p-2 text-sm dark:border-slate-600"
            type="number" min={0} max={100}
            placeholder="حداقل امتیاز"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
          />
          <Button variant="danger" onClick={handleClear} disabled={reports.length === 0}>حذف همه</Button>
        </div>
      </Card>

      {reports.length === 0 ? (
        <EmptyState title="گزارشی ذخیره نشده است" description="پس از تحلیل صفحه، گزارش به‌صورت خودکار در دستگاه شما ذخیره می‌شود." />
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <Card key={r.id} className="cursor-pointer" >
              <div className="flex items-center justify-between gap-2" onClick={() => setSelected(selected?.id === r.id ? null : r)}>
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.title}</div>
                  <div className="mono ltr truncate text-left text-xs text-slate-400">{r.url}</div>
                  <div className="text-xs text-slate-500">{formatDateFa(r.analyzedAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-sm font-bold ${r.overallScore >= 80 ? 'bg-green-100 text-green-800' : r.overallScore >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                    {formatScore(r.overallScore)}
                  </span>
                  <Button variant="ghost" className="text-xs text-red-600" onClick={(e) => { e.stopPropagation(); void handleDelete(r.id); }}>حذف</Button>
                </div>
              </div>
              {selected?.id === r.id && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                  <Button variant="secondary" className="text-xs" onClick={() => downloadFile(`weblens-report-${r.id}.json`, exportJson(r.result), 'application/json')}>خروجی JSON</Button>
                  <Button variant="secondary" className="text-xs" onClick={() => downloadFile(`weblens-report-${r.id}.html`, exportHtml(r.result), 'text/html')}>خروجی HTML</Button>
                  <Button variant="secondary" className="text-xs" onClick={() => window.print()}>چاپ گزارش</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
