import type { PlannedTask } from './planning';
import type { Preferences } from '../types';
import { strings } from '../strings';

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function safeUid(id: string): string {
  let hex = '';
  for (const byte of new TextEncoder().encode(id)) hex += byte.toString(16).padStart(2, '0');
  return `${hex}@after-school.local`;
}

function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 73) return line;
  const parts: string[] = [];
  let start = 0;
  let first = true;
  while (start < bytes.length) {
    const limit = first ? 73 : 72;
    let end = Math.min(bytes.length, start + limit);
    while (end > start && (bytes[end] & 0xc0) === 0x80) end -= 1;
    if (end === start) end = Math.min(bytes.length, start + limit);
    const piece = new TextDecoder().decode(bytes.slice(start, end));
    parts.push(first ? piece : ` ${piece}`);
    first = false;
    start = end;
  }
  return parts.join('\r\n');
}

function stamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function dateValue(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

export function buildCalendar(
  planned: PlannedTask[],
  preferences: Preferences,
  now = new Date(),
): string {
  void preferences;
  const dated = planned.filter((item) => item.dueDate);
  const undated = planned.filter((item) => !item.dueDate);
  const events = dated.map((item) => {
    const description = [
      strings.calendar.privacy,
      item.reasons.includes('expiry-assumed') ? strings.calendar.assumed : '',
      item.task.notes,
    ]
      .filter(Boolean)
      .join('\n');
    const lines = [
      'BEGIN:VEVENT',
      `UID:${safeUid(item.task.id)}`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${dateValue(item.dueDate)}`,
      `SUMMARY:${escapeText(item.task.title)}`,
      `DESCRIPTION:${escapeText(description)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(strings.calendar.reminder)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
    ];
    return lines.map(fold).join('\r\n');
  });
  const todos = undated.map((item) => {
    const lines = [
      'BEGIN:VTODO',
      `UID:${safeUid(item.task.id)}`,
      `DTSTAMP:${stamp(now)}`,
      `SUMMARY:${escapeText(item.task.title)}`,
      `DESCRIPTION:${escapeText(strings.calendar.needsDate)}`,
      'STATUS:NEEDS-ACTION',
      'END:VTODO',
    ];
    return lines.map(fold).join('\r\n');
  });
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${strings.calendar.product}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${strings.calendar.name}`,
    ...events,
    ...todos,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
