export const TRANSACTION_TYPES = ["IN", "OUT"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionFilter = "ALL" | TransactionType;

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface TransactionSummary {
  balance: number;
  totalIn: number;
  totalOut: number;
  todayIn: number;
  todayOut: number;
}

export interface ParsedTransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  note: string | null;
}

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTransactionDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  });
}

export function calculateTransactionSummary(transactions: Transaction[]): TransactionSummary {
  const today = new Date();

  return transactions.reduce<TransactionSummary>(
    (summary, transaction) => {
      if (transaction.type === "IN") {
        summary.totalIn += transaction.amount;
        summary.balance += transaction.amount;
      } else {
        summary.totalOut += transaction.amount;
        summary.balance -= transaction.amount;
      }

      if (isSameDay(new Date(transaction.date), today)) {
        if (transaction.type === "IN") {
          summary.todayIn += transaction.amount;
        } else {
          summary.todayOut += transaction.amount;
        }
      }

      return summary;
    },
    { balance: 0, totalIn: 0, totalOut: 0, todayIn: 0, todayOut: 0 }
  );
}

export function parseQuickTransaction(input: string, fallbackType: TransactionType = "OUT"): ParsedTransactionInput {
  const normalized = normalizeWhitespace(input);

  if (!normalized) {
    throw new Error("Enter an amount and a short description.");
  }

  const amountMatch = normalized.match(/(\d+(?:[.,]\d+)?)/);
  if (!amountMatch) {
    throw new Error("Add an amount like `500 in salary`.");
  }

  const amount = Number(amountMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid amount greater than zero.");
  }

  const amountIndex = amountMatch.index ?? 0;
  const amountText = amountMatch[0];
  const withoutAmount = normalizeWhitespace(
    `${normalized.slice(0, amountIndex)} ${normalized.slice(amountIndex + amountText.length)}`
  );

  const type: TransactionType = fallbackType;
  const noteSource = withoutAmount ? toTitleCase(withoutAmount) : null;
  const category = noteSource ? toTitleCase(noteSource.split(" ")[0]) : type === "IN" ? "Income" : "Expense";

  return {
    amount,
    type,
    category,
    note: noteSource,
  };
}
