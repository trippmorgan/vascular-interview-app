# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- JavaScript (JSX/React) - All UI components and application logic
- CSS - Styling via Tailwind CSS
- HTML5 - Document structure with PWA metadata

## Runtime

**Environment:**
- Node.js (LTS recommended, based on package.json)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present and committed)

## Frameworks

**Core:**
- React 19.2.0 - UI framework for component-based architecture
- React DOM 19.2.0 - React DOM rendering

**Build/Dev:**
- Vite 7.3.1 - Build tool and dev server
- @vitejs/plugin-react 5.1.1 - React fast refresh plugin for Vite

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.18 - Tailwind CSS PostCSS plugin
- PostCSS 8.5.6 - CSS transformation tool
- autoprefixer 10.4.24 - Vendor prefix automation

**Linting/Code Quality:**
- ESLint 9.39.1 - JavaScript linter
- @eslint/js 9.39.1 - ESLint core JavaScript config
- eslint-plugin-react-hooks 7.0.1 - React Hooks rules enforcement
- eslint-plugin-react-refresh 0.4.24 - React Fast Refresh rules

**Deployment:**
- gh-pages 6.3.0 - GitHub Pages deployment tool

## Key Dependencies

**Critical:**
- React (core UI framework) - Renders all UI components and manages state
- Vite (build tool) - Fast development and production builds

**Infrastructure:**
- globals 16.5.0 - Global variable definitions for ESLint
- @types/react 19.2.7 - TypeScript type definitions (dev only)
- @types/react-dom 19.2.3 - React DOM TypeScript definitions (dev only)

## Configuration

**Environment:**
- No `.env` files detected - Configuration is hardcoded in source
- Deployment via GitHub Pages

**Build:**
- `vite.config.js` - Vite configuration with React plugin, base path set to `/vascular-interview-app/`
- `tailwind.config.js` - Tailwind CSS configuration with content paths
- `postcss.config.js` - PostCSS plugin configuration for Tailwind
- `eslint.config.js` - ESLint configuration for JSX/React projects

**PWA/Service Worker:**
- `public/manifest.json` - PWA manifest for installable app
- `public/sw.js` - Service Worker for offline caching and PWA functionality

## Platform Requirements

**Development:**
- Node.js (v18+ recommended based on modern npm/package-lock)
- npm (v9+ recommended)
- Git (for deployment via gh-pages)

**Production:**
- Deployment target: GitHub Pages
- Static hosting (no server-side runtime required)
- Browser with ES2020 JavaScript support (modern browsers)
- Service Worker support (PWA features)

## Development Scripts

Available npm scripts (from `package.json`):
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages
- `npm run predeploy` - Pre-deployment build step

---

*Stack analysis: 2026-03-26*
