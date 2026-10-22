export type Category =
  | 'Cloud storage'
  | 'Development'
  | 'Design & creation'
  | 'Productivity'
  | 'Learning'
  | 'Entertainment'
  | 'Shopping & finance'
  | 'Campus';
export type Verification = 'verified' | 'restricted' | 'unverified';
export interface Guide {
  status: Verification;
  steps: string[];
  url?: string;
}
export interface CatalogEntry {
  id: string;
  name: string;
  category: Category;
  domains: string[];
  email: Guide;
  export: Guide;
  education: { available: 'yes' | 'no' | 'unverified'; impact: string; url?: string };
  deletion: Guide;
  verifiedAt: string;
  sources: string[];
}
export type Signal = 'welcome' | 'verification' | 'password' | 'receipt' | 'security' | 'marketing';
export type Confidence = 'High' | 'Medium' | 'Low';
export type Ownership = 'unsure' | 'mine' | 'not-mine';
export interface Evidence {
  signal: Signal;
  date: string;
  schoolMatch: boolean;
  recipientDomain?: string;
  subject?: string;
}
export interface Account {
  id: string;
  serviceId?: string;
  name: string;
  domain: string;
  confidence: Confidence;
  ownership: Ownership;
  count: number;
  firstSeen: string;
  lastSeen: string;
  signals: Partial<Record<Signal, number>>;
  /** True when any scanned message matched a school recipient, even if that row is not in the eight shown. */
  schoolMatched?: boolean;
  evidence: Evidence[];
  source: 'scan' | 'catalog' | 'manual' | 'demo';
}
export type TaskType = 'email' | 'export' | 'replace' | 'delete' | 'recovery';
export type TaskStatus = 'not-started' | 'in-progress' | 'done' | 'cant-migrate' | 'not-mine';
export interface Task {
  id: string;
  accountId?: string;
  serviceId?: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  notes: string;
  completedSteps: number[];
  createdAt: string;
  kind?: 'drive' | 'mail' | 'contacts' | 'recovery' | 'school';
}
export interface Preferences {
  schoolDomains: string[];
  graduationDate: string;
  expiryDate: string;
  retentionDays: number;
  expiryAssumed: boolean;
  schoolPolicy: string;
  saveSubjects: boolean;
  theme: 'light' | 'dark' | 'system';
  riskWeights: {
    billing: number;
    data: number;
    restricted: number;
    education: number;
    recovery: number;
  };
}
export interface Workspace {
  version: 1;
  accounts: Account[];
  tasks: Task[];
  preferences: Preferences;
  demo: boolean;
  onboarded: boolean;
  updatedAt: string;
}
export interface ScanProgress {
  bytesRead: number;
  totalBytes: number;
  messages: number;
  skipped: number;
  accounts: Account[];
  warnings: string[];
}
export interface ScanOptions {
  schoolDomains: string[];
  saveSubjects: boolean;
}
