# Financial Tracker

A modern financial tracking application that helps users manage their budgets and expenses effectively.

## Features

- Set daily or monthly budgets
- Track expenses with customizable categories
- Real-time expense tracking
- Interactive dashboard with graphs
- Automatic date and time tracking
- Responsive design for both web and mobile

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Mobile**: React Native (coming soon)
- **Charts**: Recharts
- **State Management**: React Query

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # Reusable components
├── lib/             # Utility functions and configurations
└── types/           # TypeScript type definitions
```

## Database Schema

### Budgets
- id: string
- user_id: string
- amount: number
- period: 'daily' | 'monthly'
- created_at: timestamp

### Expenses
- id: string
- user_id: string
- amount: number
- category: string
- description: string
- created_at: timestamp

### Categories
- id: string
- user_id: string
- name: string
- created_at: timestamp

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 