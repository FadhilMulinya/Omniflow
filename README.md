# Onhandl

**Agent Orchestration OS.** The control layer for autonomous DeFi where agents think, execute, and scale.

---

## Tech Stack

| Layer        | Technology                                                             |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | Next.js 15, React 19, React Flow, TailwindCSS, Radix UI, Framer Motion |
| Backend      | Fastify 4, Node.js, TypeScript                                         |
| Database     | MongoDB Atlas (Mongoose ODM)                                           |
| Auth         | JWT (`@fastify/jwt`), session cookies                                  |
| AI Providers | Google Gemini, OpenAI (+ proxy), Ollama (`qwen2.5:3b` default), Anthropic         |
| Blockchain   | CKB L1 , Stellar, EVM                                                  |
| Monorepo     | pnpm workspaces (`client/`, `server/`)                                 |

---

## Quick Start (without Docker)

### Prerequisites

- Node.js v18+
- pnpm (`npm install -g pnpm`)
- MongoDB Atlas instance or local MongoDB

### 1. Install dependencies

```bash
git clone https://github.com/FadhilMulinya/Onhandl.git
cd Onhandl
pnpm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Minimum required values:

## Environment Variables

| Variable                | Required        | Description                                           |
| ----------------------- | --------------- | ----------------------------------------------------- |
| `MONGO_URI`             | Yes             | MongoDB connection string                             |
| `JWT_SECRET`            | Yes             | JWT signing secret                                    |
| `DEFAULT_AI_PROVIDER`   | No              | `ollama` (default), `gemini`, or `openai`             |
| `SMTP_HOST`             | For OTP emails  | `smtp.gmail.com` or `smtp.resend.com`                 |
| `SMTP_PORT`             | For OTP emails  | `587`                                                 |
| `SMTP_USER`             | For OTP emails  | SMTP username                                         |
| `SMTP_PASS`             | For OTP emails  | SMTP password / app password                          |
| `FIBER_NODE_URL`        | Blockchain      | Fiber node RPC URL (default: `http://localhost:8227`) |
| `FIBER_AUTH_TOKEN`      | Blockchain      | Biscuit auth token for Fiber RPC                      |

`ALLOWED_ORIGINS`, `APP_URL`, `API_URL` are injected automatically by the compose files. Do not set them in `.env` unless overriding.

### 3. Start dev servers

```bash
pnpm dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |

---

## Docker

Two compose files are included:

| File                      | Purpose                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| `docker-compose.yml`      | Local dev — source mounted as volumes, hot-reload                      |
| `docker-compose.prod.yml` | Production (Contabo VPS) — compiled images, Nginx, onhandl.com domains |

### Local Dev

```bash
cp server/.env.example server/.env
# fill in server/.env

docker compose up --build
```

Or use the helper command:

```bash
pnpm docker:dev
```

Source code is mounted as volumes — edit any file and it hot reloads automatically. No local Node.js install needed.

```bash
docker compose logs -f               # all services
docker compose logs -f server        # server only
docker compose down                  # stop
docker compose down -v               # stop + delete MongoDB volume
```


---