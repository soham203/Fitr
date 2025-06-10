export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  category_id: string;
  description: string;
  user_id: string;
  created_at: string;
}

export interface Budget {
  id: string;
  amount: number;
  period: 'daily' | 'monthly';
  user_id: string;
  created_at: string;
} 