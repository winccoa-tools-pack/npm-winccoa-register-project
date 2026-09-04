---
---
Register WinCC OA projects and project configs (npm helper)
---


# npm-winccoa-register-project

Lightweight helper to write WinCC OA project config files and register a project programmatically.

This repository provides a small Node.js CLI used in CI and local developer workflows to:

- Create a project `config` file.
- Attempt programmatic registration of the project via `@winccoa-tools-pack/npm-winccoa-core` when available.
- Exit with meaningful codes so CI can treat `0` as success and non-zero as failure.

See the `devTools/npm-winccoa-register` package for the CLI implementation.

## Quick Start

Install locally (recommended for CI):

```powershell
npm ci
node devTools/npm-winccoa-register/index.js --project-path /opt/ws/OaDevTools --runnable false
```

Or use `npx` when published:

```powershell
npx @winccoa-tools-pack/npm-winccoa-register-project --project-path . --runnable false
```

## Usage

Common flows:

- CI job: call the CLI to ensure a `config` file is present and the project is registered before running `WCCOActrl`.
- Local testing: run the CLI to prepare a temporary runner directory for quick manual checks.

### Exit codes

- `0` — Success (config written and registration attempted; WCCOActrl exit code should be used for final test outcome).
- Non-zero — Failure (see CLI stderr for details).

## Developer notes

- The CLI prefers programmatic registration via `@winccoa-tools-pack/npm-winccoa-core` when present in `node_modules`.
- If the core package is not available, the CLI will still write the runner `config` file so `WCCOActrl` can be started by CI.

## Contributing

Small, focused contributions welcome. Open issues describing the desired behavior and include reproduction steps.

---

Made with ❤️ for and by the WinCC OA community
