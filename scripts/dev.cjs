const { spawn } = require('node:child_process');

const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  throw new Error('npm_execpath is not available. Run this script via npm.');
}

const processes = [
  spawn(process.execPath, [npmCliPath, 'run', 'dev:server'], { stdio: 'inherit' }),
  spawn(process.execPath, [npmCliPath, 'run', 'dev:client'], { stdio: 'inherit' }),
];

let isShuttingDown = false;

const stopAll = (exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  processes.forEach((childProcess) => {
    if (!childProcess.killed) {
      childProcess.kill('SIGTERM');
    }
  });

  process.exit(exitCode);
};

processes.forEach((childProcess) => {
  childProcess.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    const nextExitCode = typeof code === 'number'
      ? code
      : signal
        ? 1
        : 0;

    stopAll(nextExitCode);
  });
});

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));