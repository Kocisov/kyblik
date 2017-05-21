export default {
  entry: 'src/index.js',
  dest: 'lib/index.js',
  format: 'cjs',
  external: [
    'debounce',
    'fs-extra',
    'prettier'
  ]
}
