# Agent guides (pick one)

Attach **one** playbook to the agent (not both):

- Client (React): `agents.client.md`
- Backend (BFF/Node): `agents.server.md`

Tell the agent the target path + expected behavior.

## Running tests without watch mode (Vitest)

For any `pnpm run` script that executes `vitest`, append `--run --reporter=verbose`.

## Test env conventions

Set default or shared test environment variables in `src/testing/setup.ts`, not inside individual test files.

## Drizzle generated files

Files in `drizzle/` are generated files and must never be edited directly without user permission.

Only generate them by running the Drizzle commands defined in `package.json`.

