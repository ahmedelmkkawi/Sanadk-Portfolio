# Sanadak Portfolio API

Node.js backend built with **Express**, **Mongoose**, and **JWT** authentication.

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Dev server with hot reload (`ts-node-dev`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled `dist/server.js` |

## Environment

Copy `.env.example` to `.env` and set:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URLS` (comma-separated CORS origins)
- `CLOUDINARY_*` (optional; falls back to inline data URIs)

## API base path

All routes are under `/api` (e.g. `GET /api/projects`, `POST /api/auth/login`).

See root `README.md` and `DEPLOYMENT.md` for full setup and deployment.
