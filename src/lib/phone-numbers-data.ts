/**
 * Mock data for the phone numbers admin index, shaped to the models the live
 * platform returns.
 *
 * Field names and unions come from `precedent-iso/src/models/phone-number.ts`
 * and the three table components under `admin/phone-numbers/` in `bulbul`, so
 * every column here is a column that exists today.
 */

export type NumberDirection = "both" | "inbound" | "outbound"

export const NUMBER_DIRECTION_LABELS: Record<NumberDirection, string> = {
  both: "Inbound & outbound",
  inbound: "Inbound only",
  outbound: "Outbound only",
}

/* ----------------------------------------------------------- Call activity */

export type CallActivityRow = {
  answered: number
  blockedAt: null | string
  firstCallAt: null | string
  inboundCount: number
  lastCallAt: null | string
  organizationId: string
  organizationName: string
  outboundCount: number
  phoneNumber: string
  totalCallCount: number
}

export const CALL_ACTIVITY: CallActivityRow[] = [
  {
    phoneNumber: "+966920031030",
    organizationId: "org_11",
    organizationName: "Almarai",
    totalCallCount: 1284,
    inboundCount: 1102,
    outboundCount: 182,
    answered: 1043,
    firstCallAt: "2026-02-14T08:12:00.000Z",
    lastCallAt: "2026-08-29T17:41:00.000Z",
    blockedAt: null,
  },
  {
    phoneNumber: "+966114567890",
    organizationId: "org_08",
    organizationName: "Saudi Awwal Bank",
    totalCallCount: 947,
    inboundCount: 903,
    outboundCount: 44,
    answered: 402,
    firstCallAt: "2026-01-06T10:30:00.000Z",
    lastCallAt: "2026-08-30T06:15:00.000Z",
    blockedAt: null,
  },
  {
    phoneNumber: "+12524604230",
    organizationId: "org_04",
    organizationName: "Bupa Arabia",
    totalCallCount: 216,
    inboundCount: 0,
    outboundCount: 216,
    answered: 31,
    firstCallAt: "2026-06-22T13:05:00.000Z",
    lastCallAt: "2026-08-28T11:20:00.000Z",
    blockedAt: null,
  },
  {
    phoneNumber: "+19292620953",
    organizationId: "org_27",
    organizationName: "Jarir Bookstore",
    totalCallCount: 38,
    inboundCount: 38,
    outboundCount: 0,
    answered: 26,
    firstCallAt: "2026-08-19T09:44:00.000Z",
    lastCallAt: "2026-08-30T08:02:00.000Z",
    blockedAt: null,
  },
  {
    phoneNumber: "+966920033445",
    organizationId: "org_33",
    organizationName: "Tamimi Markets",
    totalCallCount: 7,
    inboundCount: 7,
    outboundCount: 0,
    answered: 0,
    firstCallAt: "2026-03-27T08:05:00.000Z",
    lastCallAt: "2026-03-29T14:50:00.000Z",
    blockedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    phoneNumber: "+966555010203",
    organizationId: "org_19",
    organizationName: "Nana Direct",
    totalCallCount: 0,
    inboundCount: 0,
    outboundCount: 0,
    answered: 0,
    firstCallAt: null,
    lastCallAt: null,
    blockedAt: null,
  },
]

/* --------------------------------------------------- Outbound trunk assign */

export type TrunkRow = {
  assignedOrganizations: { id: string; name: string }[]
  createdAt: null | string
  isGlobalDefault: boolean
  isInUse: boolean
  numbers: string[]
  provider: string
  sipTrunkId: string
}

export const TRUNKS: TrunkRow[] = [
  {
    sipTrunkId: "ST_ndcJ4kP2xQ",
    provider: "STC Business",
    numbers: [
      "+966920031030",
      "+966114567890",
      "+966920044556",
      "+966920077881",
    ],
    isGlobalDefault: true,
    isInUse: true,
    assignedOrganizations: [
      { id: "org_11", name: "Almarai" },
      { id: "org_08", name: "Saudi Awwal Bank" },
    ],
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    sipTrunkId: "ST_7bWq10zLmR",
    provider: "Mobily Wholesale",
    numbers: ["+12524604230", "+19292620953"],
    isGlobalDefault: false,
    isInUse: true,
    assignedOrganizations: [{ id: "org_04", name: "Bupa Arabia" }],
    createdAt: "2026-05-14T12:30:00.000Z",
  },
  {
    sipTrunkId: "ST_ka83Vd0pYt",
    provider: "Zain KSA SIP",
    numbers: ["+966555010203"],
    isGlobalDefault: false,
    isInUse: false,
    assignedOrganizations: [],
    createdAt: "2026-07-04T11:22:00.000Z",
  },
]

/* ------------------------------------------------------ Provisioned numbers */

export type ProvisionedRow = {
  connectionLabel: null | string
  connectionPending: boolean
  direction: NumberDirection
  isClientOwned: boolean
  organizationName: null | string
  ownershipLabel: string
  phoneNumber: string
  providerName: string
  provisionedNumberId: string
  registeredAt: string
  scenarioName: null | string
  sipTrunkId: string
  status: "active" | "inactive"
}

export const PROVISIONED: ProvisionedRow[] = [
  {
    provisionedNumberId: "pn_01",
    phoneNumber: "+966920031030",
    organizationName: "Almarai",
    providerName: "STC Business",
    sipTrunkId: "ST_ndcJ4kP2xQ",
    connectionLabel: "Almarai via STC Business",
    connectionPending: false,
    isClientOwned: true,
    ownershipLabel: "Client owned",
    scenarioName: "Order tracking",
    direction: "both",
    status: "active",
    registeredAt: "2026-02-14T08:12:00.000Z",
  },
  {
    provisionedNumberId: "pn_02",
    phoneNumber: "+966114567890",
    organizationName: "Saudi Awwal Bank",
    providerName: "STC Business",
    sipTrunkId: "ST_ndcJ4kP2xQ",
    connectionLabel: "Saudi Awwal Bank via STC Business",
    connectionPending: false,
    isClientOwned: true,
    ownershipLabel: "Client owned",
    scenarioName: "Card disputes",
    direction: "inbound",
    status: "active",
    registeredAt: "2026-01-06T10:30:00.000Z",
  },
  {
    provisionedNumberId: "pn_03",
    phoneNumber: "+12524604230",
    organizationName: "Bupa Arabia",
    providerName: "Mobily Wholesale",
    sipTrunkId: "ST_7bWq10zLmR",
    connectionLabel: "Bupa Arabia via Bupa Arabia Avaya",
    connectionPending: true,
    isClientOwned: false,
    ownershipLabel: "Sarj owned",
    scenarioName: "Renewal outreach",
    direction: "outbound",
    status: "active",
    registeredAt: "2026-06-22T13:05:00.000Z",
  },
  {
    provisionedNumberId: "pn_04",
    phoneNumber: "+19292620953",
    organizationName: "Jarir Bookstore",
    providerName: "Mobily Wholesale",
    sipTrunkId: "ST_7bWq10zLmR",
    connectionLabel: null,
    connectionPending: false,
    isClientOwned: false,
    ownershipLabel: "Sarj owned",
    scenarioName: null,
    direction: "inbound",
    status: "active",
    registeredAt: "2026-08-19T09:44:00.000Z",
  },
  {
    provisionedNumberId: "pn_05",
    phoneNumber: "+966555010203",
    organizationName: null,
    providerName: "Zain KSA SIP",
    sipTrunkId: "ST_ka83Vd0pYt",
    connectionLabel: null,
    connectionPending: false,
    isClientOwned: false,
    ownershipLabel: "Sarj owned",
    scenarioName: null,
    direction: "both",
    status: "inactive",
    registeredAt: "2026-07-04T11:22:00.000Z",
  },
  {
    provisionedNumberId: "pn_06",
    phoneNumber: "+966920033445",
    organizationName: "Tamimi Markets",
    providerName: "Twilio Elastic SIP",
    sipTrunkId: "ST_legacy0001",
    connectionLabel: null,
    connectionPending: false,
    isClientOwned: false,
    ownershipLabel: "Sarj owned",
    scenarioName: null,
    direction: "inbound",
    status: "inactive",
    registeredAt: "2026-03-27T08:05:00.000Z",
  },
]

export const ORGANIZATIONS: { id: string; name: string }[] = [
  { id: "org_11", name: "Almarai" },
  { id: "org_08", name: "Saudi Awwal Bank" },
  { id: "org_04", name: "Bupa Arabia" },
  { id: "org_27", name: "Jarir Bookstore" },
  { id: "org_19", name: "Nana Direct" },
  { id: "org_33", name: "Tamimi Markets" },
]

export const PROVIDERS: { id: string; name: string }[] = [
  { id: "prv_9f2a41", name: "STC Business" },
  { id: "prv_3c88de", name: "Mobily Wholesale" },
  { id: "prv_71b0c5", name: "Zain KSA SIP" },
  { id: "prv_2d6f80", name: "Twilio Elastic SIP" },
]

export const TIME_RANGES: { label: string; value: string }[] = [
  { label: "All time", value: "all" },
  { label: "Last 24 hours", value: "1d" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
]
