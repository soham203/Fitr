'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Expense, Category } from '@/lib/supabase';

type ExpenseWithCategory = Expense & {
  categories?: {
    name: string;
  };
};

interface DashboardProps {
  expenses: ExpenseWithCategory[];
  budget: number;
  categories: Category[];
}

// Enhanced color palette with more vibrant colors
const COLORS = [
  '#fca311', // Theme orange
  '#14213d', // Dark blue
  '#2a9d8f', // Teal
  '#e76f51', // Coral
  '#264653', // Navy
  '#e9c46a', // Yellow
  '#2b2d42', // Dark gray
  '#8d99ae', // Light gray
  '#ff6b6b', // Red
  '#4ecdc4', // Mint
  '#45b7d1', // Sky blue
  '#96ceb4', // Sage
  '#ffeead', // Cream
  '#ff9999', // Pink
  '#99b898', // Green
  '#feceab', // Peach
];

export default function Dashboard({ expenses, budget, categories }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseWithCategory[]>([]);

  // Generate last 12 months for the dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    };
  });

  useEffect(() => {
    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.created_at);
      const now = new Date();
      const startDate = new Date();

      if (selectedMonth) {
        // If a specific month is selected
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      } else if (timeRange === 'week') {
        // Last 7 days
        startDate.setDate(now.getDate() - 7);
        return expenseDate >= startDate;
      } else {
        // Last 30 days
        startDate.setDate(now.getDate() - 30);
        return expenseDate >= startDate;
      }
    });
    setFilteredExpenses(filtered);
  }, [expenses, timeRange, selectedMonth]);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalExpenses;
  const percentageUsed = (totalExpenses / budget) * 100;

  // Prepare data for daily expenses chart
  const dailyChartData = filteredExpenses.reduce((acc: { date: string; amount: number }[], expense) => {
    const date = new Date(expense.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existingDate = acc.find(item => item.date === date);
    if (existingDate) {
      existingDate.amount += expense.amount;
    } else {
      acc.push({ date, amount: expense.amount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Process expenses for category chart
  const categoryData = filteredExpenses.reduce((acc: any, expense) => {
    const category = expense.categories?.name || 'Uncategorized';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#14213d]">Financial Overview</h1>
              <p className="text-gray-600 mt-1">Track your expenses and budget</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTimeRange('week');
                    setSelectedMonth('');
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    timeRange === 'week' && !selectedMonth
                      ? 'bg-[#fca311] text-white shadow-md'
                      : 'bg-white text-[#14213d] hover:bg-gray-50'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    setTimeRange('month');
                    setSelectedMonth('');
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    timeRange === 'month' && !selectedMonth
                      ? 'bg-[#fca311] text-white shadow-md'
                      : 'bg-white text-[#14213d] hover:bg-gray-50'
                  }`}
                >
                  Last 30 Days
                </button>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setTimeRange('month');
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-[#14213d] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-transparent"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Budget Progress Card - Full Width */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#14213d] mb-4">Budget Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Used</span>
              <span className="text-sm font-medium text-[#14213d]">{percentageUsed.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-[#fca311] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              ></div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Budget</span>
                <span className="text-sm font-medium text-[#14213d]">₹{budget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="text-sm font-medium text-[#14213d]">₹{remaining.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid - Side by Side */}
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* Daily Expenses Chart */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#14213d]">Daily Expenses</h3>
                  <p className="text-sm text-gray-600 mt-1">Track your spending over time</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-xl font-bold text-[#fca311]">₹{totalExpenses.toFixed(2)}</p>
                </div>
              </div>
              <div className="h-[250px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#14213d"
                      tick={{ fill: '#14213d', fontSize: 12 }}
                      height={40}
                      tickMargin={5}
                    />
                    <YAxis 
                      stroke="#14213d"
                      tick={{ fill: '#14213d', fontSize: 12 }}
                      width={60}
                      tickMargin={5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                    />
                    <Bar 
                      dataKey="amount"
                      fill="#fca311" 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 h-full">
              <h3 className="text-lg font-semibold text-[#14213d] mb-4 md:mb-6">Expenses by Category</h3>
              <div className="h-[250px] md:h-[350px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Color Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center text-sm">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-600 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 