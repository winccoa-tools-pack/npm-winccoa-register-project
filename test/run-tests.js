const path = require('path')
const child_process = require('child_process')

function runTest(file) {
  console.log('Running', file)
  const res = child_process.spawnSync('node', [path.join(__dirname, '..', 'dist', 'test', 'unit', file)], { encoding: 'utf8' })
  if (res.stdout) process.stdout.write(res.stdout)
  if (res.stderr) process.stderr.write(res.stderr)
  if (res.error) throw res.error
  if (res.status !== 0) throw new Error('Test failed: ' + file + '\n' + (res.stderr || ''))
}

try {
  runTest('register-cli.write-config.test.js')
  runTest('register-cli.no-config.test.js')
  console.log('All tests passed')
  process.exit(0)
} catch (err) {
  console.error('Tests failed:', err && err.message ? err.message : err)
  process.exit(2)
}
