import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Debug function to check Supabase connection
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
}

// Types for our database tables
export type Category = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  amount: number;
  period: 'daily' | 'monthly';
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category_id: string;
  description: string;
  created_at: string;
};

export type Feedback = {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

// Helper functions for database operations
export async function getCategories() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found when fetching categories');
      return [];
    }

    console.log('Fetching categories for user:', user.id);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No categories found for user, creating default categories');
      await createDefaultCategories();
      
      // Fetch categories again after creating defaults
      const { data: newData, error: newError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (newError) {
        console.error('Error fetching categories after creation:', newError);
        throw newError;
      }
      
      console.log('Categories after creation:', newData);
      return newData;
    }

    console.log('Categories fetched successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in getCategories:', err);
    throw err;
  }
}

export async function getBudget(period: 'daily' | 'monthly') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('period', period)
    .eq('user_id', user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getExpenses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function setBudget(amount: number, period: 'daily' | 'monthly') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('budgets')
    .upsert(
      { 
        amount, 
        period,
        user_id: user.id 
      },
      {
        onConflict: 'user_id,period',
        ignoreDuplicates: false
      }
    );
  
  if (error) {
    console.error('Error setting budget:', error);
    throw error;
  }
}

export async function createExpense(amount: number, categoryId: string, description: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('expenses')
    .insert({ 
      amount, 
      category_id: categoryId, 
      description,
      user_id: user.id 
    });
  
  if (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function createFeedback(message: string, rating: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('feedback')
    .insert({ 
      message, 
      rating,
      user_id: user.id 
    });
  
  if (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
}

export async function getFeedback() {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createCategory(name: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Creating category:', { name, userId: user.id });
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    console.log('Category created successfully:', data);
    return data as Category;
  } catch (err) {
    console.error('Error in createCategory:', err);
    throw err;
  }
}

export async function createDefaultCategories() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found when creating default categories');
      return;
    }

    const defaultCategories = [
      'Food & Dining',
      'Transportation',
      'Housing',
      'Utilities',
      'Entertainment',
      'Shopping',
      'Healthcare',
      'Education',
      'Travel',
      'Other'
    ];

    console.log('Creating default categories for user:', user.id);
    
    // Create default categories one by one to handle potential duplicates
    for (const name of defaultCategories) {
      try {
        const { error: insertError } = await supabase
          .from('categories')
          .insert([{
            user_id: user.id,
            name
          }])
          .select();

        if (insertError) {
          // If it's a duplicate error, we can ignore it
          if (insertError.code === '23505') { // Unique violation
            console.log(`Category "${name}" already exists for user`);
            continue;
          }
          console.error(`Error creating category "${name}":`, insertError);
        } else {
          console.log(`Successfully created category "${name}"`);
        }
      } catch (err) {
        console.error(`Error creating category "${name}":`, err);
      }
    }

    console.log('Default categories creation process completed');
  } catch (err) {
    console.error('Error in createDefaultCategories:', err);
    throw err;
  }
} 