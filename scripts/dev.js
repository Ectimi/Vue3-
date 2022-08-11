const { build } = require('esbuild');
const { resolve } = require('path')
const args = require('minimist')(process.argv.slice(2))

console.log(args)

const target = args._[0] || 'reactivity';
const format = args.f || 'global';
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,//把所有的包打包到一起
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(error) {
            if (error) {
                console.error(error)
            }else{
                console.log('rebuild~~~')
            }
        }
    }
}).then(() => {
    console.log('watching...')
})