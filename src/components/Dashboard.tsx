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
  Legend,
} from 'recharts';
import { Expense, Category } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Add type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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
const COLORS = ['#fca311', '#14213d', '#e63946', '#2a9d8f', '#e76f51', '#264653', '#2b2d42', '#8d99ae'];

export default function Dashboard({ expenses, budget, categories }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseWithCategory[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

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
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Calculate date range
    const startDate = new Date();
    const endDate = new Date();

    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      startDate.setFullYear(year, month - 1, 1);
      endDate.setFullYear(year, month, 0);
    } else if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // Update date range display
    setDateRange({
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });

    // Filter expenses based on selected time range
    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.created_at);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    setFilteredExpenses(filtered);

    // Prepare data for the chart
    const prepareChartData = () => {
      const data: { [key: string]: number } = {};
      const currentDate = new Date(startDate);
      
      // Initialize all dates in range with 0
      while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        data[dateStr] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Add actual expense data
      filtered.forEach(expense => {
        const date = new Date(expense.created_at);
        const dateStr = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        data[dateStr] = (data[dateStr] || 0) + expense.amount;
      });

      // Convert to array and sort by date
      return Object.entries(data)
        .map(([date, amount]) => ({
          date,
          amount: Number(amount.toFixed(2))
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
    };

    setChartData(prepareChartData());
  }, [expenses, timeRange, selectedMonth]);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalExpenses;
  const percentageUsed = (totalExpenses / budget) * 100;

  // Process expenses for category chart
  const categoryChartData = filteredExpenses.reduce((acc: { name: string; value: number }[], expense) => {
    const category = categories.find(c => c.id === expense.category_id)?.name || 'Other';
    const existingCategory = acc.find(item => item.name === category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: category, value: expense.amount });
    }
    return acc;
  }, []);

  const formatCurrency = (amount: number) => {
    // Convert to string with 2 decimal places
    const formattedAmount = amount.toFixed(2);
    // Add thousand separators
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    const dateRangeText = selectedMonth 
      ? `Report for ${months.find(m => m.value === selectedMonth)?.label}`
      : `Report for last ${timeRange === 'week' ? '7' : '30'} days (${dateRange.start} - ${dateRange.end})`;
    doc.text(dateRangeText, pageWidth / 2, 30, { align: 'center' });
    
    // Add budget overview
    doc.setFontSize(14);
    doc.text('Budget Overview', 14, 45);
    doc.setFontSize(12);
    
    const budgetData = [
      ['Total Budget', formatCurrency(budget)],
      ['Total Expenses', formatCurrency(totalExpenses)],
      ['Remaining', formatCurrency(remaining)],
      ['Budget Used', `${percentageUsed.toFixed(1)}%`]
    ];
    
    autoTable(doc, {
      startY: 50,
      head: [['Category', 'Amount']],
      body: budgetData,
      theme: 'grid',
      headStyles: { fillColor: [252, 163, 17] },
      styles: { fontSize: 10 }
    });
    
    // Add expenses table
    doc.setFontSize(14);
    doc.text('Expense Details', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const expensesData = filteredExpenses.map(expense => {
      const category = categories.find(c => c.id === expense.category_id)?.name || 'Other';
      return [
        new Date(expense.created_at).toLocaleDateString(),
        category,
        expense.description,
        formatCurrency(expense.amount)
      ];
    });
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: expensesData,
      theme: 'grid',
      headStyles: { fillColor: [252, 163, 17] },
      styles: { fontSize: 10 }
    });
    
    // Add category summary
    doc.setFontSize(14);
    doc.text('Category Summary', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const categorySummary = categoryChartData.map(item => [
      item.name,
      formatCurrency(item.value),
      `${((item.value / totalExpenses) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Category', 'Amount', 'Percentage']],
      body: categorySummary,
      theme: 'grid',
      headStyles: { fillColor: [252, 163, 17] },
      styles: { fontSize: 10 }
    });
    
    // Save the PDF
    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

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

        {/* Download Report Button - Mobile */}
        <div className="lg:hidden mb-4">
          <button
            onClick={generatePDFReport}
            className="w-full bg-[#fca311] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#e59210] transition-colors flex items-center justify-center gap-2 text-base font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Report
          </button>
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

        {/* Download Report Button - Desktop */}
        <button
          onClick={generatePDFReport}
          className="hidden lg:flex fixed bottom-6 right-6 bg-[#fca311] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#e59210] transition-colors items-center gap-2 text-lg font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Report
        </button>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Expenses Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#14213d]">Daily Expenses</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedMonth 
                    ? `Showing data for ${months.find(m => m.value === selectedMonth)?.label}`
                    : `Showing last ${timeRange === 'week' ? '7' : '30'} days (${dateRange.start} - ${dateRange.end})`
                  }
                </p>
              </div>
              <div className="text-right mt-2 md:mt-0">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-[#fca311]">₹{totalExpenses.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
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
                    <Bar dataKey="amount" fill="#fca311" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No data found</p>
              )}
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#14213d]">Expenses by Category</h3>
              </div>
              <div className="text-right mt-2 md:mt-0">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-[#fca311]">₹{totalExpenses.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="h-[300px]">
              {categoryChartData.length > 0 ? (
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
                      formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No data found</p>
              )}
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

          {/* Trend Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#14213d] mb-6">Spending Trend</h3>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
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
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#fca311"
                      strokeWidth={2}
                      dot={{ fill: '#fca311', strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No data found</p>
              )}
            </div>
          </div>

          {/* Category Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#14213d] mb-6">Category Comparison</h3>
            <div className="h-[300px]">
              {filteredExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(
                      filteredExpenses.reduce((acc, expense) => {
                        const category = categories.find(c => c.id === expense.category_id)?.name || 'Other';
                        acc[category] = (acc[category] || 0) + expense.amount;
                        return acc;
                      }, {} as { [key: string]: number })
                    ).map(([name, value]) => ({ name, value }))}
                    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
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
                      dataKey="value"
                      fill="#14213d"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No data found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}