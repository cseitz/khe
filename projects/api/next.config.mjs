import { readFileSync } from 'fs';
import withTM from 'next-transpile-modules';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// @link https://github.com/belgattitude/nextjs-monorepo-example/blob/main/apps/nextjs-app/next.config.js

/** @type {import('./config').ServerRuntimeConfig} */
const serverRuntimeConfig = {
    
}

/** @type {import('./config').PublicRuntimeConfig} */
const publicRuntimeConfig = {
    mode: process.env.NODE_ENV,
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    serverRuntimeConfig,
    publicRuntimeConfig,

    reactStrictMode: true,

    // @link https://nextjs.org/docs/advanced-features/compiler#minification
    // swcMinify: true,

    // Standalone build
    // @link https://nextjs.org/docs/advanced-features/output-file-tracing#automatically-copying-traced-files-experimental
    output: 'standalone',

    typescript: {
        ignoreBuildErrors: true,
    },

    experimental: {

        browsersListForSwc: true,
        legacyBrowsers: false,

        // @link https://nextjs.org/docs/advanced-features/output-file-tracing#caveats
        // outputFileTracingRoot: path.join(__dirname, '../'),

        // Prefer loading of ES Modules over CommonJS
        // @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
        // @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
        // esmExternals: true,

        // Experimental monorepo support
        // @link {https://github.com/vercel/next.js/pull/22867|Original PR}
        // @link {https://github.com/vercel/next.js/discussions/26420|Discussion}
        // externalDir: true,
    }
}


const { dependencies, devDependencies } = JSON.parse(readFileSync(__dirname + '/package.json', 'utf8'));
const withDependencies = Object.entries({ ...dependencies, ...devDependencies })
    .filter(([name, version]) => version === '*')
    .map(([name]) => name);

const withModules = [
    ...withDependencies,

];

import { Exports, DependencyExports } from 'exports';
if (process.env.NODE_ENV === 'development') {
    Exports(null, true);
    DependencyExports(withModules, true);
}


export default (withModules.length === 0)
    ? nextConfig
    : withTM(withModules, {
        resolveSymlinks: true
    })(nextConfig);
