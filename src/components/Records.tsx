'use client';

import { useState } from 'react';
import { Expense } from '@/lib/supabase';

type ExpenseWithCategory = Expense & {
  categories: {
    id: string;
    name: string;
  };
};

type RecordsProps = {
  expenses: ExpenseWithCategory[];
  onDelete: (id: string) => void;
};

export default function Records({ expenses, onDelete }: RecordsProps) {
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Get the start and end dates for the selected month
  const getMonthDates = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return { startDate, endDate };
  };

  // Filter expenses by category and month
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.created_at);
    const { startDate, endDate } = getMonthDates(selectedMonth);
    
    const matchesCategory = filter === 'all' || expense.categories?.id === filter;
    const matchesMonth = expenseDate >= startDate && expenseDate <= endDate;
    
    return matchesCategory && matchesMonth;
  });

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique categories for the filter dropdown
  const uniqueCategories = Array.from(
    new Set(expenses.map((expense) => ({
      id: expense.categories?.id || 'uncategorized',
      name: expense.categories?.name || 'Uncategorized'
    })))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg sm:text-xl font-medium text-[#14213d]">Expense Records</h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto bg-white text-[#14213d] border border-[#e5e5e5] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-[#fca311]"
          >
            {getMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto bg-white text-[#14213d] border border-[#e5e5e5] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-[#fca311]"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e5e5e5]">
            <thead className="bg-[#14213d]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e5e5e5]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-[#14213d]">
                    No expenses found for the selected period
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#14213d]">
                      {formatDate(expense.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#14213d]">
                      {expense.categories?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#14213d]">
                      <div className="max-w-xs truncate" title={expense.description}>
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#fca311]">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-[#fca311] hover:text-[#14213d] transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 