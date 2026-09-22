const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const targetComponent = 'SpotlightCard';
const targetComponentPath = 'components/ui/SpotlightCard';

function getRelativePath(fromPath, toPath) {
  const rel = path.relative(path.dirname(fromPath), toPath);
  return rel.startsWith('.') ? rel : './' + rel;
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('glass-card')) return;

  // We need to carefully replace <div ... glass-card ... > ... </div>
  // We'll use a stack to track open/close tags.

  let modified = false;
  let result = '';
  let i = 0;
  
  const tokens = [];
  
  // A very basic JSX parser
  while (i < content.length) {
    if (content.substring(i, i + 4) === '<div' || content.substring(i, i + 11) === '<motion.div') {
      const isMotion = content.substring(i, i + 11) === '<motion.div';
      const tagLen = isMotion ? 11 : 4;
      
      // Find the end of the opening tag
      let j = i + tagLen;
      let inString = false;
      let stringChar = '';
      let tagInner = '';
      let isSelfClosing = false;
      
      while (j < content.length) {
        const c = content[j];
        if (!inString && (c === '"' || c === "'" || c === '`')) {
          inString = true;
          stringChar = c;
        } else if (inString && c === stringChar) {
          inString = false;
        } else if (!inString && c === '>') {
          if (content[j-1] === '/') isSelfClosing = true;
          tagInner = content.substring(i + tagLen, j);
          break;
        }
        j++;
      }
      
      if (tagInner.includes('glass-card')) {
        tokens.push({ type: 'OPEN', isMotion, start: i, end: j + 1, selfClosing: isSelfClosing, inner: tagInner });
      } else {
        tokens.push({ type: 'IGNORE_OPEN', isMotion, start: i, end: j + 1 });
      }
      
      result += content.substring(i, j + 1);
      i = j + 1;
    } else if (content.substring(i, i + 6) === '</div>' || content.substring(i, i + 13) === '</motion.div>') {
      const isMotion = content.substring(i, i + 13) === '</motion.div>';
      const tagLen = isMotion ? 13 : 6;
      tokens.push({ type: 'CLOSE', isMotion, start: i, end: i + tagLen });
      result += content.substring(i, i + tagLen);
      i += tagLen;
    } else {
      result += content[i];
      i++;
    }
  }
  
  // Now we evaluate the tokens to find matching pairs
  const stack = [];
  const replacements = [];
  
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k];
    if (t.type === 'OPEN' || t.type === 'IGNORE_OPEN') {
      if (!t.selfClosing) {
        stack.push(t);
      } else if (t.type === 'OPEN') {
        replacements.push({ 
          start: t.start, 
          end: t.end, 
          isMotion: t.isMotion, 
          inner: t.inner,
          isSelfClosing: true
        });
      }
    } else if (t.type === 'CLOSE') {
      if (stack.length > 0) {
        const open = stack.pop();
        if (open.type === 'OPEN') {
          replacements.push({
            openStart: open.start,
            openEnd: open.end,
            closeStart: t.start,
            closeEnd: t.end,
            isMotion: open.isMotion,
            inner: open.inner,
            isSelfClosing: false
          });
        }
      }
    }
  }
  
  if (replacements.length === 0) return;

  // Apply replacements from back to front to preserve indices
  replacements.sort((a, b) => {
    const aStart = a.isSelfClosing ? a.start : a.openStart;
    const bStart = b.isSelfClosing ? b.start : b.openStart;
    return bStart - aStart;
  });
  
  let newContent = content;
  let needsSpotlight = false;
  let needsMotionSpotlight = false;
  
  for (const r of replacements) {
    if (r.isSelfClosing) {
      if (r.isMotion) {
        newContent = newContent.substring(0, r.start) + '<MotionSpotlightCard' + r.inner + '/>' + newContent.substring(r.end);
        needsMotionSpotlight = true;
      } else {
        newContent = newContent.substring(0, r.start) + '<SpotlightCard' + r.inner + '/>' + newContent.substring(r.end);
        needsSpotlight = true;
      }
    } else {
      if (r.isMotion) {
        newContent = newContent.substring(0, r.closeStart) + '</MotionSpotlightCard>' + newContent.substring(r.closeEnd);
        newContent = newContent.substring(0, r.openStart) + '<MotionSpotlightCard' + r.inner + '>' + newContent.substring(r.openEnd);
        needsMotionSpotlight = true;
      } else {
        newContent = newContent.substring(0, r.closeStart) + '</SpotlightCard>' + newContent.substring(r.closeEnd);
        newContent = newContent.substring(0, r.openStart) + '<SpotlightCard' + r.inner + '>' + newContent.substring(r.openEnd);
        needsSpotlight = true;
      }
    }
  }
  
  // Add imports
  if (needsSpotlight || needsMotionSpotlight) {
    const spotlightModule = getRelativePath(filePath, path.join(srcDir, targetComponentPath));
    const spotlightImport = `import SpotlightCard from '${spotlightModule.replace(/\\/g, '/')}';\n`;
    const motionSpotlightCode = needsMotionSpotlight ? `\nconst MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);\n` : '';
    
    // Check if motion is imported if we need motion spotlight
    if (needsMotionSpotlight && !newContent.includes('import { motion }')) {
      newContent = `import { motion } from 'framer-motion';\n` + newContent;
    }
    
    // Insert import after the last import statement or at the top
    let importIdx = newContent.lastIndexOf('import ');
    if (importIdx !== -1) {
      let endOfImport = newContent.indexOf('\\n', importIdx);
      if (endOfImport === -1) endOfImport = newContent.indexOf(';', importIdx);
      if (endOfImport === -1) endOfImport = importIdx + 10;
      
      const insertPos = newContent.indexOf('\\n', endOfImport) + 1;
      newContent = newContent.substring(0, insertPos) + spotlightImport + motionSpotlightCode + newContent.substring(insertPos);
    } else {
      newContent = spotlightImport + motionSpotlightCode + newContent;
    }
    
    fs.writeFileSync(filePath, newContent);
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
console.log('Done');
