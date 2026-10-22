# Privacy

After School keeps your mailbox and notes on the device where you open it.

## What stays here

- A mailbox file you choose is read in a worker in this browser. The app keeps counts, dates, signal labels, and at most eight short evidence rows per account. It does not keep the message body.
- Subjects are shown during the session only if you turn on “save subjects.” Otherwise they are removed before the workspace is written to IndexedDB.
- Notes, school domains, dates, and task status are stored in IndexedDB on this device. Optional encryption uses AES-GCM. The password is not saved. If you forget it, the app cannot open the workspace; delete the data and start again.
- Demo mode is labeled and uses invented examples.

## What does not happen

- There is no upload, account, analytics, advertising, or catalog update check.
- Mail HTML is not rendered. Remote images and links inside mail are not requested.
- The production page sets `connect-src 'none'`, so the app cannot open a connection of its own.
- A help link opens in a new tab only when you click it, and only if that host is one recorded for that service.

## Delete

**Delete all my data** clears localStorage, sessionStorage, Cache Storage, the After School IndexedDB database that holds notes and mailbox results, and this site’s service worker registration. It does not write your notes back immediately after that. A later visit can create an empty workspace with no personal fields.

A separate database, `after-school-control`, keeps one random wipe marker. It has no notes, names, or message text. It stays after a wipe so another open tab cannot put the deleted copy back. This is a remaining difference from deleting every browser database. The marker is not a copy of your mailbox.

## What this policy cannot cover

Your school, and each service you open in another tab, has its own policy. A calendar app you import an `.ics` file into is outside After School. A PDF or text report you download can contain notes you typed; that file is yours to keep or delete.
