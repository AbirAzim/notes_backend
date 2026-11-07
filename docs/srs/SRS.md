## Functional Requirements

### Authentication

- FR-1: A guest can register with name, email and password (role will be set to `USER`).
- FR-2: A new user must verify their email via a signed link before they can log in.
- FR-3: A verified user logs in with email + password and receives a JWT containing sub (userId) and role ('USER' | 'ADMIN').
- FR-4: Protected endpoints require a valid Bearer Token header.
- FR-5: A logged-in user can fetch their own profile.
- FR-6: The first admin is created by a seed script from env.

### Notes (User)

- FR-7: A user can create a note (title, content).
- FR-8: A user can list only their own notes, paginated, newest first.
- FR-9: A user can view, update and delete a single note they own (someone else's note returns 404).

### User Management (Admin)

- FR-10: An admin can list all users and their contents.
- FR-11: An admin can invite a user by email and assign their role (USER | ADMIN) in the invite.
- FR-12: An admin can update a user's name, email, role and interests.
- FR-13: An admin can delete a user; that user's notes and posts are deleted with them.

### Interests & Posts (User + Admin)

- FR-14: A user can set their own list of interests (trimmed, lowercased, de-duplicated).
- FR-15: Any logged-in user can view users grouped by interest. (one User.aggregate() call)
- FR-16: A user can create a post (title, body); posts are visible to every logged-in user.
- FR-19: Any logged-in user can view all posts of a given user. (one pipeline with $lookup)
- FR-20: Every list endpoint is paginated.

### Technical Requirements

- TR-1: Node.js 22 + TypeScript (strict).
- TR-2: Node.js + TypeScript with Express (v5), written from scratch (no framework, no templates).
- TR-3: MongoDB Atlas (M0) with Mongoose.
- TR-4: JWT authentication; bcrypt password hashing.
- TR-5: All indexes declared with `schema.index()`.
- TR-6: Scenario 1 = one `aggregate()` call; Scenario 2 = one pipeline with `$lookup`.
- TR-7: Input validation with zod.
- TR-8: OpenAPI docs via Swagger UI at `/docs`.
- TR-9: Emails via Resend HTTP API.
- TR-10: Frontend: React (Vite) on Vercel.
- TR-11: Backend: Docker (multi-stage, non-root) on AWS EC2 with Elastic IP.
- TR-12: Nginx reverse proxy with HTTPS (Let's Encrypt).
- TR-13: GitHub Actions CI: lint, type check, unit tests, build.
- TR-14: GitHub Actions CD: build image → push to GHCR → deploy to EC2 → health check.
- TR-15: Jest unit tests; Supertest + mongodb-memory-server integration tests.
- TR-16: All config via env variables, validated at startup.

## Non-Functional Requirements

- NFR-1 (Security): Passwords hashed with bcrypt; hash never returned.
- NFR-2 (Security): JWT with expiry; no secrets in the repo.
- NFR-3 (Security): Authorization enforced on the server.
- NFR-4 (Security): All input validated; invalid requests rejected with 400.
- NFR-5 (Security): CORS limited to the frontend; secure headers; rate-limited auth.
- NFR-6 (Security): Verification and invite links are signed and expire.
- NFR-7 (Security): Server exposes only ports 80/443; database accepts only the server's IP.
- NFR-8 (Efficiency): No unnecessary indexes.
- NFR-9 (Performance): Every list, GET and aggregation query uses an index.
- NFR-10 (Performance): Lean reads, projections and capped page size.
- NFR-11 (Reliability): Consistent error responses; no stack traces in production.
- NFR-12 (Reliability): API auto-restarts on crash or reboot.
- NFR-13 (Data integrity): Deleting a user leaves no orphaned data.
- NFR-14 (Availability): Health check endpoint.
- NFR-15 (Maintainability): Feature-based modules; clear commit history.
- NFR-16 (Portability): Runs locally with one command (Docker Compose).

## Deliverables

- D-1: Frontend and backend GitHub repositories.
- D-2: Live frontend URL and live backend API URL.
- D-3: README with setup, endpoints, test credentials and indexing strategy.
- D-4: Swagger docs at `/docs`.
- D-5: Submission via Reply All on the original email.

## Extended Requirements

- EXT-1: Bulk seed script for realistic test data.
- EXT-2: Script that prints `explain()` results for every query.
- EXT-3: Admin can't delete or demote themselves.
- EXT-4: Cascade user delete inside a transaction.
- EXT-5: `autoIndex: false` in production + index sync script.
- EXT-6: Structured logging with request id.
- EXT-7: Cursor-based pagination as a documented alternative.
