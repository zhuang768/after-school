import type { Confidence, Signal } from '../types';
import { stripMarkup } from './headers';

interface Rule {
  signal: Signal;
  patterns: RegExp[];
}

const RULES: Rule[] = [
  {
    signal: 'password',
    patterns: [
      /password reset/i,
      /reset (your )?password/i,
      /forgot your password/i,
      /set your password/i,
      /重設密碼/,
      /重置密码/,
      /パスワードのリセット/,
      /réinitialisation du mot de passe/i,
      /restablece(r)? tu contraseña/i,
      /passwort zurücksetzen/i,
    ],
  },
  {
    signal: 'verification',
    patterns: [
      /verification code/i,
      /verify your (email|account)/i,
      /confirm your email/i,
      /confirmation code/i,
      /one-time (code|password|passcode)/i,
      /security code/i,
      /驗證碼/,
      /验证码/,
      /確認コード/,
      /code de vérification/i,
      /código de verificación/i,
    ],
  },
  {
    signal: 'welcome',
    patterns: [
      /welcome to/i,
      /thanks for signing up/i,
      /thank you for (signing up|registering)/i,
      /account (created|confirmed)/i,
      /activate your account/i,
      /confirm your account/i,
      /you're in/i,
      /歡迎加入/,
      /欢迎加入/,
      /註冊成功/,
      /bienvenue/i,
      /bienvenido/i,
      /willkommen/i,
    ],
  },
  {
    signal: 'receipt',
    patterns: [
      /\breceipt\b/i,
      /\binvoice\b/i,
      /payment received/i,
      /order confirmation/i,
      /your (bill|subscription)/i,
      /you('ve| have) been charged/i,
      /收據/,
      /发票/,
      /領収/,
      /reçu/i,
      /factura/i,
    ],
  },
  {
    signal: 'security',
    patterns: [
      /security alert/i,
      /new (sign-in|login|device)/i,
      /suspicious (activity|sign-in)/i,
      /unusual activity/i,
      /two-factor/i,
      /2-step verification/i,
      /安全警示/,
      /新しいログイン/,
      /alerte de sécurité/i,
    ],
  },
  {
    signal: 'marketing',
    patterns: [/unsubscribe/i, /newsletter/i, /view in browser/i, /取消訂閱/, /退订/, /配信停止/],
  },
];

export function classifyText(subject: string, preview: string, listUnsubscribe: boolean): Signal[] {
  const haystack = `${subject}\n${stripMarkup(preview)}`.replace(/\s+/g, ' ');
  const found = new Set<Signal>();
  if (listUnsubscribe) found.add('marketing');
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) found.add(rule.signal);
  }
  if (
    found.has('welcome') &&
    found.has('marketing') &&
    /newsletter|mailing[\s-]*list|電子報|邮件列表|郵件清單/i.test(haystack) &&
    !found.has('verification') &&
    !found.has('password') &&
    !found.has('receipt') &&
    !found.has('security')
  ) {
    found.delete('welcome');
  }
  return [...found];
}

export function isAccountSignal(signal: Signal): boolean {
  return signal !== 'marketing';
}

export function confidenceFor(
  signals: Partial<Record<Signal, number>>,
  schoolMatched: boolean,
): Confidence | null {
  const strong = (signals.welcome ?? 0) + (signals.verification ?? 0) + (signals.password ?? 0);
  const supporting = (signals.receipt ?? 0) + (signals.security ?? 0);
  const total = strong + supporting;
  if (total === 0) return null;
  if (strong >= 1 && schoolMatched && total >= 2) return 'High';
  if (strong >= 2) return 'High';
  if ((strong >= 1 && (schoolMatched || total >= 2)) || (supporting >= 1 && schoolMatched)) {
    return 'Medium';
  }
  return 'Low';
}
