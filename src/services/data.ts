export type LearnStatus = "not_started" | "in_progress" | "completed";

export interface LearnRecord {
  id: string; // component id
  status: LearnStatus;
  count: number;
  lastAt?: number;
}

const LS_KEY = "epodor:learning";

const readAll = (): Record<string, LearnRecord> => {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? JSON.parse(raw) : {};
};

const writeAll = (data: Record<string, LearnRecord>) => {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
};

export const getRecord = (id: string): LearnRecord => {
  const all = readAll();
  return (
    all[id] || {
      id,
      status: "not_started",
      count: 0,
      lastAt: undefined,
    }
  );
};

export const upsertRecord = (rec: LearnRecord) => {
  const all = readAll();
  all[rec.id] = rec;
  writeAll(all);
};

export const markInProgress = (id: string) => {
  const rec = getRecord(id);
  if (rec.status !== "completed") {
    rec.status = "in_progress";
  }
  upsertRecord(rec);
};

export const markCompleted = (id: string) => {
  const rec = getRecord(id);
  rec.status = "completed";
  rec.count = (rec.count || 0) + 1;
  rec.lastAt = Date.now();
  upsertRecord(rec);
};

export const listAll = (): LearnRecord[] => Object.values(readAll());
