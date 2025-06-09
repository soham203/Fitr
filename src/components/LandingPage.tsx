import React, { useState } from 'react';
import Auth from '@/components/Auth';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthClick = (isSignUpForm: boolean) => {
    setIsSignUp(isSignUpForm);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#14213d] border-b border-[#fca311]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/images/nogpb8qx.png" alt="FiTr Logo" className="h-24" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleAuthClick(false)}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-[#000000] rounded-md transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleAuthClick(true)}
                className="px-4 py-2 text-sm font-medium text-[#14213d] bg-[#fca311] hover:bg-[#e69500] rounded-md transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#14213d]">Welcome to FiTr</h2>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Auth 
              onAuthSuccess={() => {
                setShowAuth(false);
                onGetStarted();
              }}
              initialIsSignUp={isSignUp}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section with Split Layout */}
        <div className="relative">
          {/* Left side - Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-20 pb-16 lg:pt-24 lg:pb-20">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                <div>
                  <h1 className="text-4xl font-extrabold text-[#14213d] sm:text-5xl lg:text-6xl">
                    <span className="block">Track Your</span>
                    <span className="block text-[#fca311]">Financial Journey</span>
                  </h1>
                  <p className="mt-6 text-xl text-gray-600">
                    Take control of your finances with our powerful expense tracking and budget management platform. 
                    Get insights into your spending habits and make smarter financial decisions.
                  </p>
                  <div className="mt-10">
                    <button
                      onClick={() => handleAuthClick(true)}
                      className="px-8 py-4 text-lg font-medium text-white bg-[#fca311] rounded-lg hover:bg-[#e69500] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fca311]"
                    >
                      Get Started
                    </button>
                  </div>
                </div>

                {/* Right side - Feature Cards */}
                <div className="mt-12 lg:mt-0">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Card 1 */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                      <div className="w-12 h-12 bg-[#fca311] rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[#14213d]">Expense Tracking</h3>
                      <p className="mt-2 text-gray-600">Track and categorize your daily expenses with ease.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                      <div className="w-12 h-12 bg-[#fca311] rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[#14213d]">Budget Management</h3>
                      <p className="mt-2 text-gray-600">Set and manage your monthly budget effectively.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                      <div className="w-12 h-12 bg-[#fca311] rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[#14213d]">Visual Insights</h3>
                      <p className="mt-2 text-gray-600">Get clear insights with interactive charts and graphs.</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                      <div className="w-12 h-12 bg-[#fca311] rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[#14213d]">Smart Analytics</h3>
                      <p className="mt-2 text-gray-600">Make informed decisions with detailed analytics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#14213d]">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to take control?</span>
                <span className="block text-[#fca311]">Start your financial journey today.</span>
              </h2>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => handleAuthClick(true)}
                  className="px-8 py-4 text-lg font-medium text-[#14213d] bg-[#fca311] rounded-lg hover:bg-[#e69500] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fca311]"
                >
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 