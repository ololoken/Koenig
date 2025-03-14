import 'dotenv/config';
import mdx from '@mdx-js/rollup';
import pkg from './package.json';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import {defineConfig, loadEnv} from 'vite';
import {resolve} from 'path';
import {sentryVitePlugin} from '@sentry/vite-plugin';

function patchLexicalYjsPlugin() {
    //process.env.NODE_ENV = 'development';
    return {
        name: 'patch-lexical-yjs',

        transform(src, id) {
            if (id.includes('LexicalYjs.js') && String(src).includes(`const LexicalYjs = process.env.NODE_ENV === 'development' ? require('./LexicalYjs.dev.js') : require('./LexicalYjs.prod.js')`)) {
                const code = src.replace(
                    `const LexicalYjs = process.env.NODE_ENV === 'development' ? require('./LexicalYjs.dev.js') : require('./LexicalYjs.prod.js')`,
                    `const LexicalYjs = require('./LexicalYjs.dev.js')`
                );
                return {code};
            }
            if (String(src).includes('// Nove move, create or remove')) {
                const code = src.replace('// Nove move, create or remove', `if (collabNodeMap.size === 0) {
          const collabNode = $createCollabNodeFromLexicalNode(
            binding,
            $getNodeByKeyOrThrow(prevKey),
            this,
          );
          this.append(collabNode);
          collabNodeMap.set(prevKey, collabNode);
        }`);
                return {code};
            }
        }
    };
}

const outputFileName = pkg.name[0] === '@' ? pkg.name.slice(pkg.name.indexOf('/') + 1) : pkg.name;

// https://vitejs.dev/config/
export default (function viteConfig({mode}) {
    const env = loadEnv(mode, process.cwd());
    process.env = {...process.env, ...env};

    const plugins = [
        patchLexicalYjsPlugin(),
        svgr(),
        react(),
        mdx()
    ];

    // Keep sentryVitePlugin as the last plugin
    // only include when we have the required details to keep local dev less noisy
    if (process.env.IS_SHIPPING) {
        plugins.push(
            sentryVitePlugin({
                org: 'ghost-foundation',
                project: 'admin',

                // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
                // and need `project:releases` and `org:read` scopes
                authToken: process.env.VITE_SENTRY_AUTH_TOKEN,

                // We're not injecting release information into the build
                // @see https://www.npmjs.com/package/@sentry/vite-plugin#option-release-inject
                // Setting this option to true causes our build to fail: this plugin runs before the build is complete,
                // and therefore our commonJS dependencies such as `kg-markdown-html-renderer` are not yet transpiled
                release: {
                    inject: false
                },

                telemetry: false
            })
        );
    }

    return defineConfig({
        plugins,
        define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.VITEST_SEGFAULT_RETRY': 3,
            __APP_VERSION__: JSON.stringify(pkg.version)
        },
        resolve: {
            alias: {
                // required to prevent double-bundling of yjs due to cjs/esm mismatch
                // (see https://github.com/facebook/lexical/issues/2153)
                yjs: resolve('../../node_modules/yjs/src/index.js')
            }
        },
        optimizeDeps: {
            include: [
                '@tryghost/kg-clean-basic-html',
                '@tryghost/kg-default-transforms',
                '@tryghost/kg-markdown-html-renderer',
                '@tryghost/kg-simplemde'
            ]
        },
        build: {
            minify: true,
            sourcemap: true,
            cssCodeSplit: true,
            lib: {
                entry: resolve(__dirname, 'src/index.js'),
                name: pkg.name,
                fileName(format) {
                    if (format === 'umd') {
                        return `${outputFileName}.umd.js`;
                    }

                    return `${outputFileName}.js`;
                }
            },
            rollupOptions: {
                external: [
                    'react',
                    'react-dom'
                ],
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM'
                    }
                }
            },
            commonjsOptions: {
                include: [/packages/, /node_modules/]
            }
        },
        test: {
            globals: true, // required for @testing-library/jest-dom extensions
            environment: 'jsdom',
            setupFiles: './test/test-setup.js',
            include: ['./test/unit/**/*.test.{js,jsx,ts,tsx}'],
            testTimeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 10000,
            ...(process.env.CI && { // https://github.com/vitest-dev/vitest/issues/1674
                minThreads: 1,
                maxThreads: 2
            })
        }
    });
});
