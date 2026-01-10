# gyul

> **gyul** (귤) - tangerine in Korean. Just as we peel a tangerine layer by layer to reach its core, gyul lets you peel ideas layer by layer until you reach deep knowledge.

---

## What is gyul?

**gyul** is a visual thinking space where you transform tweets into knowledge trees.

Instead of passively consuming and forgetting, you:

1. Paste an interesting tweet URL
2. Ask questions about the content
3. Receive AI-contextualized answers
4. Branch your thinking in new directions
5. Add your own insights
6. Visualize all the knowledge generated

---

## Why gyul exists?

Interesting tweets often condense profound ideas into 280 characters. The default cycle is: read, think "interesting", like, scroll, **forget**.

gyul breaks this cycle by offering an infinite canvas where the tweet becomes the starting point for cognitive exploration.

---

## Tech Stack

- **Vue 3** + Composition API
- **TypeScript**
- **Vue Flow** (interactive canvas)
- **Vite** (bundler)
- **Playwright** (e2e tests)
- **Vitest** (unit tests)
- **Storybook** (component documentation)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Open Storybook
pnpm storybook
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm test` | All tests (unit + e2e) |
| `pnpm test:unit` | Unit tests only |
| `pnpm test:e2e` | E2E tests only |
| `pnpm storybook` | Visual component documentation |

---

## Documentation

Detailed project documentation in [`docs/projeto/`](./docs/projeto/):

- [Product & Philosophy](./docs/projeto/01-PRODUTO-E-FILOSOFIA.md) - Vision, problem/solution, design principles
- [Architecture & Data](./docs/projeto/02-ARQUITETURA-E-DADOS.md) - Stack, components, TypeScript types
- [Design & UX](./docs/projeto/03-DESIGN-E-UX.md) - Design system, user journeys
- [Roadmap & Glossary](./docs/projeto/04-ROADMAP-E-GLOSSARIO.md) - Planned evolution

---

## Status

MVP in development. Integrations (Twitter API, AI) are mocked to validate the canvas experience.
