import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Remove bg-white from <Card ...> components
  content = content.replace(/<Card\b([^>]*)bg-white([^>]*)>/g, '<Card$1$2>');
  
  // 2. Replace hardcoded div cards with glass-card
  // We're looking for `bg-white` combined with `rounded-(xl|2xl|3xl)` and `shadow-(sm|md|lg|xl|2xl|inner)`
  const regex = /className="([^"]*)bg-white([^"]*)rounded-(xl|2xl|3xl)([^"]*)shadow-(sm|md|lg|xl|2xl|inner)([^"]*)"/g;
  
  content = content.replace(regex, (match, p1, p2, p3, p4, p5, p6) => {
    let newClasses = `${p1}${p2}${p4}${p6}`
      .replace(/border-brand-[a-z]+\/\d+/g, '')
      .replace(/border-brand-[a-z]+/g, '')
      .replace(/border-gray\/\d+/g, '')
      .replace(/border/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return `className="glass-card ${newClasses}"`;
  });

  // Handle a few other variations like Landing page cards that might have bg-white/10
  const regex2 = /className="([^"]*)bg-white\/10([^"]*)rounded-(xl|2xl|3xl)([^"]*)shadow-(sm|md|lg|xl|2xl)([^"]*)"/g;
  content = content.replace(regex2, (match, p1, p2, p3, p4, p5, p6) => {
    let newClasses = `${p1}${p2}${p4}${p6}`
      .replace(/border-white\/\d+/g, '')
      .replace(/border/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return `className="glass-card ${newClasses}"`;
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
console.log('Done');
