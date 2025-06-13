import fs from 'fs'

const filename = 'lib/adapters/express.d.ts'

// We don't want a hard dependency on '@types/express',
// so let TypeScript fail gracefully if that's missing:
const text = fs.readFileSync(filename, 'utf-8')
fs.writeFileSync(
  filename,
  text.replace(/import type/, '// @ts-ignore\nimport type')
)
