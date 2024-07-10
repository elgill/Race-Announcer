const { spawn } = require('child_process');
const path = require('path');

function startBackend() {
  const backendPath = path.join(__dirname, '..', 'backend');
  const backend = spawn('node', ['dist/main.js'], { cwd: backendPath });

  backend.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backend.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  return backend;
}

module.exports = startBackend;
