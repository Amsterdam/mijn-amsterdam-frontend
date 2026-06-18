# Agent guide: useBffApi hooks API folder

## Stubbing rule for this folder

Only for tests that validate `useBffApi` behavior:

- For these tests `fetch` is allowed to be mocked directly over using `bffApi`/`nock` routes.
- Prefer `vi.stubGlobal('fetch', vi.fn().mockResolvedValue(...))`.
- Use `vi.unstubAllGlobals()` in cleanup for these tests.

Outside this folder, follow the client playbook
