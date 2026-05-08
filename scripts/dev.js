const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const backendHealthUrl = 'http://localhost:3001/api/health';

const children = new Set();

const isBackendReady = async () => {
  try {
    const response = await fetch(backendHealthUrl);
    return response.ok;
  } catch (error) {
    return false;
  }
};

const prefixStream = (label, stream) => {
  let buffered = '';

  stream.on('data', (chunk) => {
    buffered += chunk.toString();
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() || '';

    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`[${label}] ${line}`);
      }
    });
  });

  stream.on('end', () => {
    if (buffered.trim()) {
      console.log(`[${label}] ${buffered}`);
    }
  });
};

const startProcess = (label, cwd, args) => {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const commandArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm', ...args]
    : args;

  const child = spawn(command, commandArgs, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    windowsHide: true,
  });

  children.add(child);
  prefixStream(label, child.stdout);
  prefixStream(label, child.stderr);

  child.on('exit', (code, signal) => {
    children.delete(child);
    if (signal) {
      console.log(`[${label}] stopped by ${signal}`);
      return;
    }
    if (code !== 0) {
      console.log(`[${label}] exited with code ${code}`);
    }
  });

  return child;
};

const stopChildren = () => {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill();
    }
  });
};

const main = async () => {
  if (await isBackendReady()) {
    console.log(`[backend] already running at ${backendHealthUrl}`);
  } else {
    startProcess('backend', backendDir, ['run', 'dev:backend']);
  }

  startProcess('frontend', frontendDir, ['run', 'dev:frontend']);
};

process.on('SIGINT', () => {
  stopChildren();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopChildren();
  process.exit(0);
});

main().catch((error) => {
  console.error(error);
  stopChildren();
  process.exit(1);
});
