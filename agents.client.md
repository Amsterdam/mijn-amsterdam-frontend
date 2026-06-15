# Agent playbook: Client (React)

Scope: `src/client/**` (components/pages/hooks). Shared code may live in `src/universal/**`.

Tooling: Vitest + Testing Library, `happy-dom`.

## Code map (client)

- App entry: `src/index.tsx` → `src/client/App.tsx`.
- Routing: `src/client/App.routes.tsx`.
- Most UI lives in `src/client/pages/**` and `src/client/components/**`.
- Styling: SCSS + SCSS modules (`*.module.scss`).
- Frontend env vars are exposed via Vite with `REACT_APP_` prefix (`import.meta.env.REACT_APP_*`).

## Hard rules

- Run commands from the repo root. Do **not** `cd` in command suggestions.
- Global setup is `src/testing/setup.ts`; real network is blocked (`nock.disableNetConnect()`).
- Stub all BFF HTTP with `bffApi` from `src/testing/utils.ts`.

## Commands

- Lint: `pnpm lint`
- Build FE: `pnpm build`
- `pnpm test` (client)
- `pnpm test:dirs src/client`
- Iterate: `pnpm test:dirs src/client/<subfolder>`

## Conventions

- Co-locate tests near the code under `src/client/**`.
- `*.test.tsx` for React, `*.test.ts` for pure helpers.
- Prefer accessible assertions (`getByRole`, `findByRole`, `findByText`).
- Match the closest existing sibling test file’s style.

## Stubbing
Use `bffApi`/`remoteApi` (`nock`) from `src/testing/utils.ts` for client HTTP stubbing, e.g. `bffApi.get('/services/...').reply(...)`.

- Keep stubs close to each test and cover every expected request path.
- Reuse existing route patterns from nearby tests where possible.

## Fixtures

- Reuse `mocks/fixtures/*.json` when possible; keep new fixtures minimal.

## Feature toggles

- Default is “enabled”. To test “off” use isolated imports:
  - `vi.resetModules()` → `vi.doMock(...)` → `await import(...)`.

## Notes

- `zustand` is globally mocked in test setup (`__mocks__/zustand.ts`) to auto-reset stores between tests.

## SSE hooks (if relevant)

- Use `newEventSourceMock()` from `src/testing/EventSourceMock.ts`.

## Definition of done (client)

- New/updated `*.test.ts(x)` near the code.
- All HTTP calls are stubbed with `bffApi`/`remoteApi` (`nock`); no real network.
- Assertions are stable (roles/text); avoid brittle selectors.
- Run the smallest relevant command (`pnpm test:dirs <folder>`) and fix failures caused by the new test.
