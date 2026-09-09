import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawnSync } from 'child_process'

function runCli(args: string[], env?: NodeJS.ProcessEnv) {
  return spawnSync('node', [path.join(process.cwd(), 'dist', 'cjs', 'index.js'), ...args], { encoding: 'utf8', env: Object.assign({}, process.env, env || {}) })
}

function testSubProjectsInConfig() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'regtest-'))
  const projectPath = tmp
  // create a subproject fixture
  const sub = path.join(tmp, 'sub-proj')
  fs.mkdirSync(sub, { recursive: true })

  const res = runCli(['--project-path', projectPath, '--runnable', 'true', '--langs', 'en_US.utf8', '--simulation-rc', '0', '--simulated-winccoa-versions', '3.21', '--sub-project', sub, '--sub-project', sub])
  if (res.error) throw res.error
  if (res.status !== 0) throw new Error('CLI exited with non-zero: ' + res.status + '\n' + res.stderr)
  const cfg = path.join(projectPath, 'config', 'config')
  if (!fs.existsSync(cfg)) throw new Error('Expected config to be written: ' + cfg)
  const content = fs.readFileSync(cfg, 'utf8')
  const matches = content.match(/proj_path = ".+"/g) || []
  // Expect at least two proj_path entries for the two sub-projects and one for main project
  if (matches.length < 3) throw new Error('Expected multiple proj_path entries, got: ' + matches.length)
  console.log('OK: subprojects-in-config')
  try { fs.rmSync(tmp, { recursive: true, force: true }) } catch (e) {}
}

try {
  testSubProjectsInConfig()
  process.exit(0)
} catch (err: any) {
  console.error('FAIL:', err && err.message ? err.message : err)
  process.exit(2)
}
