const DB_NAME = 'after-school';
const STORE = 'kv';

export interface VaultRecord {
  salt: string;
  iv: string;
  data: string;
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

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE, mode);
    const result = await requestToPromise(run(transaction.objectStore(STORE)));
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB failed'));
    });
    return result;
  } finally {
    database.close();
  }
}

export async function readKey<T>(key: string): Promise<T | undefined> {
  return withStore('readonly', (store) => store.get(key));
}

export async function writeKey(key: string, value: unknown): Promise<void> {
  await withStore('readwrite', (store) => store.put(value, key));
}

export async function deleteKey(key: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(key));
}

export async function deleteDatabase(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('IndexedDB failed'));
    request.onblocked = () => reject(new Error('blocked'));
  });
}
