# SkillShare — Frontend

SkillShare is a peer-to-peer learning marketplace built for the CWRU community. The core idea: students have skills, and other students want to learn them. Instead of paying for external courses, anyone can host a session — a cooking class, a LeetCode prep workshop, a guitar lesson — and other students can browse, enroll, and show up.

Hosts set the topic, time, location, capacity, and price (or make it free). Attendees browse by category or search, enroll with one click, and leave ratings after. The platform also uses AI to help students figure out what they could teach based on their coursework and academic requirements.

**Live:** [skillshare-fe-aoux6.ondigitalocean.app](https://skillshare-fe-aoux6.ondigitalocean.app)

---

## How the App Works

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS + shadcn/ui**.

### Key Pages & Routes

| Route | Component | What it does |
|---|---|---|
| `/` | `landing-page.tsx` | Hero + browse sessions |
| `/sessions` | `browse-sessions-page.tsx` | Filter/search all sessions |
| `/sessions/[sessionId]` | `session-detail-page.tsx` | Enroll, rate, view attendees |
| `/sessions/create` | `create-session-page.tsx` | Host a new session |
| `/profile` | `profile-page.tsx` | View/edit your profile |
| `/users/[userId]` | `user-profile-page.tsx` | Public user profiles |

### Architecture

- **API layer** — auto-generated OpenAPI client (`/api`) wraps all backend calls. Components call typed SDK methods (`SessionsApi`, `EnrollmentsApi`, `RatingsApi`, `UsersApi`) directly.
- **Auth** — JWT stored in `localStorage`, injected into API requests via `context/auth-context.tsx`. Route guards redirect unauthenticated users.
- **UI** — shadcn/ui primitives (`/components/ui`) composed into full-page feature components (`/components`). Dark mode via `next-themes`.

---

## GenAI Features

### 1. CWRU-Smart AI Advisor Bot (`components/ui/ai-brainstormer.tsx`)
A **Generative UI** chat assistant that guides students through hosting a SkillShare session to fulfill academic requirements (e.g., UGER presentation credit). The bot uses a multi-phase conversation state machine: it interprets the user's academic context, maps it to a valid session format, and renders a fully-populated **session draft card as structured UI** inside the chat — not just text. The user can publish the draft directly from the chat without navigating away.

### 2. Web Worker Recommendation Engine (`lib/recommendation.worker.ts`)
A cosine-similarity-style scoring algorithm runs off the main thread via the **Web Workers API** in `browse-sessions-extended.tsx`. It computes a ranked list of top-3 sessions against a user interaction vector (category weights built from past enrollments). Offloading to a worker keeps the UI non-blocking even as the session list scales.

### 3. Cryptographic Ticket Generation (`lib/security.ts`)
Uses the **Web Crypto API** (`SubtleCrypto`) to generate tamper-evident enrollment tickets. Each ticket is a SHA-256 hash of `userId + sessionId + timestamp`, giving every enrollment a verifiable, unforgeable token — no backend round-trip needed for verification on the client side.

---

## Running Locally

**Prerequisites:** Node.js 18+, npm

```bash
git clone https://github.com/Vinlaw3661/skillshare-fe.git
cd skillshare-fe
npm install
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

> The frontend expects a running backend. Set your API base URL in the generated client or via an environment variable if your backend is not on `localhost`.

---

## Running Tests

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

Tests live in `/tests` and use **Jest** + **React Testing Library**.

| Test file | What it covers |
|---|---|
| `recommendation.test.ts` | Scoring algorithm — category ranking, price bias, capacity penalty |
| `security.test.ts` | `generateSecureTicket` — SHA-256 output format, uniqueness, determinism |
| `session-detail.test.tsx` | Rating submission, enrollment state, error handling |
| `ai-brainstormer.test.tsx` | Chat phase transitions, generative UI rendering |
| `browse-sessions.test.tsx` | Filter logic, search, loading/empty states |
| `create-session.test.tsx` / `edit-session.test.tsx` | Form validation, API calls |
| `auth.test.tsx` | Login flow, token storage, redirect behavior |
| `navbar.test.tsx` / `profile.test.tsx` | Rendering and user state |

The recommendation worker is tested in a **node environment** using a mock `self` global, isolating the scoring logic without a browser runtime.

---

## Use of AI in Development

We used AI tools (primarily Claude Code) throughout the development process — not just as a feature inside the app, but as an active part of how we built it.

**Planning & architecture** — We used AI agents to help think through component structure, API integration patterns, and how to wire auth state across the app before writing a line of code.

**Code generation** — Several components and the recommendation worker were drafted with AI assistance and then reviewed and refined. The generative UI chat flow (`ai-brainstormer.tsx`) was designed and scaffolded collaboratively with Claude.

**Testing** — AI was used to evaluate our initial test cases for coverage gaps and then expand them. For example, the recommendation worker tests were reviewed by AI to add edge cases (full sessions, free vs. paid ranking, category weight ties) that we hadn't initially considered. Same for the security and session-detail test suites.

We treated AI as a senior pair programmer — it proposes, we review, we own the result.
