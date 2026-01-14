import { create } from 'zustand';
import { tokenIcons } from '../../../shared/constants';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';

export interface ExchangeRate {
  currency: string;
  date: string;
  price: number;
}

export interface WalletToken {
  currency: string;
  amount: number;
}

interface WalletState {
  exchangeRates: ExchangeRate[];
  walletTokens: WalletToken[];
  isLoading: boolean;
  error: string | null;

  // Getters
  getPrice: (currency: string) => number;
  getBalance: (currency: string) => number;
  getIcon: (currency: string) => string;

  // Actions
  fetchExchangeRates: () => Promise<void>;
  updateBalance: (currency: string, amount: number) => void;
  deductBalance: (currency: string, amount: number) => void;
  addBalance: (currency: string, amount: number) => void;
}

// Default wallet amounts for each token
const defaultWalletAmounts: Record<string, number> = {
  BLUR: 1500,
  bNEO: 2000,
  BUSD: 2500,
  USD: 10000,
  ETH: 1500,
  GMX: 2000,
  STEVMOS: 2000,
  LUNA: 2000,
  RATOM: 2000,
  STRD: 2000,
  EVMOS: 1500,
  IBCX: 2000,
  IRIS: 5000,
  ampLUNA: 2000,
  KUJI: 2000,
  STOSMO: 2000,
  USDC: 5000,
  axlUSDC: 2000,
  ATOM: 2000,
  STATOM: 2000,
  OSMO: 2000,
  rSWTH: 10000,
  STLUNA: 2000,
  LSI: 2000,
  OKB: 2000,
  OKT: 2000,
  SWTH: 50000,
  USC: 1500,
  WBTC: 1500,
  wstETH: 1500,
  YieldUSD: 1500,
  ZIL: 10000,
};

export const useWalletStore = create<WalletState>((set, get) => ({
  exchangeRates: [],
  walletTokens: [],
  isLoading: false,
  error: null,

  getPrice: (currency: string) => {
    const rate = get().exchangeRates.find((r) => r.currency === currency);
    return rate?.price || 0;
  },

  getBalance: (currency: string) => {
    const token = get().walletTokens.find((t) => t.currency === currency);
    return token?.amount || 0;
  },

  getIcon: (currency: string) => {
    return tokenIcons[currency as keyof typeof tokenIcons] || '';
  },

  fetchExchangeRates: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(PRICES_API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`);
      }

      const data: ExchangeRate[] = await response.json();

      // Deduplicate by currency, keeping the most recent entry
      const priceMap = new Map<string, ExchangeRate>();
      for (const rate of data) {
        const existing = priceMap.get(rate.currency);
        if (!existing || new Date(rate.date) > new Date(existing.date)) {
          priceMap.set(rate.currency, rate);
        }
      }

      const exchangeRates = Array.from(priceMap.values());

      // Initialize wallet tokens based on available currencies
      const walletTokens: WalletToken[] = exchangeRates.map((rate) => ({
        currency: rate.currency,
        amount: defaultWalletAmounts[rate.currency] ?? Math.floor(Math.random() * 100) + 1,
      }));

      set({ exchangeRates, walletTokens, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch exchange rates',
        isLoading: false,
      });
    }
  },

  updateBalance: (currency: string, amount: number) => {
    set((state) => ({
      walletTokens: state.walletTokens.map((t) => (t.currency === currency ? { ...t, amount } : t)),
    }));
  },

  deductBalance: (currency: string, amount: number) => {
    set((state) => ({
      walletTokens: state.walletTokens.map((t) =>
        t.currency === currency ? { ...t, amount: Math.max(0, t.amount - amount) } : t
      ),
    }));
  },

  addBalance: (currency: string, amount: number) => {
    set((state) => ({
      walletTokens: state.walletTokens.map((t) =>
        t.currency === currency ? { ...t, amount: t.amount + amount } : t
      ),
    }));
  },
}));
