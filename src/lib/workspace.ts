import type { Account, Preferences, Task, TaskStatus, TaskType, Workspace } from '../types';
import { schoolTasks } from './tasks';

/**
 * One serialized-JSON budget for save, download, and import.
 * It is above a 10,001-account scan export and a note the editor can already keep.
 */
export const WORKSPACE_LIMIT = 32_000_000;

export function defaultPreferences(): Preferences {
  return {
    schoolDomains: [],
    graduationDate: '',
    expiryDate: '',
    retentionDays: 30,
    expiryAssumed: true,
    schoolPolicy: '',
    saveSubjects: false,
    theme: 'system',
    riskWeights: { billing: 8, data: 7, restricted: 9, education: 5, recovery: 8 },
  };
}

export function emptyWorkspace(): Workspace {
  return {
    version: 1,
    accounts: [],
    tasks: schoolTasks('1970-01-01T00:00:00.000Z'),
    preferences: defaultPreferences(),
    demo: false,
    onboarded: false,
    updatedAt: new Date(0).toISOString(),
  };
}

const TASK_TYPES = new Set<TaskType>(['email', 'export', 'replace', 'delete', 'recovery']);
const TASK_STATUS = new Set<TaskStatus>([
  'not-started',
  'in-progress',
  'done',
  'cant-migrate',
  'not-mine',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string, max: number): string {
  const value = record[key];
  if (typeof value !== 'string' || value.length > max) throw new Error('invalid');
  return value;
}

function identifier(record: Record<string, unknown>, key: string, max: number): string {
  const value = stringField(record, key, max);
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) throw new Error('invalid');
  }
  return value;
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  max: number,
): string | undefined {
  if (!(key in record) || record[key] === undefined) return undefined;
  return stringField(record, key, max);
}

export function stripSubjects(workspace: Workspace): Workspace {
  if (workspace.preferences.saveSubjects) return workspace;
  return {
    ...workspace,
    accounts: workspace.accounts.map((account) => ({
      ...account,
      evidence: account.evidence.map((item) => {
        const copy = { ...item };
        delete copy.subject;
        return copy;
      }),
    })),
  };
}

export function parseWorkspace(raw: string): Workspace {
  if (raw.length > WORKSPACE_LIMIT) throw new Error('too-large');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('invalid');
  }
  if (!isRecord(parsed) || parsed.version !== 1) throw new Error('invalid');
  if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.tasks)) throw new Error('invalid');
  const accounts = parsed.accounts.map((item) => {
    if (!isRecord(item)) throw new Error('invalid');
    const ownership = item.ownership;
    const confidence = item.confidence;
    const source = item.source;
    if (ownership !== 'mine' && ownership !== 'not-mine' && ownership !== 'unsure')
      throw new Error('invalid');
    if (confidence !== 'High' && confidence !== 'Medium' && confidence !== 'Low')
      throw new Error('invalid');
    if (source !== 'scan' && source !== 'catalog' && source !== 'manual' && source !== 'demo')
      throw new Error('invalid');
    const signals = isRecord(item.signals) ? item.signals : {};
    const evidence = Array.isArray(item.evidence) ? item.evidence.slice(0, 12) : [];
    const account: Account = {
      id: identifier(item, 'id', 200),
      serviceId: optionalString(item, 'serviceId', 80),
      name: stringField(item, 'name', 200),
      domain: stringField(item, 'domain', 200),
      confidence,
      ownership,
      count:
        typeof item.count === 'number' && Number.isSafeInteger(item.count) && item.count >= 0
          ? item.count
          : 0,
      firstSeen: stringField(item, 'firstSeen', 40),
      lastSeen: stringField(item, 'lastSeen', 40),
      signals: {
        welcome: numberOrZero(signals.welcome),
        verification: numberOrZero(signals.verification),
        password: numberOrZero(signals.password),
        receipt: numberOrZero(signals.receipt),
        security: numberOrZero(signals.security),
        marketing: numberOrZero(signals.marketing),
      },
      ...(item.schoolMatched === true ||
      evidence.some((entry) => isRecord(entry) && entry.schoolMatch === true)
        ? { schoolMatched: true as const }
        : {}),
      evidence: evidence.map((entry) => {
        if (!isRecord(entry)) throw new Error('invalid');
        const signal = entry.signal;
        if (
          signal !== 'welcome' &&
          signal !== 'verification' &&
          signal !== 'password' &&
          signal !== 'receipt' &&
          signal !== 'security' &&
          signal !== 'marketing'
        ) {
          throw new Error('invalid');
        }
        return {
          signal,
          date: stringField(entry, 'date', 40),
          schoolMatch: entry.schoolMatch === true,
          recipientDomain: optionalString(entry, 'recipientDomain', 200),
          subject: optionalString(entry, 'subject', 180),
        };
      }),
      source,
    };
    return account;
  });
  const tasks = parsed.tasks.map((item) => {
    if (!isRecord(item)) throw new Error('invalid');
    const type = item.type;
    const status = item.status;
    if (typeof type !== 'string' || !TASK_TYPES.has(type as TaskType)) throw new Error('invalid');
    if (typeof status !== 'string' || !TASK_STATUS.has(status as TaskStatus))
      throw new Error('invalid');
    const kind = item.kind;
    const task: Task = {
      id: identifier(item, 'id', 240),
      accountId: optionalString(item, 'accountId', 200),
      serviceId: optionalString(item, 'serviceId', 80),
      title: stringField(item, 'title', 300),
      type: type as TaskType,
      status: status as TaskStatus,
      notes: stringField(item, 'notes', WORKSPACE_LIMIT),
      completedSteps: Array.isArray(item.completedSteps)
        ? item.completedSteps
            .filter((step) => Number.isInteger(step) && step >= 0 && step < 100)
            .slice(0, 100)
        : [],
      createdAt: stringField(item, 'createdAt', 40),
      kind:
        kind === 'drive' ||
        kind === 'mail' ||
        kind === 'contacts' ||
        kind === 'recovery' ||
        kind === 'school'
          ? kind
          : undefined,
    };
    return task;
  });
  const accountIds = new Set<string>();
  for (const account of accounts) {
    if (accountIds.has(account.id)) throw new Error('invalid');
    accountIds.add(account.id);
  }
  const taskIds = new Set<string>();
  for (const task of tasks) {
    if (taskIds.has(task.id)) throw new Error('invalid');
    taskIds.add(task.id);
    if (task.accountId && !accountIds.has(task.accountId)) throw new Error('invalid');
  }
  if (!isRecord(parsed.preferences)) throw new Error('invalid');
  const preferences = parsePreferences(parsed.preferences);
  return {
    version: 1,
    accounts,
    tasks,
    preferences,
    demo: parsed.demo === true,
    onboarded: parsed.onboarded === true,
    updatedAt:
      typeof parsed.updatedAt === 'string'
        ? parsed.updatedAt.slice(0, 40)
        : new Date(0).toISOString(),
  };
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value))
    : 0;
}

function parsePreferences(record: Record<string, unknown>): Preferences {
  const defaults = defaultPreferences();
  const weights = isRecord(record.riskWeights) ? record.riskWeights : {};
  const theme =
    record.theme === 'light' || record.theme === 'dark' || record.theme === 'system'
      ? record.theme
      : 'system';
  return {
    schoolDomains: Array.isArray(record.schoolDomains)
      ? record.schoolDomains
          .filter((item) => typeof item === 'string')
          .map((item) => item.slice(0, 200))
          .slice(0, 20)
      : [],
    graduationDate:
      typeof record.graduationDate === 'string' ? record.graduationDate.slice(0, 10) : '',
    expiryDate: typeof record.expiryDate === 'string' ? record.expiryDate.slice(0, 10) : '',
    retentionDays:
      typeof record.retentionDays === 'number' &&
      record.retentionDays >= 0 &&
      record.retentionDays <= 3650
        ? Math.floor(record.retentionDays)
        : defaults.retentionDays,
    expiryAssumed: record.expiryAssumed !== false,
    schoolPolicy: typeof record.schoolPolicy === 'string' ? record.schoolPolicy.slice(0, 4000) : '',
    saveSubjects: record.saveSubjects === true,
    theme,
    riskWeights: {
      billing: clampWeight(weights.billing, defaults.riskWeights.billing),
      data: clampWeight(weights.data, defaults.riskWeights.data),
      restricted: clampWeight(weights.restricted, defaults.riskWeights.restricted),
      education: clampWeight(weights.education, defaults.riskWeights.education),
      recovery: clampWeight(weights.recovery, defaults.riskWeights.recovery),
    },
  };
}

function clampWeight(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(10, value));
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
