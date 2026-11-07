user
  - _id (ObjectId)
  - name (2	- 60 chars)
  - email (unique, lowercase , max 254 chars)
  - password (8–72 chars input, bcrypt hash)
  - role (enum ADMIN | USER) (default USER)
  - emailVerified (default false)
  - interests (string[], ['chess', 'reading'], max 20(abuse Protection)) (each interest 1	- 50 chars) (trimmed, lowercased, de-duplicated)
  - createdAt (auto generate)
  - updatedAt (auto generate)
  - Indexes: { email: 1 } unique · { interests: 1 }

Note (Owner ALl + Admin View Only)
  - _id
  - owner ObjectId -> user._id (cascade delete with user)
  - title (1–200 chars)
  - content (0–10,000 chars)
  - createdAt (auto generate)
  - updatedAt (auto generate)
  - Indexes: { owner: 1, _id: -1 }

Post  (Public Only Need Authentication)
  - _id
  - author ObjectId → user._id (cascade delete with user)
  - title (1–200 chars)
  - body string (1–10,000 chars)
  - createdAt (auto generate)
  - updatedAt (auto generate)
  - Indexes: { author: 1, _id: -1 }
