# npm-winccoa-register-project — winccoa-pa-register

## CLI usage

- **Compile:** `npm run compile`
- **Run (example):** `winccoa-pa-register --project-path ./my-project --runnable true --langs en_US.utf8 --wincc-oa-version 3.21`
- **Testing:** include `--simulation-rc=0` to simulate a successful register/unregister return code (integer). Use other integers to simulate failure codes.

You can also run the CLI without linking via `npx winccoa-pa-register --help`.

## Testing changes locally

Follow these steps to test changes on your machine. These examples assume you're in the repository root.

- Install dependencies and build:

```bash
npm ci
npm run compile
```

- Run unit tests (compile-first):

```bash
npm run test:unit
```

- Run the compiled CLI (recommended for tests) against the included runnable fixture without registering to the system:

```bash
node dist/src/cli.js --project-path test/fixtures/projects/runnable --runnable true --langs en_US.utf8 --wincc-oa-version 3.21 --simulation-rc=0
```

- See CLI help (compiled):

```bash
node dist/src/cli.js --help
```

Notes:
- Use `--simulation-rc=0` in local/unit-test runs to avoid attempting to register or unregister WinCC OA projects on your machine and simulate success.
- For CI that runs on real WinCC OA hosts, do not include `--simulation-rc` so programmatic registration executes.

Lightweight helper to write WinCC OA project config files and register a project programmatically.

This repository provides a small Node.js CLI used in CI and local developer workflows to:

- Create a project `config` file.
- Attempt programmatic registration of the project via `@winccoa-tools-pack/npm-winccoa-core` when available.
- Exit with meaningful codes so CI can treat `0` as success and non-zero as failure.

See `src/index.js` for the CLI implementation.

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

Example registering a runnable project with languages:

```powershell
npx @winccoa-tools-pack/npm-winccoa-register-project --project-path C:\Projects\MyOaProject --runnable true --langs de_AT.utf8,en_US.utf8 --wincc-oa-version 3.20
```

## Usage

Common flows:

- CI job: call the CLI to ensure a `config` file is present and the project is registered before running `WCCOActrl`.
- Local testing: run the CLI to prepare a temporary runner directory for quick manual checks.

CLI flags:

- `--project-path <path>`: Full path to the WinCC OA project (required).
- `--runnable [true|false]`: Whether to register a runnable project (default: `true`).
- `--langs <csv|space-separated>`: Languages to configure for runnable projects (e.g. `de_AT.utf8,en_US.utf8`). Required when registering a runnable project.
- `--wincc-oa-version <version>`: Optional WinCC OA version (e.g. `3.20`). When omitted, the CLI will attempt to auto-detect if `@winccoa-tools-pack/npm-winccoa-core` is available and a single WinCC OA installation is present.
- `--unregister`: Unregister the project from the environment instead of registering it.

## Exit codes

- `0` — Success (config written and registration attempted; WCCOActrl exit code should be used for final test outcome).
- Non-zero — Failure (see CLI stderr for details).

## Developer notes

- The CLI prefers programmatic registration via `@winccoa-tools-pack/npm-winccoa-core` when present in `node_modules`.
- If the core package is not available, the CLI will still write the project `config` file so `WCCOActrl` can be started by CI.

## Contributing

Small, focused contributions welcome. Open issues describing the desired behavior and include reproduction steps.

Made with ❤️ for and by the WinCC OA community
