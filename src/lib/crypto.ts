import type { Workspace } from '../types';

const ITERATIONS = 210_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    bytesToArrayBuffer(new TextEncoder().encode(password)),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: bytesToArrayBuffer(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptWorkspace(
  workspace: Workspace,
  password: string,
): Promise<{ salt: string; iv: string; data: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(workspace));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: bytesToArrayBuffer(iv) },
    key,
    bytesToArrayBuffer(encoded),
  );
  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(cipher)),
  };
}

export async function decryptWorkspace(
  payload: { salt: string; iv: string; data: string },
  password: string,
): Promise<Workspace> {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytesToArrayBuffer(iv) },
    key,
    bytesToArrayBuffer(base64ToBytes(payload.data)),
  );
  return JSON.parse(new TextDecoder().decode(plain)) as Workspace;
}
