import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { serviceCatalog } from '../data/catalog';
import { registrableDomain } from '../parser/domains';
import { buildCalendar } from '../lib/ics';
import { officialLinkAllowed } from '../lib/links';
import { confidenceFor } from '../parser/classify';
import { daysUntil, effectiveExpiry, localDate, planTasks, progress } from '../lib/planning';
import { buildPdf, buildReport } from '../lib/report';
import { scanInWorker } from '../lib/scan-client';
import { demoWorkspace } from '../lib/demo';
import { WORKSPACE_LIMIT, downloadBlob, parseWorkspace } from '../lib/workspace';
import { genericChecklist, strings } from '../strings';
import type { Account, CatalogEntry, Evidence, Task, Workspace } from '../types';
import { useWorkspace } from './state';

function route() {
  const parts = (location.hash || '#/start').replace(/^#\/?/, '').split('/');
  return { name: parts[0] || 'start', id: parts[1] ? decodeURIComponent(parts[1]) : '' };
}

function useRoute() {
  const [current, setCurrent] = useState(route);
  useEffect(() => {
    const sync = () => setCurrent(route());
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a');
      const href = link?.getAttribute('href');
      if (!link || !href?.startsWith('#/')) return;
      event.preventDefault();
      if (location.hash !== href) location.hash = href;
      sync();
    };
    window.addEventListener('hashchange', sync);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('click', onClick);
    };
  }, []);
  useEffect(() => {
    document.getElementById('page-title')?.focus();
  }, [current.name, current.id]);
  return current;
}

export function App() {
  const api = useWorkspace();
  const current = useRoute();
  if (api.booting) return <p className="loading">{strings.accounts.scanning}</p>;
  if (api.locked) return <Unlock />;
  if (!api.workspace) return <p role="alert">{api.error || strings.errors.summary}</p>;
  const workspace = api.workspace;
  if (!workspace.onboarded && current.name === 'start') {
    return (
      <Shell workspace={workspace}>
        <Start />
      </Shell>
    );
  }
  return (
    <Shell workspace={workspace}>
      {current.name === 'accounts' && <Accounts id={current.id} />}
      {current.name === 'task' && <Guide id={current.id} />}
      {current.name === 'timeline' && <Timeline />}
      {current.name === 'catalog' && <Catalog />}
      {current.name === 'settings' && <Settings />}
      {current.name === 'privacy' && <Privacy />}
      {current.name === 'method' && <Method />}
      {current.name === 'report' && <Report />}
      {(current.name === 'today' || current.name === 'start' || current.name === '') && <Today />}
    </Shell>
  );
}

function Shell({ workspace, children }: { workspace: Workspace; children: ReactNode }) {
  const api = useWorkspace();
  const summary = progress(workspace);
  const items = [
    ['today', strings.nav.today],
    ['accounts', strings.nav.accounts],
    ['timeline', strings.nav.timeline],
    ['catalog', strings.nav.catalog],
    ['settings', strings.nav.settings],
    ['privacy', strings.nav.privacy],
    ['method', strings.nav.method],
  ] as const;
  return (
    <>
      <a className="skip" href="#main">
        {strings.skip}
      </a>
      <div className="frame">
        <header className="rail">
          <p className="mark">{strings.product}</p>
          <p className="promise">{strings.privacyPromise}</p>
          <Progress percent={summary.percent} label={`${summary.done}/${summary.total}`} />
          <nav aria-label={strings.product}>
            {items.map(([id, label]) => (
              <a
                key={id}
                href={`#/${id}`}
                aria-current={location.hash.includes(id) ? 'page' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
        </header>
        <main id="main">
          <p aria-live="polite">
            {api.savePhase === 'saving'
              ? strings.save.saving
              : api.savePhase === 'error'
                ? strings.save.error
                : strings.save.saved}
          </p>
          {api.error ? <p role="alert">{api.error}</p> : null}
          {workspace.demo ? <p className="banner">{strings.demoBanner}</p> : null}
          {children}
        </main>
      </div>
    </>
  );
}

function Progress({ percent, label }: { percent: number; label: string }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  return (
    <div className="progress" role="img" aria-label={`${strings.progressLabel} ${percent}%`}>
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r={radius} />
        <circle cx="36" cy="36" r={radius} strokeDasharray={`${(percent / 100) * circ} ${circ}`} />
      </svg>
      <span>{label}</span>
    </div>
  );
}

function Start() {
  const api = useWorkspace();
  const [domain, setDomain] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [problem, setProblem] = useState('');
  const errorId = useId();
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.start.title}
      </h1>
      <p>{strings.start.body}</p>
      <p className="promise">{strings.privacyPromise}</p>
      <div className="actions">
        <button type="button" onClick={() => api.replace({ ...demoWorkspace(), onboarded: true })}>
          {strings.start.demo}
        </button>
        <button
          type="button"
          className="quiet"
          onClick={() => api.update((workspace) => ({ ...workspace, onboarded: true }))}
        >
          {strings.start.empty}
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const normalized = registrableDomain(domain);
          if (!normalized) {
            setProblem(strings.manual.invalid);
            return;
          }
          setDomains((current) =>
            current.includes(normalized) ? current : [...current, normalized],
          );
          setDomain('');
          setProblem('');
        }}
      >
        {problem ? (
          <div role="alert" id={errorId} tabIndex={-1}>
            <h2>{strings.errors.summary}</h2>
            <p>{problem}</p>
          </div>
        ) : null}
        <label htmlFor="school-domain">{strings.start.domainsLabel}</label>
        <p id="domain-hint">{strings.start.domainsHint}</p>
        <input
          id="school-domain"
          aria-describedby={problem ? errorId : 'domain-hint'}
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
        />
        <button type="submit">{strings.start.addDomain}</button>
        <ul>
          {domains.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            api.update((workspace) => ({
              ...workspace,
              onboarded: true,
              preferences: { ...workspace.preferences, schoolDomains: domains },
            }))
          }
        >
          {strings.start.continue}
        </button>
      </form>
    </section>
  );
}

function Unlock() {
  const api = useWorkspace();
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState('');
  return (
    <main className="lock">
      <h1>{strings.settings.locked}</h1>
      <p>{strings.settings.encryptHint}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void api
            .unlock(password)
            .then((ok) => setProblem(ok ? '' : strings.settings.wrongPassword));
        }}
      >
        {problem ? <p role="alert">{problem}</p> : null}
        <label htmlFor="unlock-password">{strings.settings.password}</label>
        <input
          id="unlock-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <button type="submit">{strings.settings.unlock}</button>
        <button type="button" className="quiet" onClick={() => void api.wipe()}>
          {strings.settings.wipe}
        </button>
      </form>
    </main>
  );
}

function Today() {
  const { workspace, update } = useWorkspace();
  useEffect(() => {
    if (!workspace || !('Notification' in window) || Notification.permission !== 'granted') return;
    const due = planTasks(workspace, serviceCatalog).some(
      (item) => item.overdue || item.dueDate === localDate(new Date()),
    );
    if (!due || sessionStorage.getItem('after-school-notified')) return;
    sessionStorage.setItem('after-school-notified', '1');
    new Notification(strings.notify.title, { body: strings.notify.body });
  }, [workspace]);
  if (!workspace) return null;
  const now = new Date();
  const planned = planTasks(workspace, serviceCatalog, now);
  const expiry = effectiveExpiry(workspace.preferences);
  const remaining = expiry.date ? daysUntil(expiry.date, now) : null;
  const today = planned.filter((item) => item.overdue || item.dueDate === localDate(now));
  const upcoming = planned.filter((item) => !today.includes(item)).slice(0, 5);
  const recovery = workspace.accounts.filter(
    (account) => (account.signals.password ?? 0) > 0 && account.ownership !== 'not-mine',
  );
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.today.title}
      </h1>
      <p role="status">
        {remaining !== null && expiry.date ? (
          <>
            <span>{strings.countdown.remaining(remaining, expiry.date)}</span>
            {expiry.assumed ? <span> {strings.timeline.assumed}</span> : null}
          </>
        ) : (
          strings.countdown.unknown
        )}
      </p>
      {remaining !== null && remaining < 0 ? (
        <div className="banner" role="status">
          <h2>{strings.today.expiredTitle}</h2>
          <p>{strings.today.expiredBody}</p>
          <ol>
            <li>{strings.expired.contact}</li>
            <li>{strings.expired.recovery}</li>
            <li>{strings.expired.template}</li>
            <li>
              {strings.expired.expect}{' '}
              <a
                href={strings.schoolGuideMeta.mail[3].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {strings.schoolGuideMeta.mail[3].label}
              </a>{' '}
              {strings.sourcesNote} {strings.schoolGuideMeta.verifiedAt}
            </li>
          </ol>
        </div>
      ) : null}
      {remaining !== null && remaining >= 0 && remaining <= 30 ? (
        <p className="banner" role="status">
          {strings.today.banner}
        </p>
      ) : null}
      <h2>{strings.today.overdue}</h2>
      <TaskList items={today} empty={strings.today.empty} />
      <h2>{strings.today.next}</h2>
      <TaskList items={upcoming} empty={strings.today.empty} />
      <h2>{strings.tasks.completed}</h2>
      {workspace.tasks.some((task) => task.status === 'done') ? (
        <ul className="stack">
          {workspace.tasks
            .filter((task) => task.status === 'done')
            .map((task) => (
              <li key={task.id}>
                <a href={`#/task/${encodeURIComponent(task.id)}`}>{task.title}</a>
                {task.notes ? <span>{task.notes}</span> : null}
              </li>
            ))}
        </ul>
      ) : (
        <p>{strings.today.empty}</p>
      )}
      <h2>{strings.recovery.title}</h2>
      <p>{strings.recovery.body}</p>
      <Copy text={strings.contactTemplate} label={strings.tasks.copy} />
      {recovery.length === 0 ? (
        <p>{strings.recovery.empty}</p>
      ) : (
        <ul className="stack">
          {recovery.map((account) => (
            <li key={account.id}>
              <a href={`#/accounts/${encodeURIComponent(account.id)}`}>{account.name}</a>
            </li>
          ))}
        </ul>
      )}
      <h2>{strings.itTemplate.title}</h2>
      <pre>{strings.itNote}</pre>
      <Copy text={strings.itNote} label={strings.itTemplate.copy} />
      <label className="check" htmlFor="policy-note">
        <span>{strings.settings.policy}</span>
      </label>
      <textarea
        id="policy-note"
        value={workspace.preferences.schoolPolicy}
        onChange={(event) =>
          update((current) => ({
            ...current,
            preferences: { ...current.preferences, schoolPolicy: event.target.value },
          }))
        }
      />
    </section>
  );
}

function TaskList({ items, empty }: { items: ReturnType<typeof planTasks>; empty: string }) {
  const listRef = useRef<HTMLOListElement>(null);
  const previous = useRef(new Map<string, DOMRect>());
  useEffect(() => {
    const list = listRef.current;
    if (!list || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const node of list.querySelectorAll<HTMLElement>('[data-flip]')) {
      const id = node.dataset.flip ?? '';
      const next = node.getBoundingClientRect();
      const before = previous.current.get(id);
      if (before) {
        const dy = before.top - next.top;
        if (dy)
          node.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
            duration: 220,
          });
      }
      previous.current.set(id, next);
    }
  }, [items]);
  if (items.length === 0) return <p>{empty}</p>;
  return (
    <ol className="stack" ref={listRef}>
      {items.map((item) => (
        <li key={item.task.id} data-flip={item.task.id}>
          <a href={`#/task/${encodeURIComponent(item.task.id)}`}>{item.task.title}</a>
          <span>{strings.status[item.task.status]}</span>
          {item.dueDate ? <span>{item.dueDate}</span> : null}
          {item.overdue ? <span>{strings.today.overdue}</span> : null}
        </li>
      ))}
    </ol>
  );
}

function Accounts({ id }: { id: string }) {
  const { workspace, update } = useWorkspace();
  const [scan, setScan] = useState<{
    messages: number;
    bytes: number;
    running: boolean;
    error: string;
    warnings: string[];
  }>({
    messages: 0,
    bytes: 0,
    running: false,
    error: '',
    warnings: [],
  });
  const cancelRef = useRef<{ cancel: () => void } | null>(null);
  const [live, setLive] = useState<Account[] | null>(null);
  if (!workspace) return null;
  const selected = workspace.accounts.find((account) => account.id === id);
  const rows = live ?? workspace.accounts;
  const mobile = window.matchMedia('(max-width: 800px)').matches;
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.accounts.title}
      </h1>
      <p>{strings.accounts.intro}</p>
      {mobile ? <p>{strings.accounts.mobile}</p> : null}
      <p>
        {strings.accounts.unsupported}{' '}
        <a href={strings.schoolGuideMeta.mail[5].url} target="_blank" rel="noopener noreferrer">
          {strings.schoolGuideMeta.mail[5].label}
        </a>
        {' · '}
        <a href={strings.schoolGuideMeta.mail[6].url} target="_blank" rel="noopener noreferrer">
          {strings.schoolGuideMeta.mail[6].label}
        </a>
      </p>
      <div className="actions">
        <label className="file">
          {strings.accounts.import}
          <input
            type="file"
            accept=".mbox,.eml,.zip,message/rfc822,application/zip"
            multiple
            onChange={(event) => {
              const files = [...(event.target.files ?? [])];
              event.target.value = '';
              if (files.length === 0 || !workspace) return;
              const bad = files.find((file) => !/\.(mbox|eml|zip)$/i.test(file.name));
              if (bad) {
                setScan((current) => ({ ...current, error: strings.accounts.unsupported }));
                return;
              }
              setScan({ messages: 0, bytes: 0, running: true, error: '', warnings: [] });
              const run = (index: number, collected: Account[]) => {
                const file = files[index];
                if (!file) {
                  setLive(null);
                  setScan((current) => ({ ...current, running: false }));
                  return;
                }
                cancelRef.current = scanInWorker(
                  file,
                  {
                    schoolDomains: workspace.preferences.schoolDomains,
                    saveSubjects: workspace.preferences.saveSubjects,
                  },
                  serviceCatalog.map((entry) => ({
                    id: entry.id,
                    name: entry.name,
                    domains: entry.domains,
                  })),
                  (result) => {
                    if (result.cancelled || result.error) {
                      setScan((current) => ({
                        ...current,
                        running: false,
                        error: result.error ?? '',
                        warnings: result.warnings,
                      }));
                      setLive(null);
                      return;
                    }
                    setScan({
                      messages: result.messages,
                      bytes: result.bytesRead,
                      running: !result.done,
                      error: '',
                      warnings: result.warnings,
                    });
                    if (result.accounts.length)
                      setLive(
                        mergeAccounts(workspace.accounts, [...collected, ...result.accounts]),
                      );
                    if (result.done) {
                      const merged = mergeAccounts(collected, result.accounts);
                      update((current) => ({
                        ...current,
                        accounts: mergeAccounts(current.accounts, result.accounts),
                      }));
                      setLive(null);
                      run(index + 1, merged);
                    }
                  },
                );
              };
              run(0, []);
            }}
          />
        </label>
        {scan.running ? (
          <button type="button" onClick={() => cancelRef.current?.cancel()}>
            {strings.accounts.cancel}
          </button>
        ) : null}
      </div>
      <p role="status" aria-live="polite">
        {scan.running ? `${strings.accounts.scanning}: ${scan.messages}` : scan.error}
      </p>
      {scan.warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
      {rows.length === 0 ? (
        <p>{strings.accounts.empty}</p>
      ) : (
        <ol className="stack">
          {rows.map((account) => (
            <li key={account.id} className="arrive">
              <a href={`#/accounts/${encodeURIComponent(account.id)}`}>{account.name}</a>
              <span>
                {strings.likely} · {strings.confidence[account.confidence]}
              </span>
              <span>{account.count}</span>
            </li>
          ))}
        </ol>
      )}
      {selected ? <AccountDetail account={selected} /> : null}
      <ManualAdd />
    </section>
  );
}

function sawSchool(account: Account): boolean {
  return account.schoolMatched === true || account.evidence.some((item) => item.schoolMatch);
}

/** Keep at most eight rows, and keep one school-match row when the aggregate had one. */
function boundEvidence(items: Evidence[]): Evidence[] {
  if (items.length <= 8) return items;
  const school = items.filter((item) => item.schoolMatch);
  const other = items.filter((item) => !item.schoolMatch);
  const kept = school.length > 0 ? [...other, school[school.length - 1]!] : other;
  return kept.slice(-8);
}

export function mergeAccounts(existing: Account[], incoming: Account[]): Account[] {
  const map = new Map(existing.map((account) => [account.id, account]));
  for (const account of incoming) {
    const previous = map.get(account.id);
    if (!previous) {
      map.set(account.id, {
        ...account,
        schoolMatched: sawSchool(account),
        evidence: boundEvidence(account.evidence),
      });
      continue;
    }
    const schoolMatched = sawSchool(previous) || sawSchool(account);
    const signals = {
      welcome: (previous.signals.welcome ?? 0) + (account.signals.welcome ?? 0),
      verification: (previous.signals.verification ?? 0) + (account.signals.verification ?? 0),
      password: (previous.signals.password ?? 0) + (account.signals.password ?? 0),
      receipt: (previous.signals.receipt ?? 0) + (account.signals.receipt ?? 0),
      security: (previous.signals.security ?? 0) + (account.signals.security ?? 0),
      marketing: (previous.signals.marketing ?? 0) + (account.signals.marketing ?? 0),
    };
    map.set(account.id, {
      ...previous,
      count: previous.count + account.count,
      confidence: confidenceFor(signals, schoolMatched) ?? previous.confidence,
      schoolMatched,
      firstSeen: [previous.firstSeen, account.firstSeen].filter(Boolean).sort()[0] ?? '',
      lastSeen: [previous.lastSeen, account.lastSeen].filter(Boolean).sort().at(-1) ?? '',
      signals,
      evidence: boundEvidence([...previous.evidence, ...account.evidence]),
    });
  }
  return [...map.values()];
}

function AccountDetail({ account }: { account: Account }) {
  const { update } = useWorkspace();
  const entry = serviceCatalog.find((item) => item.id === account.serviceId);
  return (
    <article>
      <h2>{account.name}</h2>
      <p>
        {strings.likely}. {account.domain}. {account.firstSeen} – {account.lastSeen}.
      </p>
      <p>{strings.accounts.noSubject}</p>
      <div className="actions">
        {(['mine', 'not-mine', 'unsure'] as const).map((ownership) => (
          <button
            key={ownership}
            type="button"
            aria-pressed={account.ownership === ownership}
            onClick={() =>
              update((workspace) => ({
                ...workspace,
                accounts: workspace.accounts.map((item) =>
                  item.id === account.id ? { ...item, ownership } : item,
                ),
              }))
            }
          >
            {ownership === 'mine'
              ? strings.accounts.mine
              : ownership === 'not-mine'
                ? strings.accounts.notMine
                : strings.accounts.unsure}
          </button>
        ))}
      </div>
      <h3>{strings.accounts.evidence}</h3>
      <ul>
        {account.evidence.map((item, index) => (
          <li key={`${item.date}-${item.signal}-${index}`}>
            {item.signal}
            {item.date ? ` ${strings.accounts.onDate} ${item.date}` : ''}
            {item.schoolMatch ? ` · ${strings.accounts.schoolMatch}` : ''}
            {item.subject ? ` · ${item.subject}` : ''}
          </li>
        ))}
      </ul>
      {!entry ? <p>{strings.accounts.unrecognized}</p> : null}
      <fieldset>
        <legend>{strings.accounts.service}</legend>
        <label>
          <input
            type="radio"
            name={`service-${account.id}`}
            checked={!account.serviceId}
            onChange={() =>
              update((workspace) => ({
                ...workspace,
                accounts: workspace.accounts.map((item) =>
                  item.id === account.id ? { ...item, serviceId: undefined } : item,
                ),
              }))
            }
          />{' '}
          {strings.accounts.unrecognized}
        </label>
        {serviceCatalog.map((service) => (
          <label key={service.id}>
            <input
              type="radio"
              name={`service-${account.id}`}
              checked={account.serviceId === service.id}
              onChange={() =>
                update((workspace) => ({
                  ...workspace,
                  accounts: workspace.accounts.map((item) =>
                    item.id === account.id
                      ? { ...item, serviceId: service.id, name: service.name }
                      : item,
                  ),
                }))
              }
            />{' '}
            {service.name}
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={() =>
          update((workspace) => {
            const id = `delete:${account.id}`;
            if (workspace.tasks.some((task) => task.id === id)) return workspace;
            return {
              ...workspace,
              tasks: [
                ...workspace.tasks,
                {
                  id,
                  accountId: account.id,
                  serviceId: account.serviceId,
                  title: `${strings.tasks.addDelete}: ${account.name}`,
                  type: 'delete' as const,
                  status: 'not-started' as const,
                  notes: '',
                  completedSteps: [],
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          })
        }
      >
        {strings.tasks.addDelete}
      </button>
    </article>
  );
}

function ManualAdd() {
  const { update } = useWorkspace();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [problem, setProblem] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        let parsed: URL;
        try {
          parsed = new URL(url);
        } catch {
          setProblem(strings.manual.invalid);
          return;
        }
        const domain = registrableDomain(parsed.hostname);
        if (parsed.protocol !== 'https:' || !domain || !name.trim()) {
          setProblem(strings.manual.invalid);
          return;
        }
        update((workspace) => {
          const base = `manual:${domain}:${name.trim().toLowerCase()}`;
          let id = base;
          let suffix = 2;
          while (workspace.accounts.some((item) => item.id === id)) {
            id = `${base}:${suffix}`;
            suffix += 1;
          }
          const account: Account = {
            id,
            name: name.trim(),
            domain,
            confidence: 'Low',
            ownership: 'unsure',
            count: 0,
            firstSeen: '',
            lastSeen: '',
            signals: {},
            evidence: [],
            source: 'manual',
          };
          return { ...workspace, accounts: [...workspace.accounts, account] };
        });
        setName('');
        setUrl('');
        setProblem('');
      }}
    >
      <h2>{strings.manual.title}</h2>
      {problem ? <p role="alert">{problem}</p> : null}
      <label htmlFor="manual-name">{strings.manual.name}</label>
      <input id="manual-name" value={name} onChange={(event) => setName(event.target.value)} />
      <label htmlFor="manual-url">{strings.manual.url}</label>
      <input
        id="manual-url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        inputMode="url"
      />
      <button type="submit">{strings.manual.add}</button>
    </form>
  );
}

function Guide({ id }: { id: string }) {
  const { workspace, update } = useWorkspace();
  if (!workspace) return null;
  const task = workspace.tasks.find((item) => item.id === id);
  if (!task) return <p>{strings.today.empty}</p>;
  const entry = serviceCatalog.find(
    (item) =>
      item.id ===
      (task.serviceId ??
        workspace.accounts.find((account) => account.id === task.accountId)?.serviceId),
  );
  const steps = stepsFor(task, entry);
  const guideKey =
    task.type === 'delete'
      ? 'deletion'
      : task.type === 'export'
        ? 'export'
        : task.type === 'email' || task.type === 'replace'
          ? 'email'
          : null;
  const verified = entry && guideKey ? entry[guideKey] : undefined;
  const link =
    verified?.url && entry && officialLinkAllowed(verified.url, entry) ? verified.url : '';
  return (
    <article>
      <h1 id="page-title" tabIndex={-1}>
        {task.title}
      </h1>
      <p>{strings.status[task.status]}</p>
      {entry?.education.available === 'yes' ? <p>{entry.education.impact}</p> : null}
      {entry?.education.available === 'unverified' ? (
        <p>
          {strings.catalog.unverified} {entry.education.impact}
        </p>
      ) : null}
      <ul>
        {planTasks(workspace, serviceCatalog)
          .find((item) => item.task.id === task.id)
          ?.reasons.map((reason) => (
            <li key={reason}>{reasonText(reason)}</li>
          ))}
      </ul>
      {entry ? (
        <p>
          {entry.name}. {strings.sourcesNote} {entry.verifiedAt}.
        </p>
      ) : (
        <h2>{strings.tasks.fallbackTitle}</h2>
      )}
      <ol>
        {steps.map((step, index) => (
          <li key={step}>
            <label>
              <input
                type="checkbox"
                checked={task.completedSteps.includes(index)}
                onChange={() =>
                  update((current) => ({
                    ...current,
                    tasks: current.tasks.map((item) =>
                      item.id === task.id
                        ? {
                            ...item,
                            status: item.status === 'not-started' ? 'in-progress' : item.status,
                            completedSteps: item.completedSteps.includes(index)
                              ? item.completedSteps.filter((value) => value !== index)
                              : [...item.completedSteps, index],
                          }
                        : item,
                    ),
                  }))
                }
              />
              {step}
            </label>
          </li>
        ))}
      </ol>
      <h2>{strings.tasks.confirmTitle}</h2>
      <ol>
        {strings.tasks.confirm.map((step, index) => {
          const stepIndex = steps.length + index;
          return (
            <li key={step}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completedSteps.includes(stepIndex)}
                  onChange={() =>
                    update((current) => ({
                      ...current,
                      tasks: current.tasks.map((item) =>
                        item.id === task.id
                          ? {
                              ...item,
                              completedSteps: item.completedSteps.includes(stepIndex)
                                ? item.completedSteps.filter((value) => value !== stepIndex)
                                : [...item.completedSteps, stepIndex],
                            }
                          : item,
                      ),
                    }))
                  }
                />
                {step}
              </label>
            </li>
          );
        })}
      </ol>
      {link ? (
        <p>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {strings.tasks.official}: {new URL(link).hostname}
          </a>
        </p>
      ) : null}
      {(task.kind === 'drive' ||
      task.kind === 'mail' ||
      task.kind === 'contacts' ||
      task.kind === 'recovery'
        ? strings.schoolGuideMeta[task.kind]
        : []
      ).map((source) => (
        <p key={source.url}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.label}
          </a>{' '}
          {strings.sourcesNote} {strings.schoolGuideMeta.verifiedAt}
        </p>
      ))}
      {entry
        ? entry.sources.map((source) => (
            <p key={source}>
              <a href={source} target="_blank" rel="noopener noreferrer">
                {new URL(source).hostname}
                {new URL(source).pathname}
              </a>{' '}
              {strings.sourcesNote} {entry.verifiedAt}
            </p>
          ))
        : null}
      {!entry || steps[0] === strings.catalog.unverified ? (
        <>
          <h2>{strings.tasks.fallbackTitle}</h2>
          <ol>
            {strings.fallback.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </>
      ) : null}
      <label htmlFor="task-notes">{strings.tasks.notes}</label>
      <textarea
        id="task-notes"
        value={task.notes}
        onChange={(event) =>
          update((current) => ({
            ...current,
            tasks: current.tasks.map((item) =>
              item.id === task.id ? { ...item, notes: event.target.value } : item,
            ),
          }))
        }
      />
      <Copy text={strings.supportTemplate} label={strings.tasks.copy} />
      <div className="actions">
        <button type="button" onClick={() => setStatus(update, task.id, 'in-progress')}>
          {strings.tasks.progress}
        </button>
        <button type="button" onClick={() => setStatus(update, task.id, 'done')}>
          {strings.tasks.done}
        </button>
        <button type="button" onClick={() => setStatus(update, task.id, 'cant-migrate')}>
          {strings.tasks.blocked}
        </button>
        <button type="button" onClick={() => setStatus(update, task.id, 'not-mine')}>
          {strings.tasks.notMine}
        </button>
        <button
          type="button"
          className="quiet"
          onClick={() => setStatus(update, task.id, 'not-started')}
        >
          {strings.tasks.reset}
        </button>
      </div>
    </article>
  );
}

function reasonText(reason: string): string {
  if (reason === 'billing') return strings.risk.billing;
  if (reason === 'data') return strings.risk.data;
  if (reason === 'restricted') return strings.risk.restricted;
  if (reason === 'education') return strings.risk.education;
  if (reason === 'recovery') return strings.risk.recovery;
  if (reason === 'expiry-assumed') return strings.calendar.assumed;
  if (reason === 'expired') return strings.today.expiredBody;
  if (reason === 'expiry-soon') return strings.today.banner;
  if (reason === 'overdue') return strings.today.overdue;
  if (reason === 'unconfirmed') return strings.accounts.unsure;
  return reason;
}

function setStatus(
  update: ReturnType<typeof useWorkspace>['update'],
  id: string,
  status: Task['status'],
) {
  update((workspace) => ({
    ...workspace,
    tasks: workspace.tasks.map((task) => (task.id === id ? { ...task, status } : task)),
  }));
}

function stepsFor(task: Task, entry: CatalogEntry | undefined): string[] {
  if (task.kind === 'drive') return [...strings.schoolGuides.drive];
  if (task.kind === 'mail') return [...strings.schoolGuides.mail];
  if (task.kind === 'contacts') return [...strings.schoolGuides.contacts];
  if (task.type === 'recovery') return [...strings.schoolGuides.recovery];
  if (!entry) return [...strings.fallback];
  const guide =
    task.type === 'export' ? entry.export : task.type === 'delete' ? entry.deletion : entry.email;
  if (guide.status === 'unverified') return [strings.catalog.unverified, ...strings.fallback];
  return guide.steps;
}

function Timeline() {
  const { workspace } = useWorkspace();
  if (!workspace) return null;
  const planned = planTasks(workspace, serviceCatalog);
  const expiry = effectiveExpiry(workspace.preferences);
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.timeline.title}
      </h1>
      {expiry.assumed && expiry.date ? <p>{strings.timeline.assumed}</p> : null}
      <p role="status">
        {expiry.date && daysUntil(expiry.date) !== null
          ? strings.countdown.remaining(daysUntil(expiry.date) ?? 0, expiry.date)
          : strings.countdown.unknown}
      </p>
      {planned.length === 0 ? (
        <p>{strings.timeline.empty}</p>
      ) : (
        <ol className="stack">
          {planned.map((item) => (
            <li key={item.task.id}>
              <a href={`#/task/${encodeURIComponent(item.task.id)}`}>{item.task.title}</a>
              <span>{item.dueDate || strings.report.unknown}</span>
              <span>{item.reasons.join(', ')}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Catalog() {
  const { workspace, update } = useWorkspace();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  if (!workspace) return null;
  const categories = ['all', ...new Set(serviceCatalog.map((entry) => entry.category))];
  const visible = serviceCatalog.filter((entry) => {
    const haystack = `${entry.name} ${entry.domains.join(' ')}`.toLowerCase();
    return (
      (category === 'all' || entry.category === category) && haystack.includes(query.toLowerCase())
    );
  });
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.catalog.title}
      </h1>
      <label htmlFor="catalog-search">{strings.catalog.search}</label>
      <input id="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} />
      <fieldset>
        <legend>{strings.catalog.all}</legend>
        {categories.map((item) => (
          <label key={item}>
            <input
              type="radio"
              name="catalog-category"
              checked={category === item}
              onChange={() => setCategory(item)}
            />{' '}
            {item === 'all' ? strings.catalog.all : item}
          </label>
        ))}
      </fieldset>
      <ul className="stack">
        {visible.map((entry) => {
          const added = workspace.accounts.some((account) => account.serviceId === entry.id);
          return (
            <li key={entry.id}>
              <strong>{entry.name}</strong>
              <span>{entry.category}</span>
              {entry.email.status === 'unverified' ? (
                <span>{strings.catalog.unverified}</span>
              ) : null}
              <button
                type="button"
                disabled={added}
                onClick={() =>
                  update((current) => ({
                    ...current,
                    accounts: [
                      ...current.accounts,
                      {
                        id: `account:${entry.id}`,
                        serviceId: entry.id,
                        name: entry.name,
                        domain: entry.domains[0] ?? entry.id,
                        confidence: 'Low',
                        ownership: 'unsure',
                        count: 0,
                        firstSeen: '',
                        lastSeen: '',
                        signals: {},
                        evidence: [],
                        source: 'catalog',
                      },
                    ],
                  }))
                }
              >
                {added ? strings.catalog.added : strings.catalog.add}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Settings() {
  const api = useWorkspace();
  const workspace = api.workspace;
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);
  if (!workspace) return null;
  const planned = planTasks(workspace, serviceCatalog);
  const patch = (preferences: Workspace['preferences']) =>
    api.update((current) => ({ ...current, preferences }));
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.settings.title}
      </h1>
      <label htmlFor="domains">{strings.start.domainsLabel}</label>
      <input
        id="domains"
        defaultValue={workspace.preferences.schoolDomains.join(', ')}
        onBlur={(event) =>
          patch({
            ...workspace.preferences,
            schoolDomains: event.target.value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          })
        }
      />
      <p>{strings.start.domainsHint}</p>
      <label htmlFor="grad">{strings.settings.graduation}</label>
      <input
        id="grad"
        type="date"
        value={workspace.preferences.graduationDate}
        onChange={(event) =>
          patch({ ...workspace.preferences, graduationDate: event.target.value })
        }
      />
      <label htmlFor="expiry">{strings.settings.expiry}</label>
      <input
        id="expiry"
        type="date"
        value={workspace.preferences.expiryDate}
        onChange={(event) =>
          patch({ ...workspace.preferences, expiryDate: event.target.value, expiryAssumed: false })
        }
      />
      <label htmlFor="retention">{strings.settings.retention}</label>
      <input
        id="retention"
        type="number"
        min={0}
        max={3650}
        value={workspace.preferences.retentionDays}
        onChange={(event) =>
          patch({ ...workspace.preferences, retentionDays: Number(event.target.value) })
        }
      />
      <label className="check">
        <input
          type="checkbox"
          checked={workspace.preferences.expiryAssumed}
          onChange={(event) =>
            patch({ ...workspace.preferences, expiryAssumed: event.target.checked })
          }
        />{' '}
        {strings.settings.assumed}
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={workspace.preferences.saveSubjects}
          onChange={(event) =>
            patch({ ...workspace.preferences, saveSubjects: event.target.checked })
          }
        />{' '}
        {strings.settings.subjects}
      </label>
      <p>{strings.settings.subjectsHint}</p>
      <fieldset>
        <legend>{strings.settings.theme}</legend>
        {(['system', 'light', 'dark'] as const).map((theme) => (
          <label key={theme}>
            <input
              type="radio"
              name="theme"
              checked={workspace.preferences.theme === theme}
              onChange={() => patch({ ...workspace.preferences, theme })}
            />{' '}
            {theme === 'system'
              ? strings.settings.system
              : theme === 'light'
                ? strings.settings.light
                : strings.settings.dark}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>{strings.settings.weights}</legend>
        {(['billing', 'data', 'restricted', 'education', 'recovery'] as const).map((key) => (
          <label key={key}>
            {key}
            <input
              type="number"
              min={0}
              max={10}
              value={workspace.preferences.riskWeights[key]}
              onChange={(event) =>
                patch({
                  ...workspace.preferences,
                  riskWeights: {
                    ...workspace.preferences.riskWeights,
                    [key]: Number(event.target.value),
                  },
                })
              }
            />
          </label>
        ))}
      </fieldset>
      <h2>{strings.settings.encrypt}</h2>
      <p>{strings.settings.encryptHint}</p>
      {problem ? <p role="alert">{problem}</p> : null}
      <label htmlFor="enc">{strings.settings.password}</label>
      <input
        id="enc"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
      />
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            if (password.length < 8) {
              setProblem(strings.errors.required);
              return;
            }
            void api.setPassword(password);
            setPassword('');
          }}
        >
          {strings.settings.savePassword}
        </button>
        <button
          type="button"
          className="quiet"
          onClick={() => {
            void api
              .clearPassword(password)
              .then((ok) => setProblem(ok ? '' : strings.settings.wrongPassword));
          }}
        >
          {strings.settings.removePassword}
        </button>
      </div>
      <h2>{strings.settings.notify}</h2>
      <p>{strings.settings.notifyHint}</p>
      <p>{strings.notify.closed}</p>
      <button
        type="button"
        onClick={() => {
          if (!('Notification' in window)) return;
          void Notification.requestPermission().then((permission) => {
            if (permission !== 'granted') return;
            const due = planTasks(workspace, serviceCatalog).some(
              (item) => item.overdue || item.dueDate === localDate(new Date()),
            );
            if (due) new Notification(strings.notify.title, { body: strings.notify.body });
          });
        }}
      >
        {strings.settings.notifyOn}
      </button>
      <div className="actions">
        <button
          type="button"
          onClick={() =>
            downloadBlob(
              'after-school.ics',
              new Blob([buildCalendar(planned, workspace.preferences)], { type: 'text/calendar' }),
            )
          }
        >
          {strings.settings.ics}
        </button>
        <a href="#/report">{strings.settings.report}</a>
        <button
          type="button"
          onClick={() => {
            const text = JSON.stringify(workspace, null, 2);
            if (text.length > WORKSPACE_LIMIT) {
              setProblem(strings.warnings.backupLimit);
              return;
            }
            downloadBlob(
              'after-school-workspace.json',
              new Blob([text], { type: 'application/json' }),
            );
          }}
        >
          {strings.settings.exportWs}
        </button>
        <label className="file">
          {strings.settings.importWs}
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              void file.text().then((text) => {
                try {
                  api.replace(parseWorkspace(text));
                  setProblem('');
                } catch {
                  setProblem(strings.settings.importBad);
                }
              });
            }}
          />
        </label>
        <button
          type="button"
          onClick={() =>
            downloadBlob(
              'after-school-checklist.txt',
              new Blob([genericChecklist], { type: 'text/plain' }),
            )
          }
        >
          {strings.settings.share}
        </button>
      </div>
      <p>{strings.settings.shareHint}</p>
      {confirmWipe ? (
        <button
          type="button"
          onClick={() => {
            setConfirmWipe(false);
            void api.wipe();
          }}
        >
          {strings.settings.wipeConfirm}
        </button>
      ) : (
        <button type="button" className="quiet" onClick={() => setConfirmWipe(true)}>
          {strings.settings.wipe}
        </button>
      )}
    </section>
  );
}

function Report() {
  const { workspace } = useWorkspace();
  if (!workspace) return null;
  const text = buildReport(workspace, planTasks(workspace, serviceCatalog));
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.settings.report}
      </h1>
      <div className="actions">
        <button
          type="button"
          onClick={() =>
            downloadBlob('migration-report.txt', new Blob([text], { type: 'text/plain' }))
          }
        >
          {strings.reportActions.downloadTxt}
        </button>
        <button
          type="button"
          onClick={() => {
            const pdf = buildPdf(text);
            const copy = new ArrayBuffer(pdf.byteLength);
            new Uint8Array(copy).set(pdf);
            downloadBlob('migration-report.pdf', new Blob([copy], { type: 'application/pdf' }));
          }}
        >
          {strings.reportActions.downloadPdf}
        </button>
        <button type="button" onClick={() => window.print()}>
          {strings.reportActions.print}
        </button>
      </div>
      <pre>{text}</pre>
    </section>
  );
}

function Privacy() {
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.privacy.title}
      </h1>
      <p>{strings.privacy.lead}</p>
      <p>{strings.privacyPromise}</p>
      <p>{strings.privacy.plain}</p>
      <p>{strings.privacy.localOnly}</p>
      <p>{strings.privacy.wipeMarker}</p>
    </section>
  );
}

function Method() {
  return (
    <section>
      <h1 id="page-title" tabIndex={-1}>
        {strings.method.title}
      </h1>
      <p>{strings.method.lead}</p>
      <p>{strings.method.signals}</p>
      <p>{strings.method.priority}</p>
      <p>{strings.method.dates}</p>
    </section>
  );
}

function Copy({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard
          ?.writeText(text)
          .then(() => setCopied(true))
          .catch(() => setCopied(false));
      }}
    >
      {copied ? strings.tasks.copied : label}
    </button>
  );
}
