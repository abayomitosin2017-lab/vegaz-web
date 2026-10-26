/**
 * Legal pages content (decision 26 Oct).
 * DRAFT FOR LEGAL REVIEW: written in plain language from how the product
 * works today (accounts by email code, profiles, hosting, tickets with
 * Paystack, free RSVPs, event chats). It is not legal advice and is not
 * binding until Vegaz's lawyer approves it.
 * OPEN ITEMS (legal / business): the company's registered name and address,
 * contact email, minimum age, refund rules, how long data is kept, and the
 * list of service providers. These are marked [to confirm] in the text.
 * Each section: a heading and paragraphs; a paragraph that is an array is
 * shown as a bullet list.
 */
export interface LegalSection { id: string; title: string; body: (string | string[])[] }
export interface LegalDoc { slug: 'terms' | 'privacy'; title: string; intro: string; updated: string; sections: LegalSection[] }

const UPDATED = '26 October 2026'

export const termsOfService: LegalDoc = {
  slug: 'terms',
  title: 'Terms of Service',
  updated: UPDATED,
  intro: 'These terms explain the rules for using Vegaz to discover, host and join events, buy tickets and chat with other people going. By creating an account or using Vegaz, you agree to them.',
  sections: [
    { id: 'about', title: 'About Vegaz and these terms', body: [
      'Vegaz is a social events platform operated by [company legal name, to confirm], based in Lagos, Nigeria ("Vegaz", "we", "us").',
      'These terms apply to the Vegaz website and apps. Some features, such as event settings and moderation, are only in the Vegaz mobile app.',
    ] },
    { id: 'account', title: 'Your account', body: [
      'You sign in with your email address and a one-time code. Keep access to your email secure: anyone who can read your codes can use your account.',
      [
        'You must be at least [minimum age, to confirm] to use Vegaz.',
        'Give accurate details (name, username, email). Your username must be unique and must not pretend to be someone else.',
        'You are responsible for what happens on your account. Tell us straight away if you think someone else is using it.',
      ],
    ] },
    { id: 'using', title: 'Using Vegaz', body: [
      'Be respectful. You agree not to:',
      [
        'harass, threaten, bully or discriminate against anyone;',
        'post anything illegal, hateful, sexually explicit or violent, or anything you do not have the right to share;',
        'create fake events, sell tickets you cannot honour, or mislead people about an event;',
        'send spam, scam other members or collect their details without permission;',
        'try to break, overload or get around the security of Vegaz.',
      ],
    ] },
    { id: 'hosting', title: 'Hosting events', body: [
      'When you host an event you are the organiser, not Vegaz. You are responsible for the event description, date, location, ticket types and prices, and for running the event safely and as described.',
      [
        'Only list events you have the right to run, at venues you are allowed to use.',
        'Follow the laws that apply to your event, including licensing, age limits and health and safety rules.',
        'If you change or cancel an event, update it on Vegaz and tell the people going as soon as you can.',
      ],
      'Vegaz may remove an event that breaks these terms or that we reasonably believe is unsafe or misleading.',
    ] },
    { id: 'tickets', title: 'Tickets, RSVPs and payments', body: [
      'Free tickets are RSVPs: you reserve a place without paying. Paid tickets are charged at checkout. The price, any fees and the total are shown before you pay.',
      'Payments are processed by Paystack. Vegaz does not store your card details. Paystack\'s own terms and privacy policy also apply to your payment.',
      'You can buy tickets for other people and assign them by name and email. Those people will receive their ticket by email.',
      'Refunds: [refund rules to confirm, for example who decides refunds (the host or Vegaz), deadlines, and what happens when an event is cancelled].',
    ] },
    { id: 'chats', title: 'Event chats and community', body: [
      'Joining an event\'s community adds you to its chat. Other people in the chat can see your name, photo, bio and the messages and photos you send.',
      'The first time you join an event\'s chat, Vegaz posts a short hello from you made from your bio and main profile photo. You can skip adding a bio.',
      'Hosts can moderate their event\'s chat in the Vegaz app. You can report messages or people that break these terms.',
    ] },
    { id: 'content', title: 'Your content', body: [
      'You own the photos, messages, bios and event details you add. You give Vegaz a non-exclusive, worldwide, royalty-free licence to host, show and share that content so the service works (for example showing your event to other people and your messages in a chat).',
      'This licence ends when you delete the content or your account, except where others have already shared it or we must keep it by law.',
    ] },
    { id: 'safety', title: 'Safety at events', body: [
      'Meeting people you do not know has risks. Vegaz does not run events or check every host or guest. Use your judgement, meet in public places when you can, and leave if you feel unsafe. In an emergency contact the local emergency services.',
    ] },
    { id: 'ending', title: 'Suspending or closing accounts', body: [
      'You can stop using Vegaz at any time and ask us to delete your account.',
      'We may suspend or close an account, or remove content, if it breaks these terms, puts others at risk or if the law requires it. Where it is reasonable, we will tell you why.',
    ] },
    { id: 'liability', title: 'Our responsibility to you', body: [
      'We work to keep Vegaz available and secure, but it is provided "as is" and may sometimes be unavailable.',
      'As far as the law allows, Vegaz is not responsible for events run by hosts, for what members do at events, or for indirect losses. Nothing in these terms limits rights you have that cannot be limited by law. [Limits of liability to confirm with legal.]',
    ] },
    { id: 'changes', title: 'Changes to these terms', body: [
      'We may update these terms as Vegaz changes. If a change is important we will tell you before it applies, for example by email or in the app. The date at the top shows when they last changed.',
    ] },
    { id: 'law', title: 'Law and disputes', body: [
      'These terms are governed by the laws of the Federal Republic of Nigeria. If we have a disagreement we will first try to sort it out with you directly. [Dispute process and courts to confirm.]',
    ] },
    { id: 'contact', title: 'Contact us', body: [
      'Questions about these terms: [contact email, to confirm].',
    ] },
  ],
}

export const privacyPolicy: LegalDoc = {
  slug: 'privacy',
  title: 'Privacy Policy',
  updated: UPDATED,
  intro: 'This policy explains what personal information Vegaz collects, why, who sees it and the choices you have. We aim to follow the Nigeria Data Protection Act 2023.',
  sections: [
    { id: 'who', title: 'Who we are', body: [
      'Vegaz is operated by [company legal name and address, to confirm]. We are responsible for the personal information described here. Contact: [privacy contact email, to confirm].',
    ] },
    { id: 'collect', title: 'What we collect', body: [
      'Information you give us:',
      [
        'Account: first and last name, username and email address.',
        'Profile: photos, bio, gender and birthday, if you add them.',
        'Tickets: the contact email and phone number you give at checkout, and the names and emails of people you assign tickets to.',
        'Events you host: event details, photos, location, date, ticket types and prices.',
        'Chats: the messages and photos you send in event chats.',
      ],
      'Information created when you use Vegaz:',
      [
        'The events you host, join, RSVP to or buy tickets for.',
        'Payment records from Paystack (amount, status, reference). We do not receive or store your full card details.',
        'Basic technical information such as your device, browser and pages visited, used to keep Vegaz working and secure.',
      ],
    ] },
    { id: 'use', title: 'How we use it', body: [
      [
        'To create and run your account and sign you in with one-time codes.',
        'To show your profile, events and messages to the people you interact with.',
        'To sell and deliver tickets and RSVPs, and send ticket emails.',
        'To post your introduction in an event\'s chat the first time you join (from your bio and main photo).',
        'To suggest events and personal touches, for example around your birthday, if you shared it.',
        'To keep Vegaz safe: preventing fraud, enforcing our Terms and responding to reports.',
        'To meet legal obligations.',
      ],
    ] },
    { id: 'basis', title: 'Why we are allowed to use it', body: [
      'We use your information because it is needed to provide the service you asked for (our contract with you), because you agreed (for example optional profile details), because we have a legitimate interest in keeping Vegaz safe and improving it, or because the law requires it. You can withdraw consent at any time.',
    ] },
    { id: 'share', title: 'Who can see it and who we share it with', body: [
      [
        'Other members: your name, username, photos and bio are shown on your profile and in event chats; your messages are seen by people in that chat.',
        'Hosts: when you buy a ticket, RSVP or join an event, its host can see your name and the tickets you hold.',
        'People you assign tickets to receive their ticket by email.',
        'Paystack, to process payments.',
        'Service providers that help us run Vegaz, such as hosting and email delivery [list to confirm], under contracts that protect your information.',
        'Authorities, when the law requires it or to protect someone\'s safety.',
      ],
      'We do not sell your personal information.',
    ] },
    { id: 'keep', title: 'How long we keep it', body: [
      'We keep your information while your account is open and as long as needed for the purposes above, then delete it or make it anonymous. Ticket and payment records may be kept longer for accounting and legal reasons. [Retention periods to confirm.]',
    ] },
    { id: 'security', title: 'Keeping it safe', body: [
      'We use technical and organisational measures such as encrypted connections, access controls and one-time sign-in codes. No system is perfectly secure, so please keep your email account secure too.',
    ] },
    { id: 'rights', title: 'Your rights', body: [
      'You can ask us to:',
      [
        'give you a copy of your personal information;',
        'correct it (you can also edit most of it on your Edit Profile page);',
        'delete it, or delete your account;',
        'stop or limit certain uses, or object to them;',
        'move it to another service where that is possible.',
      ],
      'Contact [privacy contact email, to confirm]. If you are not happy with our answer you can complain to the Nigeria Data Protection Commission.',
    ] },
    { id: 'children', title: 'Children', body: [
      'Vegaz is not meant for people under [minimum age, to confirm]. If we learn that we hold information about someone under that age, we will delete it.',
    ] },
    { id: 'storage', title: 'Cookies and browser storage', body: [
      'Vegaz uses your browser\'s storage to keep you signed in and to remember small preferences, such as whether the chat pop-up is open. [Analytics or advertising cookies, if any, to confirm.]',
    ] },
    { id: 'changes', title: 'Changes to this policy', body: [
      'We will update this policy when the way we use information changes, and tell you about important changes before they apply. The date at the top shows the latest version.',
    ] },
    { id: 'contact', title: 'Contact us', body: [
      'Questions or requests about your information: [privacy contact email, to confirm].',
    ] },
  ],
}

export const legalDocs = { terms: termsOfService, privacy: privacyPolicy }
