# ADR Format

ADRs live in `docs/adr/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc.

Create the `docs/adr/` directory lazily — only when the first ADR is needed.

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

That's it. An ADR can be a single paragraph. The value is in recording *that* a decision was made and *why* — not in filling out sections.

## Optional sections

Only include these when they add genuine value. Most ADRs won't need them.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`) — useful when decisions are revisited
- **Considered Options** — only when the rejected alternatives are worth remembering
- **Consequences** — only when non-obvious downstream effects need to be called out

## Numbering

Scan `docs/adr/` for the highest existing number and increment by one.

## When to offer an ADR

All three of these must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it — you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** "This is a monorepo. Persistence is mostly left to other municipal and governmental source APIs. Our own persistence layer is a Postgres DB."
- **Integration patterns between contexts.** "The frontend consumes BFF domain endpoints; the BFF aggregates/normalizes municipal source APIs and can pass through OIDC bearer tokens when required."
- **Technology choices that carry lock-in.** "Authentication is built around DigiD/eHerkenning (OIDC), and runtime feature toggles come from Azure App Configuration."
- **Boundary and scope decisions.** "`src/universal` contains only code that can run in both browser and Node; UI concerns stay in `src/client`, and I/O/integration concerns stay in `src/server`." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "The thema model is intentionally split into `*-thema-config.ts` (domain/static config) and `*-render-config.tsx` (React composition) so server-side code can reuse the domain config without pulling in React." Anything where a reasonable reader would assume the opposite. These stop the next engineer from "fixing" something that was deliberate.
- **Constraints not visible in the code.** "We can't use X because of compliance requirements." "Response times must be under 30000ms because of timeouts."
- **Rejected alternatives when the rejection is non-obvious.** If you considered centralizing all traffic through the BFF and still kept specific direct integrations for explicit reasons, record that so the trade-off is not considered again later.
