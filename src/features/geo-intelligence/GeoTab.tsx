import { useAnalysisStore } from '@/stores/analysis';
import { IssueCard } from '@/components/shared/IssueCard';
import { EmptyState } from '@/components/ui/States';
import { Card } from '@/components/ui/Card';

export function GeoTab() {
  const { result } = useAnalysisStore();
  if (!result) return null;
  const checks = result.checks.filter((c) => c.category === 'geo');
  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm">
          ⚠️ GEO مفهومی در حال تحول است. امتیاز داخلی WebLens معیار رسمی موتورهای جست‌وجو نیست و هیچ تضمینی برای نمایش در پاسخ‌های ChatGPT، Gemini یا Google AI ارائه نمی‌شود.
        </p>
      </Card>
      {checks.length === 0 ? <EmptyState title="بررسی‌ای وجود ندارد" /> : (
        <div className="space-y-2">
          {checks.map((c) => <IssueCard key={c.id} check={c} />)}
        </div>
      )}
    </div>
  );
}
