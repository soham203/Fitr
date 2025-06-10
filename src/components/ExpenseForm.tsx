'use client';

import { useState } from 'react';

type Category = {
  id: string;
  name: string;
};

type ExpenseFormProps = {
  categories: Category[];
  onSubmit: (data: { amount: number; category: string; description: string }) => void;
};

export default function ExpenseForm({ categories, onSubmit }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  console.log('ExpenseForm received categories:', categories);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!category) {
        throw new Error('Please select a category');
      }

      if (!description.trim()) {
        throw new Error('Please enter a description');
      }

      console.log('Submitting expense:', {
        amount: amountValue,
        category,
        description: description.trim()
      });

      setLoading(true);
      onSubmit({
        amount: amountValue,
        category,
        description: description.trim(),
      });

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit expense');
      console.error('Error submitting expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-[#14213d]">
          Amount
        </label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-[#14213d]">₹</span>
          </div>
          <input
            type="number"
            id="amount"
            name="amount"
            className="w-full pl-7 pr-3 py-2 bg-white border-2 border-[#e5e5e5] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-[#fca311] text-[#14213d]"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-[#14213d]">
          Category
        </label>
        <select
          id="category"
          name="category"
          className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#e5e5e5] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-[#fca311] text-[#14213d]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[#14213d]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#e5e5e5] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-[#fca311] text-[#14213d]"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-[#fca311] text-white rounded-md hover:bg-[#e69500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
} 