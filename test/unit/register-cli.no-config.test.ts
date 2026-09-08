import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawnSync } from 'child_process'

function runCli(args: string[]) {
  return spawnSync('node', [path.join(process.cwd(), 'dist', 'cjs', 'index.js'), ...args], { encoding: 'utf8', env: process.env })
}

function testNoConfigWhenNotRunnable() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'regtest-'))
  const projectPath = tmp
  const res = runCli(['--project-path', projectPath, '--runnable', 'false', '--simulation-rc', '0', '--simulated-winccoa-versions', '3.21'])
  if (res.error) throw res.error
  if (res.status !== 0) throw new Error('CLI exited with non-zero: ' + res.status + '\n' + res.stderr)
  const cfg = path.join(projectPath, 'config', 'config')
  if (fs.existsSync(cfg)) throw new Error('Config should not exist for non-runnable project: ' + cfg)
  console.log('OK: no-config-when-not-runnable')
  try { fs.rmSync(tmp, { recursive: true, force: true }) } catch (e) {}
}

try {
  testNoConfigWhenNotRunnable()
  process.exit(0)
} catch (err: any) {
  console.error('FAIL:', err && err.message ? err.message : err)
  process.exit(2)
}
