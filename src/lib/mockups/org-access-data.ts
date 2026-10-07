/**
 * Mock data for DES-197 — invite-only organization access.
 *
 * Built to the "Organization access and membership" requirements doc
 * (PLT-4476) and the access model's five groups. Zain KSA and Yaqoot share
 * sa.zain.com, which is the subsidiary case the doc exists for. Saudia and
 * Al Rajhi Bank are migrated organizations with no owner yet.
 */

/** The groups a person can be added to inside an organization. Sarj Super
    Admin is platform-wide and is never offered here. */
export const GROUPS = ["Viewer", "Caller", "Editor", "Org Admin"] as const
export type Group = (typeof GROUPS)[number]

export type Member = {
  id: string
  name: string
  email: string
  group: Group
  owner?: boolean
  /** Who admitted them. Null for someone auto-enrolled by domain before
      invites existed. */
  addedBy: string | null
  added: string
}

export type Invite = {
  id: string
  email: string
  group: Group
  invitedBy: string
  sent: string
}

export const ORG = { name: "Zain KSA", domain: "sa.zain.com" }

export const MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Fatimah Al-Qahtani",
    email: "f.alqahtani@sa.zain.com",
    group: "Org Admin",
    owner: true,
    addedBy: "Sarj",
    added: "2 Sep 2026",
  },
  {
    id: "m2",
    name: "Omar Al-Harbi",
    email: "o.alharbi@sa.zain.com",
    group: "Org Admin",
    addedBy: "Fatimah Al-Qahtani",
    added: "4 Sep 2026",
  },
  {
    id: "m3",
    name: "Reem Al-Dosari",
    email: "r.aldosari@sa.zain.com",
    group: "Editor",
    addedBy: "Fatimah Al-Qahtani",
    added: "4 Sep 2026",
  },
  {
    id: "m4",
    name: "Nawaf Al-Ghamdi",
    email: "n.alghamdi@sa.zain.com",
    group: "Editor",
    addedBy: null,
    added: "14 Jul 2026",
  },
  {
    id: "m5",
    name: "Khalid Al-Mutairi",
    email: "k.almutairi@sa.zain.com",
    group: "Caller",
    addedBy: "Omar Al-Harbi",
    added: "12 Sep 2026",
  },
  {
    id: "m6",
    name: "Majed Al-Otaibi",
    email: "majed.otaibi@gmail.com",
    group: "Viewer",
    addedBy: "Fatimah Al-Qahtani",
    added: "20 Sep 2026",
  },
]

export const INVITES: Invite[] = [
  {
    id: "i1",
    email: "l.alzahrani@sa.zain.com",
    group: "Editor",
    invitedBy: "Fatimah Al-Qahtani",
    sent: "5 Oct 2026",
  },
  {
    id: "i2",
    email: "hassan.k@outlook.com",
    group: "Caller",
    invitedBy: "Omar Al-Harbi",
    sent: "29 Sep 2026",
  },
]

/** People already in another organization. V1 keeps a person in one
    organization, so inviting them here is refused by name. */
export const ELSEWHERE: Record<string, string> = {
  "a.alrashid@sa.zain.com": "Yaqoot",
}

export const LINK_EXPIRY = ["1 day", "7 days", "30 days"] as const
export type LinkExpiry = (typeof LINK_EXPIRY)[number]

export type Organization = {
  id: string
  name: string
  domain: string
  /** The owner's name, or their email while their invite is pending. Null
      on an organization migrated from before owners existed. */
  owner: string | null
  ownerPending?: boolean
  members: number
  /** Who could be made owner, for an organization without one. */
  candidates?: { name: string; group: Group }[]
}

export const ORGANIZATIONS: Organization[] = [
  {
    id: "o1",
    name: "Zain KSA",
    domain: "sa.zain.com",
    owner: "Fatimah Al-Qahtani",
    members: 6,
  },
  {
    id: "o2",
    name: "Yaqoot",
    domain: "sa.zain.com",
    owner: "Abdullah Al-Rashid",
    members: 3,
  },
  {
    id: "o3",
    name: "Saudia",
    domain: "saudia.com",
    owner: null,
    members: 81,
    candidates: [
      { name: "Turki Al-Shammari", group: "Org Admin" },
      { name: "Hind Al-Subaie", group: "Org Admin" },
      { name: "Yousef Al-Malki", group: "Editor" },
    ],
  },
  {
    id: "o4",
    name: "Al Rajhi Bank",
    domain: "alrajhibank.com.sa",
    owner: null,
    members: 23,
    candidates: [
      { name: "Abeer Al-Juhani", group: "Org Admin" },
      { name: "Saad Al-Amri", group: "Editor" },
    ],
  },
  {
    id: "o5",
    name: "Rawabi Holding",
    domain: "rawabi.com",
    owner: "Huda Al-Saleh",
    members: 9,
  },
]

/** What the invited person sees, one state per screen. */
export const INVITEE_STATES = [
  { id: "invite", label: "Invite" },
  { id: "wrong-account", label: "Wrong account" },
  { id: "expired", label: "Link expired" },
  { id: "no-invite", label: "No invite" },
] as const
export type InviteeState = (typeof INVITEE_STATES)[number]["id"]

export const INVITEE = {
  invitedEmail: "l.alzahrani@sa.zain.com",
  signedInAs: "lama.z@gmail.com",
  inviter: "Fatimah Al-Qahtani",
  group: "Editor" as Group,
  uninvited: "s.alanazi@sa.zain.com",
}
