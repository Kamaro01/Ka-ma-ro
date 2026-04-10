# Ka-ma-ro Official Store

A modern Next.js 15 application built with TypeScript and Tailwind CSS.

## Features

- Next.js 15
- React 19
- Tailwind CSS
- Supabase-backed ecommerce flows
- Mobile-money-focused checkout

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:4028](http://localhost:4028) with your browser to see the result.

## Project Structure

```
nextjs/
├── public/             # Static assets
├── src/
│   ├── app/            # App router components
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Main page component
│   ├── components/     # Reusable UI components
│   ├── styles/         # Global styles and Tailwind configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
└── tailwind.config.js  # Tailwind CSS configuration

```

## Page Editing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Styling

This project uses Tailwind CSS for styling with the following features:

- Utility-first approach for rapid development
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run build` - Build the application for production
- `npm run start` - Start the production server on port 4028
- `npm run serve` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript checks

## Deployment

Build the application for production:

```bash
npm run build
```

## Environment

Keep `.env` and `.env.local` private. Add the required Supabase/OpenAI values in your deployment provider instead of committing them to GitHub.

## Learn More

To learn more about Next.js, visit [Next.js Documentation](https://nextjs.org/docs).
