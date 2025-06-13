import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

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

export default {
  input: 'src/index.ts',
  output: [
    { file: packageJson.main, format: 'cjs' },
    { file: packageJson.module, format: 'esm' }
  ],
  plugins: [resolve(resolveOpts), babel(babelOpts)]
}
