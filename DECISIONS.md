# Vegaz design system: decisions and open items

Source: Vegaz Revamp Figma, page "01 — Foundations / System Guide".

## Agreed
- Framework: Nuxt. Styling: plain CSS variables (no Tailwind for now).
- Typography: sizes come from the Figma text-style tokens, not the documentation text.
- No dark mode for web.
- Breakpoints 768 / 1024 / 1440 kept as in Figma. Typography switches to desktop sizes at 1024.
- Tables: left out for now.
- Header and Footer: deferred until the frontend prototype stage. Owner decides when and which. REMIND at that stage.
- First components: Button, Input, Select, Modal.

## Proposed by us (not in Figma, need approval)
Hover, pressed, disabled, placeholder and focus-ring values. See section B of semantic.css.

## Flags to review with design
1. Web Mobile Headline 2 is 24px with a 48px line-height.
2. Web Mobile Headline 3: bold 18px, other weights 16px.
3. Web Desktop Headline 1 size follows a 56 variable; bold line-height is 60.
4. ~~Primary light/dark ramp is blue while Primary is purple.~~ Resolved: blue removed (see "Blue → Primary purple").
5. Grey_3 and lighter, and the bright accents, need contrast review for small text.
6. Buttons and inputs have no disabled variants in Figma; inputs have no hover.

## Needs engineering approval
Nuxt version, TypeScript, package manager, linting, and whether Outfit is self-hosted or loaded from Google Fonts.

## Button (UiButton), built from Figma node 36:3560
Props map to Figma axes: size, fill (solid/outline/ghost = Figma "no"), color, chevron, iconOnly. Dark mode not built.
Flags found in Figma:
1. Secondary solid differs by size: standard is grey-6 with a 1px grey-5 border and 32px side padding; small is grey-5, no border, 16px padding.
2. Secondary text is Grey_1 (#303237), not the Text/Primary role.
3. Small buttons are 40px high, below the 44px Touch size. Review for touch screens.
4. Ghost (Figma fill "no") text colour was not read for every variant; primary is assumed to be action purple.
5. Button text uses the Mobile App Body/Small styles (16/24, 14/20), so it does not grow on desktop.
6. Icons and the chevron must be exported from Figma as SVG. This environment cannot download Figma asset links.
Proposed (not in Figma): hover, pressed, disabled, focus ring, 150ms colour transition (off for reduced motion).

## Button review (against Figma, 10 variants read)
Fixed: standard side padding differs per variant in Figma (primary solid/outline 24, primary ghost 32, secondary solid/outline 32, secondary ghost 24), and strokes sit inside the frame so total sizes now match. Ghost primary text is confirmed purple. Icon-only is 56 x 48 (standard) and 56 x 40 (small).

## Input (UiInput), Figma node 49:2771, standard style
Defined in Figma: white bg, 1px Grey_5 border, radius 12, 52px high, 14/20 Grey_1 text, placeholder Grey_3, focus border Primary light_1 (#6891FF, blue; now Primary purple #4B099F by decision), error border Negative light_1 (#FF958D). A right-hand action turns the field into a pill (radius 40) with a purple round 36px button.
Flags:
1. Focus and error are border-colour changes only. (Focus is now purple, which also fixes the low contrast of the old blue #6891FF.)
2. Figma inputs have no label, helper or error message text, and no hover state. Not invented.
3. Left-icon variant text colour is Grey_1 even with placeholder on; we use Grey_3 placeholder everywhere.
4. "small" and "line" styles not built yet.
5. Disabled style is proposed. Icons (eye, search) pending SVG export.

## Project setup (proposed, needs engineering approval)
Nuxt 4.6, TypeScript, npm, plain CSS. Nuxt 4 folder layout (`app/`). Outfit from Google Fonts. Recorded as an open item; change freely if engineering prefers otherwise.
Token additions made while wiring the project:
- `--color-border-focus` (Primary light_1) and `--color-border-error` (Negative light_1): UiInput already used them; values are from the Figma input component.
- `--text-app-small-regular-*` (14/20): UiInput already used it.
- `--gray-200/500/600/900`: the Figma Footer uses a separate "Gray" collection.
- `--color-placeholder-media` (#C4C4C4): Figma's grey image placeholder. Not a Figma variable.

## Home, Figma "Desktop - 29" (node 9856:49029)
Built at 1440 to match Figma to the pixel (page height 2882px, every block position checked).
Components: LayoutHeader, LayoutFooter (default layout), HomeHero, HomePromoBanners, EventSection, EventCard (renamed from EventHangoutCard on 22 Oct). Data: `services/events.ts` → `mocks/events.ts` (Figma demo text at first; flier events since 22 Oct).

UiButton / UiInput extensions (no visual change to existing variants):
- `textStyle="web"` on both: uses the responsive Web text style. Figma shows 18/28 labels on the hero and "Explore all" buttons and 16/24 text in the header search.
- `--ui-button-pad-x` and `--ui-button-border-color`: hooks for Figma instance overrides ("Host an Event" has 32px padding as a ghost button; hero "Explore Events" has a Grey_3 border).

Flags (kept exactly as Figma, confirm with design):
1. Hero content is 58px from both sides (header and content use 64).
2. Off-scale spacing (HOME/DEFAULT, decision 20 Oct): hero text 59px below the header and 64px above the hero's bottom (Figma's 328px hero starts 5px under the header); content starts 46px below the hero and ends 141px above the footer. Was Desktop - 29 (75 / 79 / 63 / 77).
3. Medium Hangout cards are 285.3px tall (image 193.3px).
4. Footer text: "© 2077" and "X Formerly Twitter)" (missing opening bracket).
5. Footer colours use the "Gray" collection, not Grey_1..6.
6. Hero sentence ends without a full stop.
7. ~~The two 184px grey banners have no content in Figma.~~ Resolved: real banners added (see "Promo banners").

Not built / open items:
- Header signed-in variants (desktop and mobile) and the account dropdown: out of scope for now.
- Link and button destinations: none in Figma. Header and hero buttons emit events; footer links are `#`; cards are not clickable.
- Search: the header emits `search` with the text. No search behaviour.
- How each home row is selected (this week / hot / upcoming / explore): backend rule, not implemented.
- Date format: mock data uses the display string from Figma; the API format is to be agreed.
- Hover states for footer links and cards: none in Figma, none added.

Assets (public/images):
- `logo-header.svg`, `icon-search.svg`: SVG exported from Figma.
- `logo-footer.svg`: same file as the header logo, shown at 99 x 41.885 (Figma's footer logo has the same proportions). Replace if design has a separate footer export.
- `badge-app-store.png` (344 x 102, 2x) and `badge-google-play.png` (172 x 51, 1x): supplied as PNG. FLAG: the Google Play badge is 1x and will look soft on high-density screens; an SVG or 2x export is preferred.

## Blue → Primary purple (decision)
No blue anywhere in the web UI. The Input focus border now uses Primary purple (#4B099F). The blue "Primary light/dark" ramp (#ECEFFE, #9DB8FD, #6891FF, #1E387E, #132451) was removed from the tokens. Store badges keep their own brand colours.

## Home responsive behaviour
Breakpoints: below 768 = mobile, 768-1023 = tablet, 1024+ = desktop. Typography still switches at 1024.
- Below 768: Figma HOME/DEFAULT/MOBILE (node 10653:39287), checked to within ~1px at 393 (page height 2991 vs 2992 in Figma without the phone status bar and Safari bar).
  - Header: mobile variant (logo, round search and profile icon buttons, 80px).
  - Hero stacked; buttons full width (48px); "Explore all" sits below its cards.
  - Rows scroll sideways edge to edge; small cards 160px, medium cards 205px with a square image.
  - Promo banners: square 330 x 330 versions in a sideways-scrolling row (16px gap), between "Upcoming events" and "Explore all events".
  - Section titles 24/32, -0.5 (as rendered in the latest mobile frame). Mobile footer: badges first, links in two pairs, logo above copyright.
- 768-1023 (no tablet design; decision: desktop layout squeezed): 32px side margins (Container inset tablet). Hero text and buttons side by side; cards share the row with one card fewer per row (decision); medium cards switch to a square image so images stay even; long category chips end in "...".
- 1024-1439: desktop layout, fluid.
- 1440+: content stays 1312px wide and centred (decision). Header, hero and content line up on the same 1312 column; footer container is 1280 as in Figma.
- No sideways page scroll from 320 to 2560 (checked).

Mobile flags (kept as Figma unless design says otherwise):
1. Mobile hero heading is 32/40; the Headline 1 token is 32/48 below 1024. Figma value used below 1024.
2. Mobile hero content has 20px left and 16px right margins.
3. Mobile content ends 42px above the footer (41.8 in the latest mobile frame; it was 88.8 before the banners were added).
4. Mobile footer: second columns are 143px (Company) and 131px (Legal) wide, so they don't line up.
5. Mobile frame has a 1px white line between header and hero; not reproduced (treated as a Figma slip).
6. The mobile frame's own sample events differ from desktop; one data set (desktop events) is used at every size (decision).
7. Small-card width on mobile rounded from 160.57 to 160px, medium from 205.33 to 205px.
8. On desktop, card rows are top-aligned instead of centred (no visible difference at 1440; keeps squeezed tablet rows even).
9. Mobile section titles are 24/32 (-0.5) in Figma, while the Headline 3 semibold token's mobile value is 16/26. Figma's code export reports 16px, but the frame renders 24px; built to match what the frame shows. The token's mobile value should be updated in Figma.
10. Accessibility: footer links are 24px tall and the logo link 36px (as designed). That meets the WCAG 2.2 AA minimum target size (24px) but is below the 44px touch guideline. Review with design.

## Hangout card text (decision, Figma node 7343:7945)
At every size: the title stops after 2 lines with "...", the location and date each stay on one line and end in "..." when too long. Stress-tested with "MMMM..." text at 393, 768, 900, 1024 and 1440.
Title weight: semibold (Small semibold, 14/20 below 1024px, 16/24 from 1024px). Changed from Figma's bold by design decision; sizes are unchanged.
Medium cards from 1024px fix the image height (193.3px, Figma) rather than the card height, so images stay level when a title wraps to 2 lines; identical at 1440.

## Sticky header (decision)
The header stays fixed to the top of the screen while the page scrolls, at every width (mobile 80px, desktop 88px). Cards and banners scroll underneath it. Figma frames are static, so this is a build decision.

## Promo banners
Real banners from the newer HOME/DEFAULT frame replace the grey placeholders: 644 x 168 at 1440 (was 184 in Desktop - 29), so "Explore all events" sits 16px higher, as in that frame. The hero, content and footer spacing now follow HOME/DEFAULT too (see Home flag 2); the page is 2882px tall at 1440, as in that frame. Mobile uses square 330 x 330 banners. Banners are single SVG images with alt text; not links yet (no destination in Figma).

## Testing (Home)
Checked in a headless browser (Chromium):
- Mobile (393, touch): all 4 card carousels and the banner carousel respond to a real swipe, scroll the row and not the page, start 20px from the edge and end with the last card fully visible 20px from the edge.
- 768, 900, 1024, 1100, 1200, 1300, 1440, 1920: no sideways page scroll, rows fit, no card text spills out of its card, all images load, no errors.
- 1440 is pixel-identical to the approved desktop render. Search field takes input; focus border and keyboard focus ring are Primary purple; no blue on the page.


New assets: `icon-search-24.svg`, `icon-profile-24.svg` (mobile header).

## Ticket option card (Figma Component 13, node 9832:32993), built ahead of the next page
Components: `TicketOption` (card), `UiQuantityStepper` (- n +), `UiBadge` (status pill). Types `types/ticket.ts`, mock `mocks/tickets.ts`, service `services/tickets.ts`. Preview of all 5 variants: `/dev/components` (dev-only route, no header/footer; remove or protect before release).
Variant mapping: free / custom / vip = availability 'available'; reminder = 'low' (red badge with clock, "+" stops at maxQuantity and turns grey); sold out = 'sold-out' (grey badge, stepper box empty and unusable).
Behaviour (agreed reading of Figma): number is display-only and changes with - / +; "-" stops at 0 and looks the same at every value (grey in all Figma states); "+" uses the grey icon at the limit. Description stops after 2 lines with "...". Price and badge text come from data.
Sizes match Figma exactly (cards 415 x 129 / 147, header strip 64, card overlap 25, stepper 158 x 58, number box 42, badge 20). Text uses the fixed Mobile App styles (new tokens: app h2 bold 24/32, app h3 semibold 20/26, app x-small regular and semibold 12/18).
Flags:
1. Header strip colour #F3F3F3 and the dashed border (Base black 20%) are raw values in Figma, not variables (added as `--color-ticket-header`, `--color-ticket-border`).
2. 0.5px hairline borders: drawn as an overlay so they never change the size; on 1x screens drawn as 1px at half the opacity so they look like Figma.
3. Outfit has no Naira sign (₦); it shows in a fallback font (Figma does the same).
4. White 12px text on the red badge (#FF3B2D) is about 3.5:1 contrast, below the 4.5:1 AA target for small text.
5. Low-stock rule and per-order limit (what sets `maxQuantity`) are backend decisions.
Tested: sizes for all 5 variants, + / - limits, low-stock limit, sold-out lock, keyboard use and purple focus ring, 2-line description cut-off.

## Onboarding modals (Figma section "onboarding", 10656:49108)
Top row = signup, bottom row = login (confirmed by design).
- Signup: Email -> Enter Code -> Names -> Gender ("Wassap {first name}") -> Account Setup Successful.
- Login: Email -> Enter Code -> modal closes.
Opened by "Login or signup" (desktop header) and the profile icon (mobile header). Back = previous step (entered values kept); X or Escape closes and clears everything. After login or "Start exploring" the modal closes and the page stays as it is (logged-in header is out of scope, decision).

Components: `UiModal` (reusable dialog: focus moves in and is kept inside, Escape closes, page scroll locked, focus returns to the button that opened it), `UiTextField` (labelled field, green success state), `UiCodeInput` (6 boxes: typing advances, Backspace goes back, arrows move, paste fills all). Steps in `components/auth/`, flow in `AuthOnboardingModal`, open/close via `useAuthModal()`. Data via `services/auth.ts` (mock rules in `mocks/auth.ts`).

Mock rules (decisions, for the preview only; engineering replaces the service):
- johnbade@gmail.com = existing account -> login; any other valid email -> signup.
- Code 000000 is wrong (red error state); any other 6 digits is accepted.
- Wrong-code message: "The code you entered is incorrect" (Figma said "Please enter a valid email address"; changed by decision).
- Username availability is checked as you type (always available in the mock). No "taken" state is designed yet.
- Resend: counts down from 15:00 ("Resend code 14:15" in Figma), then "Resend Code" in green restarts it. With all 6 digits entered it shows "Resend Code" in Grey_3, as drawn.

Continue becomes purple: Email when the address looks valid; Code when all 6 digits are in; Names when first, last and an available username are filled (phone optional, as in Figma); Gender once a choice is made (Figma shows it grey with Female selected; treated as not updated). An inactive Continue keeps Figma's grey secondary look and does nothing.

Sizes match Figma (desktop / mobile card heights): Email 464 / 410 (Figma 460 / 408), Code 448, Code error 470, Names 580 / 540, Gender 541 / 501 (540 / 500), Success 358 / 328. Card widths per step from Figma (376, 375, 435, 375, 441); on phones never wider than the screen minus 20px each side (353 on a 393px phone).

Flags (kept as Figma, review with design):
1. The terms sentence mixes two text sizes (spaces, "and" and the "o" of "our" are larger); built exactly as drawn.
2. Code error state: digits drop to the smaller text size, so the boxes get 4px shorter (as drawn).
3. Female / Male labels do not line up (33px gap vs a 112px group), as drawn.
4. Modal widths differ per step (375-441px); the "Names (filled)" frame is 30px off-centre in Figma, built centred.
5. Raw colours (not variables): #0E0F11 titles, #141316 field text and labels, #525964 notes; the option divider is drawn as an image in Figma and built as a 1px Grey_5 line.
6. Mobile success card uses 17px top/bottom padding (16 elsewhere), as drawn.
7. Icons mail, sms-code, user, ai-magic and close: SVG (Grey_1 strokes), replacing the earlier 1x PNGs (20 Oct).
8. Emoji (😉, 👋) show in each device's own emoji style.
Tested (desktop 1440, tablet 768, mobile 393): full signup and login, wrong code, editing clears the error, paste, Back keeps values (including the gender choice), Escape and X close, focus kept inside, focus returns, page scroll locked, modal above the sticky header, no errors.

## Spacing check against Figma (20 Oct)
Measured in the browser and compared with the Figma frames (HOME/DEFAULT 1440, HOME/DEFAULT/MOBILE 393, onboarding desktop and mobile). Changes:
- Desktop hero, content and footer gaps moved to HOME/DEFAULT (decision, see Home flag 2).
- Mobile card widths now Figma's exact 160.57px (small) and 205.33px (medium); were rounded to 160 / 205, which put lower sections up to 1px high. FLAG: Figma's "Explore all events" row uses 159.29px small cards; 160.57 is used for both small rows.
- Gender modal: the divider line no longer adds 1px (Figma lines take no layout space). Card now 540 / 500, as in Figma.
- Email modal terms note: the paragraph now uses x-Small as its base size, removing 2px. Mobile card now 408 (Figma 408); desktop 462 (Figma 460). The last 2px comes from how browsers stack lines of mixed 14/18 and 16/24 text (24 + 24 + 18); line breaks match Figma.
Matches within 1px (text rendering only): header, all section and banner positions, card internals (image, chip, text lines), Explore row, footer at both sizes, code, names and success modals.

## Single source for styles (20 Oct)
All colours, fonts, text sizes, radii and spacing come from `assets/styles/tokens/` (primitives → semantic → typography). Components use role tokens only; no component refers to the raw palette (`--grey-*`, `--gray-*`, `--base-*`) or writes a hex colour.
- New colour roles: text-strong (Grey_1), text-muted (Grey_3), text-inverse, text-placeholder-subtle (Grey_4), background-neutral, border-strong (Grey_4), border-stronger (Grey_3), footer roles (Gray collection), ticket-border-subtle, text-option (#000, raw in Figma), shadow-chip.
- New text roles: section-title (24/32/-0.5), modal-title (24/32, -0.5 / -0.2 from 1024), hero-title-line (40 below 1024).
Still written in components (by design, flagged): fixed component measurements copied from Figma that have no token (e.g. 16px and 20px icons, 310px terms width, 238px hero buttons, 581px hero text, 171.6px app badges), and off-scale Figma spacing (hero 58 / 59 / 80, content 42 / 46 / 141, header 18, gender gap 33, names fields 100, success 18, ticket -25, badge 3). FLAG for design: add 16 / 20px icon sizes and a 16px radius to the token set, or move these to the scale.

## Search clear button (decision, 20 Oct)
The (x) that appears in the header search once you type is Grey_1 (design decision; not in Figma). It is the browser's own clear button restyled: a 16px cross. Safari and Chrome show it; Firefox shows none.

## Signed-in home + profile menu (21 Oct)
Figma: HOME/LOGGED IN (10653:39693), HOME/LOGGED IN/MOBILE (10653:39744), profile menu (10653:40453), letter avatars (10679:52368).
Only the header changes when signed in; the page below is the same as signed out.
Components: `UiAvatar` (photo or letter), `UiDropdownMenu` (menu button), header `user` prop. Data: `useSession()` (signed-in user), `services/auth.ts` (`signIn`, `createAccount` returns the user, `signOut`), `mocks/auth.ts` (`mockExistingAccount`), `config/profileMenu.ts` (menu items).

Decisions (21 Oct):
- Signing in: login signs in when the code is verified; signup signs in when the account is created (the header behind the success card already shows the user). Log out returns to the signed-out header and moves keyboard focus to "Login or signup".
- Page spacing stays as signed out. FLAG: the signed-in desktop frame has the hero 5px lower, events 13px lower and 128px above the footer.
- Menu opens 8px below the profile button, right edges aligned, with the Dp2 shadow (Figma shows the card alone, no shadow).
- Letter avatar for users without a photo: first letter of the first name, Outfit Medium (weight 500 added to the font load), Figma ratio 180/386 of the avatar size. The colour set (orange, purple, lime, red, blue) is fixed per person, picked from the username. Blue kept for avatars only (exception to the no-blue rule).
- Menu text is 18/28 at every width, as in Figma (new text role `menu-item`).

Built to match Figma (measured): desktop profile button 193 x 50 at x1183 (Figma 1183), avatar, name, @username and arrow positions exact; search 532; mobile search button 273,16 and avatar 337,20 exact; menu 174 x 253 with text lines at 16 / 60 / 104 / 148, line at 192, "Log out" at 209, exact at 393, 768 and 1440.

Proposed (not in Figma, need approval): menu row highlight on hover / keyboard (Grey_6); profile button hover and open state (Grey_5); long names and usernames end in "..." after 160px.
Behaviour (standard menu button): click, Enter, Space or Arrow Down opens and focuses the first item; arrows, Home, End move; Escape closes and returns focus; Tab or a click outside closes; the menu also closes when the page changes.

Flags:
1. The profile button's 0.5px Grey_5 border is drawn as an inset shadow (browsers round a 0.5px border up to 1px, which made it 51px tall).
2. Mobile avatar button is 40px, below the 44px recommended tap size.
3. "Log out" red (#FF3B2D) on white is about 3.6:1, below the 4.5:1 target for 18px regular text.
4. Letter avatar colours are raw values in Figma; the light letters (lime, orange) are low contrast. The letter is decorative (the name is in the button label).
5. Demo login account: johnbade@gmail.com signs in as Esther Marie @estiloo (the Figma user); email and name don't match, both are demo data.

Open items:
- Edit Profile, Chat, Settings and My Activities have no pages; choosing them only closes the menu.
- The session is in memory only: reloading the page signs you out. Engineering: real session (cookie/token), restoring it on load.
- Asset still needed: Esther Marie's photo (`public/images/avatars/esther-marie.png`; until then she shows the letter "E").
- Down arrow supplied 21 Oct (Figma colour #1C274C, kept as supplied).

## Secondary button colour (Figma update, 21 Oct)
Action secondary is now Grey_6 (#F8F8F8), was Grey_5 (#E5E7EF). Secondary solid buttons use it at both sizes (standard keeps its 1px Grey_5 border; small has none), and so does the signed-in profile button. The separate "action-secondary-subtle" token is removed (it was the same Grey_6). Proposed pressed state for outline/ghost buttons stays Grey_5 (now `background-neutral`).

## Chat (21 Oct), Figma section "chat" (10681:52423), desktop
Page `/chat` (profile menu → Chat). Components in `components/chat/`: ChatList, ChatConversation, ChatMessage, ChatComposer, ChatProfilePanel, ChatEmpty. Data: `services/chat.ts` → `mocks/chat.ts`; formats in `utils/chatFormat.ts`; types in `types/chat.ts`. `UiInput` gained a `filled` style (Grey_6 pill) for "Search chats".

Decisions (21 Oct):
- Built for 1024+ and squeezed down to 768 (list narrows; with a profile open, the list hides until it closes). Phones: see "Chat on phones" below.
- Message box: the screens' look (white "Type your message" field, camera) plus the "Component 4" states: send button while typing, "Replying to" box. Quick chat suggestions: later.
- Reply: a reply button beside each message on hover or keyboard focus (always visible on touch screens). Not in Figma.
- Profile panel: opens from a sender's photo or name; the X or Escape closes it.
- Working with demo data: open chats, search the list by event title, unread badges clear when a chat is opened, send text (Enter or the send button), send photos with an optional caption (camera opens the file picker), reply.
- Empty states (designed from existing styles): "Select a chat to start messaging" when no chat is open; "No chats yet" in the list plus "Join an event to start chatting" with an "Explore events" button for accounts with no chats. The demo login account has chats, new sign-ups don't.
- Copy: "Hangouts" → "Events" everywhere on screen ("All Events", "events they joined or hosted").
- Chat header: "Buy Ticket" (small primary button, 98 x 40) replaces the "..." button (Figma update 21 Oct). It does nothing yet: OPEN ITEM (no ticket page).
- Photos are grey placeholders (downloads from Figma are blocked); photos you send show for real.
- Page fills the screen height (no footer); each column scrolls on its own; the conversation stays on the newest message (also when the profile panel opens and the bubbles re-wrap).
- Signed out: going to /chat sends you home and opens Login or signup; logging out on /chat takes you home.

Measured against Figma at 1440 x 885 (exact unless noted): list column 64,128 342 x 714; "Chats" 32 tall; search at y184, 52 tall; rows from y260, 84px apart; conversation x446, 930 wide; header 86 tall; body 628; message box y754, 64 tall; "TODAY" pill and every bubble position (54 / 170 / 268 / 434 inside the body) and size (381 x 108 / 90); with the profile open: 342 | 24 | 594.4 | 24 | 327.6, name at y479.6, memoji x1344; your photo-with-caption bubble 275 x 375.

Flags:
1. Figma list rows vary (52 / 58 / 72px tall, three preview greys, two time greys, one row 6px gap): normalised to unread (time purple, preview Grey_2, red badge) and read (time Grey_4, preview Grey_3), 52px rows.
2. List dates are read as M/DD/YY ("2/02/25" is listed above "1/05/25", so that is 5 January).
3. The chat frames' "Grey_6" is #F4F5F8 (ours #F8F8F8); used as its own token (`--color-chat-subtle`) for hairlines, joined-notice lines, the close button and the profile divider.
4. Photo-message time is Inter 8px in Figma; Outfit Sub 10/14 is used, so the three-photo bubble is 315 tall (Figma 311).
5. "Asherkine just joined" pill is a fixed 135px in Figma; ours fits the text (128).
6. Text bubbles are 381px wide in Figma; ours are up to 381 and shrink for short messages.
7. Figma list previews for the first three chats don't match their last message; both kept as drawn.
8. The list line between rows starts 43px in (as drawn), not under the text.
9. Profile event titles "Native breakfast cl..." and "Jonny Drille Music Video.." are cut off in Figma; the full titles are guesses. "Cook, East , Gist" kept as written.
10. Raw colours in Figma (now tokens): bubble text #FFFDF6, others' time #6D7786, list divider #E7EAED, header title #000.

Day pill ("TODAY", "YESTERDAY") and join-notice shadows softened to 0 1px 4px at 6% (decision 21 Oct; Figma: 0 24 24 at 16% and 0 4 12 at 8%).

Proposed (not in Figma, need approval): hover / selected row background (Grey_6); the reply button; the quoted message inside a reply bubble; the X to cancel a reply; the 64px photo preview with X before sending; "No chats match" text; focus border on the message box; how your own last message reads in the list ("You: ...", "Photo").

Open items:
- No real-time updates, older-message paging, failed-send state, upload limits, read receipts or profile privacy rules yet (engineering).
- Event rows in the profile panel have no destination.
- The ">" arrows on profile event rows are removed (decision 21 Oct).

## Chat photos: several at once + full-size viewer (decision 21 Oct)
- The camera picks several photos at once; using it again adds more (proposed limit: 10 per message; extra picks are skipped, no message yet: OPEN ITEM). Each preview has its own X.
- Photo grid in a message (259px wide, radius 8, 1px gaps): 1 photo = square and 3 photos = wide + two squares (both Figma); not in Figma, same style: 2 = two tall halves, 4 = 2 x 2, 5+ = 2 x 2 with "+N" on the last square (dark cover, white Body semibold).
- Clicking any photo opens `UiPhotoViewer` (not in Figma, needs design review): dark backdrop (#141316 at 92%), the whole photo uncropped, "2 / 5" count, white round close and previous / next buttons (the supplied down arrow, turned), caption under the photo. Escape, Left / Right arrows, Tab kept inside, click outside closes, focus returns to the photo. Demo photos open as grey placeholders.
- List preview for a photo-only message: "Photo" or "N photos" (proposed).

## Chat on phones (21 Oct), Figma mobile chat frames (10683:54774 list, 10683:54673 chat, 10683:54480 profile)
Below 768px the chat works one screen at a time:
- List: under the normal mobile site header (decision: web header, no app tab bar). "Chats" 32/40 bold (new text role `screen-title`), search field with 12px corners and "Search events" (Figma "Search hangouts", copy rule), 40px photos, 14px between rows and lines, previews up to 2 lines; unread previews show the sender in Grey_2 and the message in #141316. "No chats yet" plus the "Explore events" card show under the list; "Select a chat" is desktop only.
- Conversation: full screen, the site header hides. Top bar: back arrow (36px circle, rgba(241,241,241,.5)) | 40px photo | title + count | "Buy Ticket" pill (8 / 4 padding, 28px tall, regular weight; new button hooks `--ui-button-pad-y`, `--ui-button-min-height`, `--ui-button-font-weight`). Messages 16px from the sides; text bubbles radius 8, up to 234px, Body 16/24; join notices 16px above and below. Message box: white bar, 16px padding, Grey_6 pill field with a 0.5px Grey_5 line, "Say something...".
- Profile: full screen; photo edge to edge (375 x 334), back arrow top-left instead of X; memoji left of the name; name 24/32 bold; content 16px from the sides. Same content as desktop (decision: no photo carousel, All / Created / Joined tabs, attendee counts or "Slots left"; no arrows).
- Back arrows: profile -> conversation -> list.
- Reply on phones: hold or swipe a message (see "Chat on phones: reply gestures" below). No reply icon beside messages.
Measured at 375 x 812 (exact): top bar items at x16 / 68 / 120, pill 80 x 28, bubbles at x57 234 wide, message box 80 tall, profile photo 375 x 334, name at 64,365 32 tall.
Flags:
1. The Figma mobile frames use different demo text (e.g. "Happy new month family") and "100 Participant" (singular); the shared demo data and "participants" are kept.
2. Figma mobile title is 26px below the status bar; ours is 24px below the site header.
3. Figma profile content starts 31px below the photo (kept: 7px extra on the 24px gap).
Back arrow: ArrowLeft supplied by design (21 Oct), `icon-arrow-left-20.svg`.

## Narrow screens (21 Oct)
"Make sure every image or component is well wrapped even on smaller screens." At 320px photo messages spilled out of the screen. Fix: photo bubbles keep Figma's 275px but shrink to fit (`max-width: 100%`), the photo grid fills its bubble, and the reply button takes no space on phones. Checked at 320, 360 and 375: no sideways scroll.

## Share Event (decision 21 Oct)
When the signed-in user already has a ticket for the event (`hasTicket` on the chat), "Share Event" replaces "Buy Ticket" in the chat header.
- Desktop, as Figma 10682:52458: secondary Grey_6 button, 16 / 8 padding, 40px tall, share icon 24 (supplied `icon-share-24.svg`), 8px gap, "Share Event" 16/24 semibold Grey_1. Uses Web Small semibold, because Web Body grows to 18/28 on desktop and would make the button 44px.
- Phones: not in Figma. Proposed: round grey icon-only button with the share icon (the label stays for screen readers).
- Action (decision): opens the device's share sheet. Where there isn't one (most desktop browsers), copies the link and shows "Link copied".
- New component: `UiToast`, a short message near the bottom that disappears after 2 seconds. Not in Figma (proposed): dark pill, white Web Small text.
- Demo data: House Party and Ikorodu Block Party have tickets; the other chats show "Buy Ticket".
Open items: (1) the event's public link (uses `/events/<chat id>` for now), (2) toast design, (3) the phone share button design, (4) the message when copying fails.

## Chat on phones: reply gestures (decision 21 Oct)
Replaces tap-to-show-reply-button.
- Press and hold a message (about half a second): a small menu with "Reply" (with the reply icon) opens above the message, or below it near the top of the screen. Same look as the profile menu: white card, Dp2 shadow, 174px wide, 18/28 text. While it's open, the message has a 2px purple ring (proposed). It closes when you tap elsewhere, press Escape or scroll. The phone's own copy / select menu is switched off on messages.
- Swipe a message left or right: the bubble follows your finger up to 64px and the reply icon fades in beside it. Let go past 32px and the reply starts; it springs back either way. Vertical scrolling still works as normal. A swipe or hold on a photo doesn't open the photo viewer; a normal tap still does.
- Screen readers: the reply button is still in the page (hidden from view), so it can be reached without gestures.
- Desktop is unchanged: the reply button shows on hover or keyboard focus.

## Placeholder avatars (decision 21 Oct)
Portraits from Figma frame 10687:56254 ("Profiles") are used for **people only**: chat senders, the signed-in demo user (Esther Marie) and the person's photo in the profile panel. Event images (fliers, event photos, photos sent in chat) are a separate kind and stay grey until that work starts (decision).
- Figma's download links return "access denied" (403), so each portrait is an 80 x 80 screenshot of its node: sharp at 32-48px avatar sizes, soft on the large profile-panel photo. 24 of the 42 are used; one was left out as unsuitable for the app. Files: `public/images/placeholders/person-NN.png` (round, for avatars) and `person-NN-square.jpg` (corners cut off, for the rectangular profile photo).
- New sign-ups still get the letter avatar, because onboarding has no photo step.
- Placeholders live in `app/mocks/placeholders.ts` (mock data only). Swap in 2x exports with the same file names when available.


## Input text on phones (decision 21 Oct)
Below 768px, text typed into every input field is 16px: search fields, the onboarding fields, the code boxes and the chat message box. New typography role `text-input-mobile` (16px, 20px line, 0 tracking) in `tokens/typography.css`; each field keeps its own weight (onboarding fields stay semibold). The line height stays 20px so every field keeps its Figma height (48px). Side benefit: iPhones no longer zoom into a field when it's tapped, which they do for text under 16px. Desktop is unchanged.

## Phone header search + no "Chats" title (decision 21 Oct)
- **Header search on phones:** tapping the search icon turns the header bar into a search field ("Search for events", the same field as desktop, with its clear X and purple search button) plus a "Cancel" text button. It searches events on every page, including chat (decision). Proposed details (not in Figma): the field is 48px tall so the bar stays 80px; "Cancel" is text rather than an X so it isn't confused with the field's clear X; the field gets focus when it opens; Escape or Cancel closes it and puts focus back on the search icon; what you typed is kept until you clear it; it closes when you go to another page.
- OPEN ITEM: event search results. The search is sent (`search` event) but there's no results page yet.
- **Chat list on phones:** the "Chats" title is removed from view (decision); the list starts with its "Search events" field (kept, decision: the header bar only shows when tapped). The heading stays for screen readers. The `screen-title` text role (32/40) is now unused.

## Event fliers and chat photos (decision 22 Oct)
- **Fliers:** 19 event fliers supplied by design are the event images on the home cards and in the chat list and chat header (`public/images/events/flier-*.jpg`, 720px wide). Two phone screenshots were cropped to the flier (Owanbe Electro, Ultimate Party Experience); the duplicate Beach Camping screenshot isn't used.
- **Event names (decision):** the mock events and chats now use the name, place and date printed on each flier, replacing the Figma demo text ("Lagos Island Party", "House Party", "Picnic at Legacy Museum, Yaba"...). Data lives in `app/mocks/eventFliers.ts`; some fliers appear in more than one home section. Chat ids are unchanged.
  Flags: categories were picked by me from the app's list; no time on 3 fliers (Bloom, Beach Camping, Explore Obudu: date only); no area on 3 (Paint & Sip, MOV3E, Sketch Cafe: "Lagos"); Paintball and Chill's flier says 2025 (kept as printed). One chat message changed to fit its new event ("See you at the pool!" -> "See you at the beach!").
- **Chat photos (updated 22 Oct, decision):** photos of people, reusing the square cut of the Figma portraits: three in the Kindred Anniversary Picnic chat, and Esther's own portrait on her intro message in Faaji at the Pent. FLAG: 80px sources, so they look soft at chat-photo size and in the viewer, and the wide top tile crops the face tightly. (The illustrated pictures tried first are no longer used; `public/images/chat-photos/` can be deleted.)
- The event list in the profile panel (Figma "Desktop - 57") is unchanged and stays grey.
- Share Event demo: now Ultimate Party Experience and Faaji at the Pent.

## No "Chats" title on desktop (decision 22 Oct)
The "Chats" title is now hidden on desktop too (phones since 21 Oct); the list starts with "Search chats". It stays for screen readers as the page heading.


## Event details page (22 Oct), Figma section "event details" (10715:65072), gallery update (10724:67468), phone gallery arrangement (7335:7422)
Route: `/events/<event id>` (`app/pages/events/[id].vue`). Opened from home event cards, the photo/title at the top of a chat, and the header search (decision).

**Layout.** Desktop (Desktop 64): 1140px column, 62px under the header, 52px above the footer. Title row (40/48 bold + "Join Community - Free"), 40px, gallery, 40px, then 601px left column (sections 48px apart) and the 431px ticket panel, which stays in view while scrolling (decision). Below 1024px, phones and tablets use the phone order (decision): title, gallery, facts + host, tickets, About, What to expect, "Not ready to buy a ticket?" card, Community, line, app banner; sections 40px apart.

**Gallery** (decisions 22 Oct). The flier is always the first photo.
- Desktop/tablet, 1–3 photos: centred on the flier, blurred 25px under a 50% black layer. 1: 300 × 408; 2: two 300 × 408, 16px apart; 3: 300 × 354 + two 144 × 171 stacked.
- Desktop/tablet, 4+ photos: sideways strip 354px tall: flier 300 × 354, 2 × 2 groups (144 × 171) and 354px squares in turn. Proposed: round previous/next buttons when it can scroll.
- Phones (never the blurred band, all tiles square): 1 photo = one 300px square, centred; 2 = two 300px squares; 3 = 300px square + two 144px squares (Figma 7335:7422); 4+ = the phone strip (196px big, 94px small, ends with "Open Gallery"). Photos fade to dark at the bottom (Figma phone frames).
- Tapping a photo opens the full-size viewer.
- FLAG: Figma's hidden "Party" and "1/3" chips on photos are not shown.

**Facts.** Address with a copy button ("Address copied", decision); calendar tile built from the real date (Figma shows "SEP 30" beside "16 Jan 2026"); price range worked out from the ticket prices ("Free - ₦100,000").

**Tickets** (decisions 22 Oct). Ticket cards reuse TicketOption. Totals = price × quantity for every type; phone bar shows "N Tickets • N Tiers" (tickets = all quantities, tiers = types with at least one). Desktop button reads "Buy Ticket (₦520,000)"; proposed: "Buy Ticket" and disabled with nothing picked. The phone/tablet bar appears once a ticket is picked and stays at the bottom. **Buy Ticket has no action yet** (checkout not designed).

**Join Community** (decision). Signed out: Login or signup first. Then the event's chat opens (`/chat?chat=…`). The button text doesn't change. Events without a chat get one, with a host welcome message and "You just joined".

**Community.** Host first with the green "Host" pill; gender dot F (pink) / M. FLAG: Figma's M dot is blue #6891FF; the blue → Primary rule makes it purple, confirm. Tapping a person (or the "Hosted by" tag) opens the profile panel (decision): desktop = side panel over the page (proposed), phones = full screen with "Back to event". "Invite Friend" shares the event (share sheet, else copy link). "+N Others" has no action (no list designed).

**Copy** (decision): "About Hangout" → "About Event"; "What to expects" → "What to expect".

**Search** (decision): typing in the header search shows up to 6 matching events (title, place or category) in a list under the field (NOT IN FIGMA, profile-menu style); arrow keys + Enter or a tap opens one. "No events found" when nothing matches. Same on the phone search bar.

**Demo data** (`app/mocks/eventCatalog.ts`, one file per event: card, page, tickets, chat link). From the fliers: title, place, date, ticket names and prices (where printed). Written for the demo (FLAG): About text, host, community, extra gallery photos (placeholder portraits after the flier), categories, the Figma ticket tiers for fliers with no prices, and some low-stock / sold-out tickets to show those states. "What to expect" uses the Figma rows with the 4 photos supplied by design. Shared demo people live in `app/mocks/people.ts`. Chats now link to their event and use its community count.

**Icons** exported from Figma as SVG (and confirmed by design's uploads): map pin, ticket, copy, plus, Apple, Play Store (`public/images/event/`).

**Not designed (proposed):** "event not found" message; side-panel profile on desktop; search suggestions list; gallery arrows; disabled Buy Ticket state.

**Open items:** checkout/payment; real event links/URLs; app store links; the attendee list behind "+N Others"; Figma's "Party"/"1/3" chips.

---

## 22 Oct (later): gallery fill, All events page, phone header arrow

**Gallery (desktop/tablet strip, decision).** The strip always reaches the right edge (how: see "Filling the width" below, which replaced stretching the blocks). A 2 × 2 block is never left half empty: 1 leftover photo → a big square, 2 → two stacked, 3 → two stacked + a big square.

**Gallery photos.** Done: see "Gallery photos (decision)" below.

**All events page** (`/events`, decision). Home "Explore all" opens a page with every event card; "Back to Home" returns. NOT IN FIGMA (proposed): "Back to Home" link, title "All events (19)", grid of small event cards (phones 1 per row since the later update, tablet 4, desktop 5), Home's page padding. Also pointed here (proposed): the hero "Explore Events" button, the footer "Explore Events" link, and the "Explore events" buttons on the empty chat and event-not-found screens. Open items: order, paging, filters.

**Phone header (decision).** The desktop down arrow (16px) now sits beside the profile photo on phones, 4px gap (proposed spacing). The button is now 60 × 40, which also fixes the earlier tap-size flag.

## 22 Oct (later): real gallery photos, square tiles, phone tweaks

**Gallery photos (decision).** 30 free stock photos supplied by design (Pexels), cropped to 800px squares in `public/images/event-photos/`, follow each event's flier (0–5 per event, matched to the flier's theme). The placeholder portraits are no longer used in galleries.

**Square everywhere (decision; replaces Figma's 300 × 408, 300 × 354 and 144 × 171).** Desktop/tablet: flier and big tiles 354, small tiles 171 (half a big tile minus the 12px gap); 1–3 photos sit on the blurred flier band as 354 squares (3 = 354 + two 171 stacked). Phones: 4+ photo strip enlarged from Figma's 196 to 240 (small 116) to show more of each photo; 1–3 photo layouts unchanged (300 / 144).

**Filling the width (decision, refines the earlier rule).** Desktop/tablet strip: when Figma's order (2 × 2, big, 2 × 2 …) doesn't reach the right edge, the blocks are rearranged to fill it with the least growth (strip up to 30% taller, squares stay square); if no arrangement fits, the one that scrolls least is used. Never a half-empty 2 × 2.

**Phones (decision).** Event page: the title sits under the photos (24px gap; Figma has it above), and the details (address, date, price) start 24px under the title (was 40). All events page: one card per row, full width.

**Testing.** `/dev/gallery?n=1…20` (dev only) shows the gallery with any number of photos. Checked automatically at 15 widths (320–1920) × 1–20 photos: every tile square, all photos present and loaded, no half-empty 2 × 2, strip reaches the edge or scrolls, no sideways page scroll (2,212 checks, all passing). Every event page checked at 320 / 375 / 800 / 1440: photo count, square tiles, title position, images load (384 checks).

---

## 22 Oct: buy ticket flow and event page text update (Figma section 10713:56670)

**Event page text (Figma update).** Names under community photos 14/18 at every width (was 12/18 desktop, 10/14 phones); "+5" 18/28 semibold (was 16/24); the F/M letter Regular (was Light). Everything else on the page matches the new frames (checked text by text against Desktop 51–53 and iPhone 18–19).

**Buy ticket flow** (`components/checkout/`, `services/checkout.ts`, `types/checkout.ts`). Desktop/tablet: 393px dialog on the page dimmed white 70%. Phones: bottom sheet (top corners 24, 24/24/40 padding) over black 50%.
1. **Buy Ticket — contact** (email, phone). Signed-in buyers skip it (decision).
2. **Give us more details** only when the email has no Vegaz account (demo rule, as login: only johnbade@gmail.com has one). First name, Last name (Figma says "First Name" twice; fixed), phone (filled from step 1), gender.
3. **Ticket Cart.** Lines for the picked types with steppers; shares the picks with the page both ways (decision); a type set to 0 stays listed until the cart closes; "+ Add New Ticket" hidden when every type is in the cart; real total (Figma's ₦11,000 was placeholder); Checkout inactive at 0 tickets. Back: signed-in → closes; signed-out → previous step.
4. **Add Ticket.** Select listing the types not in the cart; sold out greyed + "Sold out" chip (cannot be picked); low stock red "N tickets left" chip ("5 ticket left" fixed); adds one ticket.
5. **Assign tickets.** The buyer holds the first ticket ("<type> · You · Ticket buyer"). "+ Assign Ticket" → **Add user** (full name, email, phone, tier); "Edit" reopens it as **Edit user** (proposed title). Every ticket must have a person (decision): Proceed is grey and inactive until 0 remaining. More than 3 people: the list scrolls with "Scroll to see all N assignees".
6. **Pay with Paystack — mock** (decision; Figma has only a "PAYSTACK FLOW" box). NOT IN FIGMA (proposed): title, total row, demo note, "Pay ₦X". Skipped when the total is ₦0 (free tickets only), until the RSVP design arrives.
7. **Your ticket is on its way...** Desktop: purple 479px card, radius 40. Phones: full purple screen with the light logo, "Join Chat with Others" and "Cancel". The buyer is signed in at this point (decision; new buyers get an account from their details). "Join Chat with Others" opens the event chat. Photos are the event's own (flier first). Copy fixes: "it's way" → "its way", "hangout chat" → "event chat".

Not in Figma (proposed): inactive states of Proceed / Continue / Add to cart / Checkout until required fields are filled (grey secondary style, as Figma shows on Add user); field validation rules (valid email, phone 7+ digits; assignee phone optional); option hover; keyboard support in the selects; 32px tap area on the small close X.

Typography: the flow uses the fixed "Mobile App" styles (`.text-app-*` classes in tokens/typography.css), which do not grow on desktop, as in Figma.

**Open items (engineering):** account lookup; creating/holding the order; real Paystack checkout + server confirmation; emailing tickets to the buyer and assignees; signing in after purchase (all in `services/checkout.ts`). **Design:** RSVP flow for free events (coming); error states (payment failed, sold out mid-checkout, invalid email); whether assignee phone is required.

**Owning a ticket (decisions 22 Oct, after testing).**
- Tickets are held by email (`services/tickets.ts`, demo data in `mocks/orders.ts`): the buyer's ticket and every assigned guest's ticket. Assigned guests count as holders when they log in with that email.
- Chat header: "Share Event" when you hold a ticket for that event, otherwise "Buy Ticket" (no longer fixed demo data). The demo account holds tickets for Ultimate Party Experience and Faaji at the Pent.
- Chat "Buy Ticket" opens the buy flow on top of the chat at Add Ticket with an empty cart; Back goes to the empty cart, Back again closes. After buying, the header switches to Share Event; "Join Chat with Others" just closes the flow.
- Event page with a ticket: ticket cards and Buy Ticket stay (buy more for others); the chat's "Share Event" button appears under them, full width. Buying more does not add the buyer again: every new ticket is assigned.
- Already in the event's chat: "Join Community - Free" reads **Open Chat** (no + icon, proposed wording approved) and opens it; the phone "Not ready to buy a ticket?" card hides.
- Memory only: a reload resets logins and purchases (decision).

Test cases: `tests/buy-ticket-test-cases.md` (A–K, run at 1440 / 800 / 393).

**Profiles and the community row (decision 22 Oct).**
- Community row on the event page: people are no longer clickable (no profile from there). The "Hosted by" tag still opens the host's profile.
- Profile panel "All Events": real demo events with their fliers instead of Figma's sample list (which had no images). The person's own events come first (host or community member), then others, 5 in all; date in Figma's format ("31 May, 12:00 Lekki").

**Hover polish (decision 22 Oct).**
- Links never show an underline (base.css `a { text-decoration: none }`; the three proposed hover underlines on event card titles, the chat header title and chat sender names are removed).
- Clickable images grow slightly on hover: `.img-zoom` (base.css) on event cards, gallery photos and photos in chat. Scale 1.04 over 600ms with a strong ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`), transform only, inside the existing clipped frame so nothing around it moves. Mouse/trackpad only (no stuck zoom after a tap on phones); off with "reduce motion". Tokens: `--ease-out-strong`, `--duration-image-zoom`, `--scale-image-zoom` (semantic.css, proposed). Approach follows Emil Kowalski's animation guidelines (installed with `npx skills add emilkowalski/skill`); 600ms is slower than its usual hover advice, at design's request ("slow grow").

**Moving between pages and pop-ups (decisions 22 Oct, Airbnb-inspired, "very subtle").** All motion lives in `assets/styles/motion.css`, tokens in semantic.css (proposed). Only opacity and transform move; ease-out curves; nothing over 250ms; closing is quicker than opening.
- **Page to page:** the browser's View Transitions (`experimental.viewTransition` in nuxt.config). The old page fades out (120ms), the new one fades in rising 4px (220ms). The header stays still. Chrome, Edge and Safari 18+; Firefox changes page instantly (no animation, nothing breaks). Switching chats (same page, `?chat=`) does not animate.
- **Card photo grows into the event page:** the clicked card's photo moves and grows into the gallery's flier tile (250ms) and shrinks back on Back. Only the clicked card takes part (`composables/useEventMorph.ts`), since the same event can sit in several Home rows. Desktop medium cards are wider than tall, so the photo is cropped, not stretched, while it grows.
- **Pop-ups:** dialogs (sign up, buy ticket) fade the page and grow the card from 96% (200ms in / 150ms out). Phone bottom sheets slide up from the bottom (250ms in / 200ms out, drawer curve); the full-screen purchase success just fades. A new step inside a dialog fades in (150ms). Photo viewer: fade, photo grows from 97%. Profile panel: fades and slides in 16px from the right (event page and chat).
- **No scroll reveal** (decision).
- **"Reduce motion"** (device setting): pages change instantly; pop-ups only fade, nothing moves.

Test: `motion.mjs` in the QA scripts (90 checks at 1440 / 800 / 393 and with reduce motion).

**Host an event — desktop design (decisions 23 Oct, second pass after review; Figma first, code after approval).** Mobile source: Figma section "host an event" (10754:68066). Desktop frames (1440×900) sit in the same section: row "Start fresh event" (20 frames) and row "Use existing event (new edition)" (6 frames).
- Feedback that shaped this pass: the first pass was the mobile screens in a centred column. Now: a focused page, a stepper on the left, the form on the right, sized to the viewport, buttons always visible, success in a modal.
- Focused page: slim top bar (logo, Exit), no site header. A fixed bottom bar holds Back (left) and the step's actions (right: Continue, or Skip + Proceed on What to expect). Only the middle area scrolls; every step fits 1440×900.
- Left rail (360px, Grey_6): flow title, "Step n of N", progress bar, stepper. New component "Host / Step" (Done / Current / Upcoming; title, description, number).
- Fresh steps: Event details → Date & tickets → What to expect. Edition steps: Select event → Edition details → Tickets → What to expect.
- Create event choice: its own page with two option cards (Start fresh / Use existing), not a dialog.
- Event details: fields on the left (title, description, Location / Categories / Participants rows); photo card on the right, 408px square cover with crop, thumbnails underneath. No live preview card (decision).
- Date & tickets: date and time side by side; tickets in a 2-column grid; past-time error sits under the time field.
- What to expect: items in a 2-column grid.
- Tickets and What to expect (third pass, 23 Oct): no long forms in modals. The Create ticket / Add an item form sits on the page (middle column); what you've added stacks as cards in a 400px side panel on the right ("Your tickets" / "Your list", with a count). Empty side panel shows the "No ticket has been created yet" / "Items you add will show here" box.
- Editing a ticket: the pencil loads it into the form ("Edit ticket", Cancel + Save changes) and the card is highlighted (purple border, light purple fill).
- Only short dialogs remain (441px): Location, Categories, Participants, Delete ticket, Edit event details, Edit date & time.
- Frames marked "full length" show the whole form; at 900px the middle column scrolls, the side panel scrolls on its own, and the top and bottom bars stay put.
- Event Created: the purple 479px success modal (same pattern as the buy-ticket success) over the new event page, with the invite link, Share Event (white) and Go to event (outline).
- Kept from the first pass: newer edition-row look; categories pick one (chosen chip black, white text); fee 10% capped at ₦3,000 (₦50,000 → ₦53,000); up to 5 photos with cover + crop; no bank details step; signed-out users log in first; "Go to event" opens the new event page (demo, until reload).
- Proposed, needs confirmation: stepper descriptions and step intro copy; Continue inactive until required fields are filled and while the past-time error shows; the 7th "Select event" item with its own "Create new edition" button removed (the bottom bar has that action).

**Host an event — built in code (23 Oct, from the desktop frames as edited by design).** Pages `/host` (choice), `/host/new` (fresh), `/host/edition` (new edition), on a focused layout (`layouts/host.vue`). Steps live in `HostFlow`; parts in `components/host/` (StepRail, Frame, DetailsList/Row, PhotoPicker, DateTimeFields, TicketForm/Card/Panel, QuantityField, ExpectForm/Panel, SelectEventList, the six dialogs, SuccessModal). Data: `services/hosting.ts` → `mocks/hosting.ts`; fee rule in `utils/fees.ts`; types in `types/hosting.ts`.
- Design edits picked up: new quantity stepper (grey box, circle buttons, 18/28 bold number), new ticket cards (0.5px dashed Primary line, soft shadow, plain icon buttons; edited card #ECEFFE with 2px Primary), 0.5px Grey_4 date/time fields, Skip + Proceed on What to expect, "Create New Edition" (220px) on Select event, new info-note copy ("Add up to 5 photos. Click a photo to set it as your cover.").
- Ways in: header "Host an Event" and Home "Add your event". Signed out → login opens; after login the choice page opens. Closing the login cancels. Exit and Cancel go Home (no "discard changes?" prompt: not designed, OPEN ITEM).
- Continue / Proceed turn on (PROPOSED): Event details = title, 1+ photo, location, category (description optional). Edition details = the same + date and time. Date & tickets = date and time not in the past, 1+ ticket, nothing half-edited. Tickets (edition) = 1+ ticket. What to expect: Proceed needs 1+ item; Skip publishes without items.
- Tickets: after "Add ticket" the form clears to "Select Type". Paid types need a price; Custom also needs a name; description optional (100 characters). The fee note appears once a price is typed and shows the real guest price. Gender-Based has no fee note (as drawn, OPEN ITEM) and its card shows "F n / M n" chips and the price range (not drawn, FLAG). Cards show the host's price; the event page shows the guest price (fee included). "Unlimited Slot" turns the stepper off (50%).
- Photos: file picker or drop, up to 5; any thumbnail becomes the cover; drag (or arrow keys) moves what the cover shows. The 5th Figma thumbnail's grey image badge is used on an "add more" tile shown while fewer than 5 photos are added (FLAG). Crop is only the visible framing for now (OPEN ITEM: real crop/upload).
- Location: mock Lagos suggestions filtered by what is typed (OPEN ITEM: real places search). "Done" keeps typed text even without a suggestion.
- New edition: Select event lists six demo catalog events instead of Figma's sample concerts (they have no photos or pages). The new edition starts with that event's title and About; it keeps the event's host, community and chat. Edition number always "1.0" (OPEN ITEM: numbering).
- Publishing (MOCK): the event joins the demo catalog in memory, opens on its own page with "Event Created" (`?created=1`), and shows first in Home "Upcoming" / "Explore all" and All events until reload. "Go to event" closes the dialog; Copy copies the link; QR shows "QR code is coming soon" (OPEN ITEM).
- Not designed, PROPOSED: 1024–1279px uses a 280px rail and 320px side panel; below 1024 the rail hides and the side panel moves under the form; photos go under the fields below 1280. No phone header entry yet.
- Delete for What to expect items reuses the Delete dialog with "Delete Item" copy (not drawn).
- QA: `host.mjs` (fresh flow, 27 checks at 1440 / 1024 / 800) and `host-ed.mjs` (edition flow) in the QA scripts. Regression: sign-in 24, onboarding 51, chat 36, buy ticket 69 + 321 all pass; the event-page script fails 3 profile-panel checks because it measures during the panel's slide-in animation (timing in the script, not related to this work).

**Host an event — round 2 (24 Oct).**
- New edition: picking the event now fills in everything from it, all editable: photos (up to 5, flier as cover), title, description, location (full address), category, participants (All Gender), tickets and "What to expect". Only the date and time start empty, so Continue on Edition details waits for them. Picking a different event on Select event refills the details. Catalog tickets become Custom tickets (Free when they cost nothing) with their name, price, description and limit; the demo catalog holds guest prices, used as the host price here (OPEN ITEM: the API should send the host's own price). Catalog categories that differ from the host list are matched ("Food & Drinks" → "Food and Drink", "Sports" → "Sport").
- Date and time pickers: our own pop-ups instead of the browser's (`HostDatePicker`, `HostTimePicker`), opening under their field. Look from the design system's "Select Date" / "Select Time" modals and "Time Select" AM/PM (title Body bold Grey_1, chosen value Primary bold between Grey_5 lines, other values Grey_4, full-width Save). Date uses a month grid (quicker on the web than the phone wheels; PROPOSED): today ringed in Primary, chosen day filled Primary, past days greyed and not pickable; keyboard arrows / Page Up / Page Down. Time: hour, minutes (steps of 5, PROPOSED) and AM/PM columns that scroll by wheel, drag or click; Save sets it. In the Edit date & time dialog the pickers open inside the card (the card clips its content).
- Edit date & time dialog fields now match edition frame 05: 48px tall, 1px Grey_4 line, 18px Linear Calendar / Clock Circle icons, Small app regular 14/20 value.
- Icons exported from Figma and fixed: "Use existing event" card's new Restart Circle icon (each choice card now always shows its own icon), Participants radios (Primary ring + dot / Grey_5 ring), the grey "add photo" badge (exported whole, 25px), the Cover chip gallery icon and the ticket illustration with its notch outlines (earlier copies were cut off by Figma's frame clipping or trimmed).

**Host an event — phone layout, host actions, QA (26 Oct).**
- Phones (up to 767px) now follow the mobile Figma frames on their own; desktop keeps the desktop frames. Same steps, same rules, different screens: no top bar (each screen has a back arrow and a centred title), "Create event" opens as a bottom sheet over the current page instead of the /host page, tickets get a full-screen "Create Ticket" / "Edit Ticket" screen, and "What to expect" items use a "Create Item" sheet.
- Phone tickets: cards with a coloured left edge (Primary, Positive, Warning, black, repeating), pen and delete buttons and a drag handle. Tickets can be reordered by dragging the handle (or arrow keys on it); the order is kept when publishing. "Date & Time" folds open above the ticket list.
- Phone fresh "Event details" uses the newer edition photo and row look (as on desktop). Kept "Description" where the mobile frame says "Descriptions". Ticket quantity still starts and stops at 1 (the mobile frame shows 0, which would be a ticket nobody can buy; FLAG for design).
- Host's own event page: the main button is "Open Chat" (top of the page and in the ticket panel) instead of Buy / Join; ticket steppers are hidden, Share Event stays. Applies to whoever is the event's host.
- "Event Created": adds a "Continue in the Vegaz app" note (advanced settings, moderation and more) with a "Get the app" button (store links), plus Share Event and Open Chat. Phones use the white full-screen mobile frame (10754:74140) with confetti and a "Go to event" link; desktop keeps the purple card.
- Header profile menu: Settings removed (settings live in the app). Now Edit Profile, Chat, My Activities, Log out.
- New edition: whoever publishes it becomes its host (and first member), so they see Open Chat on it.
- QA (26 Oct): new suites `qa-host.mjs` (158 checks, desktop 1440 and 1024: steps, validation, pickers, tickets, edit/cancel, delete, stress with 30 tickets and 12 items, double clicks, long text, keyboard, labels) and `qa-phone.mjs` (39 checks at 375 and 414). All pass. Bugs found and fixed: the "What to expect" description box kept its tall height after "Add item"; at 1024px the empty description box cut off the second line of its placeholder. Regression scripts pass; the event-page script still fails its 3 animation-timing checks (script timing, unchanged).

**Gender-based tickets split; phone review (26 Oct, later).**
- Gender-Based (your request): the form still asks for the Female and Male groups together, but "Add Ticket" now creates two separate tickets, "FEMALE TICKET" and "MALE TICKET", each with its own price, quantity and description. Each is edited and deleted on its own (editing shows only that gender's group). Guests see the same two names on the event page. Applies on desktop and phones. The data keeps the gender on each ticket (`gender: 'female' | 'male'`) for the API.
- Bug fixed: the time picker opened with the hour column off-centre (the chosen hour wasn't in the middle band) because moving focus into the column cut its scroll short. It now opens on the chosen values.
- Phone review page with all 23 phone screens (M01–M23) published for design comments.

**Success screen and new-event date (26 Oct, later).**
- "Event Created" is now one design for phones and the web: the white mobile frame (confetti, green check, "Event Created", subtext, invite card, Share Event + Go to event). Phones: full screen with the buttons at the bottom and no X (as drawn). Web: the same content in a 479px white card with a close X; it replaces the purple card.
- No "Get the app" box or button any more. The subtext carries the instruction: "Your event is live. Share the link below to invite people. To manage settings and moderate your event, download the Vegaz app." (PROPOSED wording.) "Open Chat" on the success screen is replaced by "Go to event"; the host's Open Chat on the event page stays.
- Phones, new event: Date & Time moves from Ticket Details to the Event details list (first row, with the Edit pill), opening the same date & time sheet as an edition, titled "Date & time" / "When is your event happening?" (PROPOSED copy). Ticket Details is now the same screen for new events and new editions ("Ticket Pricing" only). "Proceed to ticket setup" waits for the date and time. Desktop keeps the date on its "Date & tickets" step (desktop frames).
- Details rows keep their label on one line; long values are cut with "…".

## 26 Oct: Log out modal, Activities, Edit Profile, birthday and gender prompts

**Log out (Figma 10834:26385).** Profile menu "Log out" now asks first: 375px white card (radius 24, padding 24 / 24 / 40), 16px X, 40px logout icon, "Already Leaving?" + "You are about to log out of your account and authentication will be required to log back in", red "Yes, Log out" and grey "No, take me back!". The same centred card on phones (the frame is a card). Focus starts on "No, take me back!" so a stray Enter doesn't log anyone out (PROPOSED). `components/auth/LogoutDialog.vue`.

**Activities (Figma mobile 10834:28021; web frames in section 10838:19056, designed 26 Oct).** Profile menu "My Activities".
- Web: 560px modal; "Activities" + X; All / Created / Joined pills; list grouped "Upcoming" and "Past". Long lists scroll inside the card. Phones: full screen with back circle and centred title, one list (upcoming first, then past), as drawn.
- Row: 60px picture, title, "22 Apr, 14:30 Lagos" (date, 24-hour time, city), female / male counts with memojis, a chip ("5 Slots left", or "Ended" for past events, PROPOSED). The row opens the event page.
- Data (decision 26 Oct): Created = events you host, including ones published in this session. Joined = events you hold a ticket for or whose chat you're in. Upcoming / Past by today's date, so the demo catalog (April–May 2026) shows as Past. FLAG: the gender counts and slots left are invented in `mocks/profile.ts` (the catalog has neither); the API should send them.
- Empty tab (PROPOSED, web frames): "You haven't created an event yet" + "Host an Event", "You haven't joined an event yet" + "Explore Events".

**Edit Profile (Figma mobile 10834:28185 / 28268; web frames 10838:19269 / 19399).** `/profile/edit`, from the profile menu.
- Web: site header and footer; back circle + "Edit Profile"; left column 360 (progress, photos, tip), right column (Personal Info in two columns, Bio, "Save Changes" 240 on the right). 768–1023: narrower left column, fields in one column (not drawn). Phones: no site header or footer, one column, "Save Changes" in a bar fixed at the bottom, as drawn.
- Rules (decision 26 Oct): all fields can change except Email (shown locked, grey, PROPOSED look). First name, last name and username are required; a taken username shows an error under the field (copy PROPOSED). "Save Changes" turns Primary once something changed and the form is valid; "Changes saved" toast (PROPOSED). Bio stops at 100 words ("N/100 words").
- "Profile N% Complete" (decision 26 Oct): first name, last name, username, email, gender, birthday, bio and at least one photo, an equal share each; it updates as you type.
- Photos: up to 3. Tap an empty tile to add, a filled one to replace; the first photo is the profile photo (header avatar). Drag the handle (or arrow keys on it) to reorder (PROPOSED: implied by the handle). OPEN ITEM: upload, size limits, removing a photo (not designed).
- Birthday: the browser's own date picker behind the Figma field (quick to go back years, PROPOSED); no future dates. Gender: the system dropdown styled as the Figma select.
- OPEN ITEM: changing the username in the demo hides the demo chats (they belong to "estiloo"); the API keeps them by account.

**Birthday and gender prompts (Figma "birthday" / "gender" frames).** Decision 26 Oct: after a login on Home, if the profile has no birthday the birthday prompt opens, then the gender prompt if there's no gender. Closing skips them until the next login. They never open when the login was for something else (hosting, buying, joining a chat) or on another page. Phones: bottom sheets as drawn; web: 441px cards (same content). The cake picture is exported from Figma with its tilt, border and shadow. In the demo the account already has a gender, so only the birthday prompt appears.

**Session user** gains gender, birthday, bio and photos (field names PROPOSED).

**QA (26 Oct):** `qa-profile.mjs` (55 checks at 1440, 54 at 1024, 52 at 375 and 320) and `logout.mjs` (26 checks, desktop + phone).

## 26 Oct — Airbnb sizing applied to the style system (phone, tablet, desktop)

Measured on airbnb.com (home + a listing page) at 375, 768 and 1440 in a real browser. Only the font family stays Outfit; sizes, line heights, weights and letter spacing are Airbnb's. Token files: `typography.css` (regenerated), `primitives.css`.

**What changed for a designer**
- Text no longer grows on desktop. Airbnb uses one ramp at every width, so the old ≥1024 "bigger body text" block is gone.
- Every text style has its own weight token (`--text-<style>-weight`). Airbnb's weights don't follow the names: headings and buttons are 500, section titles 600, small meta labels 700.
- Token breakpoints: phone < 768, tablet 768–1127, desktop ≥ 1128 (Airbnb's desktop switch). Layout breakpoints (768 / 1024) are unchanged.

**Type ramp (size / line, weight, tracking)**
| Style | Airbnb source | Value |
|---|---|---|
| Display, App H1 (success title), hero | host card headline | 32/36, 700, -0.96 |
| H1, page title (event title) | listing H1 | 26/30, 500 |
| H2, App H2, modal titles, event-page section titles | listing H2 | 22/26, 500, -0.44 |
| Home row titles (section-title) | home section title | 18/24 phone → 20/24 from 768, 600, -0.18 |
| App H3 (JoinCard, quantity) | home title at ≥768 | 20/24, 600, -0.18 |
| H3 bold / semibold | "Guests mention" / "Host details" | 18/24, 600 -0.18 / 500 |
| Body regular | reviews | 16/24, 400 |
| Body semibold/bold, button text | buttons, "Hosted by" | 16/20, 500 |
| Small regular | page body | 14/20, 400 |
| Small semibold, small buttons, menu rows | nav, Share/Save | 14/18, 500 |
| Small bold | "Guest favorite" | 14/20, 600 |
| x-Small regular / semibold / bold | card meta | 12/16, 400 / 500 / 700 |
| Sub regular / semibold / bold | rating bars / stat labels / Check-in label | 10/12 400, 10/14 500, 10/12 700 |
| Badge (Details row chip) | card badge | 11/13, 600 |
| Stat (mobile ticket price) | big numbers | 26/30, 600, -0.52 |

**Spacing, sizes**
- Page margins: 24 phone, 24 tablet, 48 desktop (home). Content max 1344 so a 1440 screen gets exactly 48.
- Event page = Airbnb listing: 1120 content, margins 24 / 40 / 80; columns 7/12 content, 1/12 gap, 4/12 tickets; 48 above and below each divider from 768.
- New spacing steps: 28, 80, section-block 48, section-block-tight 32.
- Header 80 tall at every width (Airbnb's compact header). Logo 32 tall everywhere (header and footer).
- Buttons: standard 48 (14/24 padding, 16/20 w500), small 40 (11/12 padding, 14/18 w500); the old per-variant 32 side padding is gone. Header "Host an Event" / "Login or signup" are small (Airbnb "Become a host"). Header round buttons 40 (search icon 16, profile 24).
- Icons: only 24 / 16 / 12 (+8 dots). Off-scale icons were snapped: 20 and 18 → 16, 14 → 12. New tokens `--sizing-icon-small/xsmall/micro`, round buttons `--sizing-icon-button-xs/sm/md/lg` (28/32/40/48).
- New radii 16 (`--radius-card`) and 20. Button and card shapes stay Vegaz's (pills, 24 cards): shape isn't sizing.

**Not measurable / kept (FLAG)**
- Airbnb's phone listing page shows an "open the app" screen to browsers, so the phone event-page section spacing stays as before (40); phone type uses the same ramp (Airbnb's ramp is identical at 768 and 1440).
- Airbnb's account menu didn't open for measuring; menu rows use their nav text style (14/18 w500).
- Airbnb hides its logo on phones and shows only the symbol on tablet; we kept the Vegaz logo at every width, only its size changed.
- Colours untouched (not part of the request).

## 26 Oct — Hero, page top spacing, icon line weight

- **Hero title** ("Meet people through meaningful experience"): H1 size in bold, 26/30 weight 700, at every width (`--text-hero-title-*`).
- **Hero band**: 24 top and bottom padding at every width. The band starts right under the header.
- **Phones**: "Explore Events" is hidden in the hero; only "Add your event" shows.
- **Header → first content = 24 on every page** (new token `--spacing-page-top`): All events, event page (phone, tablet, desktop), chat (web), Edit Profile (web), and the hosting screens. The Edit Profile phone screen has its own top bar and is unchanged; the host "choose how to start" screen stays vertically centred.
- **Host top bar logo**: now 32 tall like the main header.
- **Icon line weight**: every line icon now draws a 1.5px line on screen at any size (24, 16 or 12), so icons look equally heavy. Done in the icon files with `stroke-width="1.5"` + `vector-effect="non-scaling-stroke"` (57 files). Solid icons are unchanged, as decided. Illustrations (empty states, banners, radio buttons, confetti) aren't icons and were left alone.
- FLAG: the drag handles are drawn as dots, so their dots are now 1.5px, smaller than before.

## 26 Oct — Hero size update
- Hero title is now 40/48 bold at every width (`--text-hero-title-*`), replacing 26/30 bold.
- Hero band padding is 40 top and bottom at every width (new token `--spacing-hero-block`). Other pages keep 24 under the header.

## 26 Oct — Bolder headings, hero on phones, phone event page
- **Headings one step bolder** than Airbnb's: weight 500 → 600 and 600 → 700 for every heading style (H1, H2, H3, page, section, modal and app titles). Body text, buttons and labels are unchanged. The quantity number in the hosting ticket form is not a heading, so it keeps 600.
- **Hero title**: 32/40 bold on phones, 40/48 from 768. 16 between the title and the text at every width.
- **Phone event page**: 32 between every section (Figma 10713:56670); the title still sits 24 under the photos. Tablet and desktop unchanged (48).
- **"Not ready to buy a ticket?"** (Figma 10656:48775) is no longer a card: no shadow, no rounded corners, a 1px Grey_5 line above and below, 16 padding and 16 gap kept. Text stays on the current type system (decision).

## 26 Oct — Photos square, button widths, RSVP, chat intro, no modal motion, phone gallery

- **Phone "Create new event" photos**: the upload box and the cover photo are square (were 325:402).
- **Buttons fit their text** (Airbnb): fixed widths removed (host Back / Skip / Next bar, ticket and "what to expect" forms, Edit Profile Save, host Exit, Activities CTA). Regular buttons 24 left/right, small 12. Buttons meant to fill a row (phone bars, cards, modals) stay full width. Hero buttons share the width of the longer one.
- **"Join Community - Free"**: small pill (40 tall, 12 sides, 16px + icon), like Airbnb "Become a host".
- **RSVP for free tickets**: the action reads "RSVP" when everything picked is free, or when the event only has free tickets; as soon as a paid ticket is picked it's "Buy Ticket (₦X)". Applies to the event tickets panel, the phone bottom bar, the event chat header, and the checkout (contact title "RSVP", cart button "RSVP", assign button "RSVP"). Free-only orders skip payment. Rule lives in `utils/ticketCta.ts`.
- **Chat intro message**: the first time someone joins an event's chat (hosts excluded), Vegaz posts "Hi everyone, my name is {first name} and {bio}" from them, with their main profile photo (text only if none). The bio's first letter is lowered to read as one sentence (FLAG: a bio starting with a name is lowered too).
  - No bio yet: an "Introduce yourself" modal opens first (PROPOSED, not in Figma): bio field (100 words), "Save and join" (saves the bio to the profile, joins, posts the hello) or "Skip for now" (joins without a hello; asked again next time). The copy says they need a bio so people can get to know them. X / Escape cancels the join. Text on the system ramp (modal title 22/26).
  - OPEN ITEM (engineering): the hello should be posted by the backend on join, so it isn't lost if the page closes.
- **No modal animation**: modals, sheets, the photo viewer, the event-page profile panel and the phone ticket screen now open and close instantly (the animations glitched).
- **Phone event gallery**: the photo strip runs to both screen edges, so photos scrolled to the left are no longer cut off at the page margin. Tablet and desktop unchanged.

## 26 Oct — Chat dock (quick replies), built from Figma 10862:22113

- **What**: a "Messages" dock bottom right on every page for signed-in people, on screens 768px and wider. Not on the Chat page or the hosting flow (own layout). Phones keep the Chat page; unread chats show as a red count on "Chat" in the profile menu and a red dot on the header photo.
- **States**: minimized bar (360 × 56, red unread count) → chat list (360 × 560, search by event name) → one conversation at a time (360 × 520, 16 left of the list / bar; opening another chat replaces it) → minimized conversation tab (240 × 56). Open in the Chat page from the bar or the conversation.
- **Tablet 768–1023**: one panel; opening a chat replaces the list, ← returns.
- **New message** while that chat isn't open: unread count goes up and a preview shows above the bar for 5 s (paused on hover / focus); Reply opens that chat with the message box focused; it never opens the dock by itself. Messages arriving in the open chat appear in it and are marked read.
- **Keyboard**: Enter sends; Escape minimizes the open window (conversation first, then the list). Open / minimized and the open chat are kept for the browser tab and cleared on log out.
- **Event pages on tablets**: the dock sits above the bottom ticket bar.
- **Code**: `components/chat/dock/*` (`<ChatDock>`, Bar, Row, Conversation, Message, Toast), `composables/useChatDock.ts`, `services/chat.ts` `onIncomingMessage()`. Dropdown items gained an optional `badge`.
- MOCK / FLAG: there is no live server, so for the demo account one scripted message ("Doors open at 7…") arrives in Ultimate Party Experience about 12 s after a page loads, to show the preview. OPEN ITEMS (engineering): real-time delivery (websocket / push), sound, photo upload limits.

## 26 Oct — Hero: "Explore Events" removed everywhere
- The home hero now has only "Add your event" at every width (phones already had it removed). The "Explore all" button under "Explore all events" still goes to All events.

## 26 Oct — Phone bottom navigation (Figma 10870:35376)
- **Phones only (< 768px)**: Home, Create, Chat at the bottom of the screen (white, 1px black/10 line on top, 15 padding plus the phone's safe area, items 48 apart; 78 tall). Labels x-Small 12/18 semibold as in Figma: Grey_3, Primary when active; Create is a dark purple (#24044D) pill with a white +, label Grey_1.
- **Active**: Home on Home and All events; Chat on the Chat page. Chat shows the red unread count (replaces the red dot on the header photo and the count in the menu).
- **Create** starts Host an Event; **Chat** opens the Chat page. Signed out, both ask to log in first (as "Host an Event" and the Chat page already do).
- **Where**: Home, All events, the Chat list and Edit Profile. Hidden inside an open conversation, on event pages (their ticket bar sits there), in hosting (own layout) and under modals. Edit Profile's Save bar now sits on top of the bar. The layout adds room at the bottom so nothing hides behind it.
- **Profile menu on phones**: Edit Profile, My Activities, Log out ("Chat" moved to the bottom navigation). Desktop and tablet keep Chat in the menu (decision).
- **Update (same day): bottom navigation on Airbnb sizing** (measured on airbnb.com at 375): bar 65 tall (1px line, 10 above and below the tabs, plus safe area); tabs 73 × 44, 2 apart, centred, 3px top padding, icon 24, 5 to the label; label 10/12, 0.2 letter spacing, 500 when active, 400 otherwise (`--text-nav-label-*`). Colours and the Create pill stay as in Figma. `--sizing-bottom-nav` is now 65.
- **Figma update (same day)**: the first tab is now **Explore** (Compass icon, Linear / Bold when active) instead of Home. It still goes to Home and is active on Home and All events. Figma's 64 gap between tabs is replaced by Airbnb's 73-wide tabs 2 apart (decision: Airbnb sizing).
- **Figma spacing update (same day)**: the three items hug their content and sit 64 apart, centred (Figma 10870:35167). Airbnb sizing kept for the bar (65 tall, 10 above / below), the 44-tall tabs (3px top padding, icon 24, 5 to the label) and the 10/12 labels.
- **Label size (same day)**: bottom-nav labels are 11/13 (was Airbnb 10/12); weights and letter spacing unchanged.

## 26 Oct — Footer links and legal pages
- Footer "Create an Event" is now **"Host an Event"** and starts hosting like the header button (logs in first when signed out).
- Copyright: **"© Vegaz 2026. All rights reserved."** (Figma 10875:35486; was "© 2077 Vegaz. All rights reserved.").
- **Legal pages** (not in Figma, PROPOSED Airbnb-style reading page): `/legal/terms` (Terms of Service, 13 sections) and `/legal/privacy` (Privacy Policy, 12 sections), linked from the footer's Terms / Privacy. 720 reading width, draft notice, title, "Last updated", intro, "On this page" contents, numbered sections, link to the other page. Text lives in `config/legal.ts`.
- **DRAFT FOR LEGAL REVIEW**: written in plain language from how the product works (email codes, profiles, hosting, Paystack tickets, free RSVPs, event chats, Nigeria Data Protection Act 2023). Not legal advice. Items marked [to confirm]: company legal name and address, contact emails, minimum age, refund rules, retention periods, service providers, liability limits, dispute process, analytics cookies. Remove the draft notice (`draft` prop) once approved.

## 26 Oct — Modals: click outside to close, keyboard on phones
- **Click outside closes** every modal and sheet (was: never). Exceptions:
  - once something has been typed or changed in a field inside it (sign-up details, checkout contact, assignee, host dialogs, bio…): the outside click does nothing; X / Cancel / Escape still close;
  - while busy (sending a code, saving, paying): `:dismissible="!busy"` and anything marked `aria-busy="true"`;
  - the checkout success screen and the host "Event created" screen (`:dismissible="false"`).
  - A press that starts inside the card and ends outside (selecting text) does not close.
- **Phones, on-screen keyboard** (corrected 26 Oct): **bottom sheets only**. The sheet rises so its bottom edge sits exactly on the keyboard's top edge (keyboard height from `visualViewport`, updated once per frame so it doesn't flicker); if it is taller than the space left it scrolls inside, and the focused field is scrolled into view. Centred and full-screen dialogs are back to how they were before (the browser handles the keyboard); tap outside to close still applies to them.
- Already closing on outside click (unchanged): photo viewer, event-page profile panel, menus.

## 26 Oct — Event page photos: no dark fade

- The phone gallery photos had a dark gradient at the bottom (from the Figma phone frames). Removed: photos show as they are, on phones and everywhere else. The `--gradient-gallery-fade` token is deleted.
- Unchanged: the blurred, darkened backdrop behind 1–3 photos on desktop (it is a background, not on the photos).

## 27 Oct — Event page, host app prompt, calendar, optional assigning, inactive buttons

- **Empty sections hide** on the event page: About Event when there is no description, What to expect when the host skipped it or added nothing, and Community until at least 10 people have joined (`COMMUNITY_MIN` in `config/event.ts`, PRODUCT TO CONFIRM the number). The "Not ready to buy a ticket?" block stays. On desktop the ticket panel spans only the sections that show.
- **"Finish setting up in the Vegaz app"** (`HostAppModal`, PROPOSED layout and copy, not in Figma): only the host of the event sees it, each time they open its page (first time: right after "Event Created" closes), until "Don't show again". X, Escape or clicking outside closes it for that visit. Image: the app on a phone, supplied by design. One sentence about guest link, promoter link and ticket scanning; "Open the Vegaz app" opens the app or its store page.
  - OPEN ITEM: the real app link (`config/app.ts`, placeholder, the button does nothing yet). Engineering: one smart / universal link that opens the app or the right store.
  - MOCK: "Don't show again" is remembered in this browser only; with the API it should be saved on the account.
- **Add to calendar** (`EventAddToCalendar`): small grey secondary button on the right of the date row, opening a menu: Google Calendar, Apple Calendar (.ics file, works with other calendar apps too) and Outlook. Filled in with the title, address, description and event link.
  - OPEN ITEM: events have no end time, so calendar entries last 2 hours (`DEFAULT_HOURS` in `utils/calendar.ts`, PRODUCT TO CONFIRM).
- **Assigning tickets is optional** (replaces 22 Oct "every ticket must have a person"): Proceed is always active on Assign tickets. While tickets are left a centred note at 80% opacity says "Not assigning? The N unassigned tickets will be sent to you." (PROPOSED copy). When the order is placed, every unassigned ticket is given to the buyer.
- **Inactive buttons**: text and icons at 60% opacity on every button that is disabled or not ready yet (including while saving).

## 27 Oct — One back button everywhere

- Every back arrow now uses the same button, `UiBackButton`: a 36px round button, #F1F1F1 at 50% with a slight blur, and a 20px arrow (the style already in the Figma create-event and profile frames). Hover is a touch darker (PROPOSED).
- Changed to match: the create-edition screens on phones (plain arrow before), the phone chat conversation (smaller circle before), the chat pop-up (no background before), the phone profile panel over the photo, and "Back to Home" on All events (purple text link before; the circle now sits before the text, which is dark grey).
- Unchanged: the text "Back" buttons next to Continue / Proceed in flows (they are buttons with words, not back arrows) and the gallery scroll arrows.

## 27 Oct — Chat intro: always asked, prefilled, sent as typed (replaces 26 Oct)

- The "Introduce yourself" box now opens every time someone joins an event's chat for the first time (each event once), whether or not they have a bio. Hosts are still never asked in their own event's chat.
- The box is filled in with their bio (empty if they have none). They can edit it, then "Send and join" (was "Save and join").
- Only what is in the box is posted, with their main profile photo. The fixed "Hi everyone, my name is …" opening is removed (`introMessage` deleted).
- It is saved as their bio only when they had no bio yet. If they already have one, editing the intro never changes the bio.
- "Skip for now" still joins without posting anything. X / Escape cancels the join.
- Copy (PROPOSED): with a bio, "Say hello so people in the chat can get to know you. We've started it with your bio; edit it before you send."; without one, "… We'll also save it as your bio."

## 27 Oct — Design feedback (round 1)

- **"You can join community without buying ticket"** under the ticket card on desktop (≥ 1024px), outside the card and centred, Small regular Grey_2. "join community" is a purple (Primary) semibold link that runs the normal join flow (log in if needed, intro box on first join, then the chat). Hidden for the host and for anyone already in the event's chat. Phones keep the "Not ready to buy a ticket?" block.
- **Ticket card titles** (SINGLE, COUPLE…): one step down, 14/18 → 12/16 (app x-Small semibold, weight unchanged), still in capitals.
- **Phone page side padding: 16** (was 24). Changed at the source (`--container-inset-mobile` and `--container-detail-inset-mobile`), so every page follows; the create-event phone screens, the ticket screen, the photo strip and Edit Profile now use the same token. The bottom action buttons on the create-event phone screens now run edge to edge inside the 16 margin (were capped at 327). Indents inside sections (e.g. the 8px inset of the create-event fields) are unchanged.

## 27 Oct — Event details icons (Figma 10894:35489) and title-row buttons

- Address, date and price rows use the Figma icons (Phosphor MapPin, CalendarDots, Ticket; CopySimple for copy) with no box around them; the month/day calendar tile is gone. Sizes follow Airbnb's listing rows (measured on airbnb.com): icon 24, 16 to the text, text 16/20 regular, 24 between rows (Figma has 20px icons 18 apart). Copy icon 16. Text colours unchanged (Grey_1, phones Grey_2). "Add to calendar" unchanged.
- Desktop title row: "Join Community - Free" is text only (+ icon removed) and a "Share Event" pill sits beside it (same small secondary style). Share uses the phone share sheet, or copies the link ("Link copied").
- Desktop ticket card: the "Open Chat" (host) and "Share Event" (host or ticket holder) buttons under the tickets are hidden on desktop, since the title row has both. Phones and tablets keep them there, because the title-row buttons only show on desktop.
- "Add to calendar" is now a compact pill, 28 tall (14/20 semibold, 4 above and below, 12 sides; Figma's pill size), and every details row is 28 tall (icon and text centred in it), so address, date and price sit evenly apart (icons 52 apart on desktop).

## 27 Oct — Header search, login icon (Figma 10847:27370), bold card titles

- **Desktop search field** sized as in Figma HOME/DEFAULT: 509 wide (shrinks on smaller laptops), 52 tall, placeholder 18/24 Grey_3 starting 18 from the edge, 32 purple button with a 16 icon, 10 from the right. Replaces the Airbnb 376 / 14px / 36 sizing. Phone search bar (after tapping the icon) unchanged.
- **Phone header buttons** stay Airbnb 40 round, but the icons are now 24 (search was 16).
- **Login icon** on phones (signed out): the Figma person outline (`icon-user-24.svg`, drawn with our 1.5px line rule). Signed in still shows their photo.
- **Event card titles** are bold (700) on every event card (Home rows, All events, Activities); size unchanged.
- Event page (768px and up): the photos now sit 24 below the title row (was 40), the same as the header to the title row, so the title is evenly spaced (desktop: 29 above and below the title text, the row being as tall as its 40px buttons). Phones unchanged (already 24).

## 27 Oct — Community "View all", bigger gender tag, Home "Explore all"

- **Community section**: "Invite Friend" is now **"View all"** and opens `EventCommunityModal` (NOT IN FIGMA, PROPOSED layout): web a 441 card, phones a bottom sheet; title "Community (N)", X; a scrolling list of everyone, host first, each row a 48 photo/letter avatar and the name (16/20). More load as you scroll (30 at a time). Tapping a person closes the list and opens their profile. "+N Others" opens the list too. (Inviting is still available through Share Event.)
  - MOCK: the catalog only names 5 people per event, so `mocks/community.ts` invents the rest (stable per event) up to the community count. Service: `getCommunityMembers(eventId, offset, limit)`. OPEN ITEM (engineering): endpoint and page size.
- **Gender tag** on community photos: 18 (with its 2px white edge, was 12) and a 10px semibold F / M (was 6px regular) so it can be read.
- **Home "Explore all"**: the button sits under the card row, left aligned, 24 below, on every screen (was beside the "Explore all events" heading from 768px up).

## 27 Oct — Home hero from Figma, "Add your Event", host app modal copy, modal body colour

- **Home hero** (Figma HOME/DEFAULT 10847:27412 and HOME/DEFAULT/MOBILE 10847:27650):
  - Desktop (≥ 1024): 70 above and below; title left, 56/64 bold, -1 letter spacing, up to 581 wide; right column up to 506 wide with the sentence (18/28 Grey_2) and, 24 below, a 240 × 52 "Join Vegaz" (18/28 semibold). Sides line up with the page content (not Figma's 58).
  - Tablet (768–1023): same layout with today's sizes (40/48 title, 16/24 text, 48 button), 40 above and below.
  - Phones: 40 above and below, 16 title to text, 32 text to the full-width button; sizes unchanged.
  - **"Join Vegaz"** (was "Add your event") opens Login or signup; it is hidden once signed in.
- **Header and footer**: "Host an Event" now reads **"Add your Event"** (same action: starts hosting).
- **Host app modal**: title "Unlock your host tools in the app"; body "Get your guest and promoter links, scan tickets at the door and manage your event, all in the Vegaz app." Both centred, body Grey_2. **"Maybe Later"** replaces "Don't show again": it closes the modal until their next visit (there is no permanent opt-out any more; `useHostAppPrompt` removed).
- **Body text in modals and pop-ups is Grey_2** (`--color-text-secondary`): Log out, host app, Event Created, ticket-kind sheet, Activities (empty state and note), signup success, gender step, and the terms note on the email step. Titles, labels and field text stay dark. Already Grey_2: bio, birthday and gender prompts, host dialogs, auth step copy. Not changed: the checkout success copy (light text on the dark card).

## 27 Oct — Bottom nav (Figma update), hero button, footer, phone search

- **Bottom navigation** (Figma 10870:35376 update): Create pill is now Primary with a light purple (#F1E9FF) +; active tab icons are the Linear icons in Primary (no Bold icons); inactive Grey_3; labels semibold in every state. Kept from earlier decisions: Airbnb bar sizing (65 tall, 10 above / below, 44 tabs) and 11/13 labels (Figma shows 12/18 and 15 padding).
- **Home hero button** (desktop and tablet): Airbnb standard button (48 tall, 16/20, 24 sides) that fits "Join Vegaz" (~125 wide); Figma's 240 × 52 felt too big. Phones keep the full-width button.
- **Footer**: "Hot events right now" and "Upcoming events" removed from Discover.
- **Phone search** (`LayoutMobileSearch`, NOT IN FIGMA, PROPOSED): the search icon opens a full-screen search instead of turning the header into a field with "Cancel". Close X (40 round, Grey_6) on the left, then the search pill; before typing, "Suggested events" (up to 6 happening this week); while typing, up to 6 matches or "No events found"; rows: 48 flier, title, place · date. Tapping a row opens the event; Search / Enter opens the All events page with the results (`/events?q=…`, "Results for “…” (N)"). What was typed is kept. Desktop keeps the dropdown under the header field.

## 27 Oct — Create-event hierarchy and alignment, phone search close, icon buttons, Home bottom space

- **Create event choice screen**: "Create event" is H2 32/40 bold (was 20/24 semibold); "Start fresh event" / "Use existing event" are bold.
- **Create-event layout (desktop and tablet)**: content lines up with the top bar, 64 from the screen edge: the step rail's text starts in line with the logo (the grey rail still runs to the screen edge and widens by the difference), and the form / side panel ("Your tickets") end in line with Exit. The middle form is narrower as a result. Same on every step and on 1024–1279 and tablet widths.
- **Ticket type dropdown** (create-event flow): option titles bold; 4px more padding above and below each option. Colours unchanged.
- **Details row icons** (Location, Categories, Participants…): fixed file paths instead of names built at runtime, so every build finds them (they were missing in the preview).
- **Phone search**: the clear (x) inside the field is removed; the close X sits to the right of the field, with no background.
- **Icon buttons have no grey circle** behind them: back buttons (`UiBackButton`, everywhere) and the profile panel close / back. Hover fades the icon slightly (PROPOSED). Header search / login round buttons are unchanged.
- **Home**: 24 between the "Explore all" button and the footer on every screen (was 141 on desktop/tablet, 42 on phones).

## 27 Oct — Phone ticket bar redesign

- Based on Airbnb's booking bar (measured at 375: 48-tall button, 16/20 text, 24 sides) and made clearer:
  - 16 above and below (+ safe area), page margins at the sides (16 phones; 24/40 tablet).
  - Top: 1px hairline (black at 6%) and a soft shadow `0 -4px 16px rgba(17,17,26,.06)` so it lifts off white pages.
  - Left: total 18/24 bold Grey_1 ("Free" when there's nothing to pay) over "3 tickets · 2 tiers" 14/18 regular Grey_2.
  - Right: standard 48 primary button (16/20, at least 148 wide): "Buy Ticket", or "RSVP" for free-only picks.
- Room is now reserved under the whole page while the bar shows, so the bottom of the footer is no longer hidden behind it.
- Tapping the ticket bar anywhere except its button smoothly scrolls the page to the ticket list (just below the header). The total and summary are a button for keyboard and screen-reader users ("…, Show tickets").
- Header (signed in): the phone profile photo is 32 (was 40) so it balances the 24px search icon; on desktop the profile button shows the photo and name only (the @username line is removed).

## 27 Oct — Hero when signed in, button weight, header centring, carousels, profile menu spacing

- **Home hero** is hidden whenever someone is signed in; the first row then sits 24 under the header.
- **Button text is semibold (600)** on every `UiButton` (was 500), including the chat header "Buy Ticket" (was regular).
- **Desktop header**: the search is exactly in the middle of the page (two equal side columns), placeholder/text 16px (Figma 18). The profile button is the photo (32) + arrow only, 40 tall like "Add your Event" (name removed).
- **Phone header**: the search and login icons have no grey circle (just the icon). Spacing tightened: 40 tap areas 4 apart, so the icons are 20 apart and the last one lines up with the 16 page margin. Profile photo 28 (with its arrow): a filled photo reads as the same size as the 24 outline search icon.
- **Phone carousels**: no scrollbar under the cards; 12 extra space below the cards.
- **Profile menu spacing** (Figma 10682:52438, updated): 24 between items (rows 8 apart), 8 above and below the line, 16 above the first item and 24 below "Log out" (our menu text keeps its Airbnb size, so the gaps are copied rather than the absolute positions).

## 27 Oct — Rotating promo banner with animated art (Figma 10653:38231)

- **768px and up**: one full-width promo banner at a time (Figma 10653:38259 "Refer a host" and 10904:35652 "Get free tickets"), cross-fading (0.6s) every 30 seconds, round and round. Two dots under it (8 round, the current one a 20-wide Primary pill, PROPOSED) show which one is on and switch it; the timer pauses while the pointer or keyboard focus is on the banner.
- Built from parts (not one image) so the art can move: Primary card 168 tall, radius 20; illustration 231 from the left edge; centred text 323 wide (title 34/34 Outfit Black 900 in Lime #C6FF00 / Pink #FF4081, uppercase; 16 below, 14/18 white); pink 56 round arrow 46 from the right. Outfit 900 is now loaded.
- **Animation (PROPOSED)**: the illustration floats slowly with a slight tilt (6s loop) and its white sparkles twinkle (staggered); only the visible banner animates, and nothing moves for people who turn on "reduce motion". Done in CSS on the Figma SVGs (`assets/illustrations/`), no extra library. A richer animation would need a Lottie file from design.
- **Phones**: unchanged (both square banners in a sideways row).
- OPEN ITEM (unchanged): no destination for the banners / arrow yet.
- Promo banner arrows (Figma update 27 Oct): 48 round (was 56), still 46 from the right; Pink on "Refer a host", cyan (#00E5FF) on "Get free tickets".
- Phone header (< 768px): 10 above and below, the same as the bottom navigation, so it is 61 tall (10 + 40 tap areas + 10 + 1px line; was 80). `--sizing-header-height` is 61 on phones, so the chat page height and sticky offsets follow.
- Host app modal: title is the app H2, 24/32 bold, with balanced line breaks (no single word left alone). "Maybe Later" is a text-only button (ghost: no fill, no border).
- Ticket bought (purple screen, phones): "Cancel" under "Join Chat with Others" is text only (white, no outline).
- **Event page sticky header (phones and tablets, < 1024)**: once the event name scrolls up behind the site header, `EventStickyHeader` takes the header's place (same height and bottom line): the event name on the left (16/20 semibold, one line, "…"), and on the right a Share icon button (40, no background) and the same small secondary button as the desktop title row ("Join Community - Free", or "Open Chat" for the host / members). It disappears when the name scrolls back into view. Not shown on desktop, where the title row has the buttons.
- The "Open Chat" and "Share Event" buttons under the tickets are removed at every width (desktop title row / phone sticky header have them).
- Share sits on the far right: in the phone/tablet sticky header (icon lined up with the page edge) and in the desktop title row (after "Join Community - Free" / "Open Chat").
- **Leaving Create event part-way** (`HostLeaveDialog`, NOT IN FIGMA, PROPOSED copy, Log out dialog layout; phones a bottom sheet): once anything has been added (title, description, photos, date or time, location, category, participants, tickets, What to expect, or a chosen event for an edition), trying to leave the flow (Exit, Back on the first step, the browser's back button, any link) asks "Leave without publishing?" with "“<event title>” isn't live yet and drafts aren't saved. If you leave now, the details, photos and tickets you've added will be deleted." (says "Your event" / "Your new edition" when no title is typed) — red "Leave and delete" and a text-only "Keep editing" (focused first; X, Escape and clicking outside also keep them in). Nothing added yet: leaves straight away. Publishing never asks. Closing or reloading the tab shows the browser's own "Leave site?" warning.

## 27 Oct: Loading placeholders (ghost loaders)
- **What:** grey shapes that look like the content shown while it's still loading (slow network or a slow server), with a soft shimmer sweeping across them. They're always shown while loading; there's no minimum time and no demo switch. When the data arrives, the real content takes their place.
- **Parts:** `UiSkeleton` (one shape: Grey_6 with a Grey_5 shimmer every 1.4s; the shimmer stops for people who reduce motion; hidden from screen readers), `UiSkeletonList` (rows of a photo and two lines; screen readers hear "Loading…") and `EventCardSkeleton` (the event card's square photo and three lines).
- **Where:**
  - Home rows: 5–6 card shapes per row.
  - All events: 10 cards; the count is hidden while loading.
  - Event page: title, gallery, details, host, tickets and About in the page layout.
  - Chat: the chat list, and message bubbles (left and right).
  - Search: the desktop search dropdown and the phone search suggestions.
  - Also: the community "View all" list (including the next page), My Activities, the chat pop-up (list and messages) and the edition event picker.
- **How:** pages now load their data "lazily", so the page frame (header, footer) appears straight away and the placeholders fill the gaps, instead of a blank screen until everything is ready. The Home mock now waits like a real request does.
- NOT IN FIGMA, PROPOSED: shapes follow the real layouts; colours are existing Grey tokens.

## 27 Oct: Buy ticket success screen: "Close" instead of "Cancel"
- The phone button under "Join Chat with Others" now says **Close** (still text only). It and the X (desktop and phones) close the success screen only, and the buyer stays on the event page.
- Closing also puts the buyer in the event's community, so the event page shows them as already in the chat: the "Join the community" card and note are gone, and the button reads **Open Chat**. On desktop it's in the title row; on phones it's in the bar that appears at the top once they scroll. Open Chat goes straight into the chat.
- ASSUMPTION (engineering to confirm): buying a ticket includes membership of the event's community. Because they're already members, the chat intro box doesn't open when they come in through Open Chat later. "Join Chat with Others" still opens the intro box first, as before.
- Fix found while testing: the shared dialog component now renders only after the page has started in the browser. When the event and chat pages were opened directly (server-rendered), a dialog's opening animation broke start-up and left the page blank. Nothing visible changes.

## 27 Oct: Event page sticky header on desktop too
- The sticky bar (event name and buttons, shown once the name scrolls up behind the site header) now shows at every width, desktop included.
- Desktop (1024px and up): the two buttons are exactly the ones in the title row ("Join Community - Free" / "Open Chat", then "Share Event"). They're the same 40-tall text pills, in the same spot on screen, 8 apart. The name uses the page title's size (26/30 semibold, same as before scrolling; was 18/24), left aligned with the page content (1120 wide, 40 sides). The bar is the site header's height (80) with its bottom line.
- Phones and tablets are unchanged: small button, then the Share icon.

## 27 Oct: Design review of everything not in Figma (Tosin)
Every item listed as "NOT IN FIGMA / PROPOSED" in this log was reviewed in one pass (list of 37, sent 27 Oct). Approved items are final for engineering; they still need adding to Figma so it stays the source of truth.
- **Approved as built:**
  - interaction styles (hover, pressed, focus, disabled), inactive buttons at 60%, icon hover, toast, loading placeholders, motion;
  - desktop search results, phone search screen, long names ending in "…";
  - All events page; promo banner dots and animation;
  - event not found page, sticky header (phones and desktop), phone ticket bar, phone Share icon, gallery arrows and photo viewer, desktop profile side panel, Community "View all";
  - Paystack placeholder step, "Edit user", unassigned tickets note, field rules;
  - chat replies, press-and-hold menu, photo grids and 10-photo limit, list preview text, chat intro copy;
  - Create event: when Continue/Proceed turns on, 1024–1279 layout, phone Date & Time, success copy, "Leave without publishing?", "Unlock your host tools in the app";
  - My Activities chips and empty tabs; Edit Profile locked email, username error, photo reorder;
  - Terms and Privacy page layout (the legal text is still a draft for legal review).
- **Changed:** the "M" gender dot uses Figma's blue #6891FF (an exception to the blue → Primary rule); the "F" dot stays pink.
- **To design and build next:** something went wrong + Try again, offline, message failed to send, photo upload errors, empty states (Home, All events), sold out + "N tickets left" countdown from 5, session expired, a general 404 page, the chat 10-photo limit message. (Payment failed is not in this round.)

## 27 Oct: Missing states designed and built (NOT IN FIGMA, PROPOSED unless noted)
All of these use one look, `UiStateMessage`: a 64 round Grey_6 circle with a 32 line icon, the title (18/24 semibold Grey_1), a short line (14/20 Grey_2) and a small secondary button. A compact version (no icon) is used in small spaces. Problems next to a field use `UiInlineAlert`: a red 16 "!" and red text.
- **Sold out and "N tickets left"** (Figma Ticket 6698:6496), per ticket type:
  - At 5 or fewer left, the red chip with the clock counts down live: "5 tickets left" … "1 ticket left". We use proper plurals; Figma says "5 ticket left".
  - "+" stops at what's left.
  - At 0: grey "Sold out" chip, price struck through in Grey_1, price and description at 60%, and no quantity control.
  - If someone else buys while you're picking, your pick is lowered to what's left, or removed when it sells out, with a short message.
  - Data: `remaining` on each ticket type (utils/ticketStock.ts).
  - DEMO: on the event page, every 20 seconds "someone else" buys one ticket of a type that's down to 5 or fewer, so the countdown can be seen. OPEN ITEM: a live update (push or polling) from the API.
- **Something went wrong + Try again** (approved style: in place; header and footer stay):
  - Shown on Home, All events, the event page (no longer wrongly says "not found"), the chat list and messages, both searches, the community list, My Activities, the chat pop-up and the edition event picker.
  - Copy: "Something went wrong" / "We couldn't load <events>. Please try again."
  - When offline it switches to "You're offline" / "Check your internet connection and try again." (wifi-off icon).
- **Offline banner:**
  - A dark bar under the header that pushes the page down: "You're offline. Some things won't load until you reconnect." On phones, just "You're offline".
  - Back online: a green dot and "You're back online" for 3 seconds.
- **Message not sent:** the bubble stays in the chat with a red "!" and "Not sent · Try again"; tapping it sends again. In the chat pop-up, the message stays in the box with a red line above it.
- **Photo problems** (chat, chat pop-up, event photos, profile photos, What to expect pictures), as one red line:
  - "“x.pdf” isn't a photo. Use JPG, PNG, WebP or HEIC.";
  - "“x.jpg” is over 10 MB. Choose a smaller photo.";
  - "You can add up to 10 photos. We added the first N." (chat limit 10, pop-up 5, event 5, profile 3).
  - Rules in utils/photoRules.ts; limits to confirm with engineering.
- **Profile photos:** a 24 round X on each photo removes it; the next one moves up to become the profile photo.
- **Couldn't save:** a toast on Edit Profile; a toast on Publish in Create event, where everything stays as typed. The log-in email step shows "We couldn't reach Vegaz. Check your connection and try again."
- **Empty states:** Home and All events with no events: calendar icon, "No events yet", "New events are added all the time. Check back soon, or host your own.", "Add your Event". Home rows with no events hide on their own.
- **Session expired** (approved: log-in pop-up, keep progress):
  - "You've been signed out" / "For your security, please log in again. You'll carry on right where you left off.", with their email filled in.
  - After logging in, the page is exactly as they left it (forms, cart, chat draft). Closing the pop-up signs them out and goes to Home.
  - Engineering: call `useSession().expire()` when a request answers 401. In development: `__vegaz.expireSession()` in the browser console.
- **404 page** (wrong links): map pin with an X, "Page not found", "The link may be broken, or the page may have moved.", "Go to Home" + text-only "Explore events". Other crashes: "Something went wrong" + "Try again" / "Go to Home".
- **Testing hook:** the mock services now fail when the device is offline (services/mockRequest.ts), so these states can be seen by turning off wifi. Delete with the mocks.

## 27 Oct: Phone event header with a back arrow
- **Phones (under 768px):** the event header is now the header on event pages, from the top (no scrolling needed). The Vegaz logo and search header is hidden there.
  - Contents, left to right: a back arrow, the event name (one line, "…" when long), "Join Community - Free" / "Open Chat", then the Share icon.
  - Back goes to the previous page. If they arrived from a link (no previous page), it goes to Home.
  - It's hidden while the full-screen profile is open, which has its own back.
- **Tablets and desktop:** unchanged. The normal header switches to the event header once you scroll past the name.

## 27 Oct: PWA "Add to Home Screen" nudge, designed in Figma (not built yet)
- Figma: Vegaz Revamp, page "PWA install", section "PWA · Add to Home Screen nudge (mobile)". It has three phone frames (393 wide), a notes panel, and two local components: "PWA / App icon" (Primary, radius 14, white Vegaz logo) and "PWA / Step".
- **Banner:** a white card above the bottom bar with the app icon, "Get the Vegaz app" / "Add it to your Home Screen. No download.", a small "Add" button and an X. "Add" opens the sheet.
- **Sheet:** the app icon, "Add Vegaz to your Home Screen", "Open Vegaz in one tap, full screen, like any other app. No app store download needed.", then 3 numbered steps, each with a small picture of what to tap (purple ring or highlighted row).
  - Same design on every phone; only the steps and pictures change.
  - iPhone (Safari): Share → "Add to Home Screen" → "Add", then "Got it".
  - Android (Chrome): menu ⋮ → "Add to Home screen" / "Install app" → "Install". "Add to Home Screen" opens the browser's own install pop-up.
  - "Not now" under each.
- **When it shows** (decision): after a meaningful action (joining a community, buying a ticket or RSVP), never on first load. Phones only, and not once installed.
- PROPOSED: X / Not now waits 14 days before asking again.
- OPEN ITEM (engineering): web manifest, icons (192 / 512 + maskable), service worker.

## 27 Oct: PWA install nudge built (Figma page "PWA install")
- **When:** after a meaningful action: joining a community (event page), buying a ticket or RSVP (event page, or Buy Ticket from a chat).
  - Phones only (under 768px).
  - Not shown when Vegaz is already open from the Home Screen, or within 14 days of a dismissal (PROPOSED, kept on the device).
  - It waits while a conversation fills the screen or during Create event.
- **Banner** (Figma 10924:400): "Install Vegaz on your device" / "Add it to your Home Screen and access Vegaz easily". It sits 12 above the bottom navigation, or above the ticket bar on event pages.
  - The whole card is tappable; the X closes it.
  - FLAG: Figma's title says "Intall"; built as "Install".
- **iPhone (Safari) only:** tapping the banner opens the sheet (Figma 10928:627): the app icon, title and line, three steps with the screenshots from Figma, then "Got it" and text-only "Not now". Any of them closes it for 14 days.
- **Android (decision):** no sheet. Tapping the banner opens the browser's own install pop-up. If the browser offers no install pop-up (e.g. iPhone Chrome, Firefox), the banner isn't shown.
- **Installable app:**
  - `public/manifest.webmanifest`: name Vegaz, standalone, theme #4B099F.
  - Icons in `public/icons` (192, 512, maskable 512, apple-touch 180), made from the Figma app icon.
  - Meta tags in nuxt.config.
  - OPEN ITEM (engineering): service worker / offline caching (not needed to install on Chrome Android today, but needed for offline use).
- **Code:** `usePwaInstall` (rules and install prompt), `PwaBanner`, `PwaSheet`, `PwaAppIcon`. In development, `__vegaz.pwaNudge()` in the console shows the banner.
- **Update 27 Oct (replaces "when" and the 14-day wait above):**
  - The banner appears every time someone lands on Home (phones, not already installed).
  - It then stays on every page until they close it (X, or "Not now" / "Got it" on iPhone) or add Vegaz. On Android, cancelling the browser's pop-up also closes it.
  - Closing it hides it for this visit only; it comes back the next time they open Vegaz and land on Home.
  - No longer tied to joining or buying; no 14-day wait.

## 28 Oct: Hero button copy
- The Home hero button now reads "Join Vegaz - Free" (was "Join Vegaz"). It still opens log in / sign up.
