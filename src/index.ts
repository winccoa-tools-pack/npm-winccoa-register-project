import fs from 'fs'
import path from 'path'
import {
    ProjEnvProject,
    getAvailableWinCCOAVersions,
    getWinCCOAInstallationPathByVersion
} from '@winccoa-tools-pack/npm-winccoa-core'


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
            const next = args[i + 1]
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


    if (getAvailableWinCCOAVersions().length === 0) {
        console.error('Warning: Could not determine installed version of npm-winccoa-core; programmatic registration may fail')
    } else if (!opts['wincc-oa-version'] && getAvailableWinCCOAVersions().length > 1) {
        console.error('Warning: Multiple versions of npm-winccoa-core are installed; programmatic registration may fail')
        process.exit(1);
    }
    const installedCoreVersion = getAvailableWinCCOAVersions()[0];

    const winccVersion = (opts['wincc-oa-version'] || opts.wincc || installedCoreVersion) as string | undefined

    if (!winccVersion) {
        console.error('Warning: --wincc-oa-version not provided and could not determine installed version of npm-winccoa-core; programmatic registration may fail')
        process.exit(1);
    }

    const oaPath = getWinCCOAInstallationPathByVersion(winccVersion as string) || undefined;

    const absProjectPath = path.resolve(projectPath)
    if (!fs.existsSync(absProjectPath)) {
        console.error('Project path does not exist:', absProjectPath)
        process.exit(2)
    }



    try {
        const project: any = new ProjEnvProject()
        project.setDir(absProjectPath);
        project.setVersion(winccVersion);
        project.setRunnable(!!runnable);
        project.setLanguages(langs);

        if (unregister) {
            const rc = await project.unregisterProj();
            if (rc == 0) {
                console.log('Project successfully unregistered:', path.basename(absProjectPath))
                process.exit(0)
            } else {
                console.warn('Project was not registered or could not be unregistered:', path.basename(absProjectPath))
                process.exit(1)
            }
        } else {


            if (runnable && langs.length === 0) {
                console.warn('--langs was not provided. It is recommended when registering a runnable project.')
                process.exit(1);
            }
            if (runnable) {
                const cfgDir = path.join(absProjectPath, 'config')
                try { fs.mkdirSync(cfgDir, { recursive: true }) } catch (e) { /* ignore */ }
                const cfgPath = path.join(cfgDir, 'config')
                if (!fs.existsSync(cfgPath)) {
                    const contentLines: string[] = [
                        '[general]',
                        `pvss_path = "${(oaPath ?? '').replace(/\\/g, '/')}"`,
                        `proj_path = "${absProjectPath.replace(/\\/g, '/')}"`,
                    ]
                    if (winccVersion) contentLines.push(`proj_version = "${winccVersion}"`)
                    if (langs.length) contentLines.push(`langs = "${langs.join(' ')}"`)
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

            const rc = await project.registerProj();
            if (rc == 0) {
                console.log('Project successfully registered:', path.basename(absProjectPath))
                process.exit(0)
            } else {
                console.warn('Project could not be registered:', path.basename(absProjectPath))
                process.exit(1)
            }
        }

        process.exit(0)
    } catch (err: any) {
        console.warn('Could not load npm-winccoa-core or programmatic registration failed:', err && err.message ? err.message : err)
        process.exit(0)
    }
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(3) })
