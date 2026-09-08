const path = require('path')
const child_process = require('child_process')
const fs = require('fs')

function runTest(file) {
  console.log('Running', file)
  const res = child_process.spawnSync('node', [path.join(__dirname, '..', 'dist', 'test', 'unit', file)], { encoding: 'utf8' })
  if (res.stdout) process.stdout.write(res.stdout)
  if (res.stderr) process.stderr.write(res.stderr)
  if (res.error) throw res.error
  if (res.status !== 0) throw new Error('Test failed: ' + file + '\n' + (res.stderr || ''))
}

try {
  const unitDir = path.join(__dirname, '..', 'dist', 'test', 'unit')
  if (!fs.existsSync(unitDir)) {
    console.log('No compiled unit tests found; skipping')
    process.exit(0)
  }
  const files = fs.readdirSync(unitDir).filter(f => f.endsWith('.test.js')).sort()
  if (files.length === 0) {
    console.log('No unit tests found; skipping')
    process.exit(0)
  }
  for (const f of files) runTest(f)
  console.log('All tests passed')
  process.exit(0)
} catch (err) {
  console.error('Tests failed:', err && err.message ? err.message : err)
  process.exit(2)
}
