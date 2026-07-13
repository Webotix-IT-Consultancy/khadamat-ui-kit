# @khadamat/ui-kit

Shared UI components, hooks, Zustand stores, utils and i18n scaffolding used by
both `khadamat-customer-portal` and `khadamat-admin-portal`.

## What this is

This package ships **TypeScript/TSX source directly** — there is no build
step. Both consuming apps are Vite projects, and Vite's esbuild-based pipeline
transpiles TS/JSX/CSS from `node_modules` natively, so shipping source avoids
the risk of a bundler mis-handling this package's CSS and image imports (this
was a deliberate choice over a `tsup`-built dist — see the migration notes in
the `Khadamat_Wallet` repo's `CLAUDE.md` for the reasoning). This is an
internal package for these two Vite/React apps, not intended for wider
distribution.

## Usage

Import components by their existing deep path, exactly as they were imported
inside the original monorepo — just swap the `@/` alias prefix for the
package name:

```tsx
// before (inside the old monorepo)
import Button from '@/components/Button/Button';

// after
import Button from '@khadamat/ui-kit/components/Button/Button';
```

Cross-cutting pieces (i18n factory, toast context, stores, the `cn` helper,
table/receipt export utils) are also re-exported from the package root:

```tsx
import { createAppI18n, ToastProvider, useToast, useLanguageStore } from '@khadamat/ui-kit';
```

### i18n

Each portal owns its own i18next instance. Call `createAppI18n` with your
portal's own namespace resources; the shared `common` and `auth` namespaces
are baked in automatically:

```ts
// src/i18n.ts in a consuming portal
import { createAppI18n } from '@khadamat/ui-kit';
import enDashboard from './locales/en/dashboard.json';
import arDashboard from './locales/ar/dashboard.json';

const i18n = createAppI18n({
  en: { dashboard: enDashboard },
  ar: { dashboard: arDashboard },
});

export default i18n;
```

## Peer dependencies

React, react-router-dom, react-i18next/i18next, zustand, MUI, Radix, and a
handful of small utility libraries are declared as `peerDependencies` — the
consuming app controls the actual installed versions. See `package.json`.

## Installing

No npm registry involved — consuming portals depend on this repo directly via
a git URL pinned to a tag:

```json
{
  "dependencies": {
    "@khadamat/ui-kit": "github:Webotix-IT-Consultancy/khadamat-ui-kit#v0.1.0"
  }
}
```

npm clones the repo at that ref and links it in as a normal `node_modules`
package — no `.npmrc`, no PAT, no registry auth, no CI publish step needed in
either portal.

## Releasing a new version

1. Make your change, commit, push to `main`.
2. Bump `version` in `package.json` (semver, by convention — nothing enforces
   it since there's no registry).
3. Tag the commit and push the tag:
   ```bash
   git tag -a v0.2.0 -m "Describe what changed"
   git push origin v0.2.0
   ```
4. In each portal repo that should pick it up:
   ```bash
   npm install github:Webotix-IT-Consultancy/khadamat-ui-kit#v0.2.0
   ```
   This updates the pinned ref in that portal's `package.json`/lockfile.

Portals can stay on an older tag indefinitely — there's no forced upgrade,
each one just points at whatever ref it was last bumped to.
