# QuizMaker Project Overview

## Project Description

QuizMaker is a quiz-creating application designed for teachers. The application allows educators to create quizzes with the assistance of an AI assistant that helps align quiz content with specific state standards (such as TEKS).

## Technology Stack

### Core Framework & Platform

- **Next.js 15.4.6** - React framework for building the application
- **Cloudflare Workers** - Serverless deployment platform
- **@opennextjs/cloudflare** - Integration layer for deploying Next.js to Cloudflare Workers

### Database

- **Cloudflare D1** - SQLite database for data persistence
  - Database Name: `quizmaker-app-database`
  - Database ID: `370f62d7-ca2b-4667-97d8-f9fd97f7bc38`
  - Binding: `quizmaker_app_database`

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework for styling
- **Geist Fonts** - Modern typography (Geist Sans & Geist Mono)

### Development Tools

- **TypeScript** - Type safety and enhanced development experience
- **Wrangler** - Cloudflare CLI tool for deployment and database management
- **ESLint** - Code linting and formatting

## Architecture

### Deployment Configuration

- **Platform**: Cloudflare Workers
- **Runtime**: Node.js compatibility enabled
- **Assets**: Static assets served via Cloudflare Workers
- **Observability**: Enabled for monitoring and debugging

### Database Migrations

- **Tool**: Wrangler migrations commands
- **Scope**: Both local and remote D1 database management
- **Commands**:
  - Create migrations: `wrangler d1 migrations create`
  - List migrations: `wrangler d1 migrations list`
  - Apply migrations: `wrangler d1 migrations apply`

## Project Structure

```
quizmaker-app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind CSS
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx          # Home page component
│   └── favicon.ico       # Site favicon
├── docs/                  # Project documentation
│   └── PROJECT_OVERVIEW.md # This file
├── public/               # Static assets
├── .dev.vars            # Local environment variables
├── wrangler.jsonc       # Cloudflare Workers configuration
├── cloudflare-env.d.ts  # TypeScript definitions for Cloudflare environment
├── next.config.ts       # Next.js configuration
├── open-next.config.ts  # OpenNext.js Cloudflare configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Environment Configuration

### Local Development

- **Environment Variables**: Stored in `.dev.vars`
- **Current Variables**:
  - `NEXTJS_ENV=development`

### Cloudflare Environment

- **Configuration**: Managed via `wrangler.jsonc`
- **Database Binding**: `quizmaker_app_database` → `quizmaker-app-database`
- **Assets Binding**: `ASSETS` → `.open-next/assets`

### TypeScript Environment

- **Cloudflare Types**: Generated in `cloudflare-env.d.ts`
- **Update Command**: `wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts`

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run preview` - Build and preview locally
- `npm run cf-typegen` - Generate Cloudflare TypeScript definitions

## Key Features

1. **Quiz Creation Interface** - Intuitive tools for teachers to create quizzes
2. **AI Assistant Integration** - AI-powered assistance for content alignment
3. **State Standards Compliance** - Support for various educational standards (e.g., TEKS)
4. **Cloud-Native Architecture** - Built for scalability and reliability
5. **Modern UI/UX** - Responsive design with Tailwind CSS

## Development Workflow

1. **Local Development**: Use `npm run dev` for local development
2. **Database Changes**: Create and apply migrations using Wrangler commands
3. **Deployment**: Use `npm run deploy` to deploy to Cloudflare Workers
4. **Environment Updates**: Modify `.dev.vars` for local changes, use Wrangler secrets for production

## Next Steps

- Set up database schema and initial migrations
- Implement quiz creation functionality
- Integrate AI assistant for standards alignment
- Design and implement user authentication
- Create quiz management interface
- Add quiz taking and grading capabilities
