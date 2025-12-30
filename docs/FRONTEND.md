# Frontend Documentation

Complete documentation for the PunchCard React/Three.js frontend application.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Production Build](#production-build)
- [Routing Structure](#routing-structure)
- [Authentication Flow](#authentication-flow)
  - [Token Storage](#token-storage)
  - [Axios Interceptor](#axios-interceptor)
  - [401 Handling](#401-handling)
  - [ProtectedRoute Component](#protectedroute-component)
- [Role-Based Access Control](#role-based-access-control)
- [State Management](#state-management)
  - [Zustand for Auth State](#zustand-for-auth-state)
  - [Zustand for Card State](#zustand-for-card-state)
  - [TanStack Query for Server State](#tanstack-query-for-server-state)
- [API Integration](#api-integration)
  - [Axios Client](#axios-client)
  - [Service Files](#service-files)
- [Components](#components)
  - [Layout Components](#layout-components)
  - [UI Components](#ui-components)
  - [Card Components](#card-components)
- [3D Visualization](#3d-visualization)
  - [Scene Setup](#scene-setup)
  - [PunchCard3D Component](#punchcard3d-component)
  - [PunchHole with Animations](#punchhole-with-animations)
  - [Card Geometry Utilities](#card-geometry-utilities)
  - [OrbitControls](#orbitcontrols)
- [Environment Variables](#environment-variables)
- [Related Documentation](#related-documentation)

---

## Overview

The PunchCard frontend is a modern React 19 application built with TypeScript and Vite. It features an interactive 3D punch card visualization using Three.js and React Three Fiber, allowing users to view their digital punch cards and administrators to create, manage, and punch cards in a visually engaging way.

**Key Features:**

- Interactive 3D punch card rendering with Three.js
- JWT-based authentication with persistent sessions
- Role-based access control (Admin/User roles)
- Optimistic updates for responsive user interactions
- Modern React patterns with hooks and functional components
- Type-safe development with TypeScript

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.9.3 | Type-safe JavaScript |
| Vite | 7.2.4 | Build tool and dev server |
| Three.js | 0.182.0 | 3D graphics library |
| React Three Fiber | 9.4.2 | React renderer for Three.js |
| React Three Drei | 10.7.7 | Useful helpers for R3F |
| React Spring | 10.0.3 | Animation library for Three.js |
| Zustand | 5.0.9 | Lightweight state management |
| TanStack Query | 5.90.14 | Server state management |
| Tailwind CSS | 4.1.18 | Utility-first CSS framework |
| Axios | 1.13.2 | HTTP client |
| React Router | 7.11.0 | Client-side routing |
| Framer Motion | 12.23.26 | Animation library |

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API service layer
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.ts             # Authentication API calls
│   │   ├── cards.ts            # Punch card CRUD operations
│   │   ├── punches.ts          # Punch operations
│   │   └── users.ts            # User management API calls
│   ├── components/             # Reusable UI components
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── cards/
│   │   │   ├── CardForm.tsx    # Card creation/edit form
│   │   │   └── CardPreview.tsx # Card preview card component
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Navigation header
│   │   │   └── Layout.tsx      # Page layout wrapper
│   │   └── ui/
│   │       ├── Button.tsx      # Reusable button component
│   │       ├── Input.tsx       # Reusable input component
│   │       └── LoadingSpinner.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hooks
│   │   ├── useCards.ts         # Card operations hooks
│   │   ├── usePunchAnimation.ts # Punch animation hook
│   │   └── useUsers.ts         # User management hooks
│   ├── pages/                  # Route components
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── CardView.tsx        # Single card view with 3D
│   │   └── CardEditor.tsx      # Card create/edit page
│   ├── stores/                 # Zustand state stores
│   │   ├── authStore.ts        # Authentication state
│   │   └── cardStore.ts        # Card UI state
│   ├── three/                  # Three.js/R3F components
│   │   ├── Scene.tsx           # Canvas and scene setup
│   │   ├── PunchCard3D.tsx     # 3D punch card component
│   │   └── PunchHole.tsx       # Interactive punch hole
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Type re-exports
│   │   ├── user.ts             # User-related types
│   │   └── card.ts             # Card-related types
│   ├── utils/                  # Utility functions
│   │   └── cardGeometry.ts     # 3D geometry calculations
│   ├── App.tsx                 # Application root with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles with Tailwind
├── public/                     # Static assets
├── .env                        # Environment variables
├── .env.example                # Environment variables template
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App-specific TS config
├── tsconfig.node.json          # Node-specific TS config
├── vite.config.ts              # Vite configuration
└── eslint.config.js            # ESLint configuration
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime (recommended) or Node.js 20+
- Backend API server running (see [API.md](API.md))

### Installation

Install dependencies using Bun:

```bash
cd frontend
bun install
```

### Development

Start the development server on port 5173:

```bash
bun dev
```

The application will be available at `http://localhost:5173`. The development server includes a proxy configuration that forwards `/api` requests to `http://localhost:8080`.

### Production Build

Build for production:

```bash
bun build
```

This runs TypeScript compilation (`tsc -b`) followed by Vite's production build. Output is placed in the `dist/` directory.

Preview the production build:

```bash
bun preview
```

### Linting

Run ESLint to check code quality:

```bash
bun lint
```

---

## Routing Structure

The application uses React Router v7 for client-side routing with the following structure:

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | - | Public | Redirects to `/dashboard` |
| `/login` | `Login` | Public | User login page |
| `/register` | `Register` | Public | User registration page |
| `/dashboard` | `Dashboard` | Protected | Main dashboard showing user's cards |
| `/cards/new` | `CardEditor` | Protected (Admin) | Create new punch card |
| `/cards/:id` | `CardView` | Protected | View card with 3D visualization |
| `/cards/:id/edit` | `CardEditor` | Protected (Admin) | Edit existing card |
| `*` | - | Public | Catch-all redirects to `/dashboard` |

**Route Configuration (App.tsx):**

```typescript
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/cards/new"
    element={
      <ProtectedRoute>
        <CardEditor />
      </ProtectedRoute>
    }
  />
  <Route
    path="/cards/:id"
    element={
      <ProtectedRoute>
        <CardView />
      </ProtectedRoute>
    }
  />
  <Route
    path="/cards/:id/edit"
    element={
      <ProtectedRoute>
        <CardEditor />
      </ProtectedRoute>
    }
  />

  {/* Redirect root to dashboard */}
  <Route path="/" element={<Navigate to="/dashboard" replace />} />

  {/* Catch all */}
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>
```

---

## Authentication Flow

The frontend implements JWT-based authentication with automatic token management.

### Token Storage

Authentication state is managed by Zustand with localStorage persistence:

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        }),
      setUser: (user) =>
        set({
          user,
          isAdmin: user.role === 'ADMIN',
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
```

### Axios Interceptor

The axios client automatically attaches the Bearer token to all requests:

```typescript
// api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 401 Handling

Unauthorized responses automatically trigger logout:

```typescript
// api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

### ProtectedRoute Component

Routes requiring authentication use the `ProtectedRoute` wrapper:

```typescript
// components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

**Usage in App.tsx:**

```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## Role-Based Access Control

The application implements role-based access control with two roles: `USER` and `ADMIN`.

### Role Types

```typescript
// types/user.ts
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
```

### Admin-Only Features

The following features are restricted to admin users:

| Feature | Location | Implementation |
|---------|----------|----------------|
| Create new cards | Dashboard, CardEditor | Conditional rendering + redirect |
| Edit cards | CardView, CardEditor | Conditional rendering + redirect |
| Delete cards | CardView | Conditional rendering |
| Punch cards | CardView | Conditional rendering |
| View user list | CardEditor | Admin-only API call |
| Assign cards to users | CardEditor | Admin-only form field |

### Implementation Example

```typescript
// pages/Dashboard.tsx
const isAdmin = useAuthStore((state) => state.isAdmin);

return (
  <Layout>
    {/* ... */}
    {isAdmin && (
      <Link to="/cards/new">
        <Button>+ New Card</Button>
      </Link>
    )}
  </Layout>
);

// pages/CardEditor.tsx
useEffect(() => {
  if (!isAdmin) {
    navigate('/dashboard');
  }
}, [isAdmin, navigate]);
```

---

## State Management

### Zustand for Auth State

Zustand manages client-side authentication state with localStorage persistence. The store provides:

- `token` - JWT token string
- `user` - Current user object
- `isAuthenticated` - Boolean authentication status
- `isAdmin` - Boolean admin status (derived from user role)
- `login()` - Set authenticated state
- `logout()` - Clear authentication
- `setUser()` - Update user data

### Zustand for Card State

A lightweight store for card-related UI state:

```typescript
// stores/cardStore.ts
interface CardState {
  selectedCardId: string | null;
  isEditing: boolean;
  setSelectedCard: (id: string | null) => void;
  setIsEditing: (editing: boolean) => void;
}

export const useCardStore = create<CardState>((set) => ({
  selectedCardId: null,
  isEditing: false,
  setSelectedCard: (id) => set({ selectedCardId: id }),
  setIsEditing: (editing) => set({ isEditing: editing }),
}));
```

### TanStack Query for Server State

Server state (cards, punches, users) is managed with TanStack Query, providing:

- Automatic caching with 5-minute stale time
- Background refetching
- Optimistic updates for mutations
- Query invalidation on mutations
- Retry logic (1 retry on failure)

**Query Client Configuration:**

```typescript
// App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
```

**Available Hooks:**

| Hook | Purpose |
|------|---------|
| `useCards(page, size)` | Fetch paginated cards list |
| `useCard(id)` | Fetch single card by ID |
| `useCreateCard()` | Create new card mutation |
| `useUpdateCard()` | Update card mutation |
| `useDeleteCard()` | Delete card mutation |
| `usePunchCard()` | Add punch with optimistic update |
| `useUsers(page, size)` | Fetch paginated users list |
| `useUser(id)` | Fetch single user by ID |
| `usePromoteUser()` | Promote user to admin |
| `useLogin()` | Login mutation |
| `useRegister()` | Registration mutation |
| `useCurrentUser()` | Fetch current user |
| `useLogout()` | Logout function |

**Example with Optimistic Updates:**

```typescript
// hooks/useCards.ts
export function usePunchCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, position }: { cardId: string; position: number }) =>
      addPunch(cardId, { position }),

    // Optimistic update for snappy feel
    onMutate: async ({ cardId }) => {
      await queryClient.cancelQueries({ queryKey: ['cards', cardId] });
      const previous = queryClient.getQueryData<PunchCard>(['cards', cardId]);

      if (previous) {
        queryClient.setQueryData<PunchCard>(['cards', cardId], {
          ...previous,
          currentPunches: previous.currentPunches + 1,
        });
      }

      return { previous };
    },

    onError: (_, { cardId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['cards', cardId], context.previous);
      }
    },

    onSettled: (_, __, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
    },
  });
}
```

---

## API Integration

### Axios Client

The centralized axios client at `api/client.ts`:

```typescript
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor adds auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handles 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

### Service Files

**Authentication (`api/auth.ts`):**

```typescript
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<User> => {
  const response = await apiClient.post<User>('/auth/register', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};
```

**Cards (`api/cards.ts`):**

```typescript
export const getCards = async (page = 0, size = 20): Promise<Page<PunchCard>> => {
  const response = await apiClient.get<Page<PunchCard>>('/cards', {
    params: { page, size },
  });
  return response.data;
};

export const getCard = async (id: string): Promise<PunchCard> => {
  const response = await apiClient.get<PunchCard>(`/cards/${id}`);
  return response.data;
};

export const createCard = async (data: CreatePunchCardRequest): Promise<PunchCard> => {
  const response = await apiClient.post<PunchCard>('/cards', data);
  return response.data;
};

export const updateCard = async (id: string, data: UpdatePunchCardRequest): Promise<PunchCard> => {
  const response = await apiClient.put<PunchCard>(`/cards/${id}`, data);
  return response.data;
};

export const deleteCard = async (id: string): Promise<void> => {
  await apiClient.delete(`/cards/${id}`);
};
```

**Punches (`api/punches.ts`):**

```typescript
export const addPunch = async (cardId: string, data: CreatePunchRequest): Promise<Punch> => {
  const response = await apiClient.post<Punch>(`/cards/${cardId}/punches`, data);
  return response.data;
};

export const getPunches = async (cardId: string): Promise<Punch[]> => {
  const response = await apiClient.get<Punch[]>(`/cards/${cardId}/punches`);
  return response.data;
};
```

**Users (`api/users.ts`):**

```typescript
export const getUsers = async (page = 0, size = 100): Promise<Page<User>> => {
  const response = await apiClient.get<Page<User>>('/users', {
    params: { page, size },
  });
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const promoteUser = async (userId: string): Promise<User> => {
  const response = await apiClient.post<User>(`/users/${userId}/promote`);
  return response.data;
};
```

---

## Components

### Layout Components

**Layout (`components/layout/Layout.tsx`):**

A wrapper component providing consistent page structure with header and main content area.

```typescript
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

**Header (`components/layout/Header.tsx`):**

Navigation header with authentication-aware UI showing:
- Logo and brand name
- Navigation links (Dashboard)
- User display name
- Login/Register or Logout buttons

### UI Components

**Button (`components/ui/Button.tsx`):**

Reusable button with variants and loading state:
- Variants: `primary`, `secondary`, `danger`
- Sizes: `sm`, `md`, `lg`
- Loading state with spinner

**Input (`components/ui/Input.tsx`):**

Form input with label and error display support.

**LoadingSpinner (`components/ui/LoadingSpinner.tsx`):**

SVG-based loading spinner with configurable sizes (`sm`, `md`, `lg`).

### Card Components

**CardForm (`components/cards/CardForm.tsx`):**

Form for creating and editing punch cards with:
- User selection dropdown (admin only, for assigning cards)
- Title and description inputs
- Reward input
- Total punches slider (1-20)
- Color picker with preset colors
- Punch shape selector (Circle, Star, Heart)

**CardPreview (`components/cards/CardPreview.tsx`):**

Card list item showing:
- Card title and reward
- Progress bar
- Current/total punches
- Completion status badge

---

## 3D Visualization

The frontend uses React Three Fiber to render interactive 3D punch cards.

### Scene Setup

The `Scene` component wraps all 3D content with lighting, camera, and controls:

```typescript
// three/Scene.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

export function Scene({ children }: { children: ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Card and other 3D content */}
      {children}

      {/* Shadows */}
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />

      {/* User controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
```

### PunchCard3D Component

The main 3D punch card rendering component:

```typescript
// three/PunchCard3D.tsx
import { RoundedBox, Text } from '@react-three/drei';
import { PunchHole } from './PunchHole';
import { generatePunchGrid, CARD_DIMENSIONS, hexToThreeColor } from '../utils/cardGeometry';

interface PunchCard3DProps {
  card: PunchCard;
  onPunch?: (position: number) => void;
  disabled?: boolean;
}

export function PunchCard3D({ card, onPunch, disabled }: PunchCard3DProps) {
  const punchPositions = generatePunchGrid(card.totalSlots);
  const punchedPositions = new Set(card.punches.map((p) => p.position));
  const bgColor = hexToThreeColor(card.cardStyle.backgroundColor);

  return (
    <group>
      {/* Card base */}
      <RoundedBox
        args={[CARD_DIMENSIONS.width, CARD_DIMENSIONS.height, CARD_DIMENSIONS.depth]}
        radius={CARD_DIMENSIONS.cornerRadius}
        smoothness={4}
      >
        <meshStandardMaterial
          color={bgColor}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Title text */}
      <Text
        position={[0, 0.75, CARD_DIMENSIONS.depth / 2 + 0.01]}
        fontSize={0.18}
        color={card.cardStyle.textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={CARD_DIMENSIONS.width - 0.4}
      >
        {card.title}
      </Text>

      {/* Reward text */}
      <Text
        position={[0, -0.8, CARD_DIMENSIONS.depth / 2 + 0.01]}
        fontSize={0.1}
        color={card.cardStyle.textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={CARD_DIMENSIONS.width - 0.4}
      >
        {card.reward}
      </Text>

      {/* Progress indicator */}
      <Text
        position={[CARD_DIMENSIONS.width / 2 - 0.3, 0.75, CARD_DIMENSIONS.depth / 2 + 0.01]}
        fontSize={0.12}
        color={card.cardStyle.textColor}
        anchorX="right"
        anchorY="middle"
      >
        {card.currentPunches}/{card.totalSlots}
      </Text>

      {/* Punch holes */}
      {punchPositions.map((pos, i) => {
        const slotNumber = i + 1;
        const isPunched = punchedPositions.has(slotNumber);

        return (
          <PunchHole
            key={i}
            position={[pos.x, pos.y, pos.z]}
            isPunched={isPunched}
            shape={card.cardStyle.punchShape}
            onClick={() => onPunch?.(slotNumber)}
            disabled={disabled || isPunched}
          />
        );
      })}
    </group>
  );
}
```

### PunchHole with Animations

Interactive punch holes with spring animations:

```typescript
// three/PunchHole.tsx
import { useState } from 'react';
import { animated } from '@react-spring/three';
import type { ThreeEvent } from '@react-three/fiber';
import type { PunchShape } from '../types';
import { usePunchAnimation } from '../hooks/usePunchAnimation';

interface PunchHoleProps {
  position: [number, number, number];
  isPunched: boolean;
  shape: PunchShape;
  onClick?: () => void;
  disabled?: boolean;
}

export function PunchHole({ position, isPunched, shape, onClick, disabled }: PunchHoleProps) {
  const [hovered, setHovered] = useState(false);
  const { scale, positionZ } = usePunchAnimation(isPunched);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isPunched && !disabled && onClick) {
      onClick();
    }
  };

  const getGeometry = () => {
    switch (shape) {
      case 'STAR':
        return <circleGeometry args={[0.12, 5]} />;
      case 'HEART':
        return <circleGeometry args={[0.12, 32]} />;
      case 'CUSTOM':
      case 'CIRCLE':
      default:
        return <circleGeometry args={[0.12, 32]} />;
    }
  };

  const baseColor = isPunched ? '#1a1a1a' : hovered && !disabled ? '#4ade80' : '#d1d5db';
  const emissive = hovered && !isPunched && !disabled ? '#22c55e' : '#000000';

  return (
    <animated.mesh
      position-x={position[0]}
      position-y={position[1]}
      position-z={positionZ.to((z) => position[2] + z)}
      scale={scale}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}
      <meshStandardMaterial
        color={baseColor}
        emissive={emissive}
        emissiveIntensity={0.3}
        roughness={0.5}
        metalness={0.1}
      />
    </animated.mesh>
  );
}
```

**Animation Hook:**

```typescript
// hooks/usePunchAnimation.ts
import { useSpring, config } from '@react-spring/three';

export function usePunchAnimation(isPunched: boolean) {
  const { scale, positionZ } = useSpring({
    scale: isPunched ? 0 : 1,
    positionZ: isPunched ? -0.02 : 0,
    config: { ...config.wobbly, tension: 300, friction: 20 },
  });

  return { scale, positionZ };
}
```

### Card Geometry Utilities

The `utils/cardGeometry.ts` file provides utilities for 3D card rendering:

```typescript
// utils/cardGeometry.ts
import * as THREE from 'three';

export const CARD_DIMENSIONS = {
  width: 3.5,
  height: 2,
  depth: 0.05,
  cornerRadius: 0.1,
  punchRadius: 0.12,
};

export function generatePunchGrid(totalSlots: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];

  // Calculate grid dimensions (max 5 columns)
  const cols = Math.min(5, totalSlots);
  const rows = Math.ceil(totalSlots / cols);

  // Calculate spacing
  const horizontalSpacing = (CARD_DIMENSIONS.width - 0.8) / (cols + 1);
  const verticalSpacing = (CARD_DIMENSIONS.height - 0.6) / (rows + 1);

  // Starting positions (centered)
  const startX = -CARD_DIMENSIONS.width / 2 + 0.4 + horizontalSpacing;
  const startY = CARD_DIMENSIONS.height / 2 - 0.5 - verticalSpacing;

  for (let i = 0; i < totalSlots; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = startX + col * horizontalSpacing;
    const y = startY - row * verticalSpacing;
    const z = CARD_DIMENSIONS.depth / 2 + 0.001;

    positions.push(new THREE.Vector3(x, y, z));
  }

  return positions;
}

export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}
```

### OrbitControls

Users can interact with the 3D card using OrbitControls:

- **Rotate:** Click and drag to rotate the card
- **Zoom:** Scroll to zoom in/out (limited to 3-10 units)
- **Pan:** Disabled for focused card viewing
- **Polar angle:** Limited to prevent flipping the card upside down

---

## Type Definitions

### User Types (`types/user.ts`)

```typescript
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}
```

### Card Types (`types/card.ts`)

```typescript
export type PunchShape = 'CIRCLE' | 'STAR' | 'HEART' | 'CUSTOM';

export interface CardStyle {
  backgroundColor: string;
  textColor: string;
  texture?: string;
  punchShape: PunchShape;
}

export interface Punch {
  id: string;
  cardId: string;
  punchedBy: string;
  position: number;
  punchedAt: string;
}

export interface PunchCard {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  totalSlots: number;
  currentPunches: number;
  reward: string;
  cardStyle: CardStyle;
  punches: Punch[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePunchCardRequest {
  title: string;
  description?: string;
  totalSlots: number;
  reward: string;
  cardStyle?: Partial<CardStyle>;
  ownerId?: string;
}

export interface UpdatePunchCardRequest {
  title?: string;
  description?: string;
  reward?: string;
  cardStyle?: Partial<CardStyle>;
}

export interface CreatePunchRequest {
  position: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
```

---

## Environment Variables

Configure the frontend using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend API base URL |

**Example `.env` file:**

```env
VITE_API_URL=http://localhost:8080/api
```

**Usage in code:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

**Development Proxy:**

The Vite development server is configured with a proxy to forward API requests:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

This means in development, the default `/api` path will automatically proxy to `http://localhost:8080`. You typically don't need to set `VITE_API_URL` during development.

---

## Related Documentation

- [API.md](API.md) - Complete API reference
- [AUTHENTICATION.md](AUTHENTICATION.md) - Authentication guide
- [TESTING.md](TESTING.md) - Testing documentation
- [README.md](../README.md) - Project overview and setup
