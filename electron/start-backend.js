const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { app, utilityProcess } = require('electron');

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
  const backend = utilityProcess.fork(backendPath);

  return backend;
}

module.exports = startBackend;
