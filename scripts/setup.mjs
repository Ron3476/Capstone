import { execSync, spawnSync } from 'child_process';
import { platform } from 'os';
import { setTimeout } from 'timers/promises';

const ports = [4000, 3000];

function run(cmd, args = [], opts = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function killPort(port) {
  if (platform() === 'win32') {
    try {
      const out = execSync(
        `netstat -ano | findstr ":${port} " | findstr LISTENING`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      );
      const pids = new Set(
        out
          .split('\n')
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && /^\d+$/.test(pid))
      );
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`Stopped process ${pid} on port ${port}`);
        } catch {
          /* already stopped */
        }
      }
    } catch {
      /* nothing listening */
    }
    return;
  }

  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { shell: true, stdio: 'ignore' });
  } catch {
    /* nothing listening */
  }
}

async function main() {
  console.log('Stopping dev servers that may lock Prisma files...');
  for (const port of ports) killPort(port);

  // Brief pause so Windows releases the DLL lock
  await setTimeout(2000);

  console.log('\nGenerating Prisma client...');
  run('npx', ['prisma', 'generate']);

  console.log('\nSyncing database schema...');
  run('npx', ['prisma', 'db', 'push', '--skip-generate']);

  console.log('\nSeeding demo data...');
  run('npm', ['run', 'db:seed']);

  console.log('\nSetup complete. Start the app with: npm run dev');
}

main();
