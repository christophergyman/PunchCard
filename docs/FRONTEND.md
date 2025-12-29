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
- [Authentication Flow](#authentication-flow)
  - [Token Storage](#token-storage)
  - [Axios Interceptor](#axios-interceptor)
  - [401 Handling](#401-handling)
  - [ProtectedRoute Component](#protectedroute-component)
- [State Management](#state-management)
  - [Zustand for Auth State](#zustand-for-auth-state)
  - [TanStack Query for Server State](#tanstack-query-for-server-state)
- [API Integration](#api-integration)
  - [Axios Client](#axios-client)
  - [Service Files](#service-files)
- [3D Visualization](#3d-visualization)
  - [Scene Setup](#scene-setup)
  - [PunchCard3D Component](#punchcard3d-component)
  - [PunchHole with Animations](#punchhole-with-animations)
  - [OrbitControls](#orbitcontrols)
- [Environment Variables](#environment-variables)
- [Related Documentation](#related-documentation)

---

## Overview

The PunchCard frontend is a modern React 19 application built with TypeScript and Vite. It features an interactive 3D punch card visualization using Three.js and React Three Fiber, allowing users to create, manage, and interact with digital punch cards in a visually engaging way.

**Key Features:**

- Interactive 3D punch card rendering with Three.js
- JWT-based authentication with persistent sessions
- Optimistic updates for responsive user interactions
- Modern React patterns with hooks and functional components
- Type-safe development with TypeScript

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type-safe JavaScript |
| Vite | 7.2 | Build tool and dev server |
| Three.js | 0.182 | 3D graphics library |
| React Three Fiber | 9.4 | React renderer for Three.js |
| React Three Drei | 10.7 | Useful helpers for R3F |
| React Spring | 10.0 | Animation library for Three.js |
| Zustand | 5.0 | Lightweight state management |
| TanStack Query | 5.90 | Server state management |
| Tailwind CSS | 4.1 | Utility-first CSS framework |
| Axios | 1.13 | HTTP client |
| React Router | 7.11 | Client-side routing |
| Framer Motion | 12.23 | Animation library |

---

## Project Structure

```
frontend/src/
├── api/                    # API service layer
│   ├── client.ts           # Axios instance with interceptors
│   ├── auth.ts             # Authentication API calls
│   ├── cards.ts            # Punch card CRUD operations
│   └── punches.ts          # Punch operations
├── components/             # Reusable UI components
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── cards/
│   │   ├── CardForm.tsx
│   │   └── CardPreview.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── LoadingSpinner.tsx
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useCards.ts         # Card operations hooks
│   └── usePunchAnimation.ts # Punch animation hook
├── pages/                  # Route components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── CardView.tsx
│   └── CardEditor.tsx
├── stores/                 # Zustand state stores
│   ├── authStore.ts        # Authentication state
│   └── cardStore.ts        # Card-related state
├── three/                  # Three.js/R3F components
│   ├── Scene.tsx           # Canvas and scene setup
│   ├── PunchCard3D.tsx     # 3D punch card component
│   └── PunchHole.tsx       # Interactive punch hole
├── types/                  # TypeScript type definitions
│   ├── index.ts            # Type re-exports
│   ├── user.ts             # User-related types
│   └── card.ts             # Card-related types
├── utils/                  # Utility functions
│   └── cardGeometry.ts     # 3D geometry calculations
├── App.tsx                 # Application root
├── main.tsx                # Entry point
└── index.css               # Global styles
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

The application will be available at `http://localhost:5173`.

### Production Build

Build for production:

```bash
bun build
```

This runs TypeScript compilation followed by Vite's production build. Output is placed in the `dist/` directory.

Preview the production build:

```bash
bun preview
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
      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
      setUser: (user) =>
        set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
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

## State Management

### Zustand for Auth State

Zustand manages client-side authentication state with localStorage persistence. The store provides:

- `token` - JWT token string
- `user` - Current user object
- `isAuthenticated` - Boolean authentication status
- `login()` - Set authenticated state
- `logout()` - Clear authentication
- `setUser()` - Update user data

### TanStack Query for Server State

Server state (cards, punches) is managed with TanStack Query, providing:

- Automatic caching with 5-minute stale time
- Background refetching
- Optimistic updates for mutations
- Query invalidation on mutations

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

export function PunchCard3D({ card, onPunch, disabled }: PunchCard3DProps) {
  const punchPositions = generatePunchGrid(card.totalSlots);
  const punchedPositions = new Set(card.punches.map((p) => p.position));

  return (
    <group>
      {/* Card base */}
      <RoundedBox
        args={[CARD_DIMENSIONS.width, CARD_DIMENSIONS.height, CARD_DIMENSIONS.depth]}
        radius={CARD_DIMENSIONS.cornerRadius}
        smoothness={4}
      >
        <meshStandardMaterial
          color={card.cardStyle.backgroundColor}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Title and reward text */}
      <Text position={[0, 0.75, 0.01]} fontSize={0.18}>
        {card.title}
      </Text>

      {/* Punch holes */}
      {punchPositions.map((pos, i) => (
        <PunchHole
          key={i}
          position={[pos.x, pos.y, pos.z]}
          isPunched={punchedPositions.has(i + 1)}
          shape={card.cardStyle.punchShape}
          onClick={() => onPunch?.(i + 1)}
          disabled={disabled}
        />
      ))}
    </group>
  );
}
```

### PunchHole with Animations

Interactive punch holes with spring animations:

```typescript
// three/PunchHole.tsx
import { animated } from '@react-spring/three';
import { usePunchAnimation } from '../hooks/usePunchAnimation';

export function PunchHole({ position, isPunched, shape, onClick, disabled }: PunchHoleProps) {
  const [hovered, setHovered] = useState(false);
  const { scale, positionZ } = usePunchAnimation(isPunched);

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
      <circleGeometry args={[0.12, 32]} />
      <meshStandardMaterial
        color={isPunched ? '#1a1a1a' : hovered ? '#4ade80' : '#d1d5db'}
        emissive={hovered && !isPunched ? '#22c55e' : '#000000'}
        emissiveIntensity={0.3}
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

### OrbitControls

Users can interact with the 3D card using OrbitControls:

- **Rotate:** Click and drag to rotate the card
- **Zoom:** Scroll to zoom in/out (limited to 3-10 units)
- **Pan:** Disabled for focused card viewing
- **Polar angle:** Limited to prevent flipping the card upside down

---

## Environment Variables

Configure the frontend using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend API base URL |
| `VITE_APP_NAME` | - | Application display name |

**Example `.env` file:**

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=PunchCard
```

**Usage in code:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

**Note:** In production with a reverse proxy, the default `/api` will proxy requests to the backend. For local development with separate frontend/backend servers, set `VITE_API_URL` to the full backend URL.

---

## Related Documentation

- [API.md](API.md) - Complete API reference
- [AUTHENTICATION.md](AUTHENTICATION.md) - Authentication guide
- [TESTING.md](TESTING.md) - Testing documentation
- [README.md](../README.md) - Project overview and setup
