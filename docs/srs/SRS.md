## Functional Requirements

### Authentication

- FR-1: A guest can register with name, email and password (role will be set to `USER`).
- FR-2: A new user must verify their email via a signed link before they can log in.
- FR-3: A verified user logs in with email + password and receives a JWT containing sub (userId) and role ('USER' | 'ADMIN').
- FR-4: Protected endpoints require a valid Bearer Token header.
- FR-5: A logged-in user can view and update their own profile (name, interests).
- FR-6: The first admin is created by a seed script from env.

### Notes (User)

- FR-7: A user can create a note (title, content).
- FR-8: A user can list only their own notes, paginated, newest first.
- FR-9: A user can view, update and delete a single note they own (someone else's note returns 404).

### User Management (Admin)

- FR-10: An admin can list all users and everyone's notes (with owner name), paginated.
- FR-11: An admin can invite a user by email and assign their role (USER | ADMIN) in the invite.
- FR-12: An admin can update a user's name, email, role and interests.
- FR-13: An admin can delete a user; that user's notes and posts are deleted with them.
- FR-14: A non-admin calling any admin endpoint gets 403 Forbidden.

### Interests & Posts (User + Admin)

- FR-15: A user can set their own list of interests (trimmed, lowercased, de-duplicated).
- FR-16: Any logged-in user can view users grouped by interest. (one User.aggregate() call)
- FR-17: A user can create, update and delete their own posts (title, body); posts are visible to every logged-in user.
- FR-18: Any logged-in user can view all posts of a given user. (one pipeline with $lookup)
- FR-19: Every list endpoint is paginated.

## Technical Requirements

- TR-1: Node.js 22 + TypeScript (strict).
- TR-2: Node.js + TypeScript with Express (v5), written from scratch (no framework, no templates).
- TR-3: MongoDB Atlas with Mongoose (separate `notes_dev` and `notes_prod` databases, least-privilege DB user).
- TR-4: JWT authentication; bcrypt password hashing.
- TR-5: All indexes declared with `schema.index()`.
- TR-6: Scenario 1 = one `aggregate()` call; Scenario 2 = one pipeline with `$lookup`.
- TR-7: Input validation with zod.
- TR-8: OpenAPI docs via Swagger UI at `/docs`.
- TR-9: Transactional emails via SMTP (Nodemailer + Gmail App Password); provider is configuration-only.
- TR-10: Frontend: React (Vite) on Vercel.
- TR-11: Backend: Docker (multi-stage, non-root) on AWS EC2 (us-east-1, same region as Atlas).
- TR-12: Nginx reverse proxy on the host with HTTPS (Let's Encrypt, auto-renewal) and HTTP/2.
- TR-13: GitHub Actions CI: lint, format check, type check, build, Docker image build (tests added later).
- TR-14: GitHub Actions CD: build image → push to GHCR → deploy to EC2 → health check. (planned)
- TR-15: Jest unit tests; Supertest + mongodb-memory-server integration tests.
- TR-16: All config via env variables, validated at startup.

## Non-Functional Requirements

- NFR-1 (Security): Passwords hashed with bcrypt; hash never returned.
- NFR-2 (Security): JWT with expiry and pinned algorithm; separate secrets for access, verification and invite tokens; no secrets in the repo or image.
- NFR-3 (Security): Authorization enforced on the server.
- NFR-4 (Security): All input validated; invalid requests rejected with 400.
- NFR-5 (Security): CORS limited to the frontend; secure headers; per-IP rate limits (100 req/min on the API, 10 req/min on auth; 429 on excess).
- NFR-6 (Security): Verification and invite links are signed and expire.
- NFR-7 (Security): Server exposes only ports 22 (key-only SSH), 80 and 443; the API port is not public; database accepts only allowlisted IPs.
- NFR-8 (Efficiency): No unnecessary indexes.
- NFR-9 (Performance): Every list, GET and aggregation query uses an index.
- NFR-10 (Performance): Lean reads, projections and capped page size.
- NFR-11 (Reliability): Consistent error responses `{ statusCode, message, requestId }`; no stack traces in production.
- NFR-12 (Reliability): API auto-restarts on crash or reboot.
- NFR-13 (Data integrity): Deleting a user leaves no orphaned data.
- NFR-14 (Availability): Health check endpoint.
- NFR-15 (Maintainability): Feature-based modules; clear commit history.
- NFR-16 (Portability): Runs locally with one command (Docker Compose).
- NFR-17 (Performance): Authenticated reads use `Cache-Control: private, no-cache` with ETags (304 when unchanged); everything else is `no-store`; reads send `Vary: Authorization`.
- NFR-18 (Observability): Every request gets an `X-Request-Id` (incoming or generated), returned in the response and included in logs and error bodies; structured JSON request logs.

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
- EXT-6: Cursor-based pagination as a documented alternative.
- EXT-7: Optimistic concurrency on updates via `If-Match` (412 on conflict).
- EXT-8: DDoS hardening — Nginx `limit_req` / `limit_conn` + timeouts; edge WAF/CDN for production.
- EXT-9: Elastic IP and AWS SSM Parameter Store for production secrets.