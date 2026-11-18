/**
 * ذخیره‌سازی گزارش‌ها در IndexedDB.
 * داده‌ها روی دستگاه کاربر باقی می‌مانند و هیچ‌گاه به سرور ارسال نمی‌شوند.
 */
import { openDB, type IDBPDatabase } from 'idb';
import type { StoredReport, ReportFilter } from '@/types/report';
import type { AnalysisResult } from '@/types/analysis';

const DB_NAME = 'weblens';
const DB_VERSION = 1;
const STORE = 'reports';

interface WebLensDB {
  reports: {
    key: string;
    value: StoredReport;
    indexes: { 'by-url': string; 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<WebLensDB>> | null = null;

function getDb(): Promise<IDBPDatabase<WebLensDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WebLensDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('by-url', 'url', { unique: false });
          store.createIndex('by-date', 'analyzedAt', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveReport(result: AnalysisResult): Promise<StoredReport> {
  const db = await getDb();
  const report: StoredReport = {
    id: result.id,
    url: result.url,
    title: result.title,
    analyzedAt: result.analyzedAt,
    overallScore: result.scores.overall,
    result,
  };
  await db.put(STORE, report);
  return report;
}

export async function listReports(filter: ReportFilter = {}): Promise<StoredReport[]> {
  const db = await getDb();
  let all = await db.getAllFromIndex(STORE, 'by-date');
  all = all.reverse(); // جدیدترین اول
  if (filter.query) {
    const q = filter.query.toLowerCase();
    all = all.filter((r) => r.url.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
  }
  if (filter.minScore !== undefined) all = all.filter((r) => r.overallScore >= filter.minScore!);
  if (filter.maxScore !== undefined) all = all.filter((r) => r.overallScore <= filter.maxScore!);
  if (filter.from) all = all.filter((r) => r.analyzedAt >= filter.from!);
  if (filter.to) all = all.filter((r) => r.analyzedAt <= filter.to!);
  return all;
}

export async function getReport(id: string): Promise<StoredReport | undefined> {
  const db = await getDb();
  return db.get(STORE, id);
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}

export async function clearReports(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE);
}

export async function countReports(): Promise<number> {
  const db = await getDb();
  return db.count(STORE);
}
