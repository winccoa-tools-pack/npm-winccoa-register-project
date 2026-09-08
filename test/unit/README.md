# Unit tests — winccoa-pa-register

## CLI usage (unit tests)

- **Compile:** `npm run compile`
- **Run CLI in unit tests:** include `--simulation-rc 0` to prevent attempts to register/unregister WinCC OA projects on developer machines by simulating a successful return code.

- **Simulate installed WinCC OA versions:** add `--simulated-winccoa-versions 3.21` (comma-separated) when tests need to exercise version-detection logic without a real WinCC OA installation.

Unit tests can be executed without a real WinCC OA installation by combining `--simulation-rc` and `--simulated-winccoa-versions` as needed.
