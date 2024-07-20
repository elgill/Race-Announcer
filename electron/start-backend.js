const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { app } = require('electron');

function startBackend(callback) {
  const logsDir = path.join(app.getPath('userData'), 'logs');
  const logFile = path.join(logsDir, 'backend.log');

  // Ensure the logs directory exists
  fs.ensureDirSync(logsDir);

  let backendPath;
  if (app.isPackaged) {
    backendPath = path.join(process.resourcesPath, 'backend', 'dist', 'main.js');
  } else {
    backendPath = path.join(app.getAppPath(), 'backend', 'dist', 'main.js');
  }
  const backend = spawn('node', [backendPath]);

  const writeStream = fs.createWriteStream(logFile, { flags: 'a' });

  backend.stdout.on('data', (data) => {
    const message = `Backend: ${data.toString()}`;
    console.log(message);
    writeStream.write(`${message}\n`);
  });

  backend.stderr.on('data', (data) => {
    const error = `Backend Error: ${data.toString()}`;
    console.error(error);
    writeStream.write(`${error}\n`);
  });

  backend.on('close', (code) => {
    const message = `Backend process exited with code ${code}`;
    console.log(message);
    writeStream.write(`${message}\n`);
  });

  backend.on('error', (err) => {
    const error = `Failed to start backend: ${err.message}`;
    console.error(error);
    writeStream.write(`${error}\n`);
  });

  backend.stdout.once('data', (data) => {
    if (data.toString().includes('Nest application successfully started')) {
      callback();
    }
  });

  return backend;
}

module.exports = startBackend;
