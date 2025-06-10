'use client';

import { useState } from 'react';
import { supabase, createDefaultCategories } from '@/lib/supabase';

interface AuthProps {
  onAuthSuccess: () => void;
  initialIsSignUp?: boolean;
}

export default function Auth({ onAuthSuccess, initialIsSignUp = false }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if we need to wait before retrying
    const now = Date.now();
    if (lastAttemptTime && now - lastAttemptTime < 300000) { // 5 minutes cooldown for Brevo
      const minutesLeft = Math.ceil((300000 - (now - lastAttemptTime)) / 60000);
      setError(`Due to email service limits, please wait ${minutesLeft} minutes before trying again.`);
      return;
    }

    setLoading(true);
    setLastAttemptTime(now);

    try {
      if (isSignUp) {
        // Proceed with signup
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              signup_time: new Date().toISOString(),
            }
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('rate limit') || 
              signUpError.message.includes('email service') ||
              signUpError.message.includes('too many requests')) {
            setRetryCount(prev => prev + 1);
            throw new Error('Email service is currently busy. Please try again in 5 minutes.');
          }
          throw signUpError;
        }

        if (data?.user?.identities?.length === 0) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }

        // Create default categories for the new user
        try {
          console.log('Attempting to create default categories...');
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log('User authenticated, creating default categories for:', user.id);
            await createDefaultCategories();
            console.log('Default categories creation completed');
          } else {
            console.error('No user found after signup');
          }
        } catch (err) {
          console.error('Error creating default categories:', err);
        }

        setShowConfirmationAlert(true);
        setRetryCount(0);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('rate limit') || 
              signInError.message.includes('email service') ||
              signInError.message.includes('too many requests')) {
            setRetryCount(prev => prev + 1);
            throw new Error('Service is currently busy. Please try again in 5 minutes.');
          }
          throw signInError;
        }

        // Check if this is the user's first login and create default categories if needed
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Check if user has any categories
            const { data: categories, error: categoriesError } = await supabase
              .from('categories')
              .select('*')
              .eq('user_id', user.id);

            if (categoriesError) {
              console.error('Error checking categories:', categoriesError);
            } else if (!categories || categories.length === 0) {
              console.log('No categories found for user, creating default categories');
              await createDefaultCategories();
            }
          }
        } catch (err) {
          console.error('Error checking/creating categories:', err);
        }

        onAuthSuccess();
        setRetryCount(0);
      }
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (errorMessage.includes('email service') || 
                 errorMessage.includes('rate limit') || 
                 errorMessage.includes('too many requests')) {
        errorMessage = 'Email service is currently busy. Please try again in 5 minutes.';
      } else if (errorMessage.includes('Email sending failed')) {
        errorMessage = 'Unable to send confirmation email. Please try again later or contact support.';
      } else if (errorMessage.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google') => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e5e5e5]">
      {showConfirmationAlert ? (
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-[#fca311] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#14213d] mb-4">Check Your Email</h2>
          <p className="text-[#666] mb-6">
            We've sent a confirmation link to <span className="font-semibold">{email}</span>. Please check your email and click the link to verify your account.
          </p>
          <div className="text-sm text-[#666] mb-6">
            <p className="font-medium mb-2">If you don't see the email:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Check your spam folder</li>
              <li>Wait a few minutes and try again</li>
              <li>Make sure you entered the correct email address</li>
              <li>Try using a different email provider</li>
            </ul>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowConfirmationAlert(false);
                setIsSignUp(false);
              }}
              className="w-full px-6 py-2 bg-[#14213d] text-white rounded-md hover:bg-[#000000] transition-colors"
            >
              Back to Sign In
            </button>
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-2 bg-[#fca311] text-white rounded-md hover:bg-[#e59400] transition-colors"
            >
              Resend Confirmation Email
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-[#14213d] mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-400 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#14213d] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#14213d] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#fca311] text-white rounded-md hover:bg-[#e59400] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-[#14213d] hover:text-[#fca311] transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </>
      )}
    </div>
  );
} 