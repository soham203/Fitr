# 🚀 FiTr - Your Smart Financial Tracker

<div align="center">
  <img src="https://raw.githubusercontent.com/soham203/Fitr/main/public/images/logo.png" alt="FiTr Logo" width="200"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
</div>

## 📱 Overview

FiTr is a modern, intuitive financial tracking application designed to help you take control of your finances. Whether you're tracking daily expenses or planning monthly budgets, FiTr makes financial management simple and enjoyable.

<div align="center">
  <img src="https://raw.githubusercontent.com/soham203/Fitr/main/public/images/dashboard-preview.png" alt="FiTr Dashboard" width="800"/>
</div>

## ✨ Key Features

- 💰 **Smart Budgeting**: Set and track daily or monthly budgets with ease
- 📊 **Interactive Dashboard**: Visualize your spending patterns with beautiful charts
- 🏷️ **Custom Categories**: Organize expenses your way with customizable categories
- ⚡ **Real-time Updates**: Track your expenses as they happen
- 📱 **Responsive Design**: Seamless experience across all devices
- 🔒 **Secure**: Built with security in mind using Supabase authentication

## 🛠️ Tech Stack

<div align="center">
  <img src="https://raw.githubusercontent.com/soham203/Fitr/main/public/images/tech-stack.png" alt="Tech Stack" width="600"/>
</div>

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Mobile**: React Native (coming soon)
- **Charts**: Recharts
- **State Management**: React Query

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/soham203/Fitr.git
   cd Fitr
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 📁 Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── dashboard/    # Dashboard pages
│   ├── expenses/     # Expense tracking
│   └── settings/     # User settings
├── components/       # Reusable components
│   ├── ui/          # UI components
│   └── charts/      # Chart components
├── lib/             # Utility functions
└── types/           # TypeScript definitions
```

## 📊 Database Schema

<div align="center">
  <img src="https://raw.githubusercontent.com/soham203/Fitr/main/public/images/database-schema.png" alt="Database Schema" width="600"/>
</div>

### Core Tables

- **Budgets**
  - id: string
  - user_id: string
  - amount: number
  - period: 'daily' | 'monthly'
  - created_at: timestamp

- **Expenses**
  - id: string
  - user_id: string
  - amount: number
  - category: string
  - description: string
  - created_at: timestamp

- **Categories**
  - id: string
  - user_id: string
  - name: string
  - created_at: timestamp

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

<div align="center">
  Made with ❤️ sohammm
</div> 
