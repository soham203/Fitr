-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert feedback" ON feedback;
DROP POLICY IF EXISTS "Allow users to view their own feedback" ON feedback;

-- Create policy to allow authenticated users to insert feedback
CREATE POLICY "Enable insert for authenticated users only"
    ON feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view all feedback
CREATE POLICY "Enable read access for authenticated users"
    ON feedback
    FOR SELECT
    TO authenticated
    USING (true); 