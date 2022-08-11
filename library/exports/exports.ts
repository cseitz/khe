import { execSync } from 'child_process';
import { createReadStream, readdirSync, readFileSync, Stats } from 'fs';
import { basename, dirname, extname, relative, resolve } from 'path';
import chokidar from 'chokidar';
import { createInterface } from 'readline';
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import { isEqual } from 'lodash';

// console.log('eey');

type Context = {
    cwd: string
    exports: any
    __package: string
}

async function addExport(ctx: Context, file: string, stats: Stats) {
    const { cwd, exports, __package } = ctx;
    const input = createReadStream(file);
    const rl = createInterface({ input });
    let n = 0;
    for await (const line of rl) {
        if (n++ > 10) return;
        if (line.startsWith('import')) {
            n--;
            continue;
        }
        if (line.startsWith('/**')) {
            if (line.includes('@export')) {
                const name = line.split(`'`).slice(1)[0];

                const rel = './' + relative(dirname(__package), file);
                exports[name === '.' ? name : './' + name] = {
                    default: rel,
                }
                return;
            }
        }
    }
}

async function getExports(ctx: Context, dir: string) {
    const { exports } = ctx;
    const dirs = await readdir(dir);
    const files = await Promise.all(
        dirs.map(async subdir => {
            const res = resolve(dir, subdir);
            const stats = await stat(res);

            if (stats.isDirectory()) {
                return await getExports(ctx, res);
            }

            if (extname(res).startsWith('.ts')) {
                await addExport(ctx, res, stats);
                return basename(res);
            }
        })
    );
    // console.log(files);
    return exports;
}

function getSource(cwd: string) {
    if (readdirSync(cwd).includes('src')) {
        return cwd + '/src';
    }
    return cwd;
}


function updateExports(cwd: string) {
    const __package = resolve(cwd, 'package.json');
    getExports({
        cwd,
        __package,
        exports: {},
    }, getSource(cwd)).then(async exports => {
        // console.log('exports', exports);
        const pkg = JSON.parse(await readFile(__package, 'utf8'));
        const originalExports = pkg.exports;
        pkg.exports = exports;
        if (Object.keys(pkg.exports).length === 0) {
            delete pkg.exports;
        }
        if (!isEqual(originalExports, pkg.exports)) {
            await writeFile(__package, JSON.stringify(pkg, null, 2));
        }
        // console.log('updated exports for', cwd);
    })
}

function watchExports(cwd: string) {
    let pending: any;
    const update = updateExports.bind(null, cwd);
    update();
    chokidar.watch(getSource(cwd)).on('all', (event, path) => {
        // console.log(path);
        if (pending) clearTimeout(pending);
        pending = setTimeout(update, 1000);
    })
}


export function Exports(cwd?: string, watch = false) {
    if (!cwd) {
        cwd = process.cwd();
    }
    if (extname(cwd)) {
        cwd = dirname(cwd);
    }
    // if (extname(cwd).includes('.j'))
    // console.log(cwd);

    if (watch) {
        return watchExports(cwd);
    } else {
        return updateExports(cwd);
    }

}


function getYarn() {
    return 'npx --location=project yarn ';
}

export function DependencyExports(dependencies: string[] | '*', watch = false) {
    let _workspaces = execSync(getYarn() + 'workspaces info --json', {
        encoding: 'utf8'
    });
    if (_workspaces.startsWith('y')) {
        _workspaces = _workspaces.split('\n').filter(o => {
            if (o.startsWith(' ') || o.startsWith('{') || o.startsWith('}')) {
                return true;
            }
            return false;
        }).join('\n');
    }
    const workspaces = JSON.parse(_workspaces);
    const found = new Set<string>();
    if (dependencies === '*') {
        for (const key in workspaces) {
            if (key != 'exports') {
                found.add(key);
            }
        }
    } else {
        for (const dep of dependencies) {
            if (dep in workspaces) {
                if (dep != 'exports') {
                    found.add(dep);
                }
            }
        }
    }
    for (const dep of Array.from(found)) {
        try {
            execSync(getYarn() + 'workspace ' + dep + ' ls', { encoding: 'utf8', stdio: 'pipe' });
        } catch (err) {
            const dir = err.stderr.split(/\r?\n/).find(o => o.startsWith('Directory'));
            const loc = workspaces[dep].location;
            if (dir.includes(loc)) {
                const cwd = resolve(dir.split('y: ').pop());
                // console.log({ [dep]: cwd })
                if (watch) {
                    watchExports(cwd)
                } else {
                    updateExports(cwd);
                }
            }
        }
    }
}


// import chokidar from 'chokidar';
// import { createInterface } from 'readline';
// import { readdir, readFile, stat, writeFile } from 'fs/promises';
// import { execSync } from 'child_process';
// if (process.argv.includes('--watch')) {
//     let pending: any;
//     chokidar.watch(process.cwd() + '/src').on('all', (event, path) => {
//         // console.log(path);
//         if (pending) clearTimeout(pending);
//         pending = setTimeout(updateExports, 1000);
//     })
// } else {
//     updateExports(process.cwd());
// }
