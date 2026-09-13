import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const candidateDir = path.join(pagesDir, 'candidate');
const recruiterDir = path.join(pagesDir, 'recruiter');

// Create directories
if (!fs.existsSync(candidateDir)) fs.mkdirSync(candidateDir);
if (!fs.existsSync(recruiterDir)) fs.mkdirSync(recruiterDir);

const files = fs.readdirSync(pagesDir);

files.forEach(file => {
  if (file.endsWith('.tsx') && file !== 'Landing.tsx') {
    let destDir = '';
    let newName = '';
    
    if (file.startsWith('Candidate')) {
      destDir = candidateDir;
      newName = file.replace('Candidate', '');
    } else if (file.startsWith('Recruiter')) {
      destDir = recruiterDir;
      newName = file.replace('Recruiter', '');
    }
    
    if (destDir) {
      const oldPath = path.join(pagesDir, file);
      const newPath = path.join(destDir, newName);
      
      // Read content, replace paths, then write to new location
      let content = fs.readFileSync(oldPath, 'utf-8');
      
      // Replace generic imports like from "../components to from "../../components
      // We look for from "../ or from '../
      content = content.replace(/from\s+["']\.\.\//g, 'from "../../');
      
      // If there are imports like from "./someFile", we might need to handle them,
      // but all Candidate files only imported from ../components, ../lib, ../hooks, ../services, ../data
      // Let's also check if they imported other pages (they don't, they use useNavigate("/candidate/..."))
      
      fs.writeFileSync(newPath, content);
      fs.unlinkSync(oldPath);
      
      console.log(`Moved ${file} -> ${path.join(path.basename(destDir), newName)}`);
    }
  }
});
