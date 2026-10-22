import { describe, expect, it } from 'vitest';
import { buildCalendar } from '../src/lib/ics';
import { buildPdf, buildReport } from '../src/lib/report';
import { emptyWorkspace, parseWorkspace } from '../src/lib/workspace';
import { encryptWorkspace, decryptWorkspace } from '../src/lib/crypto';

describe('exports', () => {
  it('builds a calendar with a display alarm', () => {
    const text = buildCalendar(
      [
        {
          task: {
            id: 'task:school:mail',
            title: 'Export school email',
            type: 'export',
            status: 'not-started',
            notes: 'Lab notes',
            completedSteps: [],
            createdAt: '2026-10-19T00:00:00.000Z',
            kind: 'mail',
          },
          score: 10,
          reasons: ['expiry-assumed'],
          dueDate: '2026-11-01',
          overdue: false,
        },
      ],
      emptyWorkspace().preferences,
      new Date('2026-10-19T00:00:00Z'),
    );
    expect(text).toContain('BEGIN:VCALENDAR');
    expect(text).toContain('BEGIN:VALARM');
    expect(text).toContain('TRIGGER:-P1D');
    expect(text).toContain('DTSTART;VALUE=DATE:20261101');
  });

  it('writes a text report and a PDF that stays local', () => {
    const workspace = emptyWorkspace();
    const report = buildReport(workspace, [], new Date('2026-10-19T00:00:00Z'));
    expect(report).toContain('Migration report');
    const pdf = buildPdf(report);
    expect(new TextDecoder().decode(pdf.slice(0, 8))).toBe('%PDF-1.4');
  });

  it('round-trips a workspace and rejects a broken file', () => {
    const workspace = emptyWorkspace();
    workspace.preferences.schoolDomains = ['school.example'];
    const parsed = parseWorkspace(JSON.stringify(workspace));
    expect(parsed.preferences.schoolDomains).toEqual(['school.example']);
    expect(() => parseWorkspace('{')).toThrow();
    expect(() => parseWorkspace('{"version":1}')).toThrow();
  });

  it('encrypts so the ciphertext is not the workspace text', async () => {
    const workspace = emptyWorkspace();
    workspace.preferences.schoolPolicy = 'synthetic policy';
    const vault = await encryptWorkspace(workspace, 'correct horse');
    expect(vault.data.includes('synthetic')).toBe(false);
    await expect(decryptWorkspace(vault, 'wrong password')).rejects.toThrow();
    const opened = await decryptWorkspace(vault, 'correct horse');
    expect(opened.preferences.schoolPolicy).toBe('synthetic policy');
  });
});
