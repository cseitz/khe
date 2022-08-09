/** Computes exports */

import { createReadStream, Stats } from 'fs';
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import { basename, dirname, extname, relative, resolve } from 'path';
import { createInterface } from 'readline';

const __package = resolve(__dirname, 'package.json');

async function addExport(exports: any, file: string, stats: Stats) {
    const input = createReadStream(file);
    const rl = createInterface({ input });
    let n = 0;
    for await (const line of rl) {
        if (n++ > 10) return;
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

async function getExports(dir: string, exports: any = {}) {
    const dirs = await readdir(dir);
    const files = await Promise.all(
        dirs.map(async subdir => {
            const res = resolve(dir, subdir);
            const stats = await stat(res);

            if (stats.isDirectory()) {
                return await getExports(res, exports);
            }
            
            if (extname(res).startsWith('.ts')) {
                await addExport(exports, res, stats);
                return basename(res);
            }
        })
    );
    // console.log(files);
    return exports;
}


getExports(__dirname + '/src').then(async exports => {
    // console.log('exports', exports);
    const pkg = JSON.parse(await readFile(__package, 'utf8'));
    pkg.exports = exports;
    await writeFile(__package, JSON.stringify(pkg, null, 2));
})