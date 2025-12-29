# Punchcard Frontend - Technical Specification

## Project Overview

**Punchcard** is a visual tracking application that digitizes the classic punch card loyalty system. Users can create, manage, and interact with virtual punch cards through an immersive 3D interface.

### Core Features
- 3D rendered punch cards that users can rotate and inspect
- Interactive "punching" animation when marking progress
- Dashboard for managing multiple cards
- Integration with existing Spring Boot backend for auth/users

---

## Tech Stack

### Core Framework
- **React 18+** with **TypeScript 5+**
- **Vite** - Fast build tool with excellent TypeScript support and HMR

### 3D Rendering
- **Three.js** - WebGL rendering engine
- **React Three Fiber (R3F)** - React renderer for Three.js
- **@react-three/drei** - Useful helpers (OrbitControls, Text, etc.)
- **@react-three/postprocessing** - Optional visual effects (bloom, depth of field)

### State Management
- **Zustand** - Lightweight state management (works seamlessly with R3F)
- **TanStack Query (React Query)** - Server state, caching, and API calls

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion** - UI animations outside the 3D canvas

### API & Networking
- **Axios** - HTTP client with interceptors for auth tokens
- **TanStack Query** - Handles caching, refetching, optimistic updates

### Development & Quality
- **ESLint** + **Prettier** - Code quality
- **Vitest** - Unit testing
- **React Testing Library** - Component testing

---

## Project Structure

```
punchcard-frontend/
├── public/
│   └── assets/
│       └── textures/          # Card textures, punch hole images
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance with auth interceptors
│   │   ├── auth.ts            # Login, logout, refresh token
│   │   ├── cards.ts           # CRUD for punch cards
│   │   └── punches.ts         # Punch operations
│   ├── components/
│   │   ├── ui/                # Reusable UI components (buttons, modals)
│   │   ├── layout/            # Header, Sidebar, etc.
│   │   └── cards/             # Card-related 2D components
│   ├── three/
│   │   ├── PunchCard3D.tsx    # Main 3D punch card component
│   │   ├── CardMaterial.tsx   # Custom shader/material for card
│   │   ├── PunchHole.tsx      # Individual punch hole mesh
│   │   ├── Scene.tsx          # Main R3F Canvas wrapper
│   │   └── controls/
│   │       └── CardControls.tsx  # Orbit/interaction controls
│   ├── hooks/
│   │   ├── useAuth.ts         # Auth state and methods
│   │   ├── useCards.ts        # TanStack Query hooks for cards
│   │   └── usePunchAnimation.ts  # Animation state for punching
│   ├── stores/
│   │   ├── authStore.ts       # Zustand auth store
│   │   └── cardStore.ts       # Current card selection, UI state
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx      # Card grid/list view
│   │   ├── CardView.tsx       # Single card 3D view
│   │   └── CardEditor.tsx     # Create/edit card settings
│   ├── types/
│   │   ├── card.ts            # Card, Punch interfaces
│   │   └── user.ts            # User interface
│   ├── utils/
│   │   └── cardGeometry.ts    # Helper functions for 3D math
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Data Models

### TypeScript Interfaces

```typescript
// types/card.ts

interface PunchCard {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  totalSlots: number;        // e.g., 10 punches for a free coffee
  currentPunches: number;
  reward: string;            // "Free loaf of bread"
  cardStyle: CardStyle;
  createdAt: string;
  updatedAt: string;
}

interface CardStyle {
  backgroundColor: string;   // Hex color
  textColor: string;
  texture?: string;          // Optional texture URL
  punchShape: 'circle' | 'star' | 'heart' | 'custom';
}

interface Punch {
  id: string;
  cardId: string;
  punchedAt: string;
  punchedBy: string;         // User ID who made the punch
  position: number;          // Slot number (1-10, etc.)
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'business' | 'admin';
}
```

---

## 3D Implementation Details

### Card Geometry

The punch card is rendered as a rounded rectangle with the following properties:

```typescript
// Approximate dimensions (in Three.js units)
const CARD_DIMENSIONS = {
  width: 3.5,
  height: 2,
  depth: 0.05,              // Slight thickness for 3D feel
  cornerRadius: 0.1,
  punchRadius: 0.12,        // Size of punch holes
};
```

### PunchCard3D Component Structure

```tsx
// three/PunchCard3D.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { PunchHole } from './PunchHole';

interface PunchCard3DProps {
  card: PunchCard;
  onPunch?: (position: number) => void;
}

export function PunchCard3D({ card, onPunch }: PunchCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate punch hole positions in a grid
  const punchPositions = generatePunchGrid(card.totalSlots);
  
  return (
    <group ref={groupRef}>
      {/* Card base */}
      <RoundedBox args={[3.5, 2, 0.05]} radius={0.1}>
        <meshStandardMaterial color={card.cardStyle.backgroundColor} />
      </RoundedBox>
      
      {/* Title text */}
      <Text position={[0, 0.7, 0.03]} fontSize={0.15}>
        {card.title}
      </Text>
      
      {/* Punch holes */}
      {punchPositions.map((pos, i) => (
        <PunchHole
          key={i}
          position={pos}
          isPunched={i < card.currentPunches}
          shape={card.cardStyle.punchShape}
          onClick={() => onPunch?.(i)}
        />
      ))}
    </group>
  );
}
```

### Interaction Controls

```tsx
// three/Scene.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

export function Scene({ children }: { children: React.ReactNode }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Card and other 3D content */}
      {children}
      
      {/* Shadows */}
      <ContactShadows position={[0, -1.2, 0]} opacity={0.4} />
      
      {/* User controls - spin/rotate */}
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

### Punch Animation

```typescript
// hooks/usePunchAnimation.ts
import { useSpring, animated } from '@react-spring/three';

export function usePunchAnimation(isPunched: boolean) {
  const { scale, depth } = useSpring({
    scale: isPunched ? 0 : 1,
    depth: isPunched ? -0.02 : 0,
    config: { tension: 300, friction: 20 },
  });
  
  return { scale, depth };
}
```

---

## API Integration

### Axios Client Setup

```typescript
// api/client.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
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

### TanStack Query Hooks

```typescript
// hooks/useCards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCards, getCard, createCard, punchCard } from '../api/cards';

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: getCards,
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: ['cards', id],
    queryFn: () => getCard(id),
  });
}

export function usePunchCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cardId, position }: { cardId: string; position: number }) =>
      punchCard(cardId, position),
    onSuccess: (_, { cardId }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
    },
    // Optimistic update for snappy feel
    onMutate: async ({ cardId }) => {
      await queryClient.cancelQueries({ queryKey: ['cards', cardId] });
      const previous = queryClient.getQueryData(['cards', cardId]);
      
      queryClient.setQueryData(['cards', cardId], (old: PunchCard) => ({
        ...old,
        currentPunches: old.currentPunches + 1,
      }));
      
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['cards', context?.previous?.id], context?.previous);
    },
  });
}
```

---

## Authentication Flow

The frontend expects the Spring Boot backend to provide:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Returns JWT token |
| `/api/auth/register` | POST | Creates user, returns token |
| `/api/auth/refresh` | POST | Refreshes expired token |
| `/api/auth/me` | GET | Returns current user |

### Auth Store

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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

## Getting Started Commands

```bash
# Create project with Bun
bun create vite punchcard-frontend --template react-ts
cd punchcard-frontend

# Install dependencies (Bun installs are ~10-25x faster than npm)
bun add three @react-three/fiber @react-three/drei @react-spring/three
bun add @tanstack/react-query axios zustand
bun add tailwindcss @tailwindcss/vite framer-motion
bun add -d @types/three

# Dev dependencies
bun add -d eslint prettier eslint-config-prettier vitest @testing-library/react

# Run dev server
bun run dev

# Build for production
bun run build
```

### Why Bun?

- **Faster installs**: Package installation is 10-25x faster than npm
- **Faster dev server**: Bun's runtime is faster than Node for Vite
- **Built-in test runner**: Can use `bun test` instead of Vitest if preferred
- **Drop-in replacement**: Uses the same `package.json`, no config changes needed
- **Lockfile**: Uses `bun.lockb` (binary) instead of `package-lock.json`

### Compatibility Notes

- Bun has full compatibility with the React/Three.js ecosystem
- If any package has issues (rare), you can always fall back to Node for that specific task
- Vite works identically under Bun — same `vite.config.ts`

---

## Environment Variables

```env
# .env.example
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Punchcard
```

---

## Key Implementation Notes for Claude Code

1. **Start with the 3D scene** - Get a basic rotating card rendering before adding punch logic

2. **Use Drei helpers liberally** - `RoundedBox`, `Text`, `Html` (for overlays), `OrbitControls`

3. **Punch holes can be done two ways:**
   - CSG (Constructive Solid Geometry) - Actually cut holes in geometry
   - Overlay approach - Place dark circles on the card surface (simpler, recommended)

4. **Performance considerations:**
   - Use `React.memo` on 3D components
   - Limit re-renders with Zustand selectors
   - Consider `instancedMesh` if showing many cards at once

5. **Mobile support:**
   - Touch controls work with OrbitControls out of the box
   - Test on mobile early - WebGL can be heavy

6. **The backend integration assumes REST** - If Spring Boot uses different patterns, adjust the API layer accordingly

---

## MVP Feature Checklist

- [ ] Login/logout with JWT
- [ ] View list of user's cards (2D dashboard)
- [ ] View single card in 3D with rotation
- [ ] Punch a card (with animation)
- [ ] Create new card with customization
- [ ] Responsive layout (desktop + mobile)

---

## Future Enhancements

- QR code scanning for quick punches
- Card sharing between users
- Sound effects on punch
- Card templates/themes
- Analytics dashboard for businesses
- PWA support for offline viewing
