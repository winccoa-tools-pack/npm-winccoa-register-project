# CI + Integration (WinCC OA) — winccoa-pa-register

## CLI usage (CI)

- **Compile step:** `npm run compile` (must produce `dist/` before invoking the CLI)
- **Example invocation:** `winccoa-pa-register --project-path <path> --runnable true --langs en_US.utf8 --wincc-oa-version 3.21`
- **CI tests:** integration jobs that run on WinCC OA hosts should NOT include `--simulation-rc`; unit jobs should include `--simulation-rc=0` to stay isolated.

This repository runs a standard Node/TypeScript CI pipeline on GitHub-hosted runners and (optionally) runs integration tests inside a WinCC OA Docker container.

## Workflows

### CI/CD Pipeline

Workflow: `.github/workflows/ci-cd.yml`

- Triggers:
  - `push` to `main`, `develop`, and `release/**`
  - `pull_request` to `main` and `develop`
- What it does:
  - `npm ci`
  - `npm run lint` + `npm run lint:md`
  - `npm run format:check`
  - matrix tests via `npm run test:unit`

### Integration testing policy

Integration tests that exercise a full WinCC OA installation are not executed
in this repository's CI pipeline. The previous Docker-based `integration-winccoa`
job and the associated repository Docker image are obsolete and have been
removed.

Key points:

- **Where to validate registration/unregistration:** Functional checks for
  registration/unregistration are implemented and validated in the core package
  `@winccoa-tools-pack/npm-winccoa-core` — prefer that package's test harness
  for automated verification.
- **Local integration testing:** For full end-to-end validation (WinCC OA
  host, panels, and GUI interactions), run integration tests locally using a
  supported WinCC OA installation or a provided local integration harness.
- **Docker image:** The repository no longer relies on a WinCC OA Docker image;
  any previous `WINCCOA_IMAGE` configuration can be considered obsolete.

If you need help running integration tests locally, consult the core package's
README or ask for a short runbook describing a minimal local integration setup.

## Troubleshooting

- `npm ci` fails: ensure `package-lock.json` matches `package.json` and commit the updated lockfile.
- Local integration container or host issues: run the integration tooling locally and capture logs for diagnosis.

---

## Quick Links

• [📦 npm package](https://www.npmjs.com/package/@winccoa-tools-pack/npm-winccoa-register-project)

---

<center>Made with ❤️ for and by the WinCC OA community</center>
