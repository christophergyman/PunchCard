# PunchCard Frontend

A modern React application for managing digital punch cards with interactive 3D visualizations. This frontend provides user authentication, punch card management, and real-time 3D card rendering using Three.js.

## Features

- **User Authentication**: Login and registration with JWT token-based authentication
- **Role-Based Access Control**: Admin and regular user roles with different permissions
- **3D Punch Card Visualization**: Interactive 3D punch cards rendered with Three.js
- **Punch Card Management**: Create, view, edit, and delete punch cards (admin only)
- **Progress Tracking**: Visual progress indicators and punch history
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite 7** - Build tool and dev server
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **React Spring** - Animation library for Three.js
- **Tailwind CSS 4** - Utility-first CSS framework
- **TanStack React Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **React Router DOM** - Client-side routing
- **Framer Motion** - Animation library

## Project Structure

```
src/
├── api/                    # API client and endpoint functions
│   ├── client.ts           # Axios instance with interceptors
│   ├── auth.ts             # Authentication endpoints
│   ├── cards.ts            # Punch card CRUD endpoints
│   ├── punches.ts          # Punch endpoints
│   └── users.ts            # User management endpoints
├── components/
│   ├── auth/               # Authentication components
│   │   └── ProtectedRoute.tsx
│   ├── cards/              # Card-related components
│   │   ├── CardForm.tsx
│   │   └── CardPreview.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── LoadingSpinner.tsx
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hooks
│   ├── useCards.ts         # Card data fetching/mutation hooks
│   ├── usePunchAnimation.ts
│   └── useUsers.ts         # User management hooks
├── pages/                  # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── CardView.tsx
│   └── CardEditor.tsx
├── stores/                 # Zustand state stores
│   ├── authStore.ts        # Authentication state
│   └── cardStore.ts        # Card-related state
├── three/                  # Three.js components
│   ├── Scene.tsx           # 3D scene wrapper
│   ├── PunchCard3D.tsx     # 3D punch card component
│   └── PunchHole.tsx       # Individual punch hole component
├── types/                  # TypeScript type definitions
│   ├── index.ts
│   ├── card.ts             # Card and punch types
│   └── user.ts             # User types
├── utils/                  # Utility functions
│   └── cardGeometry.ts     # Card geometry calculations
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
└── index.css               # Global styles
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production (includes TypeScript compilation)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file (optional):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for API requests | `/api` |
| `VITE_APP_NAME` | Application name | `PunchCard` |

## API Proxy Configuration

The Vite development server is configured to proxy API requests to the backend:

- All requests to `/api/*` are proxied to `http://localhost:8080`
- This avoids CORS issues during development

## Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | User login page | Public |
| `/register` | User registration page | Public |
| `/dashboard` | Main dashboard with card list | Protected |
| `/cards/new` | Create new punch card | Protected (Admin) |
| `/cards/:id` | View punch card details with 3D visualization | Protected |
| `/cards/:id/edit` | Edit punch card | Protected (Admin) |

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory. This includes:
- Compiled TypeScript
- Bundled and minified JavaScript
- Optimized CSS
- Static assets

## Key Features Explained

### 3D Punch Card Rendering

The application uses React Three Fiber to render interactive 3D punch cards. Features include:
- Customizable card colors and styles
- Multiple punch hole shapes (Circle, Star, Heart, Custom)
- Interactive rotation and zoom
- Click-to-punch functionality for admins

### State Management

- **Zustand**: Manages client-side state (authentication, UI state)
- **React Query**: Handles server state, caching, and synchronization

### Authentication

- JWT tokens stored in Zustand with persistence
- Automatic token injection via Axios interceptors
- Automatic logout on 401 responses
- Protected routes with role-based access
