import { describe, expect, it } from 'vitest';
import { serviceCatalog } from '../src/data/catalog';
import { emptyWorkspace } from '../src/lib/workspace';
import { daysUntil, planTasks, scoreTask } from '../src/lib/planning';
import { syncTasks } from '../src/lib/tasks';

describe('planning', () => {
  it('rejects impossible calendar dates', () => {
    expect(daysUntil('2026-02-31')).toBeNull();
  });

  it('ranks billing and recovery above an ordinary export', () => {
    const workspace = emptyWorkspace();
    workspace.preferences.expiryDate = '2026-12-01';
    workspace.preferences.expiryAssumed = false;
    workspace.accounts = [
      {
        id: 'account:github',
        serviceId: 'github',
        name: 'GitHub',
        domain: 'github.com',
        confidence: 'High',
        ownership: 'mine',
        count: 2,
        firstSeen: '2024-01-01',
        lastSeen: '2026-01-01',
        signals: { welcome: 1, password: 1, receipt: 1 },
        evidence: [],
        source: 'scan',
      },
    ];
    workspace.tasks = syncTasks(workspace, serviceCatalog);
    const now = new Date('2026-10-19T00:00:00');
    const planned = planTasks(workspace, serviceCatalog, now);
    expect(planned.length).toBeGreaterThan(0);
    expect(planned[0]?.score).toBeGreaterThan(0);
    expect(
      planned.every((item, index) => index === 0 || planned[index - 1].score >= item.score),
    ).toBe(true);
    const recovery = planned.find((item) => item.task.type === 'recovery');
    expect(recovery?.reasons).toContain('recovery');
    expect(recovery?.reasons).toContain('billing');
  });

  it('raises already-expired work and stays calm with no accounts', () => {
    const workspace = emptyWorkspace();
    workspace.preferences.expiryDate = '2020-01-01';
    workspace.preferences.expiryAssumed = false;
    const planned = planTasks(workspace, serviceCatalog, new Date('2026-10-19T00:00:00'));
    expect(planned.every((item) => item.reasons.includes('expired'))).toBe(true);
    const bare = emptyWorkspace();
    bare.tasks = [];
    expect(planTasks(bare, serviceCatalog)).toEqual([]);
    const task = syncTasks(workspace, serviceCatalog)[0];
    expect(scoreTask(task, [], serviceCatalog, workspace.preferences).score).toBeGreaterThan(0);
  });
});
