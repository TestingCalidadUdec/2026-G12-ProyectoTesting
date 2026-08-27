# Workout Tracker - Frontend

A modern React-based frontend application for tracking workouts, managing exercises, and monitoring fitness progress. Built with React 19, TypeScript, and Tailwind CSS 4.x.

## 🏗️ Architecture

This is a Single Page Application (SPA) built with React and TypeScript that provides a complete workout tracking experience with role-based access control.

### Key Features

- **User Authentication & Authorization**: JWT-based auth with role-based access (admin/user)
- **Workout Tracking**: Start workouts, track sets/reps/weights, and monitor progress
- **Exercise Management**: Browse exercise library with muscle groups and equipment filtering
- **Workout Templates**: Create and use reusable workout plans
- **Admin Dashboard**: User and exercise management for administrators

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000` (see backend README)

### Configuration Files
- `.env.example` - Template for environment variables
- `.env.local` - Local overrides (gitignored, create from .env.example)

### Environment Variables
```bash
# Required
VITE_API_BASE_URL=http://localhost:8000/api  # Backend API URL
VITE_APP_TITLE="Workout Tracker"            # Application title
VITE_APP_VERSION="0.1.0"                    # Application version

# Optional
VITE_DEBUG_MODE=true                         # Enable debug logging
```

### Setup Instructions
1. Copy `.env.example` to `.env.local` for local development
2. Update `VITE_API_BASE_URL` to match your backend URL
3. Modify other variables as needed for your environment

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access the application at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin dashboard components
│   │   ├── AdminDashboard.tsx
│   │   ├── ExerciseManagement.tsx
│   │   ├── ExerciseModal.tsx
│   │   ├── UserModal.tsx
│   │   └── WorkoutTemplateManagement.tsx
│   ├── auth/            # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── profile/         # User profile components
│   │   └── ProfileForm.tsx
│   ├── ui/              # Layout and shared UI
│   │   └── Layout.tsx
│   └── workout/         # Workout tracking components
│       ├── ExerciseSelector.tsx
│       ├── SetTracker.tsx
│       ├── StartWorkoutModal.tsx
│       └── WorkoutExerciseCard.tsx
├── config/              # Configuration management
│   └── index.ts         # Centralized app configuration
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   └── ActiveWorkoutContext.tsx
├── pages/               # Route-level page components
│   ├── AdminPage.tsx
│   ├── DashboardPage.tsx
│   ├── HistoryPage.tsx
│   ├── LoginPage.tsx
│   ├── ProfilePage.tsx
│   ├── RegisterPage.tsx
│   ├── WorkoutPage.tsx
│   └── WorkoutsPage.tsx
├── services/            # API communication layer
│   ├── api.ts           # Axios configuration
│   ├── adminService.ts
│   ├── authService.ts
│   ├── exerciseService.ts
│   └── workoutService.ts
├── types/               # TypeScript type definitions
│   ├── auth.ts
│   ├── exercise.ts
│   └── workout.ts
├── hooks/               # Custom React hooks (ready for expansion)
└── App.tsx              # Main application component
```

## 🛠️ Technology Stack

### Core Dependencies
- **React 19.1.1**: Modern React with latest features
- **React Router DOM 7.8.0**: Client-side routing with data loading
- **TypeScript 5.8.3**: Type safety and developer experience
- **Tailwind CSS 4.1.12**: Utility-first CSS framework with Vite integration
- **Axios 1.11.0**: HTTP client with interceptors for authentication

### Development Tools
- **Vite 7.1.2**: Fast build tool and development server
- **ESLint 9.33.0**: Code linting with TypeScript and React rules
- **@vitejs/plugin-react 5.0.0**: React support for Vite
- **@tailwindcss/vite 4.1.12**: Tailwind CSS integration for Vite

## 🏛️ Architecture Patterns

### State Management
- **React Context**: Global state for authentication and active workout
- **Local State**: Component-level state with React hooks
- **Service Layer**: Centralized API communication with error handling

### Authentication Flow
1. JWT tokens stored in localStorage with 8-day expiration
2. Axios interceptors automatically attach tokens to requests
3. Protected routes check authentication status before rendering
4. Role-based access control for admin features

### Component Architecture
- **Page Components**: Top-level route handlers that compose features
- **Feature Components**: Domain-specific UI components (auth, workout, admin)
- **Shared Components**: Reusable UI components and layout
- **Service Integration**: API calls abstracted into service layer

## 🔐 Authentication & Security

### JWT Token Management
- Automatic token attachment via Axios interceptors
- Token validation on protected routes
- Automatic logout on token expiration (401 responses)
- Secure storage in localStorage with cleanup on logout

### Role-Based Access Control
- **User Role**: Access to workout tracking, profile, and history
- **Admin Role**: Additional access to user management and exercise administration
- Protected routes enforce role requirements at the router level

## 📊 Key Features Breakdown

### Workout Tracking
- **Active Workout Context**: Global state for ongoing workout sessions
- **Set Tracking**: Record reps, weight, duration, and rest periods
- **Exercise Selection**: Browse and filter exercise library
- **Template Support**: Start workouts from predefined templates

### User Management (Admin)
- **User CRUD**: Create, read, update, and deactivate users
- **Role Assignment**: Manage user roles and permissions
- **Filtering & Search**: Find users by status, role, or search terms

### Exercise Management (Admin)
- **Exercise CRUD**: Manage exercise library with detailed information
- **Categorization**: Muscle groups, equipment, and exercise types
- **Template Integration**: Link exercises to workout templates


For backend setup and API documentation, see the main project README and backend documentation.