# Tests — winccoa-pa-register

## CLI usage (tests)

- **Compile before running tests:** `npm run compile`
-- **Run CLI in tests:** use `--simulation-rc 0` to simulate a successful register/unregister return code and avoid touching the system.
-- **Simulate installed WinCC OA versions:** pass `--simulated-winccoa-versions 3.21` (comma-separated) to emulate host-installed versions when running tests. Combine with `--simulation-rc` to fully simulate registration behavior without requiring WinCC OA on the test host.

This directory contains unit tests and integration tests for the WinCC OA Core Library.

## Running Tests

```bash
npm test
```

## Structure

Tests mirror the source structure for easy navigation.

---

## 🎉 Thank You

Thank you for using WinCC OA tools package!
We're excited to be part of your development journey. **Happy Coding! 🚀**

---

## Quick Links

• [📦 npm package](https://www.npmjs.com/package/@winccoa-tools-pack/???)

---

<center>Made with ❤️ for and by the WinCC OA community</center>
