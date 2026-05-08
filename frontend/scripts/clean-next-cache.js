const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..');
const target = path.join(frontendDir, '.next');

if (!target.startsWith(frontendDir)) {
  throw new Error('Refusing to remove a path outside the frontend directory');
}

if (fs.existsSync(target)) {
  fs.rmSync(target, { recursive: true, force: true });
  console.log('Cleared .next cache');
}
