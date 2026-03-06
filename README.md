# EVM Voting System — Mobile Electronic Voting Machine

A complete mobile-based EVM web application for school and college elections.

## Tech Stack
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v3** + **shadcn/ui**
- **React Router DOM v6**
- **Sonner** (toasts), **JSZip** (export), **Lucide React** (icons)

## Getting Started
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Roles
| Role | Access | Login |
|------|--------|-------|
| Election Officer | Admin panel — create elections, manage candidates/voters, view results | ID: `admin` / Pass: `0000` (changeable in Settings) |
| Polling Officer | Teacher portal — PIN-locked EVM per class | Election ID + Control PIN |
| Student | Voter screen — enter Student ID and cast vote | Student ID only |

## Project Structure
```
src/
├── App.tsx
├── index.css
├── main.tsx
├── vite-env.d.ts
├── types/index.ts
├── lib/
│   ├── storage.ts
│   ├── utils.ts
│   └── projectExport.ts
├── hooks/
│   ├── useTheme.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── AdminLoginPage.tsx
│   ├── OfficerPage.tsx
│   ├── TeacherPage.tsx
│   ├── EVMPage.tsx
│   ├── ResultsPage.tsx
│   └── NotFound.tsx
└── components/
    ├── features/
    │   ├── CandidateForm.tsx
    │   ├── ElectionSetup.tsx
    │   ├── PinPad.tsx
    │   ├── ThemeToggle.tsx
    │   ├── VictoryShareModal.tsx
    │   └── ExportModal.tsx
    └── ui/           ← shadcn/ui (auto-installed via: npx shadcn@latest add --all)
```

## Reinstalling shadcn/ui Components
After `npm install`, run:
```bash
npx shadcn@latest add --all
```
This installs all UI components into `src/components/ui/`.

## Security Features
- One vote per Student ID (enforced client-side)
- Anonymous vote recording (Student ID not linked to choice)
- PIN-protected EVM mode (auto-locks after each vote)
- Admin credentials changeable from Settings panel

## Default Credentials
- Admin ID: `admin`
- Admin Password: `0000`
