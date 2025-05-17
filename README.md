# Anal-Eyes: Smart Shareable Portfolio Platform

A modern web application for creating, managing, and sharing investment portfolios with AI-powered insights. Built with Next.js, TypeScript, and Prisma.

## Features

- 🔐 **Authentication**: Secure login with Google and GitHub
- 📊 **Portfolio Management**: Create and manage multiple investment portfolios
- 💡 **AI-Powered Insights**: Get intelligent portfolio analysis using Google's Gemini AI
- 🔗 **Smart Sharing**: Generate secure, trackable share links for your portfolios
- 📈 **Real-time Tracking**: Monitor portfolio views and access patterns
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: Google Gemini AI
- **Styling**: Tailwind CSS
- **Fingerprinting**: FingerprintJS

## Project Structure

```
anal-eyes/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── portfolio/    # Portfolio management pages
│   │   └── share/        # Shared portfolio view pages
│   ├── components/       # React components
│   └── lib/             # Utility functions and configurations
└── package.json
```

## API Routes

### Portfolio Management

- `POST /api/portfolio` - Create new portfolio
- `GET /api/portfolio/[id]` - Get portfolio details
- `PUT /api/portfolio/[id]` - Update portfolio

### Sharing

- `POST /api/share/[token]/track` - Track portfolio view
- `POST /api/share/[token]/revoke` - Revoke shared access

## Database Schema

### Models

- **User**: Authentication and user data
- **Portfolio**: Portfolio information and settings
- **Holding**: Individual stock holdings
- **SharedPortfolioAccess**: Share token and access tracking
- **TokenAccessLog**: Detailed access logging

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd anal-eyes
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file with the following variables:

   ```
   # Database
   DATABASE_URL="mongodb://..."

   # Authentication
   NEXTAUTH_SECRET="your-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   <!-- GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret" -->

   # AI
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Key Features Implementation

### Portfolio Creation

- Form-based portfolio creation with holdings management
- Real-time price fetching for holdings
- AI-powered portfolio analysis

### Smart Sharing

- Secure token-based sharing system
- View tracking with fingerprinting
- Access control and revocation

### AI Insights

- Portfolio analysis using Gemini AI
- Risk assessment and diversification analysis
- Investment recommendations

## Security Features

- JWT-based authentication
- Secure session management
- Rate limiting on API routes
- Fingerprint-based view tracking
- Access token revocation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Google for the Gemini AI API
- All contributors and users of the project
# anal-eyes
