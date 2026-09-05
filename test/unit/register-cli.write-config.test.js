const fs = require('fs')
const path = require('path')
const os = require('os')
const child = require('child_process')

function runCli(args, env) {
  const res = child.spawnSync('node', [path.join(__dirname, '..', '..', 'devTools', 'npm-winccoa-register', 'index.js'), ...args], { encoding: 'utf8', env: Object.assign({}, process.env, env || {}) })
  return res
}

function testWriteConfig() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'regtest-'))
  const projectPath = tmp
  const res = runCli(['--project-path', projectPath, '--runnable', 'true', '--langs', 'en_US.utf8', '--no-core'])
  if (res.error) throw res.error
  if (res.status !== 0) throw new Error('CLI exited with non-zero: ' + res.status + '\n' + res.stderr)
  const cfg = path.join(projectPath, 'config', 'config')
  if (!fs.existsSync(cfg)) throw new Error('Expected config to be written: ' + cfg)
  const content = fs.readFileSync(cfg, 'utf8')
  if (!/langs/.test(content)) throw new Error('Config missing langs entry')
  console.log('OK: write-config')
  // cleanup
  try { fs.rmSync(tmp, { recursive: true, force: true }) } catch (e) {}
}

try {
  testWriteConfig()
  process.exit(0)
} catch (err) {
  console.error('FAIL:', err && err.message ? err.message : err)
  process.exit(2)
}
