const DB_NAME = 'after-school-control';
const STORE = 'kv';
const EPOCH_KEY = 'epoch';

function openControl(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed'));
  });
}

async function controlGet(): Promise<string> {
  const database = await openControl();
  try {
    const transaction = database.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(EPOCH_KEY);
    const value = await new Promise<unknown>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB failed'));
    });
    return typeof value === 'string' ? value : '';
  } finally {
    database.close();
  }
}

async function controlPut(value: string): Promise<void> {
  const database = await openControl();
  try {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(value, EPOCH_KEY);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB failed'));
    });
  } finally {
    database.close();
  }
}

/** Epoch shared by every tab. It lives outside the wiped app database. */
export async function readEpoch(): Promise<string> {
  try {
    return await controlGet();
  } catch {
    return '';
  }
}

export function deleteAppDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('after-school');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed'));
    request.onblocked = () => reject(new Error('blocked'));
  });
}

export async function bumpEpoch(): Promise<string> {
  const next = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  await controlPut(next);
  try {
    const channel = new BroadcastChannel('after-school-wipe');
    channel.postMessage({ epoch: next });
    channel.close();
  } catch {
    // BroadcastChannel is absent on file pages in some engines. The epoch read still protects writes.
  }
  return next;
}
