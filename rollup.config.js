const typescript = require('rollup-plugin-typescript');

export default {
    input: 'src/index.ts',
    output: {
        file: 'lib/promise.js',
        format: 'umd',
        name: 'Promise',
        sourcemap: true
    },
    plugins: [
        typescript(),
    ]
}