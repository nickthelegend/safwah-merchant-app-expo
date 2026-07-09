import { create } from 'zustand';

// Demo-grade in-memory settlement rail for the SAFWAH merchant app.
// Models pillar 1: tourists pay in crypto, the protocol swaps to AED, the merchant
// sees AED land in `available`, then withdraws it to a UAE bank via the Bridge.
// NOT on-chain yet — swap these mutations for SafwahSwap/SettlementRouter calls once deployed.

export type PayToken = 'USDT' | 'ETH' | 'AED';
export const AED_PER_USD = 3.6725;
export const VAT_RATE = 0.05; // UAE standard VAT

export interface Sale {
  id: string;
  amountAED: number; // gross charged, in AED
  token: PayToken; // what the customer paid in
  tokenAmount: number; // amount in that token
  customer: string;
  ts: number;
  status: 'settled' | 'pending';
}

export interface Payout {
  id: string;
  amountAED: number;
  iban: string;
  ts: number;
}

export const TOKEN_META: Record<PayToken, { name: string; color: string; aed: number }> = {
  AED: { name: 'Dirham', color: '#131316', aed: 1 },
  USDT: { name: 'Tether USD', color: '#26a17b', aed: AED_PER_USD },
  ETH: { name: 'Ethereum', color: '#8a92b2', aed: AED_PER_USD * 3150 },
};

const now = Date.now();
const min = 60_000;
const seed: Sale[] = [
  { id: 's1', amountAED: 248.0, token: 'USDT', tokenAmount: 67.53, customer: 'Tourist · 0x7a3f', ts: now - 6 * min, status: 'settled' },
  { id: 's2', amountAED: 96.5, token: 'USDT', tokenAmount: 26.28, customer: 'Tourist · 0x44b1', ts: now - 52 * min, status: 'settled' },
  { id: 's3', amountAED: 530.0, token: 'ETH', tokenAmount: 0.0535, customer: 'Tourist · 0x9c20', ts: now - 3 * 60 * min, status: 'settled' },
  { id: 's4', amountAED: 42.0, token: 'AED', tokenAmount: 42, customer: 'Walk-in', ts: now - 5 * 60 * min, status: 'settled' },
  { id: 's5', amountAED: 187.25, token: 'USDT', tokenAmount: 50.99, customer: 'Tourist · 0x1f88', ts: now - 26 * 60 * min, status: 'settled' },
];

interface SettlementState {
  business: { name: string; category: string; emirate: string; iban: string };
  available: number; // AED settled & withdrawable
  pending: number; // AED in flight (settles ~instantly in demo)
  sales: Sale[];
  payouts: Payout[];
  acceptPayment: (amountAED: number, token: PayToken, customer?: string) => Sale;
  withdraw: (amountAED: number) => void;
  setBusiness: (b: Partial<SettlementState['business']>) => void;
}

let counter = 100;
const uid = (p: string) => `${p}${++counter}`;

export const useSettlement = create<SettlementState>((set, get) => ({
  business: { name: 'Spice Route Café', category: 'Dining · Restaurant', emirate: 'Dubai, UAE', iban: 'AE07 0331 2345 6789 0123 456' },
  available: 1604.75,
  pending: 0,
  sales: seed,
  payouts: [],

  acceptPayment: (amountAED, token, customer = 'Walk-in') => {
    const tokenAmount = +(amountAED / TOKEN_META[token].aed).toFixed(token === 'ETH' ? 5 : 2);
    const sale: Sale = {
      id: uid('s'),
      amountAED: +amountAED.toFixed(2),
      token,
      tokenAmount,
      customer,
      ts: Date.now(),
      status: 'settled',
    };
    set((st) => ({ sales: [sale, ...st.sales], available: +(st.available + sale.amountAED).toFixed(2) }));
    return sale;
  },

  withdraw: (amountAED) => {
    const amt = Math.min(amountAED, get().available);
    if (amt <= 0) return;
    const payout: Payout = { id: uid('p'), amountAED: +amt.toFixed(2), iban: get().business.iban, ts: Date.now() };
    set((st) => ({ available: +(st.available - amt).toFixed(2), payouts: [payout, ...st.payouts] }));
  },

  setBusiness: (b) => set((st) => ({ business: { ...st.business, ...b } })),
}));

// --- selectors / helpers (compute in components) ---
export const isToday = (ts: number) => {
  const d = new Date(ts);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};
export const vatOf = (amountAED: number) => +(amountAED * VAT_RATE).toFixed(2);

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRIOR6 = [760, 1180, 910, 1340, 1020, 1480]; // seeded revenue for the 6 days before today

/// Revenue per day for the last 7 days (prior 6 seeded, today computed live from sales).
export function weeklyRevenue(sales: Sale[]): { x: string; y: number; label?: string }[] {
  const today = sales.filter((s) => isToday(s.ts)).reduce((a, s) => a + s.amountAED, 0);
  const now = new Date();
  const pts: { x: string; y: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    pts.push({ x: DOW[d.getDay()], y: i === 0 ? Math.round(today) : PRIOR6[6 - i] });
  }
  return pts;
}

/// AED received grouped by the token the customer paid in.
export function tokenBreakdown(sales: Sale[]): { label: string; value: number; color: string }[] {
  return (['USDT', 'ETH', 'AED'] as PayToken[])
    .map((t) => ({ label: t, value: +sales.filter((s) => s.token === t).reduce((a, s) => a + s.amountAED, 0).toFixed(2), color: TOKEN_META[t].color === '#131316' ? '#131316' : TOKEN_META[t].color }))
    .filter((d) => d.value > 0);
}
