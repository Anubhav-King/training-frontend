const fs = require('fs')
const path = require('path')

const baseDir = path.resolve(__dirname, 'src')
const target = 'http://localhost:5000/api/'
const replacement = '${BASE_URL}/api/'

function getRelativeImportPath(filePath) {
  const depth = filePath.split(path.sep).filter(Boolean).length - baseDir.split(path.sep).length
  const prefix = '../'.repeat(depth)
  return `${prefix}utils/api`
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')

  if (!content.includes(target)) return // skip if URL not found

  let updated = false

  // Replace hardcoded URL
  if (content.includes(target)) {
    content = content.replaceAll(target, replacement)
    updated = true
  }

  // Add import if missing
  if (!content.includes("import { BASE_URL }")) {
    const importPath = getRelativeImportPath(filePath)
    content = `import { BASE_URL } from '${importPath}';\n` + content
    updated = true
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`✔️  Updated: ${filePath}`)
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath)
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath)
    }
  })
}

walkDir(baseDir)
console.log('✅ All Axios URLs updated.')
