/** استور Zustand برای وضعیت تحلیل صفحه جاری. */
import { create } from 'zustand';
import type { AnalysisResult } from '@/types/analysis';
import type { PageData } from '@/types/page';

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface AnalysisState {
  status: AnalysisStatus;
  page: PageData | null;
  result: AnalysisResult | null;
  error: string | null;
  setLoading: () => void;
  setPage: (page: PageData) => void;
  setResult: (result: AnalysisResult) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  status: 'idle',
  page: null,
  result: null,
  error: null,
  setLoading: () => set({ status: 'loading', error: null }),
  setPage: (page) => set({ page }),
  setResult: (result) => set({ result, status: 'success', error: null }),
  setError: (error) => set({ status: 'error', error }),
  reset: () => set({ status: 'idle', page: null, result: null, error: null }),
}));
