# GenX.art

Every Frame is Art - AI Art Video Creation Platform

Transform your photos into stunning cinematic art videos in 30 seconds. No skills needed, no expensive software required.

## Features

- **Image to Video**: Upload a photo and transform it into beautiful art videos
- **Text to Video**: Describe your vision and let AI create stunning videos
- **5 Unique Art Styles**: Cyberpunk, Watercolor, Oil Painting, Anime, Fluid Art
- **Fast Generation**: Get your art video in about 30 seconds
- **No Skills Required**: Simple interface that anyone can use

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with social providers (Google, GitHub)
- **Payments**: Stripe integration
- **UI**: Radix UI + TailwindCSS
- **State Management**: Zustand
- **Internationalization**: next-intl (English & Chinese)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy environment variables:
   ```bash
   cp env.example .env
   ```
4. Configure your environment variables
5. Run database migrations:
   ```bash
   pnpm db:migrate
   ```
6. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm format` - Format code
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Apply migrations
- `pnpm db:studio` - Open Drizzle Studio

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
├── config/        # Application configuration
├── db/            # Database schema and migrations
├── lib/           # Utility functions
├── hooks/         # Custom React hooks
├── stores/        # Zustand state stores
├── ai/            # AI video generation logic
├── payment/       # Payment integration
└── mail/          # Email templates
```

## Links

- Website: [genx.art](https://genx.art)
- Support: [support@genx.art](mailto:support@genx.art)

## License

See [LICENSE](LICENSE) for details.
