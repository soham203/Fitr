'use client';

import { useState } from 'react';

type BudgetFormProps = {
  onSubmit: (amount: number) => void;
  onCancel: () => void;
};

export default function BudgetForm({ onSubmit, onCancel }: BudgetFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(Number(amount));
      setAmount('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-[#14213d]">
          Amount (₹)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-[#14213d] shadow-sm focus:border-[#fca311] focus:outline-none focus:ring-1 focus:ring-[#fca311]"
          placeholder="Enter amount"
          disabled={isSubmitting}
          required
          min="0"
          step="0.01"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fca311] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#fca311] hover:bg-[#e69500] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fca311] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Setting Budget...
            </div>
          ) : (
            'Set Budget'
          )}
        </button>
      </div>
    </form>
  );
} 