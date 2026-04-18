export const CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Health",
  "Utilities",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type CategoryVariant =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "health"
  | "utilities"
  | "other";

export function getCategoryVariant(category: string): CategoryVariant {
  return category.toLowerCase() as CategoryVariant;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  createdAt: string;
}
