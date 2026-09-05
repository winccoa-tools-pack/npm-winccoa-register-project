const { spawnSync } = require('child_process')
const tests = [
  './test/unit/register-cli.write-config.test.ts',
  './test/unit/register-cli.no-config.test.ts'
]

let failed = 0
for (const t of tests) {
  console.log('Running', t)
  const r = spawnSync('node', ['-r', 'ts-node/register', t], { stdio: 'inherit' })
  if (r.status !== 0) failed++
}

if (failed) {
  console.error(failed, 'test(s) failed')
  process.exit(2)
} else {
  console.log('All tests passed')
  process.exit(0)
}
