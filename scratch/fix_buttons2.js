import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. bg-brand-navy text-white -> btn-interactive btn-primary bg-brand-navy
  content = content.replace(/<button([^>]*)className="([^"]*)bg-brand-navy([^"]*)text-white([^"]*)"/g, (match, p1, p2, p3, p4) => {
    let classes = `${p2}${p3}${p4}`
      .replace(/hover:bg-[^\s"]+/g, '')
      .replace(/shadow-[^\s"]+/g, '')
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    if (classes.includes('btn-interactive')) return match;
    return `<button${p1}className="btn-interactive btn-primary rounded-lg shadow-sm bg-brand-navy ${classes}"`;
  });

  // 2. bg-[#1e293b] text-white -> btn-interactive btn-primary bg-[#1e293b]
  content = content.replace(/<button([^>]*)className="([^"]*)bg-\[#1e293b\]([^"]*)text-white([^"]*)"/g, (match, p1, p2, p3, p4) => {
    let classes = `${p2}${p3}${p4}`
      .replace(/hover:bg-[^\s"]+/g, '')
      .replace(/shadow-[^\s"]+/g, '')
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/border-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    if (classes.includes('btn-interactive')) return match;
    return `<button${p1}className="btn-interactive btn-primary rounded-lg shadow-sm bg-[#1e293b] ${classes}"`;
  });

  // 3. bg-brand-light text-brand-navy -> btn-interactive btn-secondary
  content = content.replace(/<button([^>]*)className="([^"]*)bg-brand-light([^"]*)text-brand-navy([^"]*)"/g, (match, p1, p2, p3, p4) => {
    let classes = `${p2}${p3}${p4}`
      .replace(/hover:bg-[^\s"]+/g, '')
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    if (classes.includes('btn-interactive')) return match;
    return `<button${p1}className="btn-interactive btn-secondary rounded-lg ${classes}"`;
  });

  // 4. text-brand-navy hover:bg-brand-light (Ghost button)
  content = content.replace(/<button([^>]*)className="([^"]*)text-brand-navy([^"]*)hover:bg-brand-light([^"]*)"/g, (match, p1, p2, p3, p4) => {
    let classes = `${p2}${p3}${p4}`
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/flex items-[^\s"]+/g, 'flex items-center') // normalize
      .replace(/\s+/g, ' ').trim();
    if (classes.includes('btn-interactive')) return match;
    return `<button${p1}className="btn-interactive btn-ghost rounded-lg ${classes}"`;
  });

  // 5. text-semantic-error hover:bg-semantic-error/10 (Ghost danger)
  content = content.replace(/<button([^>]*)className="([^"]*)text-semantic-error([^"]*)hover:bg-semantic-error\/[0-9]+([^"]*)"/g, (match, p1, p2, p3, p4) => {
    let classes = `${p2}${p3}${p4}`
      .replace(/rounded-[^\s"]+/g, '')
      .replace(/transition-[^\s"]+/g, '')
      .replace(/\s+/g, ' ').trim();
    if (classes.includes('btn-interactive')) return match;
    return `<button${p1}className="btn-interactive rounded-lg hover:bg-semantic-error/10 text-semantic-error ${classes}"`;
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
console.log('Done replacing round 2');
