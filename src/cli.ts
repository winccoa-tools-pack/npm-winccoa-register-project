#!/usr/bin/env node
import { main } from './index';

// Small CLI bootstrap that delegates to the library `main()` entry.
// Keeping this file minimal makes it easy to test and to replace later.
main().catch((err: any) => {
    // Ensure non-zero exit on unexpected errors

    console.error('Unexpected error:', err && err.message ? err.message : err);

    process.exit(3);
});
