import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Primary Buttons: bg-brand-indigo text-white
  content = content.replace(/<button([^>]*)className="([^"]*)bg-brand-indigo([^"]*)text-white([^"]*)"/g, (match, p1, p2, p3, p4) => {
    let classes = `${p2}${p3}${p4}`
      .replace(/hover:bg-[^\s"]+/g, '')
      .replace(/shadow-[^\s"]+/g, '')
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    return `<button${p1}className="btn-interactive btn-primary rounded-lg shadow-sm ${classes}"`;
  });

  // Also primary if text-white and bg-brand-indigo are flipped
  content = content.replace(/<button([^>]*)className="([^"]*)text-white([^"]*)bg-brand-indigo([^"]*)"/g, (match, p1, p2, p3, p4) => {
    let classes = `${p2}${p3}${p4}`
      .replace(/hover:bg-[^\s"]+/g, '')
      .replace(/shadow-[^\s"]+/g, '')
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    return `<button${p1}className="btn-interactive btn-primary rounded-lg shadow-sm ${classes}"`;
  });

  // 2. Secondary Buttons: bg-brand-light or bg-white with border
  content = content.replace(/<button([^>]*)className="([^"]*)(bg-brand-light|bg-white)([^"]*)border([^"]*)"/g, (match, p1, p2, p3, p4, p5) => {
    let classes = `${p2}${p4}${p5}`
      .replace(/hover:bg-[^\s"]+/g, '')
      .replace(/shadow-[^\s"]+/g, '')
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/border-brand-[^\s"]+/g, '')
      .replace(/text-brand-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    // Don't replace if it's already a glass-card (from previous task) or has btn-interactive
    if (classes.includes('glass-card') || classes.includes('btn-interactive')) return match;
    return `<button${p1}className="btn-interactive btn-secondary rounded-lg ${classes}"`;
  });

  // 3. Danger Buttons: bg-semantic-error
  content = content.replace(/<button([^>]*)className="([^"]*)bg-semantic-error([^"]*)"/g, (match, p1, p2, p3) => {
    let classes = `${p2}${p3}`
      .replace(/hover:bg-[^\s"]+/g, '')
      .replace(/shadow-[^\s"]+/g, '')
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    return `<button${p1}className="btn-interactive rounded-lg bg-semantic-error text-white hover:bg-semantic-error/90 shadow-sm ${classes}"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir('c:/ResumeAI/frontend/src');
console.log('Done replacing buttons');
