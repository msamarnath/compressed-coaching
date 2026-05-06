# Basic Authentication (Signup + Login) - Technical PRD

## Overview

This document defines the user authentication requirements for QuizMaker. It covers user sign-up, login, session management, logout, and access control so that only authenticated users can create and manage MCQ questions.

---

## Business Requirements

### User Registration
- Users must be able to create an account using **first name**, **last name**, **email**, and **password**.
- Email address must be unique and will serve as the **username** for login.
- The system must validate all fields and provide user-friendly errors.

### User Login & Logout
- Users must be able to log in using **email + password**.
- Logged-in users must be able to log out from the app.
- Users should remain logged in across page refreshes via a secure session mechanism.

### Access Control
- Only authenticated users may access MCQ management features (list/create/edit/delete/preview).
- Unauthenticated users attempting to access protected routes should be redirected to login.

### Security & Compliance (Baseline)
- Passwords must never be stored in plaintext.
- Authentication must be resilient to common issues (credential stuffing basics, timing attacks basics, enumeration prevention where feasible).

---

## Technical Requirements

### Authentication Model

**Approach**: Server-side session authentication stored in Cloudflare D1, with a secure, HTTP-only cookie containing a session token.

- **Signup**: create `users` record with password hash.
- **Login**: validate password, create `sessions` record, set cookie.
- **Logout**: delete/expire session, clear cookie.
- **Middleware / Route protection**: server checks for valid session on protected routes and server actions.

Rationale:
- Fits Cloudflare Workers + Next.js App Router constraints well.
- Avoids the complexity of JWT rotation/invalidation for a CRUD app.
- Enables immediate session revocation (logout, admin kill, expiry).

---

## Database Schema (Cloudflare D1 / SQLite)

> Notes:
> - IDs are `TEXT` UUID-like values (hex random blob) to keep them URL-safe and portable.
> - Use UTC timestamps (`CURRENT_TIMESTAMP` in SQLite is UTC).

```sql
-- Users table: one row per user account
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,                -- username
  password_hash TEXT NOT NULL,        -- bcrypt/argon2 hash
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email);

-- Sessions table: server-side session store
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  session_token_hash TEXT NOT NULL,   -- hash of random session token
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,                -- null unless revoked
  last_seen_at DATETIME,              -- optional: for analytics / rolling sessions
  user_agent TEXT,
  ip_address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token_hash_unique ON sessions (session_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);
```

### Password Hashing

- **Required**: Use a strong one-way password hash.
- **Recommended**:
  - Prefer **Argon2id** if runtime support is straightforward in the Cloudflare/Next environment.
  - Otherwise use **bcrypt** with an appropriate cost factor.
- Store the full encoded hash string in `users.password_hash`.

### Session Token Handling

- Generate a cryptographically secure random token (e.g., 32+ bytes).
- Store only a **hash** of the token (`session_token_hash`) in D1.
- Set a cookie on the client containing the raw token.

Cookie requirements:
- `HttpOnly: true`
- `Secure: true` (in production)
- `SameSite: Lax` (or `Strict` if the app does not require cross-site POSTs)
- `Path: /`
- Set `Max-Age` aligned with session `expires_at`

Session lifetime:
- Baseline: 7 days (configurable).
- Optional enhancement: rolling sessions (update `expires_at` on activity) with absolute max lifetime.

---

## API / Server Actions (Contract-Level)

This project can implement auth using **Server Actions** rather than REST API routes. The PRD specifies contracts independent of exact wiring.

### Signup

**Action**: `signup({ firstName, lastName, email, password })`

- **Validations**
  - `firstName`: required, 1–80 chars, trimmed
  - `lastName`: required, 1–80 chars, trimmed
  - `email`: required, valid email format, lowercased, trimmed
  - `password`: required, minimum 8 chars (baseline), must not exceed a safe max length (e.g., 128) to prevent hash DoS
- **Behavior**
  - If email already exists, return a generic error (avoid user enumeration).
  - Create user record with hashed password.
  - Optionally auto-login (create session + set cookie) after signup.
- **Errors**
  - 400: validation failure (field-level)
  - 409: email already in use (can still return generic UI message)
  - 500: server failure

### Login

**Action**: `login({ email, password })`

- **Validations**
  - `email`: required, normalized to lowercase/trim
  - `password`: required
- **Behavior**
  - Compare password to stored hash (constant-time compare at hash library level).
  - If invalid, return generic error: “Invalid email or password”.
  - If valid, create session with expiry, set cookie.
- **Errors**
  - 400: validation failure
  - 401: invalid credentials (generic message)
  - 500: server failure

### Logout

**Action**: `logout()`

- **Behavior**
  - Revoke current session (`revoked_at = now`) or delete row.
  - Clear session cookie.

### Get Current User

**Function/Helper**: `getCurrentUser()` (server-only)

- **Behavior**
  - Read session token cookie.
  - Hash token and look up active session:
    - `revoked_at IS NULL`
    - `expires_at > now`
  - Join `users` for user profile.
  - Return `null` if missing/invalid.

---

## User Interface Requirements

### Signup Page (`/signup`)

- **Fields**
  - First name (required)
  - Last name (required)
  - Email (required; validate format)
  - Password (required; min length)
- **Actions**
  - Create account
  - Link to login
- **UX**
  - Inline field errors
  - Disable submit while loading
  - On success: redirect to MCQ list (or login page if not auto-login)

### Login Page (`/login`)

- **Fields**
  - Email
  - Password
- **Actions**
  - Log in
  - Link to signup
- **UX**
  - Generic error for invalid credentials
  - Disable submit while loading
  - On success: redirect to MCQ list

### Logout Control

- Provide logout entry point in the authenticated layout (e.g., top-right menu).
- On logout: redirect to `/login`.

### Protected Route Behavior

- For protected routes (e.g., `/mcq`), unauthenticated users are redirected to `/login`.
- Optional: support `?next=/mcq` for returning post-login.

---

## Edge Cases & Non-Functional Requirements

### Validation & Normalization
- Always normalize email to lowercase and trim whitespace at boundaries.
- Enforce maximum lengths to prevent abuse:
  - Names: 80
  - Email: 254
  - Password: 128 (input) (hash output can be longer)

### Error Handling
- Do not reveal whether an email exists during login.
- During signup, the UI may show “Email already in use” but backend should still avoid leaking via timing where feasible.

### Performance Targets
- Login/signup should complete in < 1s on typical network (excluding hashing cost).
- Session lookup on each protected request should be indexed and fast.

### Observability (Baseline)
- Log auth failures at a coarse level (no passwords).
- Record session creation and revocation events (optionally).

---

## Implementation Phases

### Phase 1: Database Foundations - ⏳ PLANNED

**Objective**: Create `users` and `sessions` tables with indexes.

**Tasks**:
1. Add D1 migration for auth tables
2. Add indexes and uniqueness constraint for `email`

**Deliverables**:
- Migration SQL(s) covering auth tables

### Phase 2: Auth Flows - ⏳ PLANNED

**Objective**: Signup/login/logout wired end-to-end.

**Tasks**:
1. Signup form + server action
2. Login form + server action
3. Logout action + cookie clearing
4. Session validation helper

**Deliverables**:
- Working auth pages and session cookies

### Phase 3: Route Protection - ⏳ PLANNED

**Objective**: Guard MCQ pages and actions behind authentication.

**Tasks**:
1. Protect `/mcq` list and all MCQ mutations
2. Implement redirect-to-login behavior

---

## Success Criteria

- [ ] User can sign up with first name, last name, email, password
- [ ] User can log in using email + password
- [ ] Authenticated session persists via secure cookie
- [ ] User can log out and session is invalidated
- [ ] Unauthenticated user cannot access MCQ pages/actions
- [ ] Passwords are stored only as hashes (no plaintext anywhere)

---

## Troubleshooting Guide

### “I keep getting logged out”
**Problem**: Session cookie not persisted or session expired early.  
**Cause**: Cookie missing `Secure`/`SameSite` settings, mismatched Max-Age vs `expires_at`, or server time mismatch.  
**Solution**: Align cookie expiry with `sessions.expires_at`, verify cookie flags, verify session lookup query and indexes.

### “Signup works but login fails”
**Problem**: Stored password hash does not verify.  
**Cause**: Different hash algorithm params between signup and login, or password normalization mismatches.  
**Solution**: Ensure a single hashing/verify module is used for both; do not trim/alter password input.

---

## Future Enhancements

- Password reset via email
- Email verification
- “Remember me” session duration toggle
- Account management page (update profile/password)
- Admin roles / organization support

---

## Dependencies

### External Dependencies
- None required for baseline auth (no email provider needed unless adding password reset/verification)

### Internal Dependencies
- D1 access via centralized DB client (`lib/d1-client.ts`)
- Cookie utilities compatible with Next.js App Router on Cloudflare Workers

---

## Risks and Mitigation

### Technical Risks
- **Risk**: Password hashing library incompatibility on Cloudflare runtime.  
  **Mitigation**: Choose a library known to work in Workers/Node compat; validate in preview environment.
- **Risk**: Session cookie misconfiguration causing auth loops.  
  **Mitigation**: Add integration checks for cookie flags and expiry alignment.

### User Experience Risks
- **Risk**: Confusing errors for invalid credentials.  
  **Mitigation**: Use consistent generic error message and inline validation for formatting issues.

---

## Current Status

**Last Updated**: 2026-05-05  
**Current Phase**: Phase 1 - Database Foundations  
**Status**: ⏳ PLANNED  
**Next Steps**: Define migrations and then implement signup/login UI + server actions.

