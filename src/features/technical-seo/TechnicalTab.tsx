import { useAnalysisStore } from '@/stores/analysis';
import { IssueCard } from '@/components/shared/IssueCard';
import { EmptyState } from '@/components/ui/States';
import type { CheckResult } from '@/types/analysis';

export function TechnicalTab({ onExplain }: { onExplain?: (c: CheckResult) => void }) {
  const { result } = useAnalysisStore();
  if (!result) return null;
  const checks = result.checks.filter((c) => c.category === 'technical-seo' || c.category === 'metadata');
  if (checks.length === 0) return <EmptyState title="بررسی‌ای وجود ندارد" />;
  return (
    <div className="space-y-2">
      {checks.map((c) => <IssueCard key={c.id} check={c} onExplain={onExplain} />)}
    </div>
  );
}
