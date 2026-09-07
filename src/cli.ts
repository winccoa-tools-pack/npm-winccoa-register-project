#!/usr/bin/env node
import { main } from './index'

// Small CLI bootstrap that delegates to the library `main()` entry.
// Keeping this file minimal makes it easy to test and to replace later.
main().catch((err: any) => {
  // Ensure non-zero exit on unexpected errors
  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err && err.message ? err.message : err)
  // eslint-disable-next-line no-process-exit
  process.exit(3)
})
