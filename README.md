# Finding Finland

A gamified web application to help new immigrants navigate their journey in Finland. Complete quests, earn points, and track your progress as you settle into Finnish life!

## Features

- **🎮 Gamified Quest System**: Complete tasks across four categories:
  - ⚖️ Legal: Registration, permits, bank accounts, etc.
  - 👥 Social: Join communities, attend events, make connections
  - 🎭 Cultural: Experience Finnish traditions and lifestyle
  - 🍴 Food: Try authentic Finnish cuisine

- **📊 Progress Tracking**: Track your completed quests and total points
- **🏆 Leaderboard**: Compete with other immigrants and see your ranking
- **🔐 Secure Authentication**: Email/password authentication via Supabase
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🇫🇮 Finnish-Themed UI**: Blue and white color scheme inspired by the Finnish flag

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:
- Node.js 18.x or later installed
- npm or yarn package manager
- A Supabase account (free tier is sufficient)
- A Vercel account (for deployment)

## Getting Started

### 1. Clone the Repository

```bash
cd finding-finland-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: "Finding Finland" (or any name you prefer)
   - Database Password: (choose a strong password)
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

#### Get Your Supabase Credentials

1. Go to your project settings (gear icon in sidebar)
2. Navigate to "API" section
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon/Public Key** (under "Project API keys")

#### Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

#### Run Database Migrations

1. In your Supabase dashboard, go to the "SQL Editor" (in the sidebar)
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and click "Run"
5. Create another new query
6. Copy the contents of `supabase/migrations/002_seed_quests.sql`
7. Paste and click "Run"

This will create all the necessary tables, policies, and seed the database with quests.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app!

### 5. Create Your First Account

1. Navigate to the signup page
2. Create an account with your email and password
3. Start completing quests!

## Project Structure

```
finding-finland-app/
├── app/
│   ├── dashboard/          # Main dashboard with quests
│   ├── leaderboard/        # Leaderboard page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── page.tsx            # Landing page
├── components/
│   ├── QuestCard.tsx       # Quest display component
│   └── ProgressStats.tsx   # User progress display
├── lib/
│   └── supabase/           # Supabase client configuration
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client
│       └── middleware.ts   # Auth middleware
├── types/
│   └── database.ts         # TypeScript types
├── supabase/
│   └── migrations/         # SQL migration files
├── middleware.ts           # Next.js middleware for auth
└── .env.local             # Environment variables (not in git)
```

## Database Schema

### Tables

- **profiles**: User profiles with points, level, and metadata
- **quests**: All available quests with categories and points
- **user_quest_progress**: Tracks which quests users have completed
- **achievements**: Available achievements (future feature)
- **user_achievements**: User's earned achievements

### Views

- **leaderboard**: Aggregated view of top users by points

## Deployment to Vercel

### 1. Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/finding-finland.git
   git push -u origin main
   ```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the same variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

6. Click "Deploy"

Your app will be live at `https://your-project-name.vercel.app` in a few minutes!

### 3. Configure Custom Domain (Optional)

1. In your Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions

## Customization

### Adding New Quests

1. Go to your Supabase SQL Editor
2. Run an INSERT query:
   ```sql
   INSERT INTO quests (title, description, category, points, icon, order_index, tips)
   VALUES (
     'Your Quest Title',
     'Description of the quest',
     'legal', -- or 'social', 'cultural', 'food'
     25, -- points
     '🎯', -- emoji icon
     10, -- display order
     'Helpful tips for completing this quest'
   );
   ```

### Changing Theme Colors

Edit the Tailwind classes in the components. The main color scheme uses:
- Primary: `blue-600` (Finnish blue)
- Secondary: `white`
- Accents: Category-specific colors

### Modifying Quest Categories

Update the `quest_category` enum in the database and the category filters in `DashboardClient.tsx`.

## Troubleshooting

### "Invalid API Key" Error
- Double-check your `.env.local` file has the correct Supabase credentials
- Make sure there are no extra spaces or quotes around the values
- Restart your development server after changing environment variables

### Database Errors
- Verify you ran both migration files in the correct order
- Check the Supabase dashboard for any error messages
- Ensure Row Level Security (RLS) policies are enabled

### Middleware Redirect Loop
- Clear your browser cookies and cache
- Check that your middleware.ts is correctly configured
- Verify the Supabase client is properly initialized

### Build Errors on Vercel
- Ensure all environment variables are set in Vercel
- Check that your `package.json` has all necessary dependencies
- Review the build logs in Vercel for specific errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Check the Next.js documentation: https://nextjs.org/docs
- Create an issue in the GitHub repository

## Roadmap

Future features to consider:
- [ ] User avatars and profiles
- [ ] Comments and tips from other users
- [ ] Achievement badges system
- [ ] Quest difficulty levels
- [ ] Photo uploads for quest proof
- [ ] Multi-language support (Finnish, English, etc.)
- [ ] Push notifications for events
- [ ] Integration with Finnish government APIs
- [ ] Mobile app (React Native)

---

**Made with ❤️ for new immigrants in Finland**

