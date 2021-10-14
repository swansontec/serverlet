import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import flowEntry from 'rollup-plugin-flow-entry'
import mjs from 'rollup-plugin-mjs-entry'

import packageJson from './package.json'

const extensions = ['.ts']
const babelOpts = {
  babelHelpers: 'bundled',
  babelrc: false,
  extensions,
  include: ['src/**/*'],
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['transform-regenerator'],
        loose: true
      }
    ],
    '@babel/typescript'
  ]
}
const resolveOpts = { extensions }

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: packageJson.main, format: 'cjs' },
      { file: packageJson.module, format: 'es' }
    ],
    plugins: [
      resolve(resolveOpts),
      babel(babelOpts),
      flowEntry({ types: 'src/index.flow.js' }),
      mjs()
    ]
  },
  {
    external: ['express'],
    input: './src/adapters/express.ts',
    output: { file: './express.js', format: 'cjs' },
    plugins: [
      resolve(resolveOpts),
      babel(babelOpts),
      flowEntry({ types: 'src/adapters/express.flow.js' }),
      mjs(),
      {
        name: 'express-types',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'express.d.ts',
            source: "export * from './lib/adapters/express.js';"
          })
        }
      }
    ]
  }
]
