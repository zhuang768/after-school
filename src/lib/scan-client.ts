import type { Account, CatalogEntry, ScanOptions } from '../types';
import { strings } from '../strings';

export interface ScanUpdate {
  bytesRead: number;
  messages: number;
  accounts: Account[];
  warnings: string[];
  done: boolean;
  error?: string;
  cancelled?: boolean;
}

export function scanInWorker(
  file: File,
  options: ScanOptions,
  catalog: Pick<CatalogEntry, 'id' | 'name' | 'domains'>[],
  onUpdate: (update: ScanUpdate) => void,
): { cancel: () => void } {
  const worker = new Worker(new URL('../parser/worker.ts', import.meta.url), { type: 'module' });
  let settled = false;
  worker.onmessage = (event: MessageEvent<ScanUpdate & { type: string; message?: string }>) => {
    const data = event.data;
    if (data.type === 'progress') {
      onUpdate({ ...data, warnings: [], done: false });
      return;
    }
    settled = true;
    if (data.type === 'done') onUpdate({ ...data, done: true });
    else if (data.type === 'cancelled')
      onUpdate({
        bytesRead: 0,
        messages: 0,
        accounts: [],
        warnings: [],
        done: true,
        cancelled: true,
      });
    else
      onUpdate({
        bytesRead: 0,
        messages: 0,
        accounts: [],
        warnings: [],
        done: true,
        error: data.message ?? strings.warnings.scanUnread,
      });
    worker.terminate();
  };
  worker.onerror = () => {
    if (settled) return;
    onUpdate({
      bytesRead: 0,
      messages: 0,
      accounts: [],
      warnings: [],
      done: true,
      error: strings.warnings.scanUnread,
    });
    worker.terminate();
  };
  worker.postMessage({ type: 'start', file, options, catalog });
  return {
    cancel: () => {
      if (settled) return;
      settled = true;
      onUpdate({
        bytesRead: 0,
        messages: 0,
        accounts: [],
        warnings: [],
        done: true,
        cancelled: true,
      });
      worker.postMessage({ type: 'cancel' });
      worker.terminate();
    },
  };
}
