'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { getExpenses, getBudget, setBudget as updateBudget, createExpense, getCategories, deleteExpense } from '@/lib/supabase';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import ExpenseForm from '@/components/ExpenseForm';
import BudgetForm from '@/components/BudgetForm';
import Records from '@/components/Records';
import type { Expense, Category } from '@/types';
import FeedbackForm from '@/components/FeedbackForm';
import LandingPage from '@/components/LandingPage';

type ExpenseWithCategory = Expense & {
  categories: {
    id: string;
    name: string;
  };
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'feedback'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setExpenses([]);
        setBudget(0);
        setCategories([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading data for user:', user.id);
      const [expensesData, budgetData, categoriesData] = await Promise.all([
        getExpenses(),
        getBudget('monthly'),
        getCategories()
      ]);
      console.log('Categories loaded:', categoriesData);
      setExpenses(expensesData);
      setBudget(budgetData?.amount || 0);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetSubmit = async (amount: number) => {
    try {
      await updateBudget(amount, 'monthly');
      await loadData();
      setShowBudgetForm(false);
    } catch (err) {
      console.error('Error setting budget:', err);
      setError('Failed to set budget. Please try again.');
    }
  };

  const handleExpenseSubmit = async (data: { amount: number; category: string; description: string }) => {
    try {
      await createExpense(data.amount, data.category, data.description);
      await loadData();
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {user && (
        <nav className="bg-[#14213d] border-b border-[#fca311]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src="/images/nogpb8qx.png" alt="FiTr Logo" className="h-24" />
              </div>

              {/* Mobile menu button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#fca311]"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Hamburger icon */}
                  <svg
                    className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {/* Close icon */}
                  <svg
                    className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Desktop menu */}
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-[#fca311] text-white'
                      : 'text-white hover:bg-[#000000]'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'records'
                      ? 'bg-[#fca311] text-white'
                      : 'text-white hover:bg-[#000000]'
                  }`}
                >
                  Records
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'feedback'
                      ? 'bg-[#fca311] text-white'
                      : 'text-white hover:bg-[#000000]'
                  }`}
                >
                  Feedback
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setShowAuth(false);
                    setActiveTab('dashboard');
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-[#000000] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeTab === 'dashboard'
                      ? 'bg-[#fca311] text-white'
                      : 'text-white hover:bg-[#000000]'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('records');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeTab === 'records'
                      ? 'bg-[#fca311] text-white'
                      : 'text-white hover:bg-[#000000]'
                  }`}
                >
                  Records
                </button>
                <button
                  onClick={() => {
                    setActiveTab('feedback');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeTab === 'feedback'
                      ? 'bg-[#fca311] text-white'
                      : 'text-white hover:bg-[#000000]'
                  }`}
                >
                  Feedback
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setShowAuth(false);
                    setActiveTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#000000] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {!user && !showAuth && (
        <LandingPage onGetStarted={() => setShowAuth(true)} />
      )}

      {showAuth && !user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto">
            <Auth onAuthSuccess={() => {
              setShowAuth(false);
              loadData();
            }} />
          </div>
        </div>
      )}

      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fca311]"></div>
                </div>
              ) : activeTab === 'dashboard' ? (
                <Dashboard
                  budget={budget}
                  expenses={expenses}
                  categories={categories}
                />
              ) : activeTab === 'records' ? (
                <Records
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                />
              ) : (
                <FeedbackForm />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Set Budget Button/Form */}
              {showBudgetForm ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <BudgetForm onSubmit={handleBudgetSubmit} onCancel={() => setShowBudgetForm(false)} />
                </div>
              ) : (
                <button
                  onClick={() => setShowBudgetForm(true)}
                  className="w-full px-4 py-2 bg-[#fca311] text-white rounded-md hover:bg-[#e69500] transition-colors"
                >
                  Set Budget
                </button>
              )}

              {/* Add Expense Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Expense</h2>
                <ExpenseForm onSubmit={handleExpenseSubmit} categories={categories} />
              </div>

              {/* Recent Expenses */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Expenses</h2>
                <div className="space-y-4">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.created_at).toLocaleDateString()} • {expense.categories?.name}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">₹{expense.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Show for both authenticated and unauthenticated states */}
      <footer className="bg-[#14213d] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Made with ❤️ by sohammm
          </p>
        </div>
      </footer>

      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#14213d]">Feedback</h2>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FeedbackForm />
          </div>
        </div>
      )}
    </main>
  );
}