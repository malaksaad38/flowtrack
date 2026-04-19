import { create } from "zustand";
import {
  calculateTransactionSummary,
  type Transaction,
  type TransactionFilter,
  type TransactionSummary,
  type TransactionType,
} from "@/lib/transactions";

type AppState = {
  quickInput: string;
  fallbackType: TransactionType;
  filterType: TransactionFilter;
  hasLoadedTransactions: boolean;
  transactions: Transaction[];
  setQuickInput: (value: string) => void;
  setFallbackType: (value: TransactionType) => void;
  setFilterType: (value: TransactionFilter) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  replaceTransaction: (tempId: string, transaction: Transaction) => void;
  removeTransaction: (transactionId: string) => void;
  getFilteredTransactions: () => Transaction[];
  getSummary: () => TransactionSummary;
};

export const useAppStore = create<AppState>((set, get) => ({
  quickInput: "",
  fallbackType: "OUT",
  filterType: "ALL",
  hasLoadedTransactions: false,
  transactions: [],
  setQuickInput: (value) => set({ quickInput: value }),
  setFallbackType: (value) => set({ fallbackType: value }),
  setFilterType: (value) => set({ filterType: value }),
  setTransactions: (transactions) => set({ transactions, hasLoadedTransactions: true }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions], hasLoadedTransactions: true })),
  replaceTransaction: (tempId, transaction) =>
    set((state) => ({
      transactions: state.transactions.map((item) => (item.id === tempId ? transaction : item)),
      hasLoadedTransactions: true,
    })),
  removeTransaction: (transactionId) =>
    set((state) => ({
      transactions: state.transactions.filter((item) => item.id !== transactionId),
      hasLoadedTransactions: true,
    })),
  getFilteredTransactions: () => {
    const { transactions, filterType } = get();
    if (filterType === "ALL") {
      return transactions;
    }
    return transactions.filter((transaction) => transaction.type === filterType);
  },
  getSummary: () => calculateTransactionSummary(get().transactions),
}));
