import type { Account, Workspace } from '../types';
import { schoolTasks } from './tasks';
import { defaultPreferences } from './workspace';

const demoAccounts: Account[] = [
  {
    id: 'account:github.com',
    serviceId: 'github',
    name: 'GitHub',
    domain: 'github.com',
    confidence: 'High',
    ownership: 'unsure',
    count: 3,
    firstSeen: '2023-02-11',
    lastSeen: '2026-01-04',
    signals: { welcome: 1, verification: 1, password: 1 },
    evidence: [
      { signal: 'welcome', date: '2023-02-11', schoolMatch: true, subject: 'Welcome to GitHub' },
      { signal: 'password', date: '2025-11-02', schoolMatch: true, subject: 'Reset your password' },
    ],
    source: 'demo',
  },
  {
    id: 'account:notion.so',
    serviceId: 'notion',
    name: 'Notion',
    domain: 'notion.so',
    confidence: 'Medium',
    ownership: 'unsure',
    count: 2,
    firstSeen: '2024-04-02',
    lastSeen: '2025-09-18',
    signals: { welcome: 1, marketing: 4 },
    evidence: [
      { signal: 'welcome', date: '2024-04-02', schoolMatch: true, subject: 'Welcome to Notion' },
    ],
    source: 'demo',
  },
  {
    id: 'account:dropbox.com',
    serviceId: 'dropbox',
    name: 'Dropbox',
    domain: 'dropbox.com',
    confidence: 'High',
    ownership: 'unsure',
    count: 2,
    firstSeen: '2022-10-01',
    lastSeen: '2026-03-01',
    signals: { welcome: 1, receipt: 1 },
    evidence: [
      { signal: 'receipt', date: '2026-03-01', schoolMatch: true, subject: 'Your Dropbox receipt' },
    ],
    source: 'demo',
  },
  {
    id: 'account:canva.com',
    serviceId: 'canva',
    name: 'Canva',
    domain: 'canva.com',
    confidence: 'Medium',
    ownership: 'unsure',
    count: 1,
    firstSeen: '2024-08-19',
    lastSeen: '2024-08-19',
    signals: { verification: 1 },
    evidence: [
      {
        signal: 'verification',
        date: '2024-08-19',
        schoolMatch: true,
        subject: 'Your verification code',
      },
    ],
    source: 'demo',
  },
  {
    id: 'account:spotify.com',
    serviceId: 'spotify',
    name: 'Spotify',
    domain: 'spotify.com',
    confidence: 'Low',
    ownership: 'unsure',
    count: 1,
    firstSeen: '2025-01-12',
    lastSeen: '2025-01-12',
    signals: { receipt: 1 },
    evidence: [
      {
        signal: 'receipt',
        date: '2025-01-12',
        schoolMatch: false,
        subject: 'Your receipt from Spotify',
      },
    ],
    source: 'demo',
  },
  {
    id: 'account:figma.com',
    serviceId: 'figma',
    name: 'Figma',
    domain: 'figma.com',
    confidence: 'Medium',
    ownership: 'unsure',
    count: 2,
    firstSeen: '2023-09-09',
    lastSeen: '2025-12-12',
    signals: { welcome: 1, security: 1 },
    evidence: [
      { signal: 'welcome', date: '2023-09-09', schoolMatch: true, subject: 'Welcome to Figma' },
    ],
    source: 'demo',
  },
];

export function demoWorkspace(): Workspace {
  const workspace: Workspace = {
    version: 1,
    accounts: demoAccounts,
    tasks: [],
    preferences: {
      ...defaultPreferences(),
      schoolDomains: ['school.example'],
      graduationDate: '2027-05-20',
      retentionDays: 90,
      expiryAssumed: true,
      schoolPolicy: 'Example only: confirm the real retention period with your school.',
    },
    demo: true,
    onboarded: true,
    updatedAt: new Date().toISOString(),
  };
  return { ...workspace, tasks: schoolTasks(workspace.updatedAt) };
}
