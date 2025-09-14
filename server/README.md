Gym Fonty — Backend API (Express + Prisma + PostgreSQL)

Setup

1. Create a .env file in server/ based on .env.example
2. Run: npm install
3. Start PostgreSQL via Docker: `docker compose up -d`
4. Push schema: `npm run prisma:push`
5. Seed data: `npm run seed`
6. Start API: `npm run dev`

Scripts

- dev: tsx watch src/index.ts
- prisma:push: sync schema to DB
- prisma:migrate: create migrations
- prisma:studio: open Prisma Studio

Endpoints (MVP)

- GET /health
- GET /api/products
- GET /api/services
- GET /api/events

Next steps

- Implement auth (register/login, JWT) and user dashboard endpoints
- Implement orders and Stripe checkout webhook
- Add rate limiting and better validation

OAuth setup

- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
- APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (PEM single-line with \n)
- BACKEND_BASE_URL (e.g. http://localhost:4000)
- FRONTEND_ORIGIN (e.g. http://localhost:3000)

Callbacks (local dev)

- Google: http://localhost:4000/auth/google/callback
- Facebook: http://localhost:4000/auth/facebook/callback
- Apple: http://localhost:4000/auth/apple/callback

The server redirects to FRONTEND_ORIGIN/account?token=... on success.

