# Security Specification & Test Protocol

## 1. Data Invariants
1. An issue/task must belong to a valid project (`projectId` must be a valid ID) and must not exceed string constraints.
2. A user cannot forge their `uid` or modify other users' profiles.
3. A comment author must be the authenticated user (`authorId == request.auth.uid`).
4. Presence updates can only be written by the user themselves (`request.auth.uid == userId`).
5. Chat messages must be authored by the authenticated caller (`authorId == request.auth.uid`).
6. Sprint start and end dates cannot be arbitrarily forged to corrupt sprint history.
7. Only authenticated users can read or write project data.
8. Sensitive admin actions (deleting projects, kicking members) are guarded by project ownership or admin role.

## 2. The "Dirty Dozen" Threat Payloads
1. **User Identity Spoof**: Creating user profile with someone else's UID in body (`uid: "victim_123"`).
2. **Ghost Field Poisoning**: Writing `{ title: "Task", isAdmin: true, role: "superadmin" }` to escalate privilege.
3. **Denial-of-Wallet Payload**: Injecting a 2MB base64 string into `title` or `description`.
4. **Author Impersonation in Messages**: Posting `{ authorId: "ceo_uid", content: "You are fired" }` as an unprivileged user.
5. **Presence Hijack**: Overwriting another user's presence document at `/presence/victim_user`.
6. **Task Project Orphan**: Creating an issue with `projectId: ""` or invalid non-alphanumeric junk.
7. **Negative or Overflow Story Points**: Injecting `storyPoints: -99999` or NaN.
8. **Malicious Script in Comment**: Injecting 50,000 character script payload into `comments/{id}`.
9. **Sprint Status Bypass**: Forcing terminal status mutations or invalid sprint state strings.
10. **Forged GitHub Webhook**: Writing unauthorized GitHub commit records without project association.
11. **Channel Tamper Attack**: Modifying another user's private channels or changing project channel keys.
12. **Unauthenticated Read Dump**: Calling `list` on `/users` or `/issues` without auth.

## 3. Defense Mechanisms
- Standalone `isValid*` validation functions for each entity checking bounds, types, and required fields.
- `request.auth != null` mandatory guard across all read/write paths.
- Default deny: `match /{document=**} { allow read, write: if false; }`.
- Identity constraints: `request.auth.uid == resource.data.authorId` / `request.auth.uid == userId`.
