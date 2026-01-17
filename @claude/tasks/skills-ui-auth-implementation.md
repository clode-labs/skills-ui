# Skills-UI Authentication Implementation

## Overview

Implementing authentication for skills-ui that integrates with web-app OAuth flow and enables JWT-protected API calls to skills-registry.

## Architecture

```
skills-ui → redirect to web-app (login/signup) → callback with sessionId/sessionCode → exchange for tokens via Raksha → store tokens → use for API calls
```

## Environment Variables (Not Hard-coded)

All URLs are configurable via environment variables:

```bash
VITE_API_BASE_URL=http://localhost:8086      # Skills registry API
VITE_WEBAPP_URL=https://app.clode.space      # Web-app for OAuth
VITE_AUTH_URL=https://auth.clode.space/auth  # Raksha auth service
```

## Files to Create

### 1. `src/pages/MySkills.tsx`
- Protected page showing user's private skills
- Redirects to signin if not authenticated
- Uses `authApi.getPrivateSkills()` endpoint
- Pagination support
- Empty state with call-to-action

### 2. `src/types/auth.ts`
- `User` interface (id, email, name, avatar_url, created_at)
- `AuthState` interface (user, tokens, loading states)
- `AuthContextType` interface (state + actions)
- `Credentials` interface (tokens + user)

### 3. `src/services/auth.ts`
- `generateSessionId()` - UUID v4 for CSRF protection
- `buildLoginUrl()` - Construct web-app redirect URL with callback
- `exchangeCodeForTokens()` - POST to Raksha to get JWT tokens
- `refreshAccessToken()` - Refresh expired access tokens
- `revokeTokens()` - Logout/revoke tokens
- Storage helpers: `saveCredentials()`, `loadCredentials()`, `clearCredentials()`
- `isTokenExpired()` - Check JWT exp claim

### 4. `src/contexts/AuthContext.tsx`
- `AuthProvider` component with state management
- Auto-load credentials from localStorage on mount
- Auto-refresh expired tokens
- Expose: `signIn()`, `signUp()`, `signOut()`, `refreshAccessToken()`
- `useAuth()` hook for consuming context

### 5. `src/pages/SignIn.tsx`
- Redirects to web-app login if not authenticated
- Redirects to home if already authenticated

### 6. `src/pages/SignUp.tsx`
- Redirects to web-app signup if not authenticated
- Redirects to home if already authenticated

### 7. `src/pages/AuthCallback.tsx`
- Handles redirect from web-app with sessionId/sessionCode
- Validates sessionId matches stored value (CSRF protection)
- Exchanges code for tokens via Raksha
- Updates AuthContext and redirects to home

## Files to Update

### 1. `src/App.tsx`
- Wrap with `AuthProvider`
- Add routes: `/signin`, `/signup`, `/auth/callback`, `/my-skills`

### 2. `src/components/Header.tsx`
- Import `useAuth()` hook
- Replace static Sign In/Sign Up buttons with auth-aware UI
- Show user avatar/name when authenticated
- Add "My Skills" link for authenticated users
- Add Sign Out button

### 3. `src/pages/Home.tsx`
- Import `useAuth()` hook
- Add "My Skills" tab in navigation for authenticated users

### 4. `src/services/api.ts`
- Add `getAccessToken()` import from auth service
- Add `requiresAuth` option to fetch wrapper
- Create `authApi` object for authenticated endpoints (`/api/v1/*`)

### 5. `.env.example`
- Add `VITE_WEBAPP_URL` variable

## Implementation Order

1. Create `src/types/auth.ts`
2. Create `src/services/auth.ts`
3. Create `src/contexts/AuthContext.tsx`
4. Create auth pages (SignIn, SignUp, AuthCallback)
5. Update `App.tsx` with provider and routes
6. Update `Header.tsx` with auth UI
7. Update `api.ts` with auth headers
8. Update `.env.example`

## Auth Flow

### Sign In Flow
1. User clicks "Sign In" in Header
2. `signIn()` generates sessionId, stores in sessionStorage
3. Redirects to `{WEBAPP_URL}/login?sessionId=...&callback=...&initiator=skills-ui`
4. User authenticates in web-app
5. Web-app redirects back to `/auth/callback?sessionId=...&sessionCode=...`
6. AuthCallback validates sessionId, exchanges code for tokens
7. Tokens stored in localStorage, user redirected to home

### Token Refresh Flow
1. On app load, check if access token expired
2. If expired, call `refreshAccessToken()` with refresh token
3. If refresh succeeds, update stored tokens
4. If refresh fails, clear credentials (user must re-login)

### Sign Out Flow
1. User clicks "Sign Out"
2. Call `revokeTokens()` to invalidate on server
3. Clear localStorage credentials
4. Reset auth state

## Security Considerations

- Session ID stored in sessionStorage for CSRF protection
- Tokens stored in localStorage (consider httpOnly cookies for production)
- 5-minute buffer before token expiration for refresh
- Session ID validated on callback to prevent CSRF attacks
