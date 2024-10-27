const esbuild = require('esbuild')


const cmd = process.argv.filter(arg => arg.startsWith("--cmd="))[0]

esbuild.build({
  entryPoints: [ cmd ? cmd.slice(6) : './src/main.ts' ],
  bundle: true,
  outfile: './dist/main.js',
  platform: 'node',
  target: 'esnext',
  format: 'esm',
  sourcemap: true,
  tsconfig: './tsconfig.json',
  external: [ './node_modules/*' ],
}).catch(() => process.exit(1))
