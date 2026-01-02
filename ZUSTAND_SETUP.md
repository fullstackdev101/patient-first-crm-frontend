# Zustand State Management Setup

## Overview
Zustand is now configured for global state management in the PatientFirst CRM frontend, providing a clean and efficient way to manage authentication, leads, users, and UI state.

## Installed Packages
```bash
npm install zustand axios
```

## Store Structure

### 1. Auth Store (`store/authStore.ts`)
Manages user authentication and JWT tokens with localStorage persistence.

**State:**
- `user`: Current logged-in user object
- `token`: JWT authentication token
- `isAuthenticated`: Boolean flag for auth status
- `isLoading`: Loading state for auth operations
- `error`: Error messages from auth operations

**Actions:**
- `login(username, password)`: Authenticate user and store token
- `logout()`: Clear user session and token
- `verifyToken()`: Validate current JWT token
- `clearError()`: Clear error messages

**Features:**
- Automatic token persistence in localStorage
- Auto-restore session on page reload
- Axios interceptor for automatic token injection

### 2. Leads Store (`store/leadsStore.ts`)
Manages leads data with CRUD operations, pagination, and filtering.

**State:**
- `leads`: Array of lead objects
- `currentLead`: Currently selected/editing lead
- `isLoading`: Loading state
- `error`: Error messages
- `currentPage`, `itemsPerPage`, `totalLeads`: Pagination
- `searchQuery`, `statusFilter`: Filter states

**Actions:**
- `fetchLeads()`: Get leads with pagination/filters
- `fetchLeadById(id)`: Get single lead
- `createLead(lead)`: Create new lead
- `updateLead(id, lead)`: Update existing lead
- `deleteLead(id)`: Delete lead
- `setSearchQuery(query)`: Update search filter
- `setStatusFilter(status)`: Update status filter
- `setCurrentPage(page)`: Change page

### 3. Users Store (`store/usersStore.ts`)
Manages users data with CRUD operations.

**State:**
- `users`: Array of user objects
- `currentUser`: Currently selected/editing user
- `isLoading`: Loading state
- `error`: Error messages

**Actions:**
- `fetchUsers()`: Get all users
- `fetchUserById(id)`: Get single user
- `createUser(user)`: Create new user
- `updateUser(id, user)`: Update existing user
- `deleteUser(id)`: Delete user
- `clearError()`: Clear error messages

### 4. UI Store (`store/uiStore.ts`)
Manages global UI state for modals, toasts, and sidebar.

**State:**
- `isModalOpen`, `modalType`, `modalData`: Modal management
- `globalLoading`: Global loading indicator
- `toast`: Toast notification state
- `isSidebarCollapsed`: Sidebar collapse state

**Actions:**
- `openModal(type, data)`: Open modal with data
- `closeModal()`: Close modal
- `setGlobalLoading(loading)`: Set global loading
- `showToast(message, type)`: Show toast notification
- `hideToast()`: Hide toast
- `toggleSidebar()`: Toggle sidebar collapse

## Axios Configuration (`lib/axios.ts`)

Configured axios instance with:
- Base URL: `http://localhost:3001/api`
- Automatic JWT token injection from localStorage
- Global error handling (401, 403, 500)
- Auto-redirect to login on 401 Unauthorized

## Usage Examples

### Login Page
```typescript
import { useAuthStore } from '@/store';

const { login, error, isLoading } = useAuthStore();

const handleLogin = async () => {
  try {
    await login(username, password);
    router.push('/');
  } catch (err) {
    // Error is automatically set in store
  }
};
```

### Leads Page
```typescript
import { useLeadsStore } from '@/store';

const { 
  leads, 
  isLoading, 
  fetchLeads, 
  setSearchQuery,
  setStatusFilter 
} = useLeadsStore();

useEffect(() => {
  fetchLeads();
}, []);
```

### Protected Route
```typescript
import { useAuthStore } from '@/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const { isAuthenticated, verifyToken } = useAuthStore();
const router = useRouter();

useEffect(() => {
  const checkAuth = async () => {
    const valid = await verifyToken();
    if (!valid) {
      router.push('/login');
    }
  };
  checkAuth();
}, []);
```

## File Structure
```
frontend/
├── store/
│   ├── authStore.ts      # Authentication state
│   ├── leadsStore.ts     # Leads management
│   ├── usersStore.ts     # Users management
│   ├── uiStore.ts        # UI state
│   └── index.ts          # Export all stores
├── lib/
│   └── axios.ts          # Axios configuration
└── app/
    └── login/
        └── page.tsx      # Updated to use auth store
```

## Benefits

1. **Centralized State**: All state in one place, easy to debug
2. **Type Safety**: Full TypeScript support
3. **Persistence**: Auth state persists across page reloads
4. **Automatic Token Management**: Axios interceptors handle JWT automatically
5. **Clean Components**: No prop drilling, cleaner component code
6. **DevTools**: Zustand has excellent dev tools support

## Next Steps

1. Update dashboard to use auth store for user info
2. Update leads listing page to use leads store
3. Update users page to use users store
4. Add protected route wrapper component
5. Implement toast notifications using UI store
