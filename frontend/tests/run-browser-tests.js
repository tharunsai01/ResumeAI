import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n======================================================');
  console.log('   HireSmart AI - Real Browser Automation Test Runner');
  console.log('======================================================\n');

  console.log('--> Starting Backend server on port 5000...');
  const backend = spawn('node', ['dist/server.js'], {
    cwd: path.resolve(__dirname, '../../backend'),
    stdio: 'pipe',
  });

  backend.stdout.on('data', d => process.stdout.write('[Backend] ' + d));
  backend.stderr.on('data', d => process.stderr.write('[Backend Err] ' + d));

  console.log('--> Starting Frontend Vite dev server on port 5173...');
  const frontend = spawn('npx', ['vite', '--port', '5173'], {
    cwd: path.resolve(__dirname, '..'),
    shell: true,
    stdio: 'pipe',
  });

  frontend.stdout.on('data', d => process.stdout.write('[Vite] ' + d));
  frontend.stderr.on('data', d => process.stderr.write('[Vite Err] ' + d));

  console.log('--> Probing servers until both are live...');
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const rBackend = await fetch('http://localhost:5000/api/v1/health');
      const rFrontend = await fetch('http://localhost:5173/');
      if (rBackend.ok && rFrontend.ok) {
        ready = true;
        console.log('--> Both Backend (:5000) and Frontend (:5173) are LIVE & READY!\n');
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  if (!ready) {
    console.error('Servers failed to respond within 30 seconds.');
    backend.kill();
    frontend.kill();
    process.exit(1);
  }

  console.log('--> Launching Playwright Chromium Browser Test Suite...\n');
  const pw = spawn(
    'pnpm',
    ['exec', 'playwright', 'test', 'tests/browser-workflow.spec.ts'],
    {
      cwd: path.resolve(__dirname, '..'),
      shell: true,
      stdio: 'inherit',
    }
  );

  pw.on('close', code => {
    console.log(`\n--> Playwright finished with exit code: ${code}`);
    console.log('--> Tearing down test servers...');
    backend.kill();
    frontend.kill();
    process.exit(code ?? 0);
  });
}

main().catch(err => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
