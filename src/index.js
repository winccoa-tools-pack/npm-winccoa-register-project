#!/usr/bin/env node
// small runtime shim to execute the TypeScript implementation via ts-node when available
try {
  // prefer to run the compiled JS if present
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('./index.ts')
} catch (e) {
  // fallback: try to register ts-node and run
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('ts-node/register')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('./index.ts')
  } catch (inner) {
    console.error('Failed to load TypeScript CLI. Ensure ts-node is installed for local execution.', inner)
    process.exit(1)
  }
}
