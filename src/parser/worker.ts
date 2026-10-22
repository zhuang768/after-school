import type { Account, ScanOptions } from '../types';
import type { CatalogEntry } from '../types';
import { strings } from '../strings';
import { scanReadable } from './scan';

interface StartMessage {
  type: 'start';
  file: File;
  options: ScanOptions;
  catalog: Pick<CatalogEntry, 'id' | 'name' | 'domains'>[];
}

type Incoming = StartMessage | { type: 'cancel' };

let controller: AbortController | null = null;

globalThis.addEventListener('message', (event: Event) => {
  const message = (event as MessageEvent<Incoming>).data;
  if (!message || message.type === 'cancel') {
    controller?.abort();
    return;
  }
  controller = new AbortController();
  const active = controller;
  void scanReadable(
    message.file.stream(),
    message.options,
    message.catalog,
    {
      onProgress: (update) => {
        globalThis.postMessage({ type: 'progress', ...update });
      },
    },
    active.signal,
  )
    .then((result) => {
      const payload: {
        type: 'done';
        accounts: Account[];
        messages: number;
        skipped: number;
        warnings: string[];
      } = {
        type: 'done',
        accounts: result.accounts,
        messages: result.messages,
        skipped: result.skipped,
        warnings: result.warnings,
      };
      globalThis.postMessage(payload);
    })
    .catch((error: unknown) => {
      const name = error instanceof DOMException ? error.name : '';
      globalThis.postMessage({
        type: name === 'AbortError' ? 'cancelled' : 'error',
        message:
          error instanceof Error && error.message.startsWith('This archive')
            ? error.message
            : strings.warnings.scanUnread,
      });
    });
});
