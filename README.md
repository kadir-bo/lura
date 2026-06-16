# Lura

Multi-model AI chat application built with Next.js 16, Firebase, and the NVIDIA NIM API. Organize conversations into projects, manage long-term memory, and choose from a dynamically loaded catalog of LLM models.

## Features

- **Chat** — streaming responses, attachments, regenerate/edit messages, version history
- **Projects** — group related conversations, shared project memory and context
- **Dynamic models** — model catalog is fetched live from the NVIDIA NIM API and grouped by provider/company, with benchmarked "Fast" models flagged
- **Settings** — profile, instructions, enabled models, default model, custom OpenAI-compatible providers
- **Archive** — archive/unarchive chats and projects without deleting them
- **Auth** — email/password via Firebase Authentication

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [Firebase](https://firebase.google.com) (Auth + Firestore)
- [NVIDIA NIM](https://build.nvidia.com) (OpenAI-compatible inference API)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your own values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID (optional) |
| `NVIDIA_API_KEY` | Server-only key for the NVIDIA NIM API ([build.nvidia.com](https://build.nvidia.com)) — never exposed to the client |

### 3. Deploy Firestore security rules

Rules are owner-scoped (a user can only read/write their own data) and live in [`firestore.rules`](firestore.rules):

```bash
npx firebase login
npx firebase deploy --only firestore:rules --project <your-firebase-project-id>
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── (public)/        Landing page
├── (auth)/           Sign in, sign up, reset password
├── (chat)/           Chat, chats list, projects, archive, settings
└── api/              Chat completion + model listing routes (server-side)
components/
├── chat/             Chat interface, conversation view, model picker
├── modal/             Settings modal + section components, confirmation modals
├── shell/             Page shells/layout
└── ui/                Shared primitives (toggle, searchbar, icon, ...)
context/               React context providers (auth, database, chat, modal, dropdown)
hooks/                  Reusable hooks (selection, paste, file select, ...)
lib/                    Firebase config, API helpers, prompts, model catalog
firestore.rules         Firestore security rules (owner-scoped)
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
