import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const SKILL_VOCABULARY = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R',
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express', 'Nest.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Sass', 'Bootstrap',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Elasticsearch', 'DynamoDB',
  'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'CI/CD', 'Terraform',
  'REST APIs', 'GraphQL', 'Microservices', 'System Design',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn',
  'Agile', 'Scrum', 'Jira', 'Jest', 'Playwright'
];

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function extractRawText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    try {
      const parser = new PDFParse({ data: buffer });
      try {
        const res = await parser.getText();
        if (res.text && res.text.trim().length > 0) {
          return res.text.trim();
        }
      } finally {
        await parser.destroy();
      }
    } catch {
      // Fallback to ASCII stream parsing below if PDF binary stream is synthetic or uncompressed
    }

    // Resilient fallback: extract ASCII text characters from the buffer
    const ascii = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    if (ascii.trim().length > 15) {
      return ascii.trim();
    }
    return '';
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ? result.value.trim() : '';
  }

  throw new Error(`Unsupported MIME type for text extraction: ${mimeType}`);
}

function extractSection(rawText: string, heading: RegExp): string[] {
  const lines = rawText.split(/\r?\n/).map(line => line.trim());
  const start = lines.findIndex(line => heading.test(line));
  if (start < 0) return [];
  const nextHeading = /^(?:(?:professional |work |relevant |employment |internship )?experience|employment history|work history|internships|(?:(?:personal|academic|selected|technical) )?projects|education|(?:technical )?skills|certifications?|achievements|awards|publications|languages|interests|volunteering|references|summary|profile)\s*:?$/i;
  const content: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (nextHeading.test(line)) break;
    if (line && !/^--\s*\d+ of \d+\s*--$/.test(line)) content.push(line);
    if (content.length === 40) break;
  }
  return content;
}

export function parseResumeDeterministic(rawText: string) {
  if (!rawText || rawText.trim().length === 0) {
    return {
      skills: [],
      totalExperienceYears: 0,
      experience: [],
      projects: [],
      education: [],
      contact: { email: undefined, phone: undefined },
    };
  }

  // 1. Deterministic skills extraction using word boundary matching
  const matchedSkills: string[] = [];
  for (const skill of SKILL_VOCABULARY) {
    const regex = new RegExp(`(^|[^a-zA-Z0-9+#])${escapeRegExp(skill)}(?![a-zA-Z0-9+#])`, 'i');
    if (regex.test(rawText)) {
      matchedSkills.push(skill);
    }
  }

  // 2. Contact details (email & phone)
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  // 3. Years of experience estimation
  let estimatedYears = 0;
  const expMatch = rawText.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/i);
  if (expMatch && expMatch[1]) {
    estimatedYears = parseInt(expMatch[1], 10);
  }

  // 4. Basic education extraction
  const education: Array<{ degree?: string; field?: string }> = [];
  const degreeRegexes = [
    /Bachelor(?:\s*of\s*[^,\n]+)?/i,
    /Master(?:\s*of\s*[^,\n]+)?/i,
    /B\.?Tech(?:\s*in\s*[^,\n]+)?/i,
    /M\.?Tech(?:\s*in\s*[^,\n]+)?/i,
    /B\.?S\.?(?:\s*in\s*[^,\n]+)?/i,
    /M\.?S\.?(?:\s*in\s*[^,\n]+)?/i,
    /Ph\.?D\.?/i,
  ];

  for (const degRegex of degreeRegexes) {
    const match = rawText.match(degRegex);
    if (match) {
      education.push({ degree: match[0].trim() });
    }
  }

  return {
    skills: matchedSkills,
    totalExperienceYears: estimatedYears,
    experience: extractSection(rawText, /^(?:(?:professional |work |relevant |internship )?experience|employment history|work history|internships)\s*:?$/i),
    projects: extractSection(rawText, /^(?:(?:personal|academic|selected|technical) )?projects\s*:?$/i),
    education,
    contact: {
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
    },
  };
}
