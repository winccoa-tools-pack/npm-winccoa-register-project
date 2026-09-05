import fs from 'fs'
import path from 'path'

type Opts = Record<string, string | boolean>

function parseArgs(argv: string[]): Opts {
  const opts: Opts = {}
  const args = argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--unregister') { opts.unregister = true; continue }
    if (a.startsWith('--')) {
      const [k, v] = a.split('=')
      const key = k.replace(/^--/, '')
      if (v !== undefined) { opts[key] = v; continue }
      const next = args[i+1]
      if (!next || next.startsWith('--')) { opts[key] = 'true'; continue }
      opts[key] = next; i++
    }
  }
  return opts
}

function usage(): void {
  console.log('Usage: npm-winccoa-register --project-path <fullPath> [--runnable true|false] [--langs de_AT.utf8,en_US.utf8] [--wincc-oa-version 3.20] [--unregister]')
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv)
  const projectPath = (opts['project-path'] || opts.projectPath) as string | undefined
  if (!projectPath) { usage(); process.exit(1) }

  const runnable = (opts.runnable === undefined) ? true : String(opts.runnable) !== 'false'
  const unregister = !!opts.unregister
  const langsRaw = (opts.langs || opts.lang || '') as string
  const langs = langsRaw ? langsRaw.split(/[ ,]+/).map(s => s.trim()).filter(Boolean) : []
  const winccVersion = (opts['wincc-oa-version'] || opts.wincc) as string | undefined

  const absProjectPath = path.resolve(projectPath)
  if (!fs.existsSync(absProjectPath)) {
    console.error('Project path does not exist:', absProjectPath)
    process.exit(2)
  }

  if (runnable && langs.length === 0) {
    console.warn('--langs was not provided. It is recommended when registering a runnable project.')
  }

  if (runnable) {
    const cfgDir = path.join(absProjectPath, 'config')
    try { fs.mkdirSync(cfgDir, { recursive: true }) } catch (e) { /* ignore */ }
    const cfgPath = path.join(cfgDir, 'config')
    if (!fs.existsSync(cfgPath)) {
      const contentLines: string[] = [
        '[general]',
        `proj_path = "${absProjectPath.replace(/\\/g, '/')}"`,
      ]
      if (winccVersion) contentLines.push(`proj_version = "${winccVersion}"`)
      if (langs.length) contentLines.push(`langs = "${langs.join(' ')}"`)
      contentLines.push('pmonPort = 5999', '')
      const content = contentLines.join('\n')
      try {
        fs.writeFileSync(cfgPath, content, { encoding: 'ascii' })
        console.log('Wrote config:', cfgPath)
      } catch (e: any) {
        console.error('Failed to write config:', e && e.message ? e.message : e)
        process.exit(3)
      }
    } else {
      console.log('Config already exists:', cfgPath)
    }
  }

  try {
    if ((opts as any)['no-core']) {
      console.log('Skipping programmatic registration (no-core)')
      process.exit(0)
    }
    // dynamic require to avoid hard dependency at compile-time
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const core = require('@winccoa-tools-pack/npm-winccoa-core') as any
    const ProjEnvProject = core && (core.ProjEnvProject || (core.default && core.default.ProjEnvProject))
    if (!ProjEnvProject) {
      console.warn('npm-winccoa-core found but ProjEnvProject not exported; falling back to config-only behavior')
      process.exit(0)
    }

    const project: any = new ProjEnvProject()
    if (typeof project.setDir === 'function') {
      project.setDir(absProjectPath)
    } else {
      if (typeof project.setId === 'function') project.setId(path.basename(absProjectPath))
      const installDir = path.resolve(absProjectPath, '..')
      if (typeof project.setInstallDir === 'function') project.setInstallDir(installDir)
    }

    if (winccVersion && typeof project.setVersion === 'function') project.setVersion(winccVersion)

    if (typeof project.setRunnable === 'function') project.setRunnable(!!runnable)
    if (typeof project.setRunable === 'function') project.setRunable(!!runnable)

    if (langs.length) {
      if (typeof project.setLanguages === 'function') project.setLanguages(langs)
      else if (typeof project.setLangs === 'function') project.setLangs(langs)
      else if (typeof project.setLang === 'function') project.setLang(langs)
    }

    if (unregister) {
      const unregisterFn = project.unregisterProj || project.unregisterProject || project.unregister || project.remove
      if (typeof unregisterFn === 'function') {
        console.log('Attempting to unregister project via npm-winccoa-core')
        const t = unregisterFn.call(project)
        try { await Promise.race([t, new Promise((_, rej) => setTimeout(() => rej(new Error('unregister timeout')), 15000))]) } catch (err: any) {
          console.warn('unregister failed or timed out:', err && err.message ? err.message : err)
          process.exit(4)
        }
        console.log('Unregister completed')
        process.exit(0)
      } else {
        console.warn('Unregister API not available on ProjEnvProject; nothing to do')
        process.exit(0)
      }
    }

    if (typeof project.registerProj === 'function' || typeof project.registerProject === 'function') {
      console.log('Attempting programmatic registration via npm-winccoa-core')
      const regFn = project.registerProj || project.registerProject
      try {
        await Promise.race([regFn.call(project), new Promise((_, rej) => setTimeout(() => rej(new Error('register timeout')), 15000))])
      } catch (err: any) {
        console.warn('project.register failed or timed out:', err && err.message ? err.message : err)
      }

      const waitMs = 30000
      const intervalMs = 500
      const start = Date.now()
      let registered = (typeof project.isRegistered === 'function') ? project.isRegistered() : false
      while (!registered && (Date.now() - start) < waitMs) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, intervalMs))
        try { registered = typeof project.isRegistered === 'function' ? project.isRegistered() : false } catch (e) { registered = false }
      }

      if (registered) {
        console.log('Project successfully registered:', path.basename(absProjectPath))
        process.exit(0)
      } else {
        console.warn('Registration did not complete within timeout; config was written')
        process.exit(2)
      }
    }

    console.warn('No register/unregister methods found on ProjEnvProject; config file has been written if requested')
    process.exit(0)
  } catch (err: any) {
    console.warn('Could not load npm-winccoa-core or programmatic registration failed:', err && err.message ? err.message : err)
    process.exit(0)
  }
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(3) })
