const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

// Load configuration
const configPath = path.join(__dirname, 'config.json');
let config = {
  projectName: 'Dev Panel',
  projectIcon: '🚀',
  devPanelPort: 3030,
  devServerPort: 3000,
  devServerCommand: 'npm run dev',
  commands: {},
  quickLinks: [],
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2'
  }
};

try {
  const configData = fs.readFileSync(configPath, 'utf8');
  config = { ...config, ...JSON.parse(configData) };
} catch (error) {
  console.warn('⚠️  No config.json found, using defaults');
}

const PORT = config.devPanelPort;
let devServerProcess = null;

app.use(express.static(__dirname));
app.use(express.json());

// Get configuration
app.get('/api/config', (req, res) => {
  res.json(config);
});

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

// Generic command runner
app.post('/api/run-command', (req, res) => {
  const { command } = req.body;
  if (!command) {
    res.json({ success: false, output: 'No command provided' });
    return;
  }
  runCommand(command, res);
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

  devServerProcess = exec(config.devServerCommand, { cwd: path.join(__dirname, '..') });

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
      output: `Dev server starting on http://localhost:${config.devServerPort}\n` + output,
      command: config.devServerCommand
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


// Check Server Status
app.get('/api/server-status', (req, res) => {
  res.json({
    running: devServerProcess !== null,
    port: config.devServerPort
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PAM Dev Panel running at http://localhost:${PORT}`);
  console.log(`📁 Project directory: ${path.join(__dirname, '..')}\n`);
});
