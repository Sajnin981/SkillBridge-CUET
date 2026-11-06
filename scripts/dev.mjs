import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const packages = ['SkillBridge-backend', 'SkillBridge-frontend'];
const children = packages.map((directory) =>
  spawn(npmCommand, ['run', 'dev'], {
    cwd: resolve(directory),
    shell: process.platform === 'win32',
    stdio: 'inherit',
  }),
);

let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = code;
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

for (const child of children) {
  child.on('error', () => stop(1));
  child.on('exit', (code) => {
    if (!stopping) stop(code || 0);
  });
}