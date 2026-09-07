import fs from 'fs';
import path from 'path';
import {
    ProjEnvProject,
    getAvailableWinCCOAVersions,
    getWinCCOAInstallationPathByVersion,
} from '@winccoa-tools-pack/npm-winccoa-core';

type Opts = Record<string, string | boolean>;

function parseArgs(argv: string[]): Opts {
    const opts: Opts = {};
    const args = argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-h' || a === '--help') { opts.help = true; continue }
        if (a === '--no-register') { opts['no-register'] = true; continue }
        if (a === '--unregister') {
            opts.unregister = true;
            continue;
        }
        if (a.startsWith('--')) {
            const [k, v] = a.split('=');
            const key = k.replace(/^--/, '');
            if (v !== undefined) {
                opts[key] = v;
                continue;
            }
            const next = args[i + 1];
            if (!next || next.startsWith('--')) {
                opts[key] = 'true';
                continue;
            }
            opts[key] = next;
            i++;
        }
    }
    return opts;
}

function usage(): void {
    console.log('Usage: winccoa-pa-register [options]\n');
    console.log('Options:');
    console.log('  --project-path <fullPath>    Full path to the WinCC OA project');
    console.log('  --runnable true|false        Whether the project is runnable (default: true)');
    console.log('  --langs <comma|space list>   Languages, e.g. "de_AT.utf8,en_US.utf8"');
    console.log('  --wincc-oa-version <ver>     WinCC OA version to use when registering');
    console.log('  --unregister                 Unregister the project instead of registering');
    console.log('  -h, --help                   Show this help message');
    console.log('\nExamples:');
    console.log('  winccoa-pa-register --project-path C:\\projects\\MyProj --runnable true --langs en_US.utf8 --wincc-oa-version 3.20');
    console.log('  winccoa-pa-register --project-path /opt/projects/MyProj --unregister');
        console.log('\nNote: The `--no-register` flag is provided for testing only; it skips programmatic register/unregister actions. Do not use in production workflows.');
}

export async function main(): Promise<void> {
    const opts = parseArgs(process.argv);
    if (opts.help) {
        usage();
        process.exit(0);
    }
    const projectPath = (opts['project-path'] || opts.projectPath) as string | undefined;
    if (!projectPath) {
        usage();
        process.exit(1);
    }

    const runnable = opts.runnable === undefined ? true : String(opts.runnable) !== 'false';
    const unregister = !!opts.unregister;
    const langsRaw = (opts.langs || opts.lang || '') as string;
    const langs = langsRaw
        ? langsRaw
              .split(/[ ,]+/)
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    const installedCoreVersion = (() => {
        try {
            // Try to read the installed core package version
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const corePkg = require('@winccoa-tools-pack/npm-winccoa-core/package.json') as { version?: string };
            return corePkg.version || undefined;
        } catch (e) {
            return undefined;
        }
    })();

    if (!installedCoreVersion) {
        console.warn('Warning: Could not determine installed version of npm-winccoa-core; programmatic registration may fail');
    }

    const winccVersion = (opts['wincc-oa-version'] || opts.wincc || installedCoreVersion) as string | undefined;

    if (runnable && !winccVersion) {
        console.warn('Warning: --wincc-oa-version not provided and could not determine installed version of npm-winccoa-core; programmatic registration may fail');
    }

    const oaPath = (() => {
        try {
            return winccVersion ? getWinCCOAInstallationPathByVersion(winccVersion as string) : undefined;
        } catch (e) {
            return undefined;
        }
    })();

    const absProjectPath = path.resolve(projectPath);
    if (!fs.existsSync(absProjectPath)) {
        console.error('Project path does not exist:', absProjectPath);
        process.exit(2);
    }

    try {
        const project: any = new ProjEnvProject();
        project.setDir(absProjectPath);
        if (winccVersion) project.setVersion(winccVersion);
        project.setRunnable(!!runnable);
        project.setLanguages(langs);

        if (unregister) {
            if (opts['no-register']) {
                console.log('Skipping unregister due to --no-register')
                process.exit(0)
            }
            const rc = await project.unregisterProj();
            if (rc == 0) {
                console.log('Project successfully unregistered:', path.basename(absProjectPath));
                process.exit(0);
            } else {
                console.warn(
                    'Project was not registered or could not be unregistered:',
                    path.basename(absProjectPath),
                );
                process.exit(1);
            }
        } else {
            if (runnable && langs.length === 0) {
                console.warn(
                    '--langs was not provided. It is recommended when registering a runnable project.',
                );
                process.exit(1);
            }
            if (runnable) {
                const cfgDir = path.join(absProjectPath, 'config');
                try {
                    fs.mkdirSync(cfgDir, { recursive: true });
                } catch {
                    /* ignore */
                }
                const cfgPath = path.join(cfgDir, 'config');
                if (!fs.existsSync(cfgPath)) {
                    const contentLines: string[] = [
                        '[general]',
                        `pvss_path = "${(oaPath ?? '').replace(/\\/g, '/')}"`,
                        `proj_path = "${absProjectPath.replace(/\\/g, '/')}"`,
                    ];
                    if (winccVersion) contentLines.push(`proj_version = "${winccVersion}"`);
                    if (langs.length) contentLines.push(`langs = "${langs.join(' ')}"`);
                    const content = contentLines.join('\n');
                    try {
                        fs.writeFileSync(cfgPath, content, { encoding: 'ascii' });
                        console.log('Wrote config:', cfgPath);
                    } catch (e: any) {
                        console.error('Failed to write config:', e && e.message ? e.message : e);
                        process.exit(3);
                    }
                } else {
                    console.log('Config already exists:', cfgPath);
                }
                if (opts['no-register']) {
                    console.log('Skipping programmatic registration due to --no-register')
                    process.exit(0)
                }
            }

            try {
                if (typeof project.registerProj === 'function') {
                    console.log('Attempting programmatic registration via npm-winccoa-core')
                    const regPromise = project.registerProj()
                    try {
                        await Promise.race([regPromise, new Promise((_, rej) => setTimeout(() => rej(new Error('register timeout')), 15000))])
                    } catch (err: any) {
                        console.warn('project.register failed or timed out:', err && err.message ? err.message : err)
                    }

                    // Wait briefly for registration to appear (non-fatal)
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
                        // Do not treat this as an error; exit 0 so callers that only need config succeed
                        process.exit(0)
                    }
                }
            } catch (err: any) {
                console.warn('Could not perform programmatic registration:', err && err.message ? err.message : err)
                process.exit(0)
            }
        }

        process.exit(0);
    } catch (err: any) {
        console.warn(
            'Could not load npm-winccoa-core or programmatic registration failed:',
            err && err.message ? err.message : err,
        );
        process.exit(0);
    }
}

main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(3);
});
