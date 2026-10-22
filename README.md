# Vegaz Web Experience (frontend)

The Vegaz website (events, sign-up, chat), built in **Nuxt 4 + Vue 3 + TypeScript + plain CSS** from the
*Vegaz Revamp* Figma file.

> **Status: UI prototype on mock data.** Every screen and interaction works, but nothing talks to a server
> yet. All data comes from `app/mocks/` through `app/services/`. Engineering replaces the services with real
> API calls. See [Open items](#open-items) and `DECISIONS.md`.

---

## Quick start

Requirements: **Node.js 20 or newer** (`.nvmrc` pins 20).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command              | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `npm run dev`        | Local dev server with hot reload                                |
| `npm run build`      | Production build (server + client) into `.output/`              |
| `npm run generate`   | Static site (plain HTML/JS) into `.output/public/`, for hosting |
| `npm run preview`    | Serves the last `build` locally                                 |
| `npm run typecheck`  | TypeScript check of the whole app                               |

**Designers (Mac):** double-click **`Start Preview.command`**. It installs dependencies on the first run,
then opens the app in your browser. Keep the Terminal window open while previewing.

### Trying the app (demo data)

| What                   | How                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Log in (existing user) | Email `johnbade@gmail.com`, then any 6-digit code → signed in as **Esther Marie**     |
| Sign up (new user)     | Any other email → code → names → gender → success                                    |
| Wrong code             | `000000` shows the error state                                                       |
| Chat                   | Profile menu → **Chat** (only Esther has chats; new sign-ups see the empty state)     |
| All events             | Home → **Explore all** (or the footer's "Explore Events")                           |
| Event page             | Click any home card, a chat's title, or search (e.g. "party") in the header          |
| Buy tickets            | Event page → pick tickets → **Buy Ticket**. Signed out: any email except johnbade@gmail.com asks for your details. Payment is a demo step |
| Join an event's chat   | Event page → **Join Community - Free** (asks you to log in first)                    |
| Component preview      | `/dev/components` (ticket option card; not linked from the app)                      |
| Gallery stress test    | `/dev/gallery?n=7` (event gallery with 1–20 photos; not linked from the app)         |

Sign-in is kept in memory only: **reloading the page signs you out**.

---

## Project structure

```
app/
  app.vue                 root: renders the layout + current page
  layouts/default.vue     sticky header, page, footer; the login/sign-up modal
  pages/
    index.vue             Home (Figma "Desktop - 29")
    chat.vue              Chats (Figma section "chat"); signed-in only
    events/index.vue      All events (Home "Explore all"; not in Figma)
    events/[id].vue       Event details (Figma section "event details")
    dev/components.vue    internal component preview (remove or protect before release)
    dev/gallery.vue       gallery with any number of photos, for testing (dev only)

  components/             auto-imported; the folder becomes the name prefix
    ui/                   design-system building blocks: UiButton, UiInput, UiModal,
                          UiDropdownMenu, UiAvatar, UiPhotoViewer, UiToast, ...
    layout/               LayoutHeader, LayoutFooter, LayoutSearchBox (header search)
    home/                 HomeHero, HomePromoBanners
    event/                EventSection, EventCard, and the event page parts:
                          EventGallery, EventFacts, EventHostTag, EventTicketPanel,
                          EventTicketBar, EventExpectList, EventCommunity,
                          EventJoinCard, EventAppBanner
    auth/                 the onboarding steps (AuthOnboardingModal + one file per step)
    checkout/             the buy ticket flow: CheckoutFlow (steps), CheckoutHeader, CheckoutSelect,
                          one file per step, CheckoutSuccessView
    chat/                 ChatList, ChatConversation, ChatMessage, ChatComposer,
                          ChatProfilePanel, ChatEmpty
    ticket/               TicketOption (built ahead of the ticket page)

  composables/            shared state and behaviour (auto-imported)
    useSession            signed-in user (mock, in memory)
    useAuthModal          open/close the login/sign-up modal from anywhere
    useMediaQuery         usePhoneLayout() = screen narrower than 768px
    useMessageGestures    phone press-and-hold menu + swipe-to-reply on chat messages
    useShareLink          share sheet / copy link with a "Link copied" toast

  services/               THE ONLY place screens get data from (see "Data flow")
  mocks/                  demo data used by services until the API exists
  types/                  shared TypeScript types (proposed API shapes)
  config/                 static content: footer links, profile menu items
  utils/                  small pure helpers (chat date/time, naira formatting)

  assets/styles/
    tokens/primitives.css raw values: colours, spacing, radii, shadows
    tokens/semantic.css   role tokens components use (--color-text-primary, ...)
    tokens/typography.css type scale, text roles and text classes (.text-body-semibold, ...)
    base.css              global resets

public/images/            icons and images
  auth/ chat/             icons exported from Figma
  events/                 event fliers (placeholder event images)
  event/                  event page icons (exported from Figma)
  expect/                 "What to expect" photos
  event-photos/           event gallery photos (free stock photos, Pexels)
  placeholders/           placeholder photos of people (avatars, chat photos)

DECISIONS.md              log of every design/engineering decision, flag and open item
```

---

## How the code is organised

### Data flow: components → services → mocks

```
page / component  ──calls──▶  services/chat.ts  ──reads──▶  mocks/chat.ts
                                   ▲
                    replace the body with $fetch('/api/...'), keep the signature
```

- Components **never import from `mocks/`**. They call functions in `services/`, which return typed data
  (`types/`) and add a short fake delay.
- To connect the real backend, rewrite each service function's body and keep its signature. Nothing else
  should need to change.
- Each service file lists its open questions for engineering at the top (`OPEN ITEMS`).

### Styling: tokens only

- **One source of truth**: `assets/styles/tokens/`. Primitives (raw values) → semantic roles → typography.
- Components use **semantic tokens** (`var(--color-text-primary)`, `var(--spacing-md)`), never raw hex or px.
  Exceptions are commented with the Figma value they copy.
- Text styles: classes such as `.text-small-regular` (defined in `tokens/typography.css`), or the matching
  `--text-*-size / -line / -tracking` tokens. They resize at the 1024px breakpoint automatically.
- Component CSS is `scoped`. Class names follow BEM: `.chat-msg`, `.chat-msg__bubble`, `.chat-msg--mine`.
- Breakpoints: phones `< 768px`, tablet `768–1023px` (squeezed desktop, no design), desktop `≥ 1024px`,
  content stops growing at 1440px.

### Components

- **Auto-imported** by Nuxt. The folder is the prefix: `components/chat/ChatList.vue` → `<ChatList>`,
  `components/ui/Button.vue` → `<UiButton>`.
- Each file starts with a comment block: which Figma node it comes from, its props/variants, and anything
  **"Not in Figma (proposed)"** or **"FLAG"** (differs from Figma, needs review).
- `ui/` components are generic and know nothing about Vegaz data. Feature folders (`chat/`, `event/`, ...)
  combine them with typed data.
- Accessibility is part of the component: labels, keyboard support (Escape, arrow keys, focus return) and
  focus rings. `UiButton` and `UiInput` log a dev warning when a required label is missing.

### Naming

- On-screen copy says **"Events"**. Figma still says "Hangouts" in places; code follows the copy
  (`EventCard` is Figma's "Hangout card").
- Primary colour is purple `#4B099F` everywhere Figma had blue (letter avatars keep their own palette).

---

## Sharing a live preview

The app runs on mock data, so it can be hosted as a **static site** with no backend. The easiest set-up is
to connect the GitHub repo to **Vercel** or **Netlify** (both free for this). Every push then redeploys, and
every pull request gets its own preview link.

### 1. Put the project on GitHub (first time)

```bash
cd vegaz-web
git init
git add .
git commit -m "Vegaz web: home, onboarding, chat (mock data)"
git branch -M main
git remote add origin https://github.com/<your-org>/vegaz-web.git   # create the empty repo on github.com first
git push -u origin main
```

`node_modules/` and build output are already in `.gitignore`.

### 2a. Vercel (recommended)

1. Go to vercel.com → **Add New… → Project** → import the GitHub repo.
2. Vercel detects Nuxt automatically. Keep the defaults and click **Deploy**.
3. You get a link like `vegaz-web.vercel.app`. Share it.
4. From now on, every push to `main` updates that link, and every pull request gets its own preview link,
   posted on the PR.

### 2b. Netlify (alternative)

1. app.netlify.com → **Add new site → Import an existing project** → pick the repo.
2. Build command `npm run generate`, publish directory `.output/public`.
3. **Deploy**. You get a `*.netlify.app` link.

### Things to know before sharing

- Anyone with the link can open it. Both hosts can add password protection on paid plans, or use an
  unguessable project name.
- The demo fliers include real phone numbers and emails. Swap them out before sharing publicly.
- `/dev/components` is reachable on the hosted site too (it has `noindex`).

---

## Open items

Collected from the `OPEN ITEM` comments in the code (search for `OPEN ITEM` to find each one).

**Engineering**
- API endpoints and data shapes for auth, events, chat, tickets and checkout (`services/*.ts`, `types/*.ts`).
- Real Paystack checkout, order creation and ticket emails (`services/checkout.ts`; the demo payment always succeeds).
- Real session (cookie/token) and restoring it on reload (`composables/useSession.ts`).
- Chat: real-time delivery, paging older messages, photo upload and limits, read receipts.
- How each home section ("this week", "hot", "upcoming", "explore all") is chosen.
- Dates and prices: the API will likely send ISO dates and amounts; display formats to agree.
- Fonts: Google Fonts (current) or self-hosted (`nuxt.config.ts`).
- Linting/formatting set-up (not added yet; `.editorconfig` only).

**Design**
- Event search results page (the header search shows a suggestions list for now).
- RSVP flow for free events (design coming); payment failure and sold-out-mid-checkout states.
- Destinations for: profile event rows, "+N Others" (attendee list), promo banners, footer links, Edit Profile, Settings,
  My Activities, app store links.
- Share Event: the public event link, the phone button design, the "Link copied" toast.
- States not in Figma: failed message send, picking more than 10 photos, copy-link failure.
- Higher-resolution placeholder photos of people (current ones are 80px).

---

## Testing

Each screen was checked in a real browser (Chromium via Playwright) at phone (320–393px), tablet (768px)
and desktop (1024–1440px) widths: layout against Figma, keyboard use, focus handling, no sideways scrolling.
The test scripts are not part of this repo yet. **Proposed:** add Playwright as a dev dependency with
`tests/` per screen, and run it in CI.
