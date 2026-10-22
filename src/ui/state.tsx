import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Workspace } from '../types';
import { serviceCatalog } from '../data/catalog';
import { decryptWorkspace, encryptWorkspace } from '../lib/crypto';
import { syncTasks } from '../lib/tasks';
import { commitToken, dropIfCommit, recordMatchesEpoch, stripCommit } from '../lib/commit';
import { bumpEpoch, readEpoch } from '../lib/epoch';
import { deleteKey, readKey, writeKey, type VaultRecord } from '../lib/store';
import { WORKSPACE_LIMIT, emptyWorkspace, stripSubjects } from '../lib/workspace';
import { wipeDeviceData } from '../lib/wipe';
import { strings } from '../strings';

export type SavePhase = 'saving' | 'saved' | 'error';

interface Api {
  workspace: Workspace | null;
  locked: boolean;
  booting: boolean;
  error: string;
  savePhase: SavePhase;
  update: (recipe: (workspace: Workspace) => Workspace) => void;
  replace: (workspace: Workspace) => void;
  unlock: (password: string) => Promise<boolean>;
  setPassword: (password: string) => Promise<void>;
  clearPassword: (password: string) => Promise<boolean>;
  wipe: () => Promise<void>;
  encrypted: boolean;
}

const Context = createContext<Api | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [locked, setLocked] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [encrypted, setEncrypted] = useState(false);
  const [savePhase, setSavePhase] = useState<SavePhase>('saved');
  const password = useRef('');
  const allowSave = useRef(true);
  const generation = useRef(0);
  const revision = useRef(0);
  const latestRevision = useRef(0);
  const inflight = useRef<Promise<void>>(Promise.resolve());
  const writeTail = useRef<Promise<void>>(Promise.resolve());
  const enqueueRef = useRef<(snapshot: Workspace) => void>(() => undefined);
  const seenEpoch = useRef('');
  const unlockSerial = useRef(0);

  function current(token: number, rev: number): boolean {
    return token === generation.current && allowSave.current && rev === latestRevision.current;
  }

  function forgetLocalWorkspace(): void {
    generation.current += 1;
    allowSave.current = false;
    password.current = '';
    latestRevision.current += 1;
    setEncrypted(false);
    setLocked(false);
    setWorkspace(emptyWorkspace());
    setSavePhase('saved');
  }

  function enqueue(snapshot: Workspace): void {
    if (!allowSave.current) return;
    const token = generation.current;
    const rev = ++revision.current;
    latestRevision.current = rev;
    const secret = password.current;
    const epochAtStart = seenEpoch.current;
    const commitId = commitToken();
    setSavePhase('saving');
    const job = (async () => {
      const stored = stripSubjects({ ...snapshot, updatedAt: new Date().toISOString() });
      if (JSON.stringify(stored).length > WORKSPACE_LIMIT) {
        if (current(token, rev)) {
          setSavePhase('error');
          setError(strings.warnings.backupLimit);
        }
        return;
      }
      const prepared = secret ? await encryptWorkspace(stored, secret) : stored;
      const epochNow = await readEpoch();
      if (epochNow !== epochAtStart) {
        if (seenEpoch.current === epochAtStart) {
          seenEpoch.current = epochNow;
          forgetLocalWorkspace();
        }
        return;
      }
      if (!current(token, rev)) return;
      const retireStale = async (key: string): Promise<boolean> => {
        if ((await readEpoch()) === epochAtStart) return false;
        await dropIfCommit(key, commitId);
        if (seenEpoch.current === epochAtStart) {
          seenEpoch.current = await readEpoch();
          forgetLocalWorkspace();
        }
        return true;
      };
      const write = writeTail.current
        .catch(() => undefined)
        .then(async () => {
          const beforeWrite = await readEpoch();
          if (beforeWrite !== epochAtStart || !current(token, rev)) return;
          if (secret) {
            await writeKey('vault', { ...prepared, commitId, epoch: epochAtStart });
            if (await retireStale('vault')) return;
            if (!current(token, rev)) return;
            await deleteKey('workspace');
            return;
          }
          await writeKey('workspace', { ...stored, commitId, epoch: epochAtStart });
          if (await retireStale('workspace')) return;
          if (!current(token, rev)) return;
          await deleteKey('vault');
        });
      writeTail.current = write;
      await write;
      if (current(token, rev) && (await readEpoch()) === epochAtStart) {
        setSavePhase('saved');
        setError((value) => (value === strings.warnings.saveWrite ? '' : value));
      }
    })().catch(() => {
      if (current(token, rev)) {
        setSavePhase('error');
        setError(strings.warnings.saveWrite);
      }
    });
    inflight.current = job;
  }
  enqueueRef.current = enqueue;

  useEffect(() => {
    const onWipe = () => {
      void readEpoch().then((epoch) => {
        seenEpoch.current = epoch;
        forgetLocalWorkspace();
      });
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'after-school-epoch') onWipe();
    };
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('after-school-wipe');
      channel.onmessage = () => onWipe();
    } catch {
      channel = null;
    }
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    const token = generation.current;
    let cancel = false;
    void (async () => {
      try {
        const epochAtStart = await readEpoch();
        seenEpoch.current = epochAtStart;
        if (cancel || token !== generation.current || !allowSave.current) return;
        const vault = await readKey<VaultRecord>('vault');
        if (
          cancel ||
          token !== generation.current ||
          !allowSave.current ||
          (await readEpoch()) !== epochAtStart
        ) {
          return;
        }
        if (vault?.data && recordMatchesEpoch(vault, epochAtStart)) {
          setEncrypted(true);
          setLocked(true);
          setWorkspace(null);
        } else {
          const plain = await readKey<Workspace>('workspace');
          if (
            cancel ||
            token !== generation.current ||
            !allowSave.current ||
            (await readEpoch()) !== epochAtStart
          ) {
            return;
          }
          setWorkspace(
            plain && recordMatchesEpoch(plain, epochAtStart)
              ? stripCommit(plain)
              : emptyWorkspace(),
          );
        }
      } catch {
        if (!cancel && token === generation.current) setError(strings.warnings.saveOpen);
      } finally {
        if (!cancel) setBooting(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!workspace || locked || !allowSave.current) return;
    enqueueRef.current(workspace);
  }, [workspace, locked]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (savePhase !== 'saving') return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [savePhase]);

  useEffect(() => {
    document.documentElement.dataset.theme = workspace?.preferences.theme ?? 'system';
  }, [workspace?.preferences.theme]);

  const api = useMemo<Api>(
    () => ({
      workspace,
      locked,
      booting,
      error,
      savePhase,
      encrypted,
      update: (recipe) => {
        allowSave.current = true;
        if (workspace) setSavePhase('saving');
        setWorkspace((current) => {
          if (!current) return current;
          const next = recipe(current);
          return {
            ...next,
            tasks: syncTasks(next, serviceCatalog),
            updatedAt: new Date().toISOString(),
          };
        });
      },
      replace: (next) => {
        allowSave.current = true;
        setSavePhase('saving');
        setLocked(false);
        setWorkspace({
          ...next,
          tasks: syncTasks(next, serviceCatalog),
          updatedAt: new Date().toISOString(),
        });
      },
      unlock: async (value) => {
        const operation = ++unlockSerial.current;
        const token = generation.current;
        const epochAtStart = seenEpoch.current;
        const vault = await readKey<VaultRecord>('vault');
        if (
          operation !== unlockSerial.current ||
          token !== generation.current ||
          !allowSave.current ||
          (await readEpoch()) !== epochAtStart
        ) {
          return false;
        }
        if (!vault?.data || !recordMatchesEpoch(vault, epochAtStart)) return false;
        try {
          const opened = await decryptWorkspace(vault, value);
          if (
            operation !== unlockSerial.current ||
            token !== generation.current ||
            !allowSave.current ||
            (await readEpoch()) !== epochAtStart
          ) {
            return false;
          }
          password.current = value;
          setEncrypted(true);
          setWorkspace(opened);
          setLocked(false);
          setError('');
          return true;
        } catch {
          return false;
        }
      },
      setPassword: async (value) => {
        allowSave.current = true;
        generation.current += 1;
        password.current = value;
        setEncrypted(true);
        if (workspace) enqueueRef.current(workspace);
        await inflight.current;
      },
      clearPassword: async (value) => {
        if (password.current && value !== password.current) return false;
        allowSave.current = true;
        generation.current += 1;
        password.current = '';
        setEncrypted(false);
        if (workspace) enqueueRef.current(workspace);
        await inflight.current;
        return true;
      },
      wipe: async () => {
        generation.current += 1;
        allowSave.current = false;
        password.current = '';
        setEncrypted(false);
        setLocked(false);
        try {
          seenEpoch.current = await bumpEpoch();
        } catch (error) {
          allowSave.current = true;
          setSavePhase('error');
          setError(
            error instanceof DOMException && error.name === 'QuotaExceededError'
              ? strings.warnings.wipeQuota
              : strings.warnings.wipeFailed,
          );
          return;
        }
        try {
          await wipeDeviceData();
        } catch (error) {
          const blocked = error instanceof Error && error.message === 'blocked';
          setSavePhase('error');
          setError(blocked ? strings.warnings.wipeBlocked : strings.warnings.wipeFailed);
          return;
        }
        setWorkspace(emptyWorkspace());
        setSavePhase('saved');
        setError((value) =>
          value === strings.warnings.wipeBlocked ||
          value === strings.warnings.wipeQuota ||
          value === strings.warnings.wipeFailed
            ? ''
            : value,
        );
      },
    }),
    [workspace, locked, booting, error, encrypted, savePhase],
  );

  return <Context.Provider value={api}>{children}</Context.Provider>;
}

export function useWorkspace(): Api {
  const value = useContext(Context);
  if (!value) throw new Error('Workspace missing');
  return value;
}
