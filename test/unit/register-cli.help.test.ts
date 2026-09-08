import { spawnSync } from 'child_process'
import path from 'path'

function runCli(args: string[]) {
  return spawnSync('node', [path.join(process.cwd(), 'dist', 'cjs', 'index.js'), ...args], { encoding: 'utf8', env: process.env })
}

function testHelpShowsUsage() {
  const res = runCli(['--help'])
  if (res.error) throw res.error
  if (res.status !== 0) throw new Error('Help should exit 0')
  if (!/Usage:/.test(res.stdout || '')) throw new Error('Help output missing Usage')
  console.log('OK: help-shows-usage')
}

try {
  testHelpShowsUsage()
  process.exit(0)
} catch (err: any) {
  console.error('FAIL:', err && err.message ? err.message : err)
  process.exit(2)
}
