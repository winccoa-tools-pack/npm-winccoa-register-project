import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawnSync } from 'child_process'

function runCli(args: string[]) {
  return spawnSync('node', [path.join(process.cwd(), 'dist', 'cjs', 'index.js'), ...args], { encoding: 'utf8', env: process.env })
}

function testSimulatedFailureLeavesConfig() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'regtest-'))
  const projectPath = tmp
  const res = runCli(['--project-path', projectPath, '--runnable', 'true', '--langs', 'en_US.utf8', '--wincc-oa-version', '3.21', '--simulation-rc=5', 'simulated-winccoa-versions=3.20,3.21'])
  if (res.error) throw res.error
  if (res.status === 0) throw new Error('Expected non-zero exit when simulation-rc=5')
  const cfg = path.join(projectPath, 'config', 'config')
  if (!fs.existsSync(cfg)) throw new Error('Config should be written even when registration fails: ' + cfg)
  console.log('OK: sim-fail-leaves-config')
  try { fs.rmSync(tmp, { recursive: true, force: true }) } catch (e) {}
}

try {
  testSimulatedFailureLeavesConfig()
  process.exit(0)
} catch (err: any) {
  console.error('FAIL:', err && err.message ? err.message : err)
  process.exit(2)
}
