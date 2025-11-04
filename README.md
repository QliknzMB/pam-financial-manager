# PAM - Personal Asset Manager 🏃‍♀️💰

**Ensuring Liquidity Always**

PAM is your financial lifeguard - a Next.js-based financial management application designed to reduce financial administration from hours to minutes through intelligent automation and AI-powered categorization.

## Features

### Current (v1.0 MVP - In Development)
- ⚡ **CSV Transaction Upload** - Import transactions from your bank
- 🤖 **AI-Powered Categorization** - Automatic transaction categorization using Claude AI
- 📊 **Dashboard** - Visual overview of your financial health
- 💰 **Budget Tracking** - Set and monitor spending targets
- 🔒 **Secure & Private** - Row-level security with Supabase

### Coming Soon
- 💬 **PAM Chat** - Conversational financial insights
- 📈 **Advanced Analytics** - Spending trends and forecasting
- 🎯 **Goal Tracking** - Monitor progress toward financial goals
- 🔄 **Recurring Transactions** - Automatic detection and management
- 📱 **Mobile Optimized** - Responsive design for all devices

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **AI/ML:** Anthropic Claude API (Sonnet 4)
- **Auth:** Supabase Auth
- **Hosting:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- A Supabase account ([sign up free](https://supabase.com))
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pam-financial-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API to get your credentials
   - Run the migration file in the SQL Editor:
     ```
     supabase/migrations/20241104_initial_schema.sql
     ```

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pam-financial-manager/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── transactions/      # Transaction management
│   │   ├── budget/            # Budget management
│   │   ├── chat/              # PAM chat interface
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── transactions/     # Transaction components
│   │   ├── budget/           # Budget components
│   │   └── dashboard/        # Dashboard components
│   ├── lib/                  # Utility libraries
│   │   ├── supabase/        # Supabase client setup
│   │   ├── anthropic/       # Anthropic AI integration
│   │   └── utils/           # Helper functions
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript type definitions
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql            # Seed data (default categories)
└── public/                 # Static assets
```

## Database Schema

The application uses PostgreSQL via Supabase with the following main tables:

- **profiles** - User profile information
- **accounts** - Bank accounts (checking, savings, credit cards)
- **transactions** - Financial transactions
- **categories** - Income and expense categories
- **budgets** - Monthly budget targets
- **categorization_rules** - Learned rules for auto-categorization
- **categorization_attempts** - Audit log of AI suggestions
- **recurring_transactions** - Expected recurring payments
- **goals** - Financial goals tracking

All tables have Row-Level Security (RLS) enabled to ensure users can only access their own data.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

## Contributing

This is a personal project initially built for Marnus Bosch, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [x] Project setup and configuration
- [x] Database schema and migrations
- [ ] User authentication
- [ ] CSV upload and parsing
- [ ] Transaction list and management
- [ ] AI-powered categorization
- [ ] Dashboard with charts
- [ ] Budget management
- [ ] PAM chat interface
- [ ] Advanced analytics
- [ ] Mobile optimization

See the [PRD document](./docs/PRD.md) for detailed feature specifications.

## Security

- All user data is isolated using Supabase Row-Level Security
- Passwords are hashed and managed by Supabase Auth
- API keys are never exposed to the client
- HTTPS enforced in production
- Regular security audits recommended

## Cost Estimates

**Monthly Operating Costs (Single User):**
- Supabase: $0 (free tier) - $25 (pro)
- Anthropic Claude API: ~$0.50/month
- Vercel Hosting: $0 (hobby) - $20 (pro)
- **Total: $0-45/month**

## License

TBD (MIT, Apache 2.0, or proprietary)

## Support

For issues, questions, or feedback:
- Create an issue in this repository
- Contact: Marnus Bosch

## Credits

- **Creator:** Marnus Bosch
- **Development Partner:** Claude (Anthropic)
- **Inspiration:** The need for better financial visibility and the spirit of Baywatch lifeguards 🏃‍♀️

---

**PAM - Your Financial Lifeguard** 🏃‍♀️💰

*Keeping you financially afloat, one transaction at a time.*
