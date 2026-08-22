export const LEGAL = {
  effective: "August 22, 2026",
  operator: "Brock Knechtel",
  region: "Colorado, United States",
  contact: "Discord (linked from nlo.gg)",
  close: "August 31, 2026 at 10:30 AM Mountain Time (America/Denver)",
} as const;

export const LEGAL_NAV = [
  { to: "/terms", label: "Terms" },
  { to: "/privacy", label: "Privacy" },
  { to: "/prizes", label: "Prize rules" },
] as const;

export type LegalSection = {
  title: string;
  body?: string[];
  items?: string[];
};

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Who we are",
    body: [
      "Netherite Legends Odyssey (\u201cNLO\u201d, \u201cwe\u201d) is a Minecraft survival server and companion site at nlo.gg. It is operated by Brock Knechtel from Colorado, United States.",
      "These Terms cover the website, shop, desk, bounties, season prizes, Discord community we run for the server, and the live Minecraft world. Using any of those means you agree to these Terms and the Privacy Policy.",
    ],
  },
  {
    title: "Age",
    body: [
      "You must be at least 13 years old to create an nlo.gg account or play on the server.",
      "You must be at least 18 years old to buy coin packs, post a funded bounty with purchased coins, or claim a Season cash / gift-card / Minecoins prize.",
      "If you are 13\u201317, a parent or guardian must supervise your account. We do not knowingly collect personal information from children under 13. If we learn we have, we delete it.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "You are responsible for the email, password, and linked Google or X login on your desk. Keep them private.",
      "One person, one desk. Ban evasion, account sharing to dodge a ban, or impersonating another player\u2019s claimed Minecraft name is a ban.",
      "We may suspend or close an account that breaks these Terms, the in-game rules, or the law.",
    ],
  },
  {
    title: "The world",
    body: [
      "Outside protected spawn and explicit system protections, raiding, theft, ambushes, bounty hunting, PvP, and damage to builds are intended gameplay. That is not a license for real-world harassment, doxxing, or illegal activity.",
      "Cheats, x-ray, illegal clients, dupes, exploits, and attacks on server stability are forbidden.",
      "Minecraft is a trademark of Mojang / Microsoft. NLO is an independent server. We are not affiliated with or endorsed by Mojang or Microsoft.",
    ],
  },
  {
    title: "Coins and the desk",
    body: [
      "NLO coins are licensed in-game currency. You do not own them as property. They have no cash value and cannot be cashed out, traded for real money through us, or transferred off the server.",
      "A paid pack credits the desk (the website holding balance) and queues an in-game grant. Once the coins land on your claimed Minecraft name they leave the desk.",
      "Coins may be spent in-game or used to fund a bounty from the desk while they are still held there. Buying coins does not buy rank, combat power, or a pay-to-win kit.",
      "We may change pack prices, sinks, and sources. We may wipe, reset, or refuse to honor coins obtained by exploit, chargeback, or fraud.",
    ],
  },
  {
    title: "Purchases and refunds",
    body: [
      "Card checkout is processed by Stripe. We never see your full card number.",
      "Digital coin packs are generally final once the charge succeeds. We refund when the law requires it, when a pack never credited because of our error, or when we choose to as a courtesy.",
      "Chargebacks filed after coins were delivered may result in a ban and reversal of the grant. Contact us on Discord before disputing a charge.",
      "If the season ends, the map changes, or you are banned for cause, unused desk coins and in-game coins are not a refundable cash balance.",
    ],
  },
  {
    title: "Bounties",
    body: [
      "A funded bounty is a player-posted in-game hunt paid from that player\u2019s desk. It is gameplay, not a real-money wager we book or a house game of chance.",
      "We can remove, refund to desk, or void a bounty that is abusive, targets a protected player, or looks like an attempt to launder a purchase.",
    ],
  },
  {
    title: "Season prizes",
    body: [
      "Season One cash and gift-card prizes are a skill contest described in the Official Prize Rules. Play on the world is free. You do not have to buy coins to compete.",
      "The Official Prize Rules control if anything on a marketing page conflicts.",
    ],
  },
  {
    title: "Content you post",
    body: [
      "Names, chat, signs, builds, bounty reasons, and Discord messages are your content. You give us a license to display them on the site, roster, boards, and promotional recaps of the season.",
      "Do not post illegal content, sexual content involving minors, real-world threats, or someone else\u2019s personal information.",
    ],
  },
  {
    title: "Availability",
    body: [
      "The server and site are provided as-is. Worlds lag. Plugins break. We will try to keep the box up, but we do not promise uptime, specific features, or that progress is permanent across every season.",
    ],
  },
  {
    title: "Liability",
    body: [
      "To the fullest extent allowed by law, NLO and the operator are not liable for lost items, griefed bases, missed prizes caused by your own rule breaks, or indirect damages.",
      "Our total liability for a paid pack is limited to the amount you paid for that pack.",
      "Some places do not allow these limits. In those places the limit is the minimum the law allows.",
    ],
  },
  {
    title: "Colorado law",
    body: [
      "These Terms are governed by the laws of the State of Colorado, excluding conflict-of-law rules. Courts in Colorado have venue, except where consumer law in your home country says otherwise.",
    ],
  },
  {
    title: "Changes",
    body: [
      "We can update these Terms. The date at the top is the current version. Keeping an account or buying a pack after a change means you accept the new version.",
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "What this covers",
    body: [
      "This policy explains what nlo.gg collects, why, and how to reach us. The operator is Brock Knechtel in Colorado, United States. Contact: Discord from nlo.gg.",
    ],
  },
  {
    title: "What we collect",
    items: [
      "Account: email, display name, password hash (never the raw password), and Google or X profile identifiers if you use those buttons.",
      "Minecraft identity: the in-game name and UUID you claim, skins we fetch from public skin services, and whether the live box has seen you.",
      "Desk and shop: coin balance, grant status, bounty posts, watchlist names, and paid-pack receipts (pack, amount, time). Card data stays with Stripe.",
      "World telemetry we store for the roster: last seen, online flag, and similar ledger facts the live server reports.",
      "Technical: IP address, user agent, and basic request logs needed to run the site, fight abuse, and talk to Stripe / auth providers.",
    ],
  },
  {
    title: "What we do not collect on purpose",
    body: [
      "We do not ask for government ID, date of birth, or a home address to create an account. Prize winners may be asked for enough information to deliver a gift card or comply with tax rules.",
      "We do not sell personal information.",
    ],
  },
  {
    title: "Why we use it",
    items: [
      "Run the desk, deliver coins in-game, and show the roster.",
      "Process payments through Stripe and prevent fraud or double-spend.",
      "Enforce rules, bans, and bounty integrity.",
      "Run Season One scoring and contact winners.",
      "Keep the site working and secure.",
    ],
  },
  {
    title: "Who we share with",
    items: [
      "Stripe, for checkout and receipts.",
      "Google or X, only if you choose that sign-in.",
      "Hosting and the live Minecraft box, so grants and roster facts can move.",
      "Public pages: claimed names, skins, open bounties, and season boards are visible to anyone on nlo.gg.",
      "Law enforcement if we are legally required to.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Account, desk, and receipt records stay while the account is open and for a reasonable period after, so we can handle chargebacks and bans. We can delete or anonymize earlier on request unless we must keep a record.",
    ],
  },
  {
    title: "Children",
    body: [
      "nlo.gg is not directed at children under 13. Do not create an account if you are under 13. If a parent believes we have a child\u2019s data, message us on Discord and we will delete it.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can update your claimed name, password, and watchlist from the desk. You can ask us on Discord to close an account or export what we have on it.",
      "If you are in a place with GDPR-style rights, you can ask for access, correction, deletion, or a copy of your data. We will respond in a reasonable time.",
    ],
  },
  {
    title: "Security",
    body: [
      "Passwords are hashed. Cards go through Stripe. No method is perfect. Tell us on Discord if you think a desk was taken over.",
    ],
  },
  {
    title: "Changes",
    body: [
      "The date at the top is the current policy. Material changes will be posted here.",
    ],
  },
];

export const PRIZE_SECTIONS: LegalSection[] = [
  {
    title: "Official rules \u2014 Season One",
    body: [
      "These are the Official Rules for the Season One skill contest on Netherite Legends Odyssey. They control over marketing copy on the Season page.",
      "Sponsor / operator: Brock Knechtel, Colorado, United States. Play at nlo.gg. Close: August 31, 2026 at 10:30 AM Mountain Time (America/Denver).",
      "Void where prohibited. No purchase necessary. A purchase does not improve your odds of winning the judged or scored prizes beyond ordinary play.",
    ],
  },
  {
    title: "What you can win",
    items: [
      "Top player: one prize with a stated value of $50. Winner picks one form: in-game NLO coins, Minecoins, a custom skin, a cloak, or an Amazon gift card.",
      "Top builder: one prize with a stated value of $20. Same choice menu as top player.",
      "Top clan: 25,000 NLO coins to each member on that clan\u2019s roster at close. Game currency only. Not cash.",
    ],
  },
  {
    title: "Eligibility",
    items: [
      "Open to players with a legitimate Minecraft account who have been seen on the live NLO world during Season One.",
      "You must be 13+ to play. You must be 18+ to receive a cash, gift-card, or Minecoins form of a prize. Under-18 winners of top player / top builder receive the in-game coin form instead.",
      "The operator, hired staff paid to run the box, and anyone who can edit season scores are not eligible for the $50 / $20 prizes.",
      "One prize per person for top player and top builder. Alts do not stack.",
    ],
  },
  {
    title: "How winners are chosen (skill)",
    body: [
      "This is a game of skill, not chance.",
      "Top player is ranked from Season One ledger activity: time on the world, funded bounties completed or posted in good faith, and published challenges. The operator publishes the standing method on the Season and Boards pages and may break ties by time on world, then by earliest qualifying activity.",
      "Top builder is judged by the operator on builds that exist on the world at close \u2014 creativity, execution, and presence in survival or the creative plot world. It is not a random draw.",
      "Top clan is the clan sitting first on the published clan board at close. Members paid are the members listed on that roster at close.",
    ],
  },
  {
    title: "How to enter",
    body: [
      "Join nlo.gg and play during Season One. That is the entry. You do not need an nlo.gg shop purchase.",
      "Buying coin packs is optional and is not required to be ranked.",
    ],
  },
  {
    title: "Winner notification and delivery",
    body: [
      "We will contact winners through the Discord used by the server and, if we have it, the email on the desk account within 14 days after close.",
      "A winner has 14 days to reply and pick a prize form. If they do not, we may award the in-game coin form or move to the next eligible player.",
      "Gift cards and Minecoins are delivered electronically. NLO coins are granted in-game. We do not wire cash.",
      "Prizes are awarded \u201cas is.\u201d Winner is responsible for any tax on the prize. We may ask for information required to deliver the prize or to issue a tax form if the law requires it.",
    ],
  },
  {
    title: "Fair play",
    body: [
      "Cheating, exploiting, buying accounts to farm time, collusive fake bounties, or staff-tool abuse voids eligibility. We can disqualify and re-rank.",
    ],
  },
  {
    title: "Publicity",
    body: [
      "By accepting a prize you let us name your Minecraft name and prize form on nlo.gg, Discord, and season recaps.",
    ],
  },
  {
    title: "Changes and cancellation",
    body: [
      "If the season cannot close as planned (outage, legal restriction, or force majeure), we may delay close, substitute an in-game prize of similar stated value, or cancel that prize category. We will post the change on the Season page.",
    ],
  },
];
