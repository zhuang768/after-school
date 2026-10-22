import { getDomain } from 'tldts';
import { domainOfAddress, extractAddresses } from './headers';

/** Bulk senders are not treated as the product the person signed up for. */
const ESP = new Set([
  'sendgrid.net',
  'amazonses.com',
  'mandrillapp.com',
  'mailchimp.com',
  'mcsv.net',
  'sparkpostmail.com',
  'rsgsv.net',
  'exacttarget.com',
]);

export function registrableDomain(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';
  const host = trimmed.includes('@') ? domainOfAddress(trimmed) : trimmed.replace(/^@/, '');
  if (!host || host.includes('/') || host.includes(' ')) return '';
  return getDomain(host, { allowPrivateDomains: true }) ?? '';
}

export function isEspDomain(domain: string): boolean {
  return ESP.has(domain);
}

export function chooseIdentityDomain(from: string, replyTo: string, listId: string): string {
  const sender = registrableDomain(extractAddresses(from)[0] ?? from);
  if (sender && !isEspDomain(sender)) return sender;
  const reply = registrableDomain(extractAddresses(replyTo)[0] ?? replyTo);
  if (reply && !isEspDomain(reply)) return reply;
  const list = registrableDomain(
    extractAddresses(listId)[0] ?? listId.replace(/^[^<]*</, '').replace(/>.*$/, ''),
  );
  if (list && !isEspDomain(list)) return list;
  return sender;
}

export function hostMatchesSchool(host: string, schoolDomains: string[]): boolean {
  const domain = host.trim().toLowerCase().replace(/^@/, '');
  if (!domain) return false;
  return schoolDomains.some((school) => {
    const normalized = school.trim().toLowerCase().replace(/^@/, '');
    return normalized !== '' && (domain === normalized || domain.endsWith(`.${normalized}`));
  });
}

export function addressMatchesSchool(address: string, schoolDomains: string[]): boolean {
  return hostMatchesSchool(domainOfAddress(address), schoolDomains);
}
