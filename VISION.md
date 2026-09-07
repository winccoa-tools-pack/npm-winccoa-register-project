# VISION — winccoa-pa-register

Provide a minimal, reliable, and well-documented Node.js helper that:

- Writes WinCC OA project `config` files in a reproducible way suitable for CI and local development.
- Attempts programmatic registration of projects using `@winccoa-tools-pack/npm-winccoa-core` where available.
- Produces clear exit codes so CI workflows can treat `0` as success and non-zero as failure.

Scope and maintenance

- Keep the tool lean and dependency-light; prefer composition (small npm packages) over a monolith.
- Prioritize CI reliability and deterministic behavior across self-hosted Windows runners.
- Accept small, focused PRs that improve robustness, docs, or CI integration.

Audience: WinCC OA automation engineers who need a reproducible project registration step in CI.

The goal is to provide programitical helper to register WinCC OA projects in CI/CD (or AI agents).
Please note that this tool will NOT create the WinCC OA projects!

---

Made with ❤️ for and by the WinCC OA community
