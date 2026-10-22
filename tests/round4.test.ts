import { describe, expect, it } from 'vitest';
import { mergeAccounts } from '../src/ui/App';
import { WORKSPACE_LIMIT, emptyWorkspace, parseWorkspace } from '../src/lib/workspace';
import { extractAddresses } from '../src/parser/headers';
import type { Account, Evidence } from '../src/types';

function evidence(schoolMatch: boolean, index: number): Evidence {
  return { signal: 'receipt', date: `2026-01-${String(index).padStart(2, '0')}`, schoolMatch };
}

function account(items: Evidence[], confidence: Account['confidence'] = 'Low'): Account {
  return {
    id: 'github.com',
    name: 'GitHub',
    domain: 'github.com',
    confidence,
    ownership: 'unsure',
    count: items.length,
    firstSeen: '2026-01-01',
    lastSeen: '2026-01-09',
    signals: { receipt: items.length },
    evidence: items,
    source: 'scan',
  };
}

describe('round 4 address, backup, and evidence contracts', () => {
  it('does not treat an escaped comment parenthesis as the comment end', () => {
    expect(extractAddresses('(Support \\) fake@school.example) real@personal.example')).toEqual([
      'real@personal.example',
    ]);
    expect(extractAddresses('(Support \\) team@github.com) team@unrelated.example')).toEqual([
      'team@unrelated.example',
    ]);
  });

  it('accepts apostrophe and equals in an angle-addr local-part', () => {
    expect(extractAddresses("<o'connor@school.example>")).toEqual(["o'connor@school.example"]);
    expect(extractAddresses('<ada=class@school.example>')).toEqual(['ada=class@school.example']);
    expect(extractAddresses("To: o'connor@school.example")).toEqual(["o'connor@school.example"]);
  });

  it('imports a note and a backup larger than the old separate caps', () => {
    const workspace = emptyWorkspace();
    const task = workspace.tasks[0];
    expect(task).toBeTruthy();
    if (!task) return;
    task.notes = 'n'.repeat(100_001);
    const text = JSON.stringify(workspace);
    expect(text.length).toBeLessThan(WORKSPACE_LIMIT);
    expect(WORKSPACE_LIMIT).toBeGreaterThan(5_945_066);
    expect(parseWorkspace(text).tasks[0]?.notes).toHaveLength(100_001);
  });

  it('keeps school-match confidence when displayed evidence is capped', () => {
    const previous = account(Array.from({ length: 8 }, (_, index) => evidence(false, index + 1)));
    const incoming = account([evidence(true, 9)], 'Medium');
    incoming.signals = { receipt: 1 };
    incoming.count = 1;
    const merged = mergeAccounts([previous], [incoming])[0];
    expect(merged?.confidence).toBe('Medium');
    expect(merged?.schoolMatched).toBe(true);
    expect(merged?.evidence).toHaveLength(8);
    expect(merged?.evidence.some((item) => item.schoolMatch)).toBe(true);
    const restored = parseWorkspace(JSON.stringify({ ...emptyWorkspace(), accounts: [merged] }));
    expect(restored.accounts[0]?.confidence).toBe('Medium');
    expect(restored.accounts[0]?.schoolMatched).toBe(true);
  });
});
