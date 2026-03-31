import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const child = spawn(
  process.execPath,
  ['--import', 'tsx', path.join(dir, 'server.ts')],
  { stdio: 'inherit', cwd: dir, env: process.env }
);

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
