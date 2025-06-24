const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, 'src');
const target = 'http://localhost:5000/api/';
const replacement = '${BASE_URL}/api/';

function getRelativeImportPath(filePath) {
  const depth = filePath
    .replace(baseDir, '')
    .split(path.sep)
    .filter(Boolean).length - 1;

  return `${'../'.repeat(depth)}utils/api`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes(target)) return;

  let updated = false;

  // Replace the base URL
  content = content.replaceAll(target, replacement);
  updated = true;

  // Check if import already exists
  if (!content.includes('import { BASE_URL }')) {
    const importPath = getRelativeImportPath(filePath);
    content = `import { BASE_URL } from '${importPath}';\n` + content;
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✔️ Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

walkDir(baseDir);
console.log('✅ All Axios URLs updated safely.');
