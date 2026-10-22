import type { Account, CatalogEntry, Preferences, Task, Workspace } from '../types';

const DAY = 86_400_000;

/** Strict calendar dates: do not let Date silently roll 2026-02-31 into March. */
export function dateNumber(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 9999) return null;
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day)
    return null;
  return utc.getTime() / DAY;
}

export function localDate(now = new Date()): string {
  return `${now.getFullYear().toString().padStart(4, '0')}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

export function addDays(date: string, days: number): string {
  const value = dateNumber(date);
  if (value === null || !Number.isSafeInteger(days)) return '';
  const result = new Date((value + days) * DAY).toISOString().slice(0, 10);
  return dateNumber(result) === null ? '' : result;
}

export function daysUntil(date: string, now = new Date()): number | null {
  const end = dateNumber(date);
  const start = dateNumber(localDate(now));
  return end === null || start === null ? null : end - start;
}

export function effectiveExpiry(preferences: Preferences): { date: string; assumed: boolean } {
  if (dateNumber(preferences.expiryDate) !== null) {
    return { date: preferences.expiryDate, assumed: preferences.expiryAssumed };
  }
  if (dateNumber(preferences.graduationDate) !== null) {
    return {
      date: addDays(preferences.graduationDate, preferences.retentionDays),
      assumed: true,
    };
  }
  return { date: '', assumed: true };
}

function riskWeight(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(10, value)) * 10 : 0;
}

export function scoreTask(
  task: Task,
  accounts: Account[],
  catalog: CatalogEntry[],
  preferences: Preferences,
): { score: number; reasons: string[] } {
  const account = accounts.find((candidate) => candidate.id === task.accountId);
  if (task.status === 'done' || task.status === 'not-mine' || account?.ownership === 'not-mine') {
    return { score: 0, reasons: [] };
  }
  const entry = catalog.find(
    (candidate) => candidate.id === (task.serviceId ?? account?.serviceId),
  );
  const weights = preferences.riskWeights;
  const reasons: string[] = [];
  let score = 0;
  const include = (key: string, value: number) => {
    reasons.push(key);
    score += riskWeight(value);
  };
  if ((account?.signals.receipt ?? 0) > 0) include('billing', weights.billing);
  if (
    ['Cloud storage', 'Development', 'Design & creation', 'Productivity'].includes(
      entry?.category ?? '',
    ) ||
    ['drive', 'mail', 'contacts'].includes(task.kind ?? '')
  )
    include('data', weights.data);
  if (entry?.email.status === 'restricted') include('restricted', weights.restricted);
  if (entry?.education.available === 'yes') include('education', weights.education);
  if (task.type === 'recovery' || (account?.signals.password ?? 0) > 0) {
    include('recovery', weights.recovery);
  }
  if (account?.ownership === 'unsure') reasons.push('unconfirmed');
  return { score, reasons };
}

export interface PlannedTask {
  task: Task;
  score: number;
  reasons: string[];
  dueDate: string;
  overdue: boolean;
}

export function planTasks(
  workspace: Workspace,
  catalog: CatalogEntry[],
  now = new Date(),
): PlannedTask[] {
  const expiry = effectiveExpiry(workspace.preferences);
  const remaining = daysUntil(expiry.date, now);
  const today = localDate(now);
  return workspace.tasks
    .filter((task) => task.status !== 'done' && task.status !== 'not-mine')
    .filter(
      (task) =>
        !workspace.accounts.some(
          (account) => account.id === task.accountId && account.ownership === 'not-mine',
        ),
    )
    .map((task) => {
      const ranked = scoreTask(task, workspace.accounts, catalog, workspace.preferences);
      // The highest-risk work is scheduled furthest ahead of the deadline.
      const lead =
        ranked.score >= 150 ? 45 : ranked.score >= 100 ? 30 : ranked.score >= 50 ? 21 : 14;
      const dueDate = expiry.date ? addDays(expiry.date, -lead) : '';
      const overdue = dueDate !== '' && dueDate < today;
      let score = ranked.score;
      const reasons = [...ranked.reasons];
      if (expiry.assumed && expiry.date) reasons.push('expiry-assumed');
      if (remaining !== null && remaining < 0) {
        score += 100;
        reasons.push('expired');
      } else if (remaining !== null && remaining <= 30) {
        score += 40;
        reasons.push('expiry-soon');
      }
      if (overdue) {
        score += 25;
        reasons.push('overdue');
      }
      return { task, score, reasons, dueDate, overdue };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.dueDate.localeCompare(b.dueDate) ||
        a.task.id.localeCompare(b.task.id),
    );
}

export function progress(workspace: Workspace): { done: number; total: number; percent: number } {
  const tasks = workspace.tasks.filter(
    (task) =>
      task.status !== 'not-mine' &&
      !workspace.accounts.some(
        (account) => account.id === task.accountId && account.ownership === 'not-mine',
      ),
  );
  const done = tasks.filter((task) => task.status === 'done').length;
  return {
    done,
    total: tasks.length,
    percent: tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100),
  };
}
