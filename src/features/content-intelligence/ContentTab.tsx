import { useAnalysisStore } from '@/stores/analysis';
import { IssueCard } from '@/components/shared/IssueCard';
import { EmptyState } from '@/components/ui/States';
import { Card } from '@/components/ui/Card';
import { formatNumberFa } from '@/utils/format';

export function ContentTab() {
  const { result } = useAnalysisStore();
  if (!result) return null;
  const checks = result.checks.filter((c) => c.category === 'content');
  const page = result.page;
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-2 font-bold">آمار محتوایی صفحه</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
          <div><div className="text-xl font-bold">{formatNumberFa(page.wordCount)}</div><div className="text-xs text-slate-500">کلمه</div></div>
          <div><div className="text-xl font-bold">{formatNumberFa(page.paragraphs.length)}</div><div className="text-xs text-slate-500">پاراگراف</div></div>
          <div><div className="text-xl font-bold">{formatNumberFa(page.headings.length)}</div><div className="text-xs text-slate-500">هدینگ</div></div>
          <div><div className="text-xl font-bold">{formatNumberFa(page.images.length)}</div><div className="text-xs text-slate-500">تصویر</div></div>
        </div>
      </Card>
      {checks.length === 0 ? <EmptyState title="بررسی‌ای وجود ندارد" /> : (
        <div className="space-y-2">
          {checks.map((c) => <IssueCard key={c.id} check={c} />)}
        </div>
      )}
    </div>
  );
}
