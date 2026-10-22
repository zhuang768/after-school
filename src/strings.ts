export const strings = {
  product: 'After School',
  tagline: 'Move school-email accounts to a personal inbox before access ends.',
  privacyPromise: 'Your mailbox and notes stay on this device. This app does not upload them.',
  skip: 'Skip to content',
  nav: {
    today: 'Today',
    accounts: 'Accounts',
    timeline: 'Timeline',
    catalog: 'Services',
    settings: 'Settings',
    privacy: 'Privacy',
    method: 'Methodology',
  },
  start: {
    title: 'Keep the accounts. Leave the school inbox.',
    body: 'This tool lists services that likely used your school email, then walks you through changing the login email or exporting a copy. It cannot transfer ownership of a school account.',
    demo: 'Try the demo',
    empty: 'Start empty',
    domainsLabel: 'School email domains',
    domainsHint:
      'Example: school.example. Add every domain that receives your school mail, including a forwarding inbox.',
    addDomain: 'Add domain',
    continue: 'Continue',
  },
  today: {
    title: 'Today',
    empty: 'Nothing is due today. Add a graduation date or import a mailbox to build a plan.',
    overdue: 'Overdue',
    due: 'Due today',
    next: 'Coming up',
    expiredTitle: 'The school account date has already passed',
    expiredBody:
      'Some files may already be gone. These steps are a recovery path, not a promise that the data can be restored.',
    banner: 'School access needs a decision soon.',
  },
  expired: {
    contact:
      'Ask your school IT office whether they can restore access long enough to export, or whether an alumni inbox exists.',
    recovery:
      'On your important personal accounts, check that the recovery email is not the school address.',
    template:
      'Use the support message to ask each service to change the login email or send a data export.',
    expect:
      'Microsoft’s license-reclaim page says mailbox data is held 30 days after the license returns to the pool, except data on Legal Hold, and is then deleted. OneDrive is not deleted by that reclaim. This is not a date every school uses. Google leaves retention to each school.',
  },
  accounts: {
    title: 'Likely accounts',
    intro:
      'Every row is a likely account, not a confirmed one. Mark each as Mine, Not mine, or Not sure.',
    empty: 'No accounts yet. Import a mailbox, pick services, or add one yourself.',
    import: 'Import mailbox',
    cancel: 'Cancel scan',
    scanning: 'Reading mail on this device',
    mobile: 'Large mailbox files are more reliable on a computer. Phones may close the tab.',
    unsupported:
      'This file is not a supported .mbox, .eml, or .zip of those files. A .pst is not one of those files. Save one message as .eml from Outlook on a computer or on the web, then import that .eml. If Save as or Download gives you .msg or PDF, this app cannot read it. Add the service from the checklist when you cannot save an .eml.',
    damaged: 'Part of the file could not be read. Any accounts found so far are still listed.',
    mine: 'Mine',
    notMine: 'Not mine',
    unsure: 'Not sure',
    evidence: 'Why this looks likely',
    noSubject: 'Subjects are hidden after you leave this session unless you choose to save them.',
    unrecognized: 'Unrecognized service',
    service: 'Service',
    schoolMatch: 'school address',
    onDate: 'on',
  },
  manual: {
    title: 'Add a service yourself',
    name: 'Service name',
    url: 'https URL',
    add: 'Add service',
    invalid: 'Enter a name and an https URL with a real domain.',
  },
  tasks: {
    open: 'Open guide',
    steps: 'Steps',
    notes: 'Notes',
    done: 'Mark done',
    progress: 'Mark in progress',
    blocked: "Can't migrate",
    notMine: 'Not mine',
    fallbackTitle: 'If the service is not in the guide',
    official: 'Official page',
    copy: 'Copy support message',
    copied: 'Copied',
    confirmTitle: 'Before you call this done',
    confirm: [
      'Sign in to the personal inbox once and confirm you can open it.',
      'Check the recovery email, phone, or backup codes, and replace the school address if it is still there.',
      'Check two-factor authentication. If a code goes to the school inbox or a school phone, add another method before you finish.',
    ],
    completed: 'Completed',
    reset: 'Not started',
    addDelete: 'Add a deletion task',
  },
  timeline: {
    title: 'Timeline',
    empty: 'Set a graduation or expiry date to place tasks on a timeline.',
    assumed: 'This expiry date is an assumption. Confirm it with your school.',
  },
  catalog: {
    title: 'Service list',
    search: 'Search services',
    all: 'All categories',
    add: 'I may have this',
    added: 'Added',
    unverified: 'Unverified',
  },
  settings: {
    title: 'Settings',
    graduation: 'Graduation date',
    expiry: 'School account expiry',
    retention: 'If you do not know the expiry, assume this many days after graduation',
    assumed: 'I am estimating this date',
    policy: 'Notes about your school’s rules',
    subjects: 'Save mail subjects on this device',
    subjectsHint: 'Off by default. Subjects then disappear when you reload.',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'Match device',
    weights: 'Priority weights',
    encrypt: 'Encrypt saved data',
    encryptHint:
      'If you forget this password, the saved workspace cannot be recovered. The password is not stored.',
    password: 'Password',
    savePassword: 'Save encryption',
    removePassword: 'Remove encryption',
    wrongPassword: 'That password did not unlock the saved data.',
    unlock: 'Unlock',
    locked: 'Saved data is encrypted on this device.',
    exportWs: 'Download workspace',
    importWs: 'Import workspace',
    importBad: 'That file is not a valid workspace.',
    wipe: 'Delete all my data',
    wipeConfirm:
      'Delete the notes, mailbox results, and files After School stored on this device? A wipe marker with no personal text stays so another open tab cannot restore the deleted copy.',
    notify: 'Browser reminder',
    notifyHint:
      'A browser notification can fire only while this site is allowed to notify you. Closing the tab can mean you never see it. The calendar file is the reliable reminder.',
    notifyOn: 'Allow reminders',
    share: 'Download a generic checklist',
    shareHint: 'This file has no account names from your device.',
    ics: 'Download calendar',
    report: 'Migration report',
  },
  reportActions: {
    downloadTxt: 'Download text report',
    downloadPdf: 'Download PDF',
    print: 'Print',
  },
  recovery: {
    title: 'Recovery email check',
    body: 'These services sent password-reset mail to an address you scanned. The school inbox may be their recovery address. Open each one and switch recovery to a personal inbox.',
    empty: 'No password-reset mail has been recorded yet.',
  },
  itTemplate: {
    title: 'Note you can send your school',
    copy: 'Copy IT note',
  },
  privacy: {
    title: 'Privacy',
    lead: 'After School is a local workspace. Scanning, notes, and exports happen in your browser.',
    plain:
      'Mail is read as plain text. HTML is not rendered, and remote images are not loaded. Official links open only when you choose them, in a new tab, and only when the host matches a source recorded for that service.',
    localOnly:
      'There is no account, no analytics, and no catalog update check. Encryption is optional and cannot be reset if you forget the password.',
    wipeMarker:
      'Delete all my data removes your notes and mailbox results. It leaves a random wipe marker in a separate browser database. That marker has no notes, names, or message text. It stays so another open tab cannot write the deleted copy back. This is not a full wipe of every browser database.',
  },
  method: {
    title: 'Methodology',
    lead: 'The labels are rules, not certainty. You can change the weights.',
    signals:
      'A message becomes an account only when it matches a welcome, verification, password, receipt, or security pattern. A newsletter or mailing list alone is ignored. Welcome, verification, and password are strong signals. Receipt and security are supporting signals. High means two or more strong signals, or at least one strong signal plus a school recipient and another account signal. Medium means one strong signal together with either a school recipient or a second account signal, or a supporting signal with a school recipient. Everything else with an account signal is Low.',
    priority:
      'Each selected factor uses your weight, clamped from 0 to 10, then multiplied by 10. Defaults are billing 8, data 7, restricted email 9, education 5, and recovery 8, so those start at 80, 70, 90, 50, and 80. Education points apply only when the catalog says a student plan was confirmed. An overdue task adds 25. An expiry that has passed adds 100. An expiry within 30 days adds 40. Done and not-mine tasks score 0.',
    dates:
      'Lead time uses that factor score before the overdue, expired, and expiry-soon additions: 45 days at 150 or more, 30 days at 100, 21 days at 50, and 14 days otherwise. An assumed expiry is labeled on Today and the timeline. Already-expired mode starts when that date is before today.',
  },
  errors: {
    summary: 'There is a problem',
    required: 'Add a value to continue.',
  },
  status: {
    'not-started': 'Not started',
    'in-progress': 'In progress',
    done: 'Done',
    'cant-migrate': "Can't migrate",
    'not-mine': 'Not mine',
  },
  confidence: { High: 'High', Medium: 'Medium', Low: 'Low' },
  likely: 'Likely',
  demoBanner: 'Demo data uses synthetic examples. It is not your mailbox.',
  progressLabel: 'Migration progress',
  fallback: [
    'Sign in on the service’s own site and open Settings, Account, or Security.',
    'Look for Email, Login, or Contact address. If the school uses single sign-on, the control may be missing.',
    'Before access ends, export or download the data you need.',
    'Turn on two-factor authentication on the personal inbox and replace any school recovery address.',
    'If you cannot find the control, send the support message and keep the reply.',
  ],
  supportTemplate: `Hello,

I am losing access to the school email address on this account. Please change the login email to my personal address, or tell me how to do that myself.

If the address cannot be changed, please send a copy of the data in this account.

I will not send a password in email.

Thank you.`,
  itNote: `Hello,

I am graduating and need the date when my school account will stop working. Please tell me:

1. The last day I can sign in.
2. Whether an alumni email is available.
3. How to export my email, contacts, and files, and whether shared folders are included.

Thank you.`,
  schoolGuides: {
    drive: [
      'List the folders you own and the shared folders you still need. Shared files may stay with the owner.',
      'On a school Google account, use Transfer your content if your admin allows it. It copies Drive files you own into another Google Account and leaves the originals behind.',
      'Microsoft’s license-reclaim page says to move personal documents from school OneDrive to a local drive, a USB drive, or another OneDrive that you manage, before access to the school online services ends.',
      'Your school’s sharing rules can block both paths. Follow the note from your own IT office when it differs.',
    ],
    mail: [
      'Export or copy mail while you can still sign in. A download is a copy, not a transfer of the school mailbox.',
      'Google Takeout can include mail. Google’s Gmail help says a school account might not be allowed to export everything.',
      'On a computer, open Gmail Settings, See all settings, then Forwarding and POP/IMAP. Add a forwarding address and confirm it from that inbox.',
      'Back in Gmail, refresh Settings, select Forward a copy of incoming mail to, choose what happens to the Gmail copy, and select Save Changes. Verifying the address does not by itself turn forwarding on.',
      'Forwarding does not include mail already in the mailbox. A school can turn forwarding off. That is the school’s rule.',
      'Microsoft’s license-reclaim page says that after a student license returns to the pool, mailbox data is held for 30 days, except data kept for a Legal Hold. The mailbox is then deleted. OneDrive is not deleted by that reclaim. This is not a date every school uses.',
      'This app reads .mbox and .eml. A .pst is not one of those files. In new Outlook, open the message, choose More actions, then Save as. On Outlook on the web or Outlook.com, choose More actions, then Download. Keep the file only when its name ends in .eml. The download is often .eml or .msg, and .msg is not readable here. Classic Outlook’s File, Save As list can offer another type; do not assume the default is .eml. PDF from Print is not a mailbox file. Opening a .pst needs classic Outlook installed for new Outlook, and both copies must be the same 32-bit or 64-bit build. That still does not make the .pst itself scannable. If you cannot save an .eml, add the account from the checklist.',
    ],
    contacts: [
      'In Google Contacts on a computer, select the contacts, choose Export, and save a Google CSV or vCard. Directory contacts at a school may not export.',
      'Google’s school-copy tool does not include contacts. Export them separately.',
      'Microsoft’s student guide says to move contacts with Outlook’s import and export tools.',
    ],
    recovery: [
      'Open the personal inbox, bank, and social accounts you cannot lose.',
      'Find recovery email, backup email, phone, or two-factor settings and replace the school address.',
      'If the school inbox is already closed, try a recovery email, phone number, or backup codes you set earlier. This app never asks for the password.',
      'Send a test password reset only if you already have another way in.',
    ],
  },
  schoolGuideMeta: {
    verifiedAt: '2026-10-19',
    drive: [
      {
        label: 'Google Transfer your content',
        url: 'https://support.google.com/accounts/answer/6386856',
      },
      {
        label: 'Microsoft student guide',
        url: 'https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide',
      },
      {
        label: 'Microsoft license reclaim',
        url: 'https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education',
      },
    ],
    mail: [
      {
        label: 'Google Takeout',
        url: 'https://support.google.com/accounts/answer/3024190?hl=en',
      },
      {
        label: 'Gmail download limits',
        url: 'https://support.google.com/mail/answer/10016932?hl=en',
      },
      {
        label: 'Gmail forwarding',
        url: 'https://support.google.com/mail/answer/10957?hl=en',
      },
      {
        label: 'Microsoft license reclaim',
        url: 'https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education',
      },
      {
        label: 'Microsoft student guide',
        url: 'https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide',
      },
      {
        label: 'Save an Outlook message',
        url: 'https://support.microsoft.com/en-us/outlook/mail/save-an-outlook-message-as-a-eml-file-a-pdf-file-or-as-a-draft',
      },
      {
        label: 'Open an Outlook data file',
        url: 'https://support.microsoft.com/en-us/outlook/open-and-close-outlook-data-files-pst',
      },
    ],
    contacts: [
      {
        label: 'Google Contacts export',
        url: 'https://support.google.com/contacts/answer/7199294',
      },
      {
        label: 'Google Transfer your content',
        url: 'https://support.google.com/accounts/answer/6386856',
      },
      {
        label: 'Microsoft student guide',
        url: 'https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide',
      },
    ],
    recovery: [
      {
        label: 'Microsoft license reclaim',
        url: 'https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education',
      },
    ],
  },
  sourcesNote:
    'Steps were read from the linked official page. If a field says Unverified, that procedure was not confirmed.',
  warnings: {
    longLine: 'A very long line was skipped.',
    headerOverflow: 'A message had too many headers. Extra headers were ignored.',
    newsletters: 'Newsletters without an account signal were not listed as accounts.',
    accountBudget:
      'The scan reached the account list budget and kept reading without adding more services.',
    zipTooMany: 'This archive has too many files.',
    zipExpanded: 'This archive expanded too far and was stopped.',
    zipUnsafe: 'An archive entry with an unsafe path was skipped.',
    zipNested: 'Nested archives are not opened.',
    zipSkipped: 'An archive entry was skipped because it is not an .mbox or .eml file.',
    zipMethod: 'An archive entry uses an unsupported compression method.',
    zipDamaged: 'This archive is damaged and was stopped.',
    zipIncomplete: 'This archive is incomplete and was stopped.',
    scanUnread: 'The file could not be read.',
    saveOpen: 'Saved data could not be opened.',
    saveWrite: 'Saved data could not be written.',
    wipeBlocked: 'Saved data is still open in another tab, so it could not be deleted.',
    wipeQuota:
      'The browser could not record the wipe, so nothing was deleted. Your notes are still on this device. Try again.',
    wipeFailed: 'The data could not be deleted. Your notes are still on this device. Try again.',
    backupLimit:
      'This workspace is larger than the 32,000,000 character backup limit, so it was not saved or downloaded.',
  },
  taskTitles: {
    email: 'Change login email',
    export: 'Export your data',
    replace: 'Find an alternative',
    delete: 'Review account deletion',
    recovery: 'Check recovery email',
  },
  schoolTaskTitles: {
    drive: 'Back up school cloud files',
    mail: 'Export school email',
    contacts: 'Export school contacts',
    recovery: 'Review recovery methods for important accounts',
  },
  report: {
    title: 'After School — Migration report',
    generated: 'Updated',
    local: 'Created on your device. This file may contain personal notes.',
    synthetic: 'DEMO: These are synthetic example accounts.',
    progress: 'Progress',
    completed: 'completed',
    deadline: 'School account expiry',
    assumed: '(assumed — confirm with your school)',
    unknown: 'Not set — confirm the date with your school.',
    policy: 'Your school policy notes',
    accounts: 'Accounts',
    tasks: 'Tasks',
    notes: 'Notes',
    likely: 'Likely account',
    due: 'Suggested date',
    noTasks: 'No tasks yet.',
    ownership: { mine: 'Mine', unsure: 'Not sure', 'not-mine': 'Not mine' },
  },
  calendar: {
    product: '-//After School//Local migration checklist//EN',
    name: 'After School checklist',
    reminder: 'Review your After School checklist',
    assumed: 'The school account expiry date is an assumption. Confirm it with your school.',
    privacy: 'This calendar contains your local task names and notes.',
    needsDate:
      'Set a graduation or school-account end date before this item can have a calendar day.',
  },
  save: {
    saving: 'Saving on this device…',
    saved: 'Saved on this device',
    error: 'This device could not save. Your change is still on screen.',
  },
  countdown: {
    remaining: (days: number, date: string) =>
      days < 0 ? `School access was set to end on ${date}.` : `${days} days until ${date}.`,
    unknown: 'No school end date yet.',
  },
  risk: {
    billing: 'A paid plan can keep charging the school email.',
    data: 'Files, messages, or a library may be hard to move later.',
    restricted: 'The service may only work with the school address.',
    education: 'School work, a class, or a record may stay on this account.',
    recovery: 'This address may be the way back into a personal account.',
  },
  contactTemplate: `Subject: I am moving to a new email address

Hello,

My previous school email will stop working. Please use this address instead:

[new address]

Thank you.`,
  notify: {
    title: 'After School',
    body: 'A migration task is due while this tab is open.',
    closed:
      'A reminder is sent only while this tab is open and you have allowed notifications. Closing the tab does not guarantee a reminder.',
  },
} as const;

export const genericChecklist = `After School generic checklist
This file has no personal account names.

1. Write down the day your school account stops working. If you do not know, ask the school and label your guess.
2. Export school mail, contacts, and the files you own.
3. For each service that used the school email, change the login email to a personal inbox or export the data.
4. Replace the school address anywhere it is a recovery email.
5. Turn on two-factor authentication on the personal inbox.
6. Tell important contacts the new address.

Your school’s rules override this list.`;
