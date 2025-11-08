const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3030;

let devServerProcess = null;

app.use(express.static(__dirname));

// Helper to run commands
function runCommand(command, res) {
  exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
    if (error) {
      res.json({
        success: false,
        output: stderr || error.message,
        command
      });
      return;
    }
    res.json({
      success: true,
      output: stdout + (stderr ? '\n' + stderr : ''),
      command
    });
  });
}

// Git Pull
app.get('/api/git-pull', (req, res) => {
  runCommand('git pull', res);
});

// Git Status
app.get('/api/git-status', (req, res) => {
  runCommand('git status', res);
});

// NPM Install
app.get('/api/npm-install', (req, res) => {
  runCommand('npm install', res);
});

// Start Dev Server
app.get('/api/start-dev', (req, res) => {
  if (devServerProcess) {
    res.json({
      success: false,
      output: 'Dev server is already running!'
    });
    return;
  }

  devServerProcess = exec('npm run dev', { cwd: path.join(__dirname, '..') });

  let output = '';
  devServerProcess.stdout.on('data', (data) => {
    output += data;
  });

  devServerProcess.stderr.on('data', (data) => {
    output += data;
  });

  setTimeout(() => {
    res.json({
      success: true,
      output: 'Dev server starting on http://localhost:4000\n' + output,
      command: 'npm run dev'
    });
  }, 2000);
});

// Stop Dev Server
app.get('/api/stop-dev', (req, res) => {
  if (!devServerProcess) {
    res.json({
      success: false,
      output: 'Dev server is not running!'
    });
    return;
  }

  devServerProcess.kill();
  devServerProcess = null;

  res.json({
    success: true,
    output: 'Dev server stopped successfully!'
  });
});

// Build
app.get('/api/build', (req, res) => {
  runCommand('npm run build', res);
});

// Lint
app.get('/api/lint', (req, res) => {
  runCommand('npm run lint', res);
});

// Check Server Status
app.get('/api/server-status', (req, res) => {
  res.json({
    running: devServerProcess !== null,
    port: 4000
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PAM Dev Panel running at http://localhost:${PORT}`);
  console.log(`📁 Project directory: ${path.join(__dirname, '..')}\n`);
});
