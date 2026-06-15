# Agent playbook: Backend (BFF/Node)

Scope: Node-side code: `src/server/**`, `src/universal/**`, `src/jobs/**`, `src/scripts/**`, `src/mocks-server/**`.

Tooling: Vitest (usually `node` env). Global setup: `src/testing/setup.ts`.

## Code map (backend)

- BFF entry: `src/server/app-start.ts` → `src/server/app.ts` (Express).
- Routes live in `src/server/routing/**`; auth in `src/server/auth/**`.- Upstream integrations + orchestration: `src/server/services/**`.
- Shared helpers/types/config used by both FE and BFF: `src/universal/**`.
- Dev mock server: `src/mocks-server/**` (started via `pnpm mock-server`).
- Jobs/scripts: `src/jobs/**`, `src/scripts/**` (keep imports side-effect free).
- Service domains live in `src/server/services/**`.

## Service structure best practice (JZD pattern)

- Per service domain, follow the shape: `*-router.ts`, `*-route-handlers.ts`, `*-service-config.ts`, and focused `*-api-service.ts` files.
- Treat `<service>-service-config.ts` as the single source of truth for a service domain.
- Keep route path constants in `routes` (grouped by exposure, e.g. `private`, `protected`, `public`).
- Keep upstream API configuration constants in the same config file whenever they are service-domain specific.

### Responsibilities split

- `*-router.ts`: route registration, middleware wiring, and handler binding only. Import route paths/roles/toggles from `*-service-config.ts`.
- `*-route-handlers.ts`: request validation + orchestration. Import validators and config values from `*-service-config.ts`; avoid hardcoded paths, roles, and toggle keys.
- `*-api-service.ts`: upstream calls and response mapping. Consume domain config from `*-service-config.ts`; avoid duplicating endpoint/auth configuration literals.

### Test impact

- Import route constants from `*-service-config.ts` in router tests to prevent string drift.
- When adding/changing a route or domain toggle, update `*-service-config.ts` first, then wire router/handlers.

## Hard rules

- Run commands from the repo root. Do **not** `cd` in command suggestions.
- Real network is blocked (`nock.disableNetConnect()`); stub all HTTP.
- Don’t test logging output.

## Commands

- Build + serve BFF build: `pnpm bff-api:build && BFF_SKIP_APPCONFIG=true pnpm bff-api:serve-build`
- Lint (shared): `pnpm lint`

- Run backend tests: `pnpm bff-api:test`
- Run shared tests: `pnpm bff-api:test:dirs src/server src/universal`
- Iterate specific test: `pnpm bff-api:test:dirs src/server/<folder>`

## Where tests live + naming

- Co-locate tests near the code under `src/server/**` and `src/universal/**`.
- Use `*.test.ts`.
- Match the closest existing sibling test file’s style.

## Stubbing

- Upstream HTTP: `remoteApi` from `src/testing/utils.ts`.
- BFF-base HTTP: `bffApi` from `src/testing/utils.ts`.

- Varying querystrings: `remoteApi.get((uri) => uri.includes('...')).reply(...)`.
- Repeated calls: `.times(n)`.

## Handler tests

- Use `RequestMock`/`ResponseMock` (and `ResponseAuthenticatedMock`) from `src/testing/utils.ts`.
- OIDC-aware requests: `getReqMockWithOidc(...)`.

## Reusing mock data

- Prefer importing realistic fixtures from `mocks/fixtures/*.json`.
- It’s OK to add `test-fixtures/` next to a service test when the dataset is only relevant there (there are existing examples).

## Test data boundaries

- Never import backend test data from `src/mocks-server/fixtures/**`.
- Keep mock-server data and test data separate.
- Backend tests in separate directories must not share fixture files.

## Fixtures

- Default to inline test data in the test file.
- Use local `test-fixtures/` only when fixture data is large:
	- A single fixture is more than 20 lines.
	- Total fixture data in a test file would exceed 60 lines.
- Share a local fixture within one directory only when the same large payload is needed by 3 or more tests in that directory.

## Feature toggles

- Default is “enabled”. To test “off”: `vi.resetModules()` → `vi.doMock(...)` → import after.


## Backend test recipes

Two common approaches:

1) **Mock internal dependencies** using `vi.spyOn(depModule, 'fn').mockResolvedValue(...)`.
2) **Exercise real code with upstream HTTP stubs** using `remoteApi`.

Prefer the simplest approach that proves the behavior.

## Node/ESM + side effects

- This repo is ESM (`"type": "module"`). Avoid `require()` patterns.
- Avoid side effects at module load in `src/jobs/**` and `src/scripts/**`; guard runnable entrypoints (e.g. `import.meta.main`) so importing a module from a test doesn’t start servers or make HTTP calls.


## Auth/time helpers (if needed)

- Auth: `getAuthProfileAndToken()` from `src/testing/utils.ts`.
- Time: `mockdate` (`MockDate.set(...)`).


## Definition of done (backend)

- New/updated `*.test.ts` near the code.
- All upstream HTTP calls are stubbed with `remoteApi`/`bffApi`.
- Assertions verify `status/content` shapes and key fields (avoid overly broad snapshots unless already the pattern).
- Run the smallest relevant command (`pnpm bff-api:test:dirs <folder>`) and fix failures caused by the new test.
- If routes/toggles/api config changed, `*-service-config.ts` is updated as the canonical source.

