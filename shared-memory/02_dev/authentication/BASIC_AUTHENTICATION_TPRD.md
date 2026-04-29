# Basic Authentication System - Technical PRD

## Overview

This document outlines the requirements for implementing a basic authentication system for QuizMaker. The system will provide user registration, login, and session management to support MCQ creation and management functionality.

## Business Requirements

### User Management

- Teachers need to create accounts to access the quiz creation system
- Users must be able to register with email/password
- Users must be able to log in securely
- Session management for authenticated users
- Basic user profile information (name, email)

### Security Requirements

- Password hashing and secure storage
- Session-based authentication with secure cookies
- Protection of MCQ management routes
- Input validation and sanitization

## Technical Requirements

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Authentication Flow

#### Registration Process

1. User fills out registration form (first name, last name, email, password, confirm password)
2. Client-side validation (required fields, email format, password match)
3. Server-side validation (email uniqueness, password strength)
4. Password hashing with salt
5. User creation in database
6. Session creation and cookie setting
7. Redirect to MCQ management dashboard

#### Login Process

1. User enters email and password
2. Client-side validation (required fields)
3. Server-side credential verification
4. Password hash comparison
5. Session creation and cookie setting
6. Redirect to MCQ management dashboard

#### Session Management

- Signed session cookies with HMAC-SHA256
- 7-day session expiration
- HTTP-only, secure, SameSite cookies
- Session validation middleware for protected routes

### API Endpoints

#### POST /api/auth/signup

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**

- Success (200): User object + session cookie
- Error (400): Missing required fields
- Error (409): Email already exists
- Error (500): Server error

#### POST /api/auth/login

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

- Success (200): User object + session cookie
- Error (400): Missing credentials
- Error (401): Invalid credentials
- Error (500): Server error

### User Interface

#### Registration Page (/signup)

- Form fields: First Name, Last Name, Email, Password, Confirm Password
- Client-side validation with error messages
- "Sign in" link to login page
- Responsive design with shadcn/ui components

#### Login Page (/login)

- Form fields: Email, Password
- Client-side validation with error messages
- "Sign up" link to registration page
- "Forgot password" link (future enhancement)
- Responsive design with shadcn/ui components

### Security Implementation

#### Password Security

- Salted SHA-256 hashing (MVP approach)
- Minimum 8 character password requirement
- Password confirmation validation
- Timing-safe password comparison

#### Session Security

- HMAC-SHA256 signed session tokens
- Session expiration (7 days)
- Secure cookie attributes (HTTP-only, Secure, SameSite)
- Session validation middleware

#### Input Validation

- Client-side: Required field validation, email format, password match
- Server-side: Email uniqueness, password strength, SQL injection prevention
- Error handling with user-friendly messages

### Route Protection

#### Protected Routes

- `/` (root) - redirects to login if not authenticated
- `/mcqs/*` - MCQ management routes
- Any future authenticated routes

#### Public Routes

- `/login` - login page
- `/signup` - registration page
- `/api/auth/*` - authentication endpoints
- Static assets and API routes

### Error Handling

#### Client-Side

- Form validation errors displayed inline
- Network error handling with user feedback
- Loading states during form submission

#### Server-Side

- Detailed error logging for debugging
- Generic error messages for security
- Proper HTTP status codes
- Input sanitization and validation

## Implementation Phases

### Phase 1: Database Foundation ✅ COMPLETED

**Objective**: Set up user authentication database schema and connectivity

**Implementation Details:**

**Database Migration:**

```sql
-- migrations/0001_users_table.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_created_at ON users (created_at);
```

**D1 Client Implementation:**

- **File**: `lib/d1-client.ts`
- **Key Features**:
  - Centralized database access with `getDatabase(env)` function
  - Parameter binding normalization (`?` → `?1`, `?2`, etc.) for D1 compatibility
  - Safe fallback mechanism for `wrangler dev` binding quirks
  - Helper functions: `executeQuery`, `executeQueryFirst`, `executeMutation`, `executeBatch`
  - Type-safe interfaces for D1Database, D1PreparedStatement, D1Result

**Database Binding:**

- **Environment**: `quizmaker_app_database` binding in Cloudflare environment
- **Access**: `env.quizmaker_app_database` via `getCloudflareContext().env`

**Deliverables:**

- ✅ `migrations/0001_users_table.sql` migration file
- ✅ Updated `lib/d1-client.ts` with correct binding and parameter handling
- ✅ Database connectivity tested and working

### Phase 2: Authentication Backend ✅ COMPLETED

**Objective**: Implement core authentication services and API endpoints

**Implementation Details:**

**Password Hashing & Session Management:**

- **File**: `lib/auth.ts`
- **Password Security**:
  ```typescript
  // PBKDF2 with SHA-256, 100,000 iterations
  export async function hashPassword(password: string): Promise<string>;
  export async function verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean>;
  ```
- **Session Management**:
  ```typescript
  // HMAC-SHA256 signed tokens with 7-day expiry
  export async function signSession(
    payload: Record<string, unknown>
  ): Promise<string>;
  export async function verifySession(
    token: string
  ): Promise<Record<string, unknown> | null>;
  ```
- **Cookie Management**:
  ```typescript
  export async function setSessionCookie(
    userId: string,
    email: string
  ): Promise<void>;
  export async function clearSessionCookie(): Promise<void>;
  export async function getCurrentSession(): Promise<Record<
    string,
    unknown
  > | null>;
  ```

**API Endpoints:**

**Signup Endpoint:**

- **File**: `app/api/auth/signup/route.ts`
- **Features**:
  - Input validation (required fields, email format, password strength)
  - Email uniqueness check via `UserService.emailExists()`
  - Password hashing with `hashPassword()`
  - User creation via `UserService.createUser()`
  - Session creation and cookie setting
  - Type-safe request body handling: `as { firstName: string; lastName: string; email: string; password: string; }`

**Login Endpoint:**

- **File**: `app/api/auth/login/route.ts`
- **Features**:
  - Credential validation
  - User lookup via `UserService.getUserByEmail()`
  - Password verification with `verifyPassword()`
  - Session creation and cookie setting
  - Type-safe request body handling: `as { email: string; password: string; }`

**User Service Layer:**

- **File**: `lib/services/user-service.ts`
- **Key Methods**:
  ```typescript
  export class UserService {
    async createUser(
      userData: CreateUserData,
      passwordHash: string
    ): Promise<User>;
    async getUserByEmail(email: string): Promise<User | null>;
    async emailExists(email: string): Promise<boolean>;
    // ... additional CRUD operations
  }
  ```

**Route Protection Middleware:**

- **File**: `middleware.ts`
- **Protected Routes**: `/`, `/mcqs/*`
- **Public Routes**: `/login`, `/signup`, `/api/auth/*`
- **Logic**: Session validation with redirects for unauthenticated users

**Deliverables:**

- ✅ `lib/auth.ts` with comprehensive hashing and session utilities
- ✅ `app/api/auth/signup/route.ts` with full validation and error handling
- ✅ `app/api/auth/login/route.ts` with credential verification
- ✅ `app/api/auth/logout/route.ts` for session cleanup
- ✅ `app/api/auth/me/route.ts` for current user info
- ✅ `middleware.ts` with route protection logic
- ✅ All endpoints tested and working with proper error handling

### Phase 3: Authentication Frontend ✅ COMPLETED

**Objective**: Build user interface for registration and login with MCQ stub

**Implementation Details:**

**Signup Page & Form:**

- **Page**: `app/signup/page.tsx` - Simple wrapper with responsive layout
- **Form**: `components/signup-form.tsx`
- **Features**:
  - shadcn/ui components: `Card`, `Field`, `Input`, `Button`
  - Client-side validation with error state management
  - Form submission with loading states
  - API integration with `/api/auth/signup`
  - Success redirect to `/mcqs`
  - Error handling with user-friendly messages

**Login Page & Form:**

- **Page**: `app/login/page.tsx` - Simple wrapper with responsive layout
- **Form**: `components/login-form.tsx`
- **Features**:
  - shadcn/ui components with consistent styling
  - Email/password validation
  - API integration with `/api/auth/login`
  - Success redirect to `/mcqs`
  - "Sign up" link navigation

**MCQ Stub Page:**

- **Page**: `app/mcqs/page.tsx`
- **Content**: Empty state with "No MCQs yet" message
- **Purpose**: Landing page after successful authentication

**Root Page Redirect:**

- **File**: `app/page.tsx`
- **Logic**: `redirect("/mcqs")` to send authenticated users to MCQ management

**Deliverables:**

- ✅ `app/signup/page.tsx` and `components/signup-form.tsx` with full functionality
- ✅ `app/login/page.tsx` and `components/login-form.tsx` with full functionality
- ✅ `app/mcqs/page.tsx` stub page for authenticated users
- ✅ Complete authentication flow with proper redirects
- ✅ Responsive design with shadcn/ui components

### Phase 4: Integration and Testing ✅ COMPLETED

**Objective**: Comprehensive testing and production readiness

**Implementation Details:**

**Build System:**

- **TypeScript**: All type errors resolved with proper type assertions
- **ESLint**: All linting issues fixed (unused variables, `any` types)
- **Build Process**: `npm run build` completes successfully
- **Static Generation**: 12 pages generated successfully

**Security Implementation:**

- **Password Hashing**: PBKDF2 with SHA-256, 100,000 iterations
- **Session Security**: HMAC-SHA256 signed tokens with 7-day expiry
- **Cookie Security**: HTTP-only, secure, SameSite attributes
- **Input Validation**: Both client-side and server-side validation
- **SQL Injection Prevention**: Parameterized queries with D1 client

**Error Handling:**

- **Client-Side**: Form validation, loading states, user-friendly error messages
- **Server-Side**: Comprehensive error logging, proper HTTP status codes
- **Network Errors**: Graceful handling with fallback messages

**Deliverables:**

- ✅ All authentication features tested and working
- ✅ Production-ready authentication system with clean build
- ✅ Comprehensive error handling and security measures
- ✅ Complete documentation with code references

## Technical Implementation Reference

### Core Files and Their Responsibilities

#### Database Layer

- **`migrations/0001_users_table.sql`**: User table schema with indexes
- **`lib/d1-client.ts`**: Centralized D1 database access with parameter binding normalization
- **`lib/services/user-service.ts`**: User CRUD operations and business logic

#### Authentication Layer

- **`lib/auth.ts`**: Password hashing, session management, cookie handling
- **`middleware.ts`**: Route protection and session validation

#### API Layer

- **`app/api/auth/signup/route.ts`**: User registration endpoint
- **`app/api/auth/login/route.ts`**: User login endpoint
- **`app/api/auth/logout/route.ts`**: Session cleanup endpoint
- **`app/api/auth/me/route.ts`**: Current user information endpoint

#### Frontend Layer

- **`app/signup/page.tsx`**: Registration page wrapper
- **`app/login/page.tsx`**: Login page wrapper
- **`app/mcqs/page.tsx`**: Authenticated user landing page
- **`components/signup-form.tsx`**: Registration form with validation
- **`components/login-form.tsx`**: Login form with validation

### Key Implementation Patterns

#### Database Access Pattern

```typescript
// lib/d1-client.ts
export function getDatabase(env: any): D1Database {
  return env.quizmaker_app_database;
}

// Usage in API routes
const { env } = getCloudflareContext();
const db = getDatabase(env);
```

#### Parameter Binding Pattern

```typescript
// Normalize placeholders for D1 compatibility
function normalizePlaceholders(sql: string, paramCount: number): string {
  if (paramCount === 0) return sql;
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `?${index}`;
  });
}
```

#### Session Management Pattern

```typescript
// lib/auth.ts
export async function setSessionCookie(
  userId: string,
  email: string
): Promise<void> {
  const session = await signSession({
    userId,
    email,
    expiresAt: Date.now() + SESSION_DURATION,
  });
  cookies().set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  });
}
```

#### API Route Pattern

```typescript
// app/api/auth/signup/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };
    // Validation, hashing, user creation, session setting
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Form Submission Pattern

```typescript
// components/signup-form.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    if (response.ok) {
      router.push("/mcqs");
    } else {
      const data = await response.json();
      setError(data.error || "Signup failed");
    }
  } catch {
    setError("Unexpected error. Please try again.");
  } finally {
    setSubmitting(false);
  }
};
```

### Security Implementation Details

#### Password Hashing

- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **Salt**: Random 32-byte salt per password
- **Implementation**: `lib/auth.ts` - `hashPassword()` and `verifyPassword()`

#### Session Security

- **Signing**: HMAC-SHA256 with secret key
- **Expiry**: 7 days from creation
- **Storage**: HTTP-only cookies
- **Attributes**: Secure, SameSite=lax

#### Input Validation

- **Client-Side**: Form validation with error states
- **Server-Side**: Type assertions, email format, password strength
- **Database**: Parameterized queries prevent SQL injection

### Error Handling Strategy

#### Client-Side Errors

- Form validation with inline error messages
- Network error handling with user feedback
- Loading states during form submission

#### Server-Side Errors

- Comprehensive error logging for debugging
- Generic error messages for security
- Proper HTTP status codes (400, 401, 409, 500)
- Input sanitization and validation

### Build and Deployment

#### TypeScript Configuration

- All type errors resolved with proper type assertions
- ESLint compliance with `any` type exceptions where necessary
- Clean build process with `npm run build`

#### Static Generation

- 12 pages generated successfully
- API routes properly configured
- Middleware for route protection

## Success Criteria ✅ ACHIEVED

- ✅ Users can successfully register with valid information
- ✅ Users can log in with correct credentials
- ✅ Invalid credentials are properly rejected
- ✅ Sessions persist across page refreshes
- ✅ Protected routes redirect unauthenticated users
- ✅ Public routes remain accessible
- ✅ Error messages are user-friendly and secure
- ✅ Forms validate input appropriately

## Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Issues

**Problem**: `Cannot read properties of undefined (reading 'prepare')`
**Cause**: Incorrect environment access in API routes
**Solution**: Use `getCloudflareContext().env` instead of `process.env` or `globalThis`

```typescript
// ❌ Wrong
const db = getDatabase(process.env);

// ✅ Correct
const { env } = getCloudflareContext();
const db = getDatabase(env);
```

#### Parameter Binding Errors

**Problem**: `Wrong number of parameter bindings for SQL query`
**Cause**: D1 requires positional placeholders (`?1`, `?2`) instead of anonymous (`?`)
**Solution**: Use `lib/d1-client.ts` helpers that normalize placeholders automatically

```typescript
// ❌ Wrong - direct D1 usage
const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
stmt.bind(email);

// ✅ Correct - use helper functions
const user = await executeQueryFirst(
  db,
  "SELECT * FROM users WHERE email = ?",
  email
);
```

#### TypeScript Type Errors

**Problem**: `Property 'email' does not exist on type 'unknown'`
**Cause**: Request body not properly typed
**Solution**: Add type assertions for request bodies

```typescript
// ❌ Wrong
const body = await request.json();
const { email, password } = body;

// ✅ Correct
const body = (await request.json()) as { email: string; password: string };
const { email, password } = body;
```

#### ESLint Build Errors

**Problem**: `Unexpected any. Specify a different type`
**Cause**: ESLint strict type checking
**Solution**: Use `unknown` for better type safety or add ESLint disable comments

```typescript
// For Cloudflare environment access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDatabase(env: any): D1Database {
  return env.quizmaker_app_database;
}
```

#### Session Property Access

**Problem**: `'session.expiresAt' is of type 'unknown'`
**Cause**: Session object typed as `Record<string, unknown>`
**Solution**: Use type assertions for known properties

```typescript
// ❌ Wrong
if (Date.now() > session.expiresAt) {

// ✅ Correct
if (Date.now() > (session.expiresAt as number)) {
```

### Development Workflow Issues

#### Hot Module Replacement

**Problem**: Changes not reflecting in development
**Cause**: Using `wrangler dev` instead of Next.js dev server
**Solution**: Use `npm run dev` for proper HMR with Next.js

#### Database Migration Issues

**Problem**: `Couldn't find a D1 DB with the name or binding`
**Cause**: Incorrect database configuration or wrong directory
**Solution**: Ensure `wrangler.jsonc` is properly configured and run commands from correct directory

## Future Enhancements

### Security Improvements

- Upgrade to Argon2 or bcrypt for password hashing
- Rate limiting for login attempts
- Email verification for account activation
- Password reset functionality
- Two-factor authentication

### User Experience

- "Remember me" functionality
- Social login integration (Google, Microsoft)
- User profile management
- Account deletion (GDPR compliance)

### Technical Improvements

- JWT token support for stateless authentication
- Refresh token implementation
- Session analytics and monitoring
- Multi-device session management

## Dependencies

- Cloudflare D1 database
- Next.js API routes
- shadcn/ui components
- Web Crypto API for hashing
- Cookie handling utilities

## Risks and Mitigation

### Security Risks

- **Risk**: Password compromise
- **Mitigation**: Strong hashing, secure session management

- **Risk**: Session hijacking
- **Mitigation**: Secure cookies, HTTPS enforcement

- **Risk**: SQL injection
- **Mitigation**: Prepared statements, input validation

### Technical Risks

- **Risk**: Session management complexity
- **Mitigation**: Use proven patterns, thorough testing

- **Risk**: Database performance
- **Mitigation**: Proper indexing, query optimization

This authentication system provides a solid foundation for the QuizMaker application while maintaining security best practices and user experience standards.
