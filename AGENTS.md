# Answering machine
This is a simple project that answers questions with local models, but with an emphasis on tool usage.

## Behavior
- Search, webfetch, and context7 are used before any major change. No assumptions are made without referencing previous docs.
- The project is typechecked, linted, and formatted after *every* change.

## Coding
- **Typescript** is used and is mandatory. The `any` type  is considered an error.

## Tooling
- **Deno** is used because of its sandboxing and safety. No other tools (i.e. bun, npm, pnpm, etc) are used under any condition.
