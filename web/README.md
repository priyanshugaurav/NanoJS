# NanoJS Web Studio & Download Center

Web playground, execution inspector, and binary distribution portal for NanoJS.

- **Live URL:** [https://nanojs.priyanshugaurav.space](https://nanojs.priyanshugaurav.space)

---

## Features

- **Interactive Playground**: Write and run JavaScript code directly in the browser.
- **Dual Execution Engine**:
  - **C++ Native Backend**: When run locally (`npm run dev`), executes code through the compiled C++ `nanojs` binary via `/api/run`.
  - **Client-Side Sandbox**: Fallback client-side AST interpreter for static hosting environments (e.g. Vercel).
- **Engine Diagnostics**: Live status monitor running all 19 language test suites directly against the C++ engine via `/api/tests`.
- **Download Center**: Prebuilt binaries for macOS (Universal: Apple Silicon & Intel), Windows (x64), and Linux (x64), with one-line install scripts.
- **AST & Scope Inspector**: Visualizes tokens, AST nodes, lexical scopes, and heap memory allocations.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- (Optional, for native backend) Compiled `nanojs` binary in the parent directory (`../nanojs`)

### Development Server

```bash
cd web
npm install
npm run dev
```

The dev server starts at `http://localhost:5173/`. The Vite backend plugin automatically hooks up `/api/run`, `/api/tests`, and `/api/info` to the C++ binary.

### Production Build

```bash
cd web
npm run build
```

Build outputs are generated in `web/dist/`.

---

## Deployment (Vercel)

The web client is configured for deployment to Vercel via `vercel.json` in both the project root and `web/` folder:

- **Framework**: Vite
- **Output Directory**: `dist` (or `web/dist` from root)
- **Domain**: `nanojs.priyanshugaurav.space`

---

## Project Structure

```
web/
├── public/
│   ├── downloads/       # Prebuilt binary archives and shell install scripts
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── engine/
│   │   ├── inspector.js # Execution coordinator & scope profiler
│   │   ├── parser.js    # Client-side fallback parser
│   │   └── presets.js   # Built-in code examples
│   ├── App.jsx          # Main application component (Home, Downloads, Playground)
│   ├── App.css          # Design system & dark/light theme tokens
│   └── main.jsx
├── package.json
└── vite.config.js       # Vite config + native C++ runner plugin
```
