# Users

## US-31: User Authentication with Google

**As a** user
**I want to** sign in with my Google account
**So that** I can securely access my notes and tasks without creating another password

### Acceptance Criteria

- [ ] User can sign in using their Google account
- [ ] Google OAuth 2.0 is used for authentication
- [ ] User is redirected to Google sign-in page when clicking "Sign in with Google"
- [ ] After successful authentication, user is redirected back to the app
- [ ] User's Google profile information (name, email, avatar) is stored
- [ ] No password-based registration or login is offered
- [ ] Sign-in button is prominently displayed on the landing/login page

### Technical Notes
- Use Google OAuth 2.0 / OpenID Connect
- Store JWT tokens for session management
- Backend validates Google ID tokens
- Consider using ASP.NET Core Identity with Google provider

---

## US-32: User Profile

**As a** user
**I want to** see my profile information
**So that** I know which account I'm signed in with

### Acceptance Criteria

- [ ] User can see their profile picture (from Google) in the sidebar
- [ ] User can see their name and email
- [ ] Profile is accessible from the sidebar (bottom section)
- [ ] Clicking profile shows a dropdown with account info and sign-out option

### UI Layout

```
┌─────────────────────────┐
│  [Avatar]               │
│  John Doe               │
│  john@example.com       │
│  ──────────────────     │
│  Sign out               │
└─────────────────────────┘
```

---

## US-33: Sign Out

**As a** user
**I want to** sign out of my account
**So that** I can secure my data when I'm done or switch accounts

### Acceptance Criteria

- [ ] User can sign out from the profile dropdown
- [ ] Sign out clears all local session data
- [ ] User is redirected to the login page after sign out
- [ ] Sign out revokes the refresh token on the server

---

## US-34: User-Scoped Notes

**As a** user
**I want** my notes to be private to my account
**So that** only I can see and manage my notes

### Acceptance Criteria

- [ ] Each note is associated with the user who created it
- [ ] Users can only see their own notes
- [ ] Users can only edit their own notes
- [ ] Users can only delete their own notes
- [ ] API endpoints enforce user ownership

### Technical Notes
- Add `user_id` foreign key to `notes` table
- All note queries filter by authenticated user
- API returns 404 (not 403) for notes belonging to other users (security)

---

## US-35: User-Scoped Tasks

**As a** user
**I want** my tasks to be private to my account
**So that** only I can see and manage my tasks

### Acceptance Criteria

- [ ] Each task is associated with the user who created it
- [ ] Users can only see their own tasks
- [ ] Users can only edit their own tasks
- [ ] Users can only delete their own tasks
- [ ] Board view only shows the user's tasks
- [ ] API endpoints enforce user ownership

### Technical Notes
- Add `user_id` foreign key to `tasks` table
- All task queries filter by authenticated user
- API returns 404 (not 403) for tasks belonging to other users (security)

---

## US-36: User-Scoped Labels

**As a** user
**I want** my labels to be private to my account
**So that** I can organize my notes and tasks with my own labeling system

### Acceptance Criteria

- [ ] Each label is associated with the user who created it
- [ ] Users can only see their own labels
- [ ] Label suggestions only show the user's existing labels
- [ ] Users cannot apply another user's labels to their items
- [ ] API endpoints enforce user ownership

### Technical Notes
- Add `user_id` foreign key to `labels` table
- All label queries filter by authenticated user

---

## US-37: Protected Routes

**As a** user
**I want** the application to require authentication
**So that** my data is protected from unauthorized access

### Acceptance Criteria

- [ ] All routes except login are protected
- [ ] Unauthenticated users are redirected to login page
- [ ] API returns 401 Unauthorized for unauthenticated requests
- [ ] Expired tokens trigger re-authentication
- [ ] Deep links work after authentication (redirect to intended page)

### Technical Notes
- Implement Angular route guards
- Use HTTP interceptor for adding auth headers
- Handle token refresh automatically
- Store intended URL before redirect to login

---

## US-38: User Data Model

**As a** developer
**I want** a user entity in the system
**So that** all user-related data can be properly associated

### Data Model

```
users
├── id: UUID (PK)
├── google_id: string (unique, from Google)
├── email: string (unique)
├── name: string
├── avatar_url: string (nullable)
├── created_at: timestamp
└── last_login_at: timestamp
```

### Relationships

- User has many Notes (1:N)
- User has many Tasks (1:N)
- User has many Labels (1:N)

### Technical Notes
- Create EF Core migration for users table
- Update existing entities to include user_id
- Add navigation properties for relationships
