# Funch Car Rental Frontend

Frontend for the Funch car rental platform, built with React, TypeScript, and Vite.

The app covers:
- public car browsing and booking flow
- checkout and deposit handoff
- customer booking management
- admin booking and dashboard views

## Links

- Frontend (Vercel): https://funch-car-rental-frontend.vercel.app
- Backend repository: https://github.com/Gunyaluck/funch-car-rental-backend.git

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Supabase Storage

## Prerequisites

- Node.js 18+ recommended
- npm
- running backend API

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_STORAGE_BUCKET=car-images
```

Notes:
- `VITE_API_BASE_URL` should point to the backend server.
- `VITE_SUPABASE_*` values are used for image storage and retrieval.

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Default Vite local URL:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
```

Starts the local development server.

```bash
npm run build
```

Builds the production bundle.

```bash
npm run preview
```

Serves the production build locally for preview.

```bash
npm run lint
```

Runs ESLint.

## Project Structure

```text
src/
  app/              app bootstrap and routing
  components/       shared UI building blocks
  features/         feature-based modules
  layouts/          public and admin layouts
  pages/            route-level pages
  lib/              shared utilities
```

## Backend Integration

This frontend expects the backend to provide:
- authentication
- car listing and detail APIs
- booking and checkout APIs
- admin booking and reporting APIs

If you run the backend locally, update `VITE_API_BASE_URL` to match its port and host.

## Deployment

This frontend is deployed on Vercel:

- https://funch-car-rental-frontend.vercel.app

For a new deployment, make sure the same environment variables are configured in Vercel.

## Build Status

The project builds successfully with:

```bash
npm run build
```
