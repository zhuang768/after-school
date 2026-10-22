import { deleteDatabase } from './store';

export async function wipeDeviceData(): Promise<void> {
  localStorage.clear();
  sessionStorage.clear();
  if ('caches' in globalThis) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }
  await deleteDatabase();
}
