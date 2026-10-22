const DB_NAME = 'after-school';
const STORE = 'kv';

export function commitToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Drop storage metadata before the record is copied into React state or an export. */
export function stripCommit<T>(value: T): T {
  if (!value || typeof value !== 'object' || !('commitId' in value || 'epoch' in value))
    return value;
  const copy = { ...(value as Record<string, unknown>) };
  delete copy.commitId;
  delete copy.epoch;
  return copy as T;
}

/**
 * A record with no epoch was saved before generations were stamped and can still be opened.
 * A stamped record belongs only to that wipe generation.
 */
export function recordMatchesEpoch(record: unknown, epoch: string): boolean {
  if (!record || typeof record !== 'object') return false;
  const stamped = (record as { epoch?: unknown }).epoch;
  if (typeof stamped !== 'string') return true;
  return stamped === epoch;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed'));
  });
}

/**
 * Delete one key only when it still holds this write's commit id.
 * IndexedDB runs the read and delete in one transaction, so a newer save is left in place.
 */
export async function dropIfCommit(key: string, commitId: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    const request = store.get(key);
    request.onsuccess = () => {
      const current = request.result as { commitId?: unknown } | undefined;
      if (current && current.commitId === commitId) store.delete(key);
    };
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB failed'));
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB failed'));
    });
  } finally {
    database.close();
  }
}
