import fs from 'fs';
import path from 'path';
import {
    ProjEnvProject,
    getAvailableWinCCOAVersions,
    getWinCCOAInstallationPathByVersion,
} from '@winccoa-tools-pack/npm-winccoa-core';

type Opts = Record<string, string | boolean | string[]>;

class ProjEnvProjectMock {
    private _dir: string = '';
    private _version: string = '';
    private _runnable: boolean = true;
    private _langs: string[] = [];
    private _id: string | undefined;

    setDir(dir: string): void {
        this._dir = dir;
    }

    setVersion(version: string): void {
        this._version = version;
    }

    setRunnable(runnable: boolean): void {
        this._runnable = runnable;
    }

    setLanguages(langs: string[]): void {
        this._langs = langs;
    }

    setId(id: string): void {
        this._id = id;
    }

    getDir(): string {
        return this._dir;
    }

    isRunnable(): boolean {
        return this._runnable;
    }

    isRegistered(): boolean {
        // For mock: treat items with an id as registered, otherwise if dir exists treat as registered
        return !!this._id || !!this._dir;
    }

    async registerProj(): Promise<number> {
        console.log('Mock registerProj called with:', {
            dir: this._dir,
            version: this._version,
            runnable: this._runnable,
            langs: this._langs,
        });
        return 0; // Simulate successful registration
    }

    async unregisterProj(): Promise<number> {
        console.log('Mock unregisterProj called with:', {
            dir: this._dir,
            version: this._version,
            runnable: this._runnable,
            langs: this._langs,
        });
        return 0; // Simulate successful unregistration
    }
}

function parseArgs(argv: string[]): Opts {
    const opts: Opts = {};
    const args = argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-h' || a === '--help') {
            opts.help = true;
            continue;
        }

        if (a === '--unregister') {
            opts.unregister = true;
            continue;
        }
        if (a.startsWith('--')) {
            const [k, v] = a.split('=');
            const key = k.replace(/^--/, '');

            if (key === 'sub-project') {
                if (opts[key] === undefined) {
                    opts[key] = [];
                }
            }
            if (v !== undefined) {
                if (Array.isArray(opts[key])) {
                    (opts[key] as string[]).push(v);
                } else {
                    opts[key] = v;
                }
                continue;
            }
            const next = args[i + 1];
            if (!next || next.startsWith('--')) {
                opts[key] = 'true';
                continue;
            }
            // If option supports multiple values (we initialize arrays above), push
            if (Array.isArray(opts[key])) {
                (opts[key] as string[]).push(next);
            } else {
                opts[key] = next;
            }
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
    console.log('  --sub-project <path|id>      Add a sub-project. Can be used multiple times');
    console.log('  --unregister                 Unregister the project instead of registering');
    console.log('  -h, --help                   Show this help message');
    console.log('\nExamples:');
    console.log(
        '  winccoa-pa-register --project-path C:\\projects\\MyProj --runnable true --langs en_US.utf8 --wincc-oa-version 3.20',
    );
    console.log('  winccoa-pa-register --project-path /opt/projects/MyProj --unregister');
    console.log(
        '\nNote: The `--simulation-rc` flag is provided for testing only; it simulates the register/unregister return code (integer). Do not use in production workflows.',
    );
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

    let sim: number | undefined;
    if (opts['simulation-rc'] !== undefined) {
        sim = Number(opts['simulation-rc']);
        console.warn(
            `Warning: Using --simulation-rc ${isNaN(sim) ? String(opts['simulation-rc']) : sim}; simulating register/unregister return code. This is for testing only and should not be used in production workflows.`,
        );
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

    const simVersionsRaw = (opts['simulated-winccoa-versions'] || '') as string;
    if (opts['simulated-winccoa-versions'] !== undefined) {
        console.warn(
            `Warning: Using --simulated-winccoa-versions ${simVersionsRaw}; simulating installed WinCC OA versions. This is for testing only and should not be used in production workflows.`,
        );
    }

    const installedWinCCOAVersions =
        opts['simulated-winccoa-versions'] !== undefined
            ? simVersionsRaw.split(',')
            : getAvailableWinCCOAVersions();

    console.log('Project path:', projectPath);
    console.log('Runnable:', runnable);
    console.log('Unregister:', unregister);
    console.log('Languages:', langs.join(', ') || '(none)');
    console.log('WinCC OA version:', opts['wincc-oa-version'] || '(not specified)');
    console.log('Available WinCC OA versions:', installedWinCCOAVersions.join(', ') || '(none)');
    if (installedWinCCOAVersions.length === 0) {
        throw new Error(
            'Could not determine installed version of WinCC OA; programmatic registration may fail',
        );
    }

    let winccVersion = opts['wincc-oa-version'] as string | undefined;

    if (!winccVersion) {
        if (installedWinCCOAVersions.length > 1) {
            throw new Error(
                '--wincc-oa-version not provided and multiple versions of WinCC OA are installed; programmatic registration may fail',
            );
        }
        winccVersion = installedWinCCOAVersions[0];

        if (!winccVersion) {
            throw new Error(
                '--wincc-oa-version not provided and could not determine installed version of WinCC OA; programmatic registration may fail',
            );
        }
        console.log('Using WinCC OA version:', winccVersion || '(none)');
    }

    const oaPath =
        opts['simulated-winccoa-versions'] !== undefined
            ? `/opt/WinCC_OA/${winccVersion}`
            : getWinCCOAInstallationPathByVersion(winccVersion ?? '');

    if (!oaPath) {
        throw new Error(
            `Could not determine installation path for WinCC OA version: ${winccVersion ?? '(none)'}`,
        );
    }

    const absProjectPath = path.resolve(projectPath);
    if (!fs.existsSync(absProjectPath)) {
        throw new Error(`Project path does not exist: ${absProjectPath}`);
    }

    const project: any =
        opts['simulated-winccoa-versions'] !== undefined
            ? new ProjEnvProjectMock()
            : new ProjEnvProject();
    project.setDir(absProjectPath);
    if (winccVersion) project.setVersion(winccVersion);
    project.setRunnable(!!runnable);
    project.setLanguages(langs);

    if (unregister) {
        let rc: number;
        if (sim !== undefined) {
            rc = sim;
        } else {
            rc = await project.unregisterProj();
        }
        if (rc == 0) {
            console.log('Project successfully unregistered:', path.basename(absProjectPath));
            process.exit(0);
        } else {
            throw new Error(
                `Project was not registered or could not be unregistered: ${path.basename(absProjectPath)}`,
            );
        }
    } else {
        if (runnable && langs.length === 0) {
            throw new Error(
                '--langs was not provided. It is recommended when registering a runnable project.',
            );
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
                ];

                if (opts['sub-project'] !== undefined) {
                    const subProjects = opts['sub-project'] as string[];
                    for (const subProjPathOrId of subProjects) {
                        if (!subProjPathOrId) continue;

                        const subProject: any =
                            opts['simulated-winccoa-versions'] !== undefined
                                ? new ProjEnvProjectMock()
                                : new ProjEnvProject();

                        if (fs.existsSync(subProjPathOrId)) {
                            subProject.setDir(subProjPathOrId);
                        } else {
                            subProject.setId(subProjPathOrId);
                        }

                        const subProjPath = subProject.getDir();

                        if (!subProjPath || !fs.existsSync(subProjPath)) {
                            throw new Error(
                                `Subproject path does not exist: ${subProjPathOrId}. Please provide a valid path or registered project ID.`,
                            );
                        }

                        if (subProject.isRunnable()) {
                            // adding runnable proejct as supbroject wiil works, but looks like a user failure.
                            // This is not common scenario, so we will just warn the user and continue.
                            console.warn(
                                `Warning: Subproject ${subProjPathOrId} is marked as runnable. Adding a runnable project as a subproject may not be intended.`,
                            );
                        }
                        if (!subProject.isRegistered()) {
                            // again, this is not a common scenario, so we will just warn the user and continue.
                            // unregistered subprojects will work, but it is recommended to register subprojects before using them as subprojects.
                            console.warn(
                                `Warning: Subproject ${subProjPathOrId} is not registered. Ensure it is registered before using it as a subproject.`,
                            );
                        }
                        contentLines.push(`proj_path = "${subProjPath.replace(/\\/g, '/')}"`);
                    }
                }
                contentLines.push(`proj_path = "${absProjectPath.replace(/\\/g, '/')}"`);
                if (winccVersion) contentLines.push(`proj_version = "${winccVersion}"`);
                if (langs.length) contentLines.push(`langs = "${langs.join(' ')}"`);
                const content = contentLines.join('\n');
                fs.writeFileSync(cfgPath, content, { encoding: 'ascii' });
                console.log('Wrote config:', cfgPath);
            } else {
                console.log('Config already exists:', cfgPath);
            }
        }

        console.log('Attempting programmatic registration via npm-winccoa-core');
        let rc: number;
        if (sim !== undefined) {
            rc = sim;
        } else {
            rc = await project.registerProj();
        }

        if (rc == 0) {
            console.log('Project successfully registered:', path.basename(absProjectPath));
            process.exit(0);
        } else {
            throw new Error('Registration did not complete successfully. Return code: ' + rc);
        }
    }

    process.exit(0);
}

main().catch((err) => {
    throw err;
});
