#!/usr/bin/env python3
"""Write src/data/catalog.json from procedures read on 2026-10-19."""
import json
from pathlib import Path

V = "2026-10-19"
UNVERIFIED = "Unverified. A current official procedure was not confirmed on 2026-10-19."


def guide(status, steps, url=None):
    item = {"status": status, "steps": steps}
    if url:
        item["url"] = url
    return item


def unverified():
    return guide("unverified", [UNVERIFIED])


def edu(available, impact, url=None):
    item = {"available": available, "impact": impact}
    if url:
        item["url"] = url
    return item


def entry(id, name, category, domains, email, export, education, deletion, sources):
    return {
        "id": id,
        "name": name,
        "category": category,
        "domains": domains,
        "email": email,
        "export": export,
        "education": education,
        "deletion": deletion,
        "verifiedAt": V,
        "sources": sources,
    }


NO_PLAN = edu("unverified", "Unverified. No current official note about a student plan or email-change effect was confirmed on 2026-10-19.")

entries = [
    entry(
        "google", "Google", "Cloud storage", ["google.com", "gmail.com", "googlemail.com"],
        guide("restricted", [
            "A school-managed Google Account email has to be changed by the administrator, according to Google Account Help.",
            "A personal @gmail.com address can be changed from myaccount.google.com/google-account-email, Personal info, Email, then Change Google Account email, if that control is shown.",
            "Google says the old @gmail.com address stays as an alternate and data such as photos and mail stays in the account.",
        ], "https://support.google.com/accounts/answer/19870?hl=en"),
        guide("verified", [
            "While signed in, open Google Takeout, clear products you do not want, and select Next step.",
            "Choose a delivery method such as an email download link, then Create export. Google says the archive can take minutes to days and that a download does not delete the data.",
            "On a school account, Transfer your content at the school account can copy Gmail (not contacts, chats, or tasks), Drive files you own, and eligible Photos to another Google Account if the school has allowed it. Copies leave the originals in place.",
            "Google’s Gmail export help says a school account may not be able to download every kind of mail data.",
        ], "https://support.google.com/accounts/answer/3024190?hl=en"),
        edu("unverified", "Google says school admins control Takeout transfer. How long a school keeps the account is not a single Google-wide rule."),
        unverified(),
        [
            "https://support.google.com/accounts/answer/19870?hl=en",
            "https://support.google.com/accounts/answer/3024190?hl=en",
            "https://support.google.com/accounts/answer/6386856?hl=en",
            "https://support.google.com/mail/answer/10016932?hl=en",
        ],
    ),
    entry(
        "youtube", "YouTube", "Entertainment", ["youtube.com"],
        guide("restricted", [
            "YouTube uses a Google Account. Google says a school-managed address is changed through the administrator.",
            "Takeout’s YouTube section says a Brand Account’s videos are downloaded only while you are switched into that Brand Account.",
        ], "https://support.google.com/accounts/answer/3024190?hl=en"),
        guide("verified", [
            "In Google Takeout, include YouTube. Google says the archive is created after you choose a delivery method and select Create export.",
            "If videos are missing, Google says to check whether they belong to a Brand Account and switch into it before exporting.",
        ], "https://support.google.com/accounts/answer/3024190?hl=en"),
        NO_PLAN,
        unverified(),
        ["https://support.google.com/accounts/answer/3024190?hl=en", "https://support.google.com/accounts/answer/19870?hl=en"],
    ),
    entry(
        "microsoft", "Microsoft account", "Productivity", ["microsoft.com", "live.com", "outlook.com", "hotmail.com", "office.com", "office365.com"],
        guide("verified", [
            "Sign in at account.live.com/names/manage and choose Add email or Remove next to an existing alias.",
            "Microsoft says aliases share one password and can be used to sign in. A verification code by email goes to the primary alias or another verification address.",
            "This is the personal Microsoft account flow. A school Microsoft 365 address is managed by the school.",
        ], "https://support.microsoft.com/en-us/accounts-billing/manage/change-the-email-address-or-phone-number-for-your-microsoft-account"),
        guide("verified", [
            "Microsoft’s student transition guide says to export the school mailbox and calendar, move contacts with Outlook import/export, and move OneDrive files to storage you control.",
            "The same guide points to Outlook’s file import and export for contacts. This app does not read .pst files.",
        ], "https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide"),
        edu("yes", "Microsoft’s education admin article says schools may assign Exchange Online for Alumni. If a student license is reclaimed, mailbox data is held 30 days and then deleted, with legal-hold exceptions. OneDrive is not deleted by that license change alone. Your school chooses the actual policy.", "https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education"),
        unverified(),
        [
            "https://support.microsoft.com/en-us/accounts-billing/manage/change-the-email-address-or-phone-number-for-your-microsoft-account",
            "https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide",
            "https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education",
        ],
    ),
    entry(
        "onedrive", "OneDrive", "Cloud storage", ["onedrive.com", "sharepoint.com"],
        guide("restricted", [
            "School OneDrive access ends when the school reclaims the Microsoft 365 Education license, according to Microsoft’s graduating-student article. Ask the school before that happens.",
            "A personal Microsoft account alias is changed at account.live.com/names/manage, which is a different account from a school mailbox.",
        ], "https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education"),
        guide("verified", [
            "Microsoft’s student guide says to move personal documents out of school OneDrive to a local drive, a USB drive, or another OneDrive that you manage.",
            "The guide also links a school-file transfer flow. Files you do not own may not move with you.",
        ], "https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide"),
        edu("yes", "Microsoft says OneDrive content is not deleted merely because the student license is reclaimed, but you lose access to the school service. Confirm retention with your school.", "https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education"),
        unverified(),
        [
            "https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide",
            "https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education",
            "https://support.microsoft.com/en-us/accounts-billing/manage/change-the-email-address-or-phone-number-for-your-microsoft-account",
        ],
    ),
    entry(
        "onenote", "OneNote", "Productivity", ["onenote.com"],
        guide("restricted", [
            "School OneNote notebooks sit on the school Microsoft 365 account. Microsoft says reclaiming that license removes access to the school online services.",
        ], "https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education"),
        guide("verified", [
            "Microsoft’s student guide says to save a copy of school OneNote notebooks, Teams assignments, and class materials into a personal account.",
        ], "https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide"),
        NO_PLAN,
        unverified(),
        ["https://support.microsoft.com/en-us/education/manage-graduating-student-licenses-and-content-in-microsoft-365-education", "https://support.microsoft.com/en-us/education/transition-your-files-a-student-s-guide"],
    ),
    entry(
        "dropbox", "Dropbox", "Cloud storage", ["dropbox.com"],
        guide("verified", [
            "Sign in at dropbox.com, open your avatar, then Settings.",
            "On the General tab, choose Edit next to the email address, enter the new address twice and your password, then Update email.",
            "Open the verification message sent to the new address and choose Verify your email. Dropbox says this does not update the separate recovery email.",
            "If you see an info icon instead of Edit, Dropbox says an admin has to change it.",
        ], "https://help.dropbox.com/account-settings/change-email"),
        guide("verified", [
            "Dropbox says files already synced in the desktop or mobile app are on that device. Link a device or adjust selective sync to download folders that are not local yet.",
        ], "https://help.dropbox.com/account-access/access-personal-information"),
        NO_PLAN,
        unverified(),
        [
            "https://help.dropbox.com/account-settings/change-email",
            "https://help.dropbox.com/account-access/access-personal-information",
        ],
    ),
    entry(
        "box", "Box", "Cloud storage", ["box.com"],
        guide("verified", [
            "Box’s account-settings guide says to add and confirm the new email, choose Make Primary, then remove the old address if you no longer need it.",
            "Paid accounts use Link Email. Free accounts use Link Personal Email. Enter the address, Save, and open the verification link.",
            "If Make Primary is missing, Box says an enterprise control such as single sign-on may block the change. Ask the admin.",
            "With single sign-on, Box says end users cannot change the primary email. The admin changes it in the Admin Console and in the organization’s directory before the next login.",
        ], "https://docs.box.com/en/box-fundamentals/for-users/user-login-and-settings/manage-account-settings"),
        unverified(),
        NO_PLAN,
        unverified(),
        [
            "https://docs.box.com/en/box-fundamentals/for-users/user-login-and-settings/manage-account-settings",
            "https://support.box.com/hc/en-us/articles/360043692934-Changing-an-Email-Address-for-a-Single-Sign-On-Account",
        ],
    ),
    entry(
        "github", "GitHub", "Development", ["github.com"],
        guide("verified", [
            "Open your profile picture, then Settings, then Emails in the Access section.",
            "Add the new address, choose it under Primary email address, and Save.",
            "Remove the old address and verify the new one. GitHub says some features stay unavailable until the new address is verified.",
        ], "https://docs.github.com/en/account-and-profile/how-tos/email-preferences/changing-your-primary-email-address"),
        guide("verified", [
            "Open Settings, then Account. Under Export account data, start an export.",
            "GitHub emails a tar.gz link to the primary address. The link expires after seven days by default.",
        ], "https://docs.github.com/en/get-started/archiving-your-github-personal-account-and-public-repositories/requesting-an-archive-of-your-personal-accounts-data"),
        edu("yes", "GitHub Education says some schools require a verified academic email before a student application. The application page reviewed on 2026-10-19 does not say whether a benefit already granted ends when the email changes.", "https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student"),
        unverified(),
        [
            "https://docs.github.com/en/account-and-profile/how-tos/email-preferences/changing-your-primary-email-address",
            "https://docs.github.com/en/get-started/archiving-your-github-personal-account-and-public-repositories/requesting-an-archive-of-your-personal-accounts-data",
            "https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student",
        ],
    ),
    entry(
        "gitlab", "GitLab", "Development", ["gitlab.com"],
        guide("verified", [
            "On GitLab.com, open your avatar, Edit profile, and replace the Email field, then Update profile settings.",
            "Confirm the address if you have not added it before. GitLab says the previous primary email becomes a secondary email.",
            "Secondary addresses can reset a password but are not used to sign in.",
        ], "https://docs.gitlab.com/user/profile/"),
        guide("verified", [
            "A project Maintainer or Owner can export from Settings, General, Advanced, Export project.",
            "GitLab says the export omits some items and should not be treated as a complete backup. Download it from the email link or the project settings page.",
        ], "https://docs.gitlab.com/user/project/settings/import_export/"),
        NO_PLAN,
        unverified(),
        ["https://docs.gitlab.com/user/profile/", "https://docs.gitlab.com/user/project/settings/import_export/"],
    ),
    entry(
        "npm", "npm", "Development", ["npmjs.com"],
        guide("verified", [
            "From npm 5.5.1 or newer, run npm profile set email followed by the new address. npm then asks for the current password and a one-time password if two-factor authentication is on.",
            "On the web, sign in, open your profile picture, then Account. npm’s profile page lists the email stored in package metadata among the settings managed there.",
            "If you cannot reach the old inbox, npm’s recovery page says to start account recovery and submit a ticket with Reset my email.",
        ], "https://docs.npmjs.com/managing-your-profile-settings/"),
        unverified(),
        NO_PLAN,
        unverified(),
        [
            "https://docs.npmjs.com/managing-your-profile-settings/",
            "https://docs.npmjs.com/receiving-a-one-time-password-over-email/",
        ],
    ),
    entry(
        "apple", "Apple Account", "Cloud storage", ["apple.com", "icloud.com"],
        guide("verified", [
            "On iPhone, iPad, or Mac, open Settings or System Settings, your name, then Sign-In & Security.",
            "Open the primary email. Remove it or turn off Primary Email, then verify the replacement.",
            "Apple says purchases and other account data stay, and an address already used by another Apple Account cannot be chosen.",
            "Apple says the website may send you to a trusted device instead of changing the address in the browser.",
        ], "https://support.apple.com/en-us/109353"),
        guide("verified", [
            "Sign in at Apple’s Data and Privacy page. Apple says the tools include getting a copy of data stored with the Apple Account.",
            "The same page says some regions can schedule a one-time or recurring copy of certain data.",
        ], "https://support.apple.com/en-us/102283"),
        NO_PLAN,
        guide("verified", [
            "Apple’s Data and Privacy page includes a control to delete the Apple Account and the data associated with it.",
        ], "https://support.apple.com/en-us/102283"),
        ["https://support.apple.com/en-us/109353", "https://support.apple.com/en-us/102283"],
    ),
    entry(
        "zoom", "Zoom", "Productivity", ["zoom.us"],
        guide("verified", [
            "Sign in to the Zoom web portal, open your profile picture, then Profile.",
            "Under Sign In, choose Edit next to Sign-In Email, enter the new address and password, and Save Changes.",
            "Confirm the message sent to the old address and the message sent to the new address. Zoom says the address does not change until both are confirmed.",
            "If the account is single sign-on only, Zoom says to change the address at the identity provider and then contact Zoom Support. A free Basic account without the old inbox has to create a new account. A paid account can use billing details for recovery.",
        ], "https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063624"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063624"],
    ),
    entry(
        "spotify", "Spotify", "Entertainment", ["spotify.com"],
        guide("verified", [
            "Open Edit personal info, enter the new email under Email, confirm your password, and Save profile.",
            "In the app: profile picture, Settings and privacy, Account, then the email field.",
            "Spotify’s login article says that after 1 September 2026 username login is replaced by email login, so the address on the account should be one you can open.",
        ], "https://support.spotify.com/us/article/change-email-address/"),
        guide("verified", [
            "Spotify says you can download a ZIP of personal data with the automated Download your data tool on the Account Privacy page, or by contacting Spotify.",
        ], "https://support.spotify.com/us/article/data-rights-and-privacy-settings/"),
        NO_PLAN,
        unverified(),
        [
            "https://support.spotify.com/us/article/change-email-address/",
            "https://support.spotify.com/us/article/data-rights-and-privacy-settings/",
            "https://support.spotify.com/us/article/changing-how-you-log-into-spotify/",
        ],
    ),
    entry(
        "figma", "Figma", "Design & creation", ["figma.com"],
        guide("verified", [
            "If the account uses an email and password, open the file browser, your profile, Settings, then the Account tab.",
            "Choose Change email under the address and Save. Figma says to contact support if you cannot open the current inbox.",
            "Google or SAML sign-in follows that provider. Figma says the sign-in method decides whether the address can be edited in Figma.",
        ], "https://help.figma.com/hc/en-us/articles/360039820114-Manage-email-address-or-password"),
        guide("verified", [
            "Figma’s export help says people with access can export assets unless the owner has turned export off.",
            "Export is for sharing a design, moving it to another tool, or keeping a copy outside Figma. This is a design-file export, not a full account archive.",
        ], "https://help.figma.com/hc/en-us/articles/360040028114-Export-static-designs-from-Figma"),
        NO_PLAN,
        unverified(),
        [
            "https://help.figma.com/hc/en-us/articles/360039820114-Manage-email-address-or-password",
            "https://help.figma.com/hc/en-us/articles/360040028114-Export-static-designs-from-Figma",
        ],
    ),
    entry(
        "canva", "Canva", "Design & creation", ["canva.com"],
        guide("verified", [
            "On the homepage, open your profile, Your account, Your profile, then Edit next to the email address.",
            "Canva sends a code to the current address, then a code to the new address. The new address must not already belong to a Canva account.",
            "Canva says affiliated or managed users need an organization admin to approve an email change.",
            "If you no longer have the current inbox, use Canva’s account-recovery article rather than this form.",
        ], "https://www.canva.com/help/change-email/"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://www.canva.com/help/change-email/"],
    ),
    entry(
        "miro", "Miro", "Design & creation", ["miro.com"],
        guide("verified", [
            "In Profile settings, choose Change in the Email section and send a verification code to the current address.",
            "Enter the new address and the code, then Update email. Confirm the link sent to the new address while still signed in with the old one.",
            "Miro says single sign-on addresses are changed by the identity provider and Miro Support, not in Profile settings.",
            "An enterprise domain-control error also has to go through Miro Support.",
        ], "https://help.miro.com/hc/en-us/articles/360011781980-How-to-change-your-email"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://help.miro.com/hc/en-us/articles/360011781980-How-to-change-your-email"],
    ),
    entry(
        "adobe", "Adobe", "Design & creation", ["adobe.com"],
        guide("verified", [
            "Sign in and open Account information and access. Choose Change next to Primary email.",
            "Enter a new address that is not already an Adobe ID, then enter the verification code within 10 minutes.",
            "Adobe says Teams or Enterprise users ask their Adobe admin instead.",
            "An address already used on another Adobe account must be removed there first.",
        ], "https://helpx.adobe.com/account/individual/manage-your-account/change-primary-email-adobe-account.html"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://helpx.adobe.com/account/individual/manage-your-account/change-primary-email-adobe-account.html"],
    ),
    entry(
        "linkedin", "LinkedIn", "Productivity", ["linkedin.com"],
        guide("verified", [
            "Open Me, Settings & Privacy, Sign in & security, then Email addresses.",
            "Add the new address. LinkedIn may send a code to the current primary address or ask you to approve it in the app.",
            "Open the validation message, then choose Make primary. LinkedIn says the primary address can only be replaced by a verified address.",
        ], "https://www.linkedin.com/help/linkedin/answer/a519904"),
        guide("verified", [
            "Open Me, Settings & Privacy, Data Privacy, then Download your data and Request archive.",
            "LinkedIn says a narrow download arrives within minutes and a larger one within 24 hours. The link works for 72 hours. Do this from a private computer; the control is not on mobile.",
        ], "https://www.linkedin.com/help/linkedin/answer/a1339364"),
        NO_PLAN,
        unverified(),
        [
            "https://www.linkedin.com/help/linkedin/answer/a519904",
            "https://www.linkedin.com/help/linkedin/answer/a1339364",
        ],
    ),
    entry(
        "discord", "Discord", "Entertainment", ["discord.com", "discordapp.com"],
        guide("verified", [
            "Discord says support cannot change the address for you. You need the current inbox.",
            "On desktop, open User Settings, My Account, and Edit next to the email. Follow the prompt and confirm the message sent to the new address.",
            "On mobile, open your avatar, the settings gear, Account, then the current email.",
        ], "https://support.discord.com/hc/en-us/articles/4423385681175-How-to-Change-your-Discord-Account-s-Email"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://support.discord.com/hc/en-us/articles/4423385681175-How-to-Change-your-Discord-Account-s-Email"],
    ),
    entry(
        "coursera", "Coursera", "Learning", ["coursera.org"],
        guide("unverified", [
            "Unverified. On 2026-10-19 this Coursera article returned a loading shell, so the email steps were not confirmed.",
        ], "https://www.coursera.support/s/article/learner-000001383?language=en_US"),
        unverified(),
        edu("unverified", "Unverified. On 2026-10-19 this Coursera article returned a loading shell, so a student-plan effect was not confirmed.", "https://www.coursera.support/s/article/learner-000001383?language=en_US"),
        unverified(),
        ["https://www.coursera.support/s/article/learner-000001383?language=en_US"],
    ),
    entry(
        "khan", "Khan Academy", "Learning", ["khanacademy.org"],
        guide("verified", [
            "Create a password if the account does not have one, then choose Connect another email.",
            "Re-authenticate, open the Email tab, and set Send email to the new address. You can then remove the old one.",
            "Khan Academy says an address already used on another account cannot be added until that account is deleted or changed. Learners under 13 cannot edit these settings themselves.",
        ], "https://support.khanacademy.org/hc/en-us/articles/202487580-How-do-I-change-the-email-address-I-use-to-log-in-to-my-account"),
        unverified(),
        NO_PLAN,
        guide("verified", [
            "Khan Academy’s settings article says people 13 or older can permanently delete the account from Settings. Younger learners need a parent or teacher to change the account.",
        ], "https://support.khanacademy.org/hc/en-us/articles/204707040-How-can-I-edit-my-account-settings"),
        [
            "https://support.khanacademy.org/hc/en-us/articles/202487580-How-do-I-change-the-email-address-I-use-to-log-in-to-my-account",
            "https://support.khanacademy.org/hc/en-us/articles/204707040-How-can-I-edit-my-account-settings",
        ],
    ),
    entry(
        "quizlet", "Quizlet", "Learning", ["quizlet.com"],
        guide("verified", [
            "On the web, open Settings, Change your email, enter the new address and password, and Submit.",
            "In the iOS or Android app, open Profile, Email, enter the password and new address, and save.",
            "Quizlet says some accounts that stored a parent email do not show this control. A parent has to contact Quizlet.",
        ], "https://help.quizlet.com/hc/en-us/articles/360029104772-Changing-your-email-address"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://help.quizlet.com/hc/en-us/articles/360029104772-Changing-your-email-address"],
    ),
    entry(
        "turnitin", "Turnitin", "Campus", ["turnitin.com"],
        guide("verified", [
            "The guide reviewed on 2026-10-19 says to sign in at https://home.turnitin.com/ and open your name or User Info.",
            "Choose Update your email. The current inbox receives a link that expires in one hour. Open it, enter the new address, and continue.",
            "Turnitin says open sessions signed in with the old address end. Finish work first.",
        ], "https://guides.turnitin.com/hc/en-us/articles/23962693684237-Changing-your-security-information"),
        unverified(),
        edu("unverified", "Turnitin is often provided by a school. Whether your school lets you change the address was not confirmed beyond Turnitin’s own user guide."),
        unverified(),
        ["https://guides.turnitin.com/hc/en-us/articles/23962693684237-Changing-your-security-information"],
    ),
    entry(
        "zotero", "Zotero", "Learning", ["zotero.org"],
        guide("verified", [
            "Add the new address in Zotero’s email settings and open the verification link in a browser where you are signed in.",
            "Zotero says any verified address can sign in, complete two-step checks, and reset the password.",
            "Zotero recommends a backup address when the primary one is a work or school inbox.",
        ], "https://www.zotero.org/support/kb/change_email"),
        unverified(),
        edu("unverified", "Unverified as a student plan. Zotero’s email article, updated 2026-09-29, recommends a backup address because an institutional inbox may change. That page does not document a student discount.", "https://www.zotero.org/support/kb/change_email"),
        unverified(),
        ["https://www.zotero.org/support/kb/change_email"],
    ),
    entry(
        "orcid", "ORCID", "Learning", ["orcid.org"],
        guide("verified", [
            "On your ORCID record, open the pencil on Emails.",
            "Add the new address, save, and verify it from the message ORCID sends. Then delete the old address and save again.",
            "ORCID says an outdated only address can lock you out of the iD.",
        ], "https://support.orcid.org/hc/en-us/articles/18501349590295-Managing-associated-email-addresses"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://support.orcid.org/hc/en-us/articles/18501349590295-Managing-associated-email-addresses"],
    ),
    entry(
        "overleaf", "Overleaf", "Learning", ["overleaf.com"],
        guide("verified", [
            "Overleaf’s account page says most users can update the email addresses and login methods on the account.",
            "A Professional group can turn the account into a managed account. Overleaf says managed accounts cannot add or change email addresses.",
            "The detailed button labels were not included in the page text fetched on 2026-10-19. Use the official page rather than a guessed menu path.",
        ], "https://docs.overleaf.com/accounts-and-security/email-address-and-login-options"),
        unverified(),
        edu("unverified", "Overleaf documents managed group accounts, which can block email changes. A separate student-plan rule was not confirmed."),
        unverified(),
        ["https://docs.overleaf.com/accounts-and-security/email-address-and-login-options"],
    ),
    entry(
        "moodle", "Moodle", "Campus", ["moodle.org"],
        guide("verified", [
            "Moodle Docs says to open the user menu and Edit profile. Email address is one of the required general fields.",
            "The same page says an administrator’s authentication settings may block editing the email. If the field is locked, ask the school Moodle admin.",
            "Choose Update profile when the form can be edited. A school Moodle site may live on the school’s own domain, so a mailbox from that domain can stay unrecognized until you classify it.",
        ], "https://docs.moodle.org/en/Edit_profile"),
        unverified(),
        edu("unverified", "Moodle is usually run by the school. Docs confirm admins can lock the email field. Site-specific retention was not confirmed."),
        guide("verified", [
            "Moodle Docs says an administrator can disable an account by setting authentication to No login. That is an admin action, not a self-serve delete button described on the page.",
        ], "https://docs.moodle.org/en/Edit_profile"),
        ["https://docs.moodle.org/en/Edit_profile"],
    ),
    entry(
        "slack", "Slack", "Productivity", ["slack.com"],
        guide("verified", [
            "Open my.slack.com/account. Expand Email Address, enter your password and the new address, and Update Email.",
            "Confirm the message sent to the new address. If Slack asks you to sign in, use the old address, then Save.",
            "Repeat while signed into each workspace. Slack says a workspace owner can block edits when single sign-on is on.",
        ], "https://slack.com/help/articles/207262907-Change-your-email-address"),
        guide("verified", [
            "On a computer, a Workspace Owner or Admin clicks Admin in the sidebar, then Workspace settings, Security, Import & export data, and the Export tab. Choose a date range, then Start Export. Slack emails you when the ZIP is ready. Open the email, visit the export page, and choose Ready for download.",
            "On Free and Pro, Owners and Admins can export public-channel messages and file links as JSON. A Free workspace can only export file links from the last 90 days. Private channels and direct messages are not in that export. Business+ all-channels and direct-message exports require the Workspace Owner to apply. On Enterprise, Org Owners request the export tools, and a member with the Export Admin system role can also export. A regular member cannot export other people's direct messages.",
        ], "https://slack.com/help/articles/201658943-export-your-workspace-data"),
        NO_PLAN,
        unverified(),
        [
            "https://slack.com/help/articles/207262907-Change-your-email-address",
            "https://slack.com/help/articles/201658943-export-your-workspace-data",
        ],
    ),
    entry(
        "notion", "Notion", "Productivity", ["notion.so"],
        guide("verified", [
            "Open Settings from the workspace name, then your name, Account security, Manage emails.",
            "Add the new address, enter the code sent to it, then Make primary from its menu. Remove the old address if you want.",
            "Notion says an address already used on another account must be removed there first, from Settings, your name, Delete my account.",
            "Enterprise admins can disable aliases or limit them to verified domains.",
        ], "https://www.notion.com/help/account-settings"),
        guide("verified", [
            "A workspace export is under Settings, Workspace, General, Export all workspace content.",
            "Notion emails a download link that expires after 7 days. Notion says the export can be HTML, Markdown, or CSV, and PDF on Business or Enterprise. Other people’s private pages are not included. Desktop or web only.",
        ], "https://www.notion.com/help/workspace-settings"),
        NO_PLAN,
        guide("verified", [
            "Notion’s account article says an unwanted account is removed from Settings, your name, Delete my account.",
        ], "https://www.notion.com/help/account-settings"),
        ["https://www.notion.com/help/account-settings", "https://www.notion.com/help/workspace-settings"],
    ),
    entry(
        "openai", "ChatGPT", "Productivity", ["openai.com"],
        unverified(),
        guide("verified", [
            "Sign in to ChatGPT, open Settings, Data controls, Export, then Confirm export.",
            "OpenAI says the export email or SMS can take up to 7 days. The download link expires 24 hours after it arrives, and you download it while signed into the same account.",
            "Business, Enterprise, and ChatGPT for Healthcare workspaces do not have this self-serve export. Ask the workspace owner.",
            "The Privacy Portal path is Make a Privacy Request, consumer ChatGPT account, Download my data.",
        ], "https://help.openai.com/en/articles/7260999-exporting-your-chatgpt-history-and-data"),
        NO_PLAN,
        unverified(),
        ["https://help.openai.com/en/articles/7260999-exporting-your-chatgpt-history-and-data"],
    ),
    entry(
        "todoist", "Todoist", "Productivity", ["todoist.com"],
        guide("verified", [
            "Open your avatar, Settings, then Change email. Enter the new address twice and your password.",
            "Todoist sends a verification link to the new address only. The help article updated 7 October 2026 says you do not need the old inbox for that confirmation.",
            "Google, Facebook, or Apple sign-in needs a Todoist password first. Two-factor accounts also need an authenticator code.",
        ], "https://www.todoist.com/help/account-and-billing/account/change-your-email-address-OgNcgI"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://www.todoist.com/help/account-and-billing/account/change-your-email-address-OgNcgI"],
    ),
    entry(
        "trello", "Trello", "Productivity", ["trello.com"],
        guide("verified", [
            "Trello says the login email is the Atlassian account email. Change it on the Atlassian account, which also changes other Atlassian apps.",
            "An address already used by another Trello account cannot be used. Google sign-in needs a password before the email can change.",
            "If a company has verified the email domain, Trello says that company’s admin can deactivate or delete the account. Trello recommends a personal address for personal boards.",
        ], "https://support.atlassian.com/trello/docs/changing-an-email-address/"),
        unverified(),
        edu("unverified", "Unverified as a student plan. Trello’s email article says a verified company domain lets that organization’s admin manage or delete the account. That page does not document a student discount.", "https://support.atlassian.com/trello/docs/changing-an-email-address/"),
        unverified(),
        ["https://support.atlassian.com/trello/docs/changing-an-email-address/"],
    ),
    entry(
        "wordpress", "WordPress.com", "Development", ["wordpress.com"],
        guide("verified", [
            "While signed in, open your name, My WordPress.com account, replace Email address, and Save.",
            "Open the confirmation sent to the new address. WordPress.com says that if the link asks you to sign in, use the old address.",
            "WordPress.com recommends a personal inbox because a school or work address can lock the account when it stops.",
            "Closing an account does not free the address for 30 days.",
        ], "https://wordpress.com/support/email-address/"),
        unverified(),
        edu("unverified", "Unverified as a student plan. WordPress.com’s email guide, reviewed 5 October 2026, warns that a school or work address can strand the account. That page does not document a student discount.", "https://wordpress.com/support/email-address/"),
        unverified(),
        ["https://wordpress.com/support/email-address/"],
    ),
    entry(
        "grammarly", "Grammarly", "Productivity", ["grammarly.com"],
        guide("verified", [
            "On the Profile page, choose Update next to Email. Enter a verification code if asked, then the new address, and Update.",
            "Open the confirmation link sent to the new address. An address already on another Grammarly account requires that other account to be deleted first.",
            "Google, Facebook, or Apple registration needs a Grammarly password before the control appears.",
            "An organizational subscription has to be removed by the admin and the person re-invited at the new address.",
        ], "https://support.grammarly.com/hc/en-us/articles/115000089932-I-need-to-change-my-email-address"),
        unverified(),
        edu("unverified", "Unverified as a student plan. Grammarly says an organizational subscription has to be removed by an admin before the email can change. That page does not document a student discount.", "https://support.grammarly.com/hc/en-us/articles/115000089932-I-need-to-change-my-email-address"),
        unverified(),
        ["https://support.grammarly.com/hc/en-us/articles/115000089932-I-need-to-change-my-email-address"],
    ),
    entry(
        "evernote", "Evernote", "Productivity", ["evernote.com"],
        guide("verified", [
            "Open Account Settings, Account Summary, and Edit next to the email. Evernote may ask you to sign in again.",
            "Enter the new address and Continue. The change finishes only after you open the verification link and see Email successfully updated.",
            "If that link shows a login page, Evernote says to sign in with the old address.",
            "Google or Apple sign-in without a password needs the password-setup flow first. Teams or Enterprise addresses are changed by the team admin.",
        ], "https://help.evernote.com/hc/en-us/articles/208313338-Change-your-account-login-email-address"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://help.evernote.com/hc/en-us/articles/208313338-Change-your-account-login-email-address"],
    ),
    entry(
        "netflix", "Netflix", "Entertainment", ["netflix.com"],
        unverified(),
        guide("verified", [
            "Account owners open https://www.netflix.com/account/getmyinfo and follow Netflix’s instructions.",
            "Netflix says a copy can take up to 30 days after they verify the request. Trouble goes to privacy@netflix.com.",
            "A profile user who added an email asks privacy@netflix.com. Netflix says the account owner is told about that request.",
        ], "https://help.netflix.com/en/node/100624"),
        NO_PLAN,
        unverified(),
        ["https://help.netflix.com/en/node/100624"],
    ),
    entry(
        "amazon", "Amazon", "Shopping & finance", ["amazon.com"],
        unverified(),
        guide("verified", [
            "Amazon’s Request Your Personal Information page says to open Request My Data, choose the information, and Submit Request while signed in.",
            "Use the validation link in the confirmation email. Amazon then sends a secure download link to the account email.",
        ], "https://www.amazon.com/gp/help/customer/display.html?nodeId=G5NBVNN2RHXD5BUW"),
        NO_PLAN,
        unverified(),
        ["https://www.amazon.com/gp/help/customer/display.html?nodeId=G5NBVNN2RHXD5BUW"],
    ),
    entry(
        "paypal", "PayPal", "Shopping & finance", ["paypal.com"],
        unverified(),
        guide("verified", [
            "PayPal’s US help says personal accounts open Settings, Data & Privacy, Download your data, choose options, and Submit Request.",
            "PayPal says it checks identity before releasing data and may refuse a request it cannot verify.",
        ], "https://www.paypal.com/us/cshelp/article/how-can-i-access-my-personal-data-help366"),
        NO_PLAN,
        unverified(),
        ["https://www.paypal.com/us/cshelp/article/how-can-i-access-my-personal-data-help366"],
    ),
    entry(
        "reddit", "Reddit", "Entertainment", ["reddit.com"],
        unverified(),
        guide("verified", [
            "On a computer, open https://www.reddit.com/settings/data-request, sign in, and submit the form.",
            "Reddit’s help article updated 19 March 2026 says preparation can take up to 30 days. The download link arrives in the Reddit inbox, or sometimes at a verified email.",
            "Without account access, Reddit says to email redditdatarequests@reddit.com from the verified address.",
        ], "https://support.reddithelp.com/hc/en-us/articles/360043048352-How-do-I-request-a-copy-of-my-Reddit-data-and-information"),
        NO_PLAN,
        unverified(),
        ["https://support.reddithelp.com/hc/en-us/articles/360043048352-How-do-I-request-a-copy-of-my-Reddit-data-and-information"],
    ),
    entry(
        "pinterest", "Pinterest", "Entertainment", ["pinterest.com"],
        guide("verified", [
            "On the web, open Settings, Account management, replace the Email field, and Save. Business accounts start from the arrow at the top right instead of the bottom-left menu.",
            "Enter the code from the message titled Your Pinterest verification code.",
            "Pinterest says an address already used on another account must be deactivated there and then left unused for seven days. Without the current inbox, Pinterest says it cannot make the change.",
        ], "https://help.pinterest.com/en/article/manage-your-email-address"),
        unverified(),
        NO_PLAN,
        unverified(),
        ["https://help.pinterest.com/en/article/manage-your-email-address"],
    ),
]

if len(entries) < 40:
    raise SystemExit(f"catalog has only {len(entries)} entries")
seen = set()
for item in entries:
    for domain in item["domains"]:
        if domain in seen:
            raise SystemExit(f"duplicate domain {domain}")
        seen.add(domain)
    if not item["sources"] or not item["verifiedAt"]:
        raise SystemExit(f"missing source {item['id']}")

path = Path(__file__).resolve().parents[1] / "src" / "data" / "catalog.json"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(entries, indent=2) + "\n", encoding="utf-8")
print(f"wrote {len(entries)} entries to {path}")
