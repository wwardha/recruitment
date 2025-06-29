# HR Recruitment System - Frontend

React frontend for the HR Recruitment System built with Vite, TypeScript, and Tailwind CSS.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Zustand** - State management
- **Zod** - Schema validation

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── App.tsx        # Main app component
├── public/            # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Features

- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Type Safety** - Full TypeScript coverage
- **Real-time Updates** - TanStack Query for data synchronization
- **Form Validation** - Zod schemas with React Hook Form
- **Error Handling** - Comprehensive error boundaries
- **Accessibility** - ARIA labels and keyboard navigation

## Development

The frontend connects to the backend API running on `http://localhost:3000` by default. Make sure the backend server is running before starting the frontend development server.

### Environment Variables

Create a `.env.local` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=HR Recruitment System
```