#!/usr/bin/env node
import { main } from './index';

// Small CLI bootstrap that delegates to the library `main()` entry.
// Keeping this file minimal makes it easy to test and to replace later.
main().catch((err: any) => {
    // Rethrow so calling environment can handle the error as an exception
    throw err;
});
