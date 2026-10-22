import type { Workspace } from '../types';
import type { PlannedTask } from './planning';
import { effectiveExpiry, progress } from './planning';
import { strings } from '../strings';

export function buildReport(
  workspace: Workspace,
  planned: PlannedTask[],
  now = new Date(),
): string {
  const summary = progress(workspace);
  const expiry = effectiveExpiry(workspace.preferences);
  const lines = [
    strings.report.title,
    `${strings.report.generated}: ${now.toISOString()}`,
    strings.report.local,
    workspace.demo ? strings.report.synthetic : '',
    '',
    `${strings.report.progress}: ${summary.done}/${summary.total} ${strings.report.completed} (${summary.percent}%)`,
    expiry.date
      ? `${strings.report.deadline}: ${expiry.date}${expiry.assumed ? ` ${strings.report.assumed}` : ''}`
      : `${strings.report.deadline}: ${strings.report.unknown}`,
    workspace.preferences.schoolPolicy
      ? `${strings.report.policy}: ${workspace.preferences.schoolPolicy}`
      : '',
    '',
    strings.report.accounts,
    ...workspace.accounts.map((account) => {
      const ownership = strings.report.ownership[account.ownership];
      return `- ${account.name} (${account.domain}) — ${strings.report.likely}, ${account.confidence}, ${ownership}, ${account.count}`;
    }),
    '',
    strings.report.tasks,
    ...workspace.tasks.map((task) => {
      const plannedItem = planned.find((item) => item.task.id === task.id);
      const due = plannedItem?.dueDate ? `${strings.report.due} ${plannedItem.dueDate}` : '';
      const notes = task.notes ? `${strings.report.notes}: ${task.notes}` : '';
      return `- ${task.title}: ${strings.status[task.status]} ${due} ${notes}`.trim();
    }),
    workspace.tasks.length === 0 ? strings.report.noTasks : '',
    '',
  ];
  return lines.filter((line) => line !== undefined).join('\n');
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

const PDF_TEXT_WIDTH = 500;
/** Adobe Helvetica AFM advances, characters 32–126, in thousandths of an em. */
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
  556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667,
  611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
  667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500,
  222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

function textWidth(value: string): number {
  let width = 0;
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const units = code >= 32 && code <= 126 ? (HELVETICA[code - 32] ?? 1000) : 1000;
    width += (units * 11) / 1000;
  }
  return width;
}

/** A small text-only PDF. Characters outside WinAnsi are replaced. */
export function buildPdf(text: string): Uint8Array {
  const printable = text.replace(/[^\n\t\x20-\x7e]/g, '?');
  const wrapped: string[] = [];
  for (const paragraph of printable.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      wrapped.push('');
      continue;
    }
    let line = '';
    const piecesOf = (word: string): string[] => {
      const pieces: string[] = [];
      let piece = '';
      for (const char of word) {
        const next = piece + char;
        if (piece && textWidth(next) > PDF_TEXT_WIDTH) {
          pieces.push(piece);
          piece = char;
        } else piece = next;
      }
      if (piece) pieces.push(piece);
      return pieces;
    };
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (textWidth(next) > PDF_TEXT_WIDTH) {
        if (line) wrapped.push(line);
        const pieces = piecesOf(word);
        wrapped.push(...pieces.slice(0, -1));
        line = pieces.at(-1) ?? '';
      } else line = next;
    }
    if (line) wrapped.push(line);
  }
  const pages: string[][] = [];
  for (let index = 0; index < wrapped.length; index += 46)
    pages.push(wrapped.slice(index, index + 46));
  if (pages.length === 0) pages.push(['']);
  const objects: string[] = [];
  const pageIds: number[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  const pageObjectStart = 3;
  for (let index = 0; index < pages.length; index += 1) {
    pageIds.push(pageObjectStart + index * 2);
  }
  objects.push(
    `<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`,
  );
  pages.forEach((page, index) => {
    const contentId = pageObjectStart + index * 2 + 1;
    const commands = ['BT', '/F1 11 Tf', '50 780 Td', '14 TL'];
    page.forEach((line, lineIndex) => {
      if (lineIndex === 0) commands.push(`(${pdfEscape(line)}) Tj`);
      else commands.push('T*', `(${pdfEscape(line)}) Tj`);
    });
    commands.push('ET');
    const stream = commands.join('\n');
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>`,
    );
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  let body = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (let index = 1; index < offsets.length; index += 1) {
    body += `${offsets[index].toString().padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(body);
}
