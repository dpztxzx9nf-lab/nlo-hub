export const SERVER = {
  name: "NLO",
  fullName: "Netherite Legends Odyssey",
  ip: "nlo.gg",
  bedrockPort: 19132,
  version: "26.2",
  software: "Paper",
  compat: "ViaBackwards",
  consoleFriend: "NLO#3114",
  discord: "https://discord.gg/ZbjU9wkPUH",
  season: "Season One",
  seasonStart: "2026-03-02",
} as const;

export const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/play", label: "Join" },
  { to: "/world", label: "World" },
  { to: "/season", label: "Season" },
  { to: "/bounties", label: "Bounties" },
  { to: "/boards", label: "Boards" },
  { to: "/shop", label: "Shop" },
  { to: "/roster", label: "Roster" },
  { to: "/rules", label: "Rules" },
  { to: "/intel", label: "Intel" },
] as const;

export const FEATURES = [
  {
    title: "Open world, real stakes",
    body: "Outside protected spawn, raids, theft, ambushes, bounty hunts, and damage to builds are legitimate play. Build like someone is coming.",
    href: "/rules",
    image: "/world-raid.jpg",
  },
  {
    title: "Player economy",
    body: "Sell resources, pay players, use the shop, and list goods in the Auction House. Coins come from time in the world — not a cash shop.",
    href: "/world",
    image: "/spawn-plaza.jpg",
  },
  {
    title: "Season One",
    body: "Finish first and take $20 — cloak, custom skin, Minecoins, Amazon gift card, or a split. Top clan shares 25,000 coins each.",
    href: "/season",
    image: "/world-hills.jpg",
  },
] as const;

export const WORLD_PILLARS = [
  {
    title: "Creative plots",
    body: "A separate creative world. Buy a plot of land and show off a build — no raids, no theft, just the thing you wanted people to see.",
    image: "/world-plots.jpg",
  },
  {
    title: "Build defensive",
    body: "Continuity stone, trapped corridors, and hidden vaults. If it is outside spawn protection, it can fall. That is the point.",
    image: "/world-raid.jpg",
  },
  {
    title: "One shared world",
    body: "Java, Bedrock on phone or Windows, and consoles through friend NLO#3114. Same grass. Same consequences.",
    image: "/world-hills.jpg",
  },
] as const;

export const RULES = [
  {
    title: "Conflict is allowed",
    items: [
      "Raiding, stealing, ambushing, bounty hunting, and PvP are legal outside protected spawn.",
      "Damage to player builds outside system protections is legitimate gameplay.",
      "Choose allies. Sleep in a hole if you have to.",
    ],
  },
  {
    title: "Spawn is sacred",
    items: [
      "Protected spawn, creative plots, and explicit system protections are off-limits for grief and PvP.",
      "Do not bypass claims, region flags, or plugin protections.",
      "Market stalls under spawn protection stay standing.",
    ],
  },
  {
    title: "Fair methods only",
    items: [
      "No cheats, hacks, x-ray, or illegal clients.",
      "No dupes, exploits, or attacks on server stability.",
      "No ban evading. Appeals go through Discord.",
    ],
  },
  {
    title: "Progress you earn",
    items: [
      "Coins, challenges, bounties, and prestige reward time in the world.",
      "There is no pay-to-win kit. Cosmetics never buy a fight.",
      "Funded bounties pay from the poster’s purse.",
    ],
  },
] as const;

export const JOIN_STEPS = {
  java: [
    {
      title: "Use Java 26.2 if you can",
      detail: `Native version is Minecraft Java ${SERVER.version}. That is the intended client.`,
    },
    { title: "Add Server", detail: `Name it NLO. Address is ${SERVER.ip}.` },
    {
      title: "Older Java still works",
      detail: `${SERVER.compat} lets some older Java versions connect. New blocks and items from 26.2 may not look right on those clients.`,
    },
  ],
  bedrock: [
    {
      title: "Phone or Windows",
      detail: `Servers → Add Server. Address ${SERVER.ip}, port ${SERVER.bedrockPort}.`,
    },
    { title: "Join", detail: "You land in the same world as Java. Crossplay is on." },
    {
      title: "Console is different",
      detail: `Xbox, PlayStation, and Switch cannot add the IP. Add Minecraft friend ${SERVER.consoleFriend}, then join their world.`,
    },
  ],
  console: [
    {
      title: "Open friends",
      detail: "On Xbox, PlayStation, or Switch, open Minecraft friends. You are still Bedrock — the console just will not take a custom IP.",
    },
    {
      title: "Add NLO#3114",
      detail: `Search and add Minecraft user ${SERVER.consoleFriend}. Wait for the accept.`,
    },
    {
      title: "Join their world",
      detail: "Join from the friend list. That drops you on nlo.gg with everyone else.",
    },
  ],
} as const;

export const CHALLENGES = [
  { cadence: "Daily", title: "Walk the border", detail: "Visit all four overworld border posts before reset.", reward: "80 prestige · 400 coins" },
  { cadence: "Daily", title: "Honest trade", detail: "Complete three player-to-player sales or AH listings.", reward: "60 prestige · 250 coins" },
  { cadence: "Weekly", title: "Show the plot", detail: "Buy or tend a creative-world plot and open it for visitors.", reward: "220 prestige · plot crate" },
  { cadence: "Weekly", title: "Claim a name", detail: "Turn in a funded bounty, or post one that gets claimed.", reward: "300 prestige" },
  { cadence: "Season", title: "Still standing", detail: "Keep a claimed base intact through two weekly raids.", reward: "Season title" },
  { cadence: "Season", title: "Top of the ledger", detail: "Finish Season One as the #1 player. $20 in value — one prize or a split.", reward: "$20 · cloak / skin / Minecoins / gift card" },
  { cadence: "Season", title: "Banner clan", detail: "The clan on top at season close. Every listed member is paid.", reward: "25,000 coins each" },
] as const;

export const PRIZES = [
  {
    place: "Top player",
    title: "$20",
    body: "The #1 player at season close gets $20 of real value. Take it as a cloak, a custom Minecraft skin, Minecoins, an Amazon gift card, or split it across those.",
    note: "One winner. You pick how the $20 lands.",
  },
  {
    place: "Top clan",
    title: "25,000 coins each",
    body: "The clan sitting first at the close pays out 25,000 in-game coins to every member on that roster. Game money. Not cash.",
    note: "Roster at close is the roster that gets paid.",
  },
] as const;

export const COIN_PACKS = [
  {
    id: "pebble",
    name: "Pebble",
    coins: 1_000,
    usd: 1,
    blurb: "Enough for a stall fee or a small bounty bump.",
  },
  {
    id: "stack",
    name: "Stack",
    coins: 10_000,
    usd: 7,
    blurb: "Shop runs, plot fees, and a proper hunt.",
  },
  {
    id: "chest",
    name: "Chest",
    coins: 50_000,
    usd: 28,
    tag: "Popular",
    blurb: "Two top-clan payouts. Room to trade.",
  },
  {
    id: "vault",
    name: "Vault",
    coins: 250_000,
    usd: 80,
    blurb: "Serious commerce. AH listings and land.",
  },
  {
    id: "netherite",
    name: "Netherite",
    coins: 1_000_000,
    usd: 180,
    tag: "Haul",
    blurb: "The big stack. For players who run the market.",
  },
] as const;
