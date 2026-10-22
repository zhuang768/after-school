import type { Account, CatalogEntry, Evidence, ScanOptions, Signal } from '../types';
import { classifyText, confidenceFor, isAccountSignal } from './classify';
import { addressMatchesSchool, chooseIdentityDomain } from './domains';
import { domainOfAddress } from './headers';

export interface ParsedMail {
  from: string;
  replyTo: string;
  listId: string;
  recipients: string[];
  date: string;
  subject: string;
  listUnsubscribe: boolean;
  preview: string;
}

export interface AggregateState {
  accounts: Map<string, Account>;
  schoolMatched: Set<string>;
  ignoredMarketing: number;
}

const EVIDENCE_CAP = 8;

function emptySignals(): Partial<Record<Signal, number>> {
  return {};
}

export function createAggregate(): AggregateState {
  return { accounts: new Map(), schoolMatched: new Set(), ignoredMarketing: 0 };
}

export function catalogMatch(
  domain: string,
  catalog: Pick<CatalogEntry, 'id' | 'name' | 'domains'>[],
): Pick<CatalogEntry, 'id' | 'name' | 'domains'> | undefined {
  return catalog.find((entry) => entry.domains.includes(domain));
}

export function addMail(
  state: AggregateState,
  mail: ParsedMail,
  options: ScanOptions,
  catalog: Pick<CatalogEntry, 'id' | 'name' | 'domains'>[],
): void {
  const domain = chooseIdentityDomain(mail.from, mail.replyTo, mail.listId);
  if (!domain) return;
  const signals = classifyText(mail.subject, mail.preview, mail.listUnsubscribe);
  const accountSignals = signals.filter(isAccountSignal);
  if (accountSignals.length === 0) {
    state.ignoredMarketing += 1;
    return;
  }
  const matchedRecipient = mail.recipients.find((address) =>
    addressMatchesSchool(address, options.schoolDomains),
  );
  if (options.schoolDomains.length > 0 && !matchedRecipient) return;
  const schoolMatch = Boolean(matchedRecipient);
  const matched = catalogMatch(domain, catalog);
  const key = matched?.id ?? domain;
  const existing = state.accounts.get(key);
  const account: Account = existing ?? {
    id: `account:${key}`,
    serviceId: matched?.id,
    name: matched?.name ?? domain,
    domain: matched?.domains[0] ?? domain,
    confidence: 'Low',
    ownership: 'unsure',
    count: 0,
    firstSeen: mail.date,
    lastSeen: mail.date,
    signals: emptySignals(),
    evidence: [],
    source: 'scan',
  };
  account.count += 1;
  for (const signal of signals) account.signals[signal] = (account.signals[signal] ?? 0) + 1;
  if (mail.date) {
    if (!account.firstSeen || mail.date < account.firstSeen) account.firstSeen = mail.date;
    if (!account.lastSeen || mail.date > account.lastSeen) account.lastSeen = mail.date;
  }
  const evidence: Evidence = {
    signal: accountSignals[0] ?? 'marketing',
    date: mail.date,
    schoolMatch,
    recipientDomain: matchedRecipient ? domainOfAddress(matchedRecipient) : undefined,
    ...(options.saveSubjects && mail.subject ? { subject: mail.subject.slice(0, 140) } : {}),
  };
  if (schoolMatch) {
    state.schoolMatched.add(key);
    account.schoolMatched = true;
  }
  if (account.evidence.length < EVIDENCE_CAP) account.evidence.push(evidence);
  const confidence = confidenceFor(account.signals, state.schoolMatched.has(key));
  if (confidence) account.confidence = confidence;
  state.accounts.set(key, account);
}

export function accountsFromAggregate(state: AggregateState): Account[] {
  return [...state.accounts.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}
