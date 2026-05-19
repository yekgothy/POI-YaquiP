# Supabase setup for backend

## 1) Create project in Supabase

1. Create a new project in https://supabase.com/dashboard.
2. Open Project Settings > API.
3. Copy:
   - Project URL
   - Secret key (sb_secret_...)

## 2) Configure environment variables

Edit backend/.env and set:

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret-key
JWT_SECRET=change-this-in-production
CLIENT_URL=http://localhost:5173
PORT=4000
SUPABASE_CHAT_BUCKET=chat-media
SUPABASE_AVATAR_BUCKET=avatars

If your project still uses legacy keys, SUPABASE_SERVICE_ROLE_KEY is also supported.

## 3) Create schema and base data

1. Open SQL Editor in Supabase.
2. Run backend/supabase/schema.sql.
3. Run backend/supabase/seed.sql.

Running schema.sql now also creates Storage buckets used by uploads:
- chat-media (up to 50MB)
- avatars (up to 5MB)

## 4) Run backend

In backend folder:

npm install
npm start

If setup is correct, server should print:
- Supabase connected
- Channels seeded
- Server running on http://localhost:4000

## 5) API compatibility

Backend still returns Mongo-style keys used by frontend:
- _id
- createdAt
- updatedAt

So frontend does not need a migration for this change.
