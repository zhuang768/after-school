import { describe, expect, it } from 'vitest';
import { serviceCatalog } from '../src/data/catalog';
import { buildCalendar } from '../src/lib/ics';
import { buildPdf, buildReport } from '../src/lib/report';
import { syncTasks } from '../src/lib/tasks';
import { emptyWorkspace, parseWorkspace } from '../src/lib/workspace';
import type { PlannedTask } from '../src/lib/planning';

function planned(id: string, dueDate: string, notes = ''): PlannedTask {
  return {
    task: {
      id,
      title: 'Export school email',
      type: 'export',
      status: 'done',
      notes,
      completedSteps: [],
      createdAt: '2026-10-19T00:00:00.000Z',
    },
    score: 0,
    reasons: [],
    dueDate,
    overdue: false,
  };
}

describe('round 1 regressions', () => {
  it('does not let a task id add another calendar event', () => {
    const text = buildCalendar(
      [planned('task\r\nBEGIN:VEVENT\r\nSUMMARY:injected', '2026-11-01', 'line\rbreak')],
      emptyWorkspace().preferences,
    );
    expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(text).not.toContain('SUMMARY:injected');
    expect(text).not.toMatch(/\r[^\n]/);
  });

  it('does not invent today for a task without a date', () => {
    const text = buildCalendar(
      [planned('undated', '')],
      emptyWorkspace().preferences,
      new Date('2026-10-19T16:30:00Z'),
    );
    expect(text).toContain('BEGIN:VTODO');
    expect(text).not.toContain('DTSTART');
    expect(text).not.toContain('TRIGGER');
  });

  it('lists a completed task even when other work remains', () => {
    const workspace = emptyWorkspace();
    workspace.tasks = [
      { ...planned('done-task', '').task, title: 'Finished export', notes: 'Kept note' },
      {
        ...planned('open-task', '').task,
        title: 'Still open',
        status: 'not-started',
        notes: '',
      },
    ];
    const report = buildReport(
      workspace,
      [planned('open-task', '2026-11-01')],
      new Date('2026-10-19T00:00:00Z'),
    );
    expect(report).toContain('Finished export');
    expect(report).toContain('Kept note');
    expect(report).toContain('Done');
  });

  it('keeps every piece of a long PDF word', () => {
    const word = 'A'.repeat(200);
    const bytes = buildPdf(`Report ${word}`);
    const text = new TextDecoder().decode(bytes);
    const lines = [...text.matchAll(/\(([^)]*)\) Tj/g)].map((match) => match[1] ?? '');
    expect(lines.join('')).toContain(word);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(68);
  });

  it('rejects control characters, duplicate ids, and unknown task accounts', () => {
    const workspace = emptyWorkspace();
    workspace.accounts = [
      {
        id: 'account:one',
        name: 'One',
        domain: 'one.test',
        confidence: 'Low',
        ownership: 'unsure',
        count: 0,
        firstSeen: '',
        lastSeen: '',
        signals: {},
        evidence: [],
        source: 'manual',
      },
    ];
    const raw = JSON.parse(JSON.stringify(workspace)) as {
      accounts: Record<string, unknown>[];
      tasks: Record<string, unknown>[];
    };
    raw.accounts[0].id = 'account\n:one';
    expect(() => parseWorkspace(JSON.stringify(raw))).toThrow('invalid');
    raw.accounts[0].id = 'account:one';
    raw.accounts.push({ ...raw.accounts[0] });
    expect(() => parseWorkspace(JSON.stringify(raw))).toThrow('invalid');
    raw.accounts.pop();
    raw.tasks = [
      {
        id: 'task:missing',
        accountId: 'account:missing',
        title: 'Missing',
        type: 'email',
        status: 'not-started',
        notes: '',
        completedSteps: [],
        createdAt: '2026-10-19T00:00:00.000Z',
      },
    ];
    expect(() => parseWorkspace(JSON.stringify(raw))).toThrow('invalid');
  });

  it('keeps notes when an account is marked not mine', () => {
    const workspace = emptyWorkspace();
    workspace.accounts = [
      {
        id: 'account:github',
        serviceId: 'github',
        name: 'GitHub',
        domain: 'github.com',
        confidence: 'High',
        ownership: 'mine',
        count: 1,
        firstSeen: '',
        lastSeen: '',
        signals: { welcome: 1 },
        evidence: [],
        source: 'manual',
      },
    ];
    workspace.tasks = syncTasks(workspace, serviceCatalog);
    const email = workspace.tasks.find((task) => task.type === 'email');
    expect(email).toBeTruthy();
    if (!email) return;
    email.notes = 'Keep this';
    email.status = 'done';
    email.completedSteps = [0];
    workspace.accounts[0].ownership = 'not-mine';
    const next = syncTasks(workspace, serviceCatalog);
    const kept = next.find((task) => task.id === email.id);
    expect(kept?.notes).toBe('Keep this');
    expect(kept?.status).toBe('done');
    expect(kept?.completedSteps).toEqual([0]);
  });
});
