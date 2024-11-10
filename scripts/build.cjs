const esbuild = require('esbuild')
const fs = require('fs')


const cmd = process.argv.filter(arg => arg.startsWith("--cmd="))[0]
const controllersDir = "./src/app/controllers/"

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

if (!cmd || cmd.slice(6) === "src/main.ts") {
  esbuild.build({
    entryPoints: fs.readdirSync(controllersDir).map(c => controllersDir + c),
    bundle: true,
    outdir: './dist/controllers',
    platform: 'node',
    target: 'esnext',
    format: 'esm',
    tsconfig: './tsconfig.json',
    external: [ './node_modules/*' ]
  }).catch(() => process.exit(1))
}
