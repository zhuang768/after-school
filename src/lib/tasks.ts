import type { Account, CatalogEntry, Task, TaskType, Workspace } from '../types';
import { strings } from '../strings';

export function taskId(accountId: string, type: TaskType): string {
  return `task:${accountId}:${type}`;
}

export function schoolTaskId(kind: 'drive' | 'mail' | 'contacts' | 'recovery'): string {
  return `task:school:${kind}`;
}

function makeTask(
  input: Omit<Task, 'notes' | 'completedSteps' | 'createdAt' | 'status'> & {
    status?: Task['status'];
  },
  now: string,
): Task {
  return {
    notes: '',
    completedSteps: [],
    createdAt: now,
    status: input.status ?? 'not-started',
    ...input,
  };
}

export function schoolTasks(now = new Date().toISOString()): Task[] {
  return [
    makeTask(
      {
        id: schoolTaskId('drive'),
        title: strings.schoolTaskTitles.drive,
        type: 'export',
        kind: 'drive',
      },
      now,
    ),
    makeTask(
      {
        id: schoolTaskId('mail'),
        title: strings.schoolTaskTitles.mail,
        type: 'export',
        kind: 'mail',
      },
      now,
    ),
    makeTask(
      {
        id: schoolTaskId('contacts'),
        title: strings.schoolTaskTitles.contacts,
        type: 'export',
        kind: 'contacts',
      },
      now,
    ),
    makeTask(
      {
        id: schoolTaskId('recovery'),
        title: strings.schoolTaskTitles.recovery,
        type: 'recovery',
        kind: 'recovery',
      },
      now,
    ),
  ];
}

export function tasksForAccount(
  account: Account,
  catalog: CatalogEntry[],
  now = new Date().toISOString(),
): Task[] {
  const entry = catalog.find((candidate) => candidate.id === account.serviceId);
  const tasks: Task[] = [];
  const emailRestricted = entry?.email.status === 'restricted';
  tasks.push(
    makeTask(
      {
        id: taskId(account.id, emailRestricted ? 'replace' : 'email'),
        accountId: account.id,
        serviceId: account.serviceId,
        title: `${emailRestricted ? strings.taskTitles.replace : strings.taskTitles.email}: ${account.name}`,
        type: emailRestricted ? 'replace' : 'email',
      },
      now,
    ),
  );
  const important = [
    'Cloud storage',
    'Development',
    'Design & creation',
    'Productivity',
    'Shopping & finance',
  ].includes(entry?.category ?? '');
  if (important || (entry && entry.export.status !== 'unverified')) {
    tasks.push(
      makeTask(
        {
          id: taskId(account.id, 'export'),
          accountId: account.id,
          serviceId: account.serviceId,
          title: `${strings.taskTitles.export}: ${account.name}`,
          type: 'export',
        },
        now,
      ),
    );
  }
  if (
    (account.signals.password ?? 0) > 0 ||
    (account.signals.receipt ?? 0) > 0 ||
    entry?.category === 'Shopping & finance'
  ) {
    tasks.push(
      makeTask(
        {
          id: taskId(account.id, 'recovery'),
          accountId: account.id,
          serviceId: account.serviceId,
          title: `${strings.taskTitles.recovery}: ${account.name}`,
          type: 'recovery',
        },
        now,
      ),
    );
  }
  return tasks;
}

export function syncTasks(workspace: Workspace, catalog: CatalogEntry[]): Task[] {
  const now = new Date().toISOString();
  const generated = [
    ...schoolTasks(now),
    ...workspace.accounts.flatMap((account) => tasksForAccount(account, catalog, now)),
  ];
  const previous = new Map(workspace.tasks.map((task) => [task.id, task]));
  const next = generated.map((task) => {
    const old = previous.get(task.id);
    if (!old) return task;
    return {
      ...task,
      status: old.status,
      notes: old.notes,
      completedSteps: old.completedSteps,
      createdAt: old.createdAt,
    };
  });
  const extras = workspace.tasks.filter(
    (task) => task.type === 'delete' && !next.some((item) => item.id === task.id),
  );
  return [...next, ...extras];
}

export function withOwnership(
  workspace: Workspace,
  accountId: string,
  ownership: Account['ownership'],
  catalog: CatalogEntry[],
): Workspace {
  const accounts = workspace.accounts.map((account) =>
    account.id === accountId ? { ...account, ownership } : account,
  );
  const next = { ...workspace, accounts, updatedAt: new Date().toISOString() };
  return { ...next, tasks: syncTasks(next, catalog) };
}
