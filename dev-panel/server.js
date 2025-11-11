const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

// Load projects configuration
const projectsPath = path.join(__dirname, 'projects.json');
let projectsData = {
  projects: [],
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2'
  }
};

try {
  const data = fs.readFileSync(projectsPath, 'utf8');
  projectsData = JSON.parse(data);
} catch (error) {
  console.warn('⚠️  No projects.json found, creating default...');
  // Create default projects.json
  projectsData = {
    projects: [{
      id: 'default',
      name: 'Dev Panel',
      path: path.join(__dirname, '..'),
      icon: '🚀',
      devServerPort: 3030,
      devServerCommand: 'npm run dev',
      active: true
    }],
    theme: {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2'
    }
  };
  fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2));
}

// Get active project
function getActiveProject() {
  return projectsData.projects.find(p => p.active) || projectsData.projects[0];
}

// Load project-specific config
function loadProjectConfig(project) {
  const configPath = path.join(project.path, 'dev-panel', 'config.json');
  let config = {
    projectName: project.name,
    projectIcon: project.icon,
    devPanelPort: 3030,
    devServerPort: project.devServerPort || 3000,
    devServerCommand: project.devServerCommand || 'npm run dev',
    commands: {},
    quickLinks: [],
    theme: projectsData.theme
  };

  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = { ...config, ...JSON.parse(configData) };
  } catch (error) {
    // Config not found, use defaults
  }

  return config;
}

let activeProject = getActiveProject();
let config = loadProjectConfig(activeProject);
const PORT = 3030; // Fixed port for dev panel
let devServerProcess = null;

app.use(express.static(__dirname));
app.use(express.json());

// Get configuration (includes active project info)
app.get('/api/config', (req, res) => {
  res.json({
    ...config,
    activeProject: {
      id: activeProject.id,
      name: activeProject.name,
      path: activeProject.path,
      icon: activeProject.icon
    },
    projects: projectsData.projects.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      active: p.active
    }))
  });
});

// Helper to run commands in active project directory
function runCommand(command, res) {
  exec(command, { cwd: activeProject.path }, (error, stdout, stderr) => {
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

  devServerProcess = exec(config.devServerCommand, { cwd: activeProject.path });

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

// Get all projects
app.get('/api/projects', (req, res) => {
  res.json(projectsData.projects);
});

// Set active project
app.post('/api/set-active-project', (req, res) => {
  const { projectId } = req.body;

  // Stop dev server if running
  if (devServerProcess) {
    devServerProcess.kill();
    devServerProcess = null;
  }

  // Update active status
  projectsData.projects.forEach(p => {
    p.active = p.id === projectId;
  });

  // Save to file
  fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2));

  // Reload active project and config
  activeProject = getActiveProject();
  config = loadProjectConfig(activeProject);

  res.json({
    success: true,
    activeProject: {
      id: activeProject.id,
      name: activeProject.name,
      path: activeProject.path,
      icon: activeProject.icon
    }
  });
});

// Add new project
app.post('/api/add-project', (req, res) => {
  const { name, path: projectPath, icon, devServerPort, devServerCommand } = req.body;

  // Generate ID from name
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Check if ID already exists
  if (projectsData.projects.find(p => p.id === id)) {
    res.json({
      success: false,
      error: 'A project with this name already exists'
    });
    return;
  }

  // Add new project
  projectsData.projects.push({
    id,
    name,
    path: projectPath,
    icon: icon || '📁',
    devServerPort: devServerPort || 3000,
    devServerCommand: devServerCommand || 'npm run dev',
    active: false
  });

  // Save to file
  fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2));

  res.json({
    success: true,
    project: projectsData.projects[projectsData.projects.length - 1]
  });
});

// Delete project
app.post('/api/delete-project', (req, res) => {
  const { projectId } = req.body;

  // Don't allow deleting the active project
  const project = projectsData.projects.find(p => p.id === projectId);
  if (project && project.active) {
    res.json({
      success: false,
      error: 'Cannot delete the active project. Switch to another project first.'
    });
    return;
  }

  // Remove project
  projectsData.projects = projectsData.projects.filter(p => p.id !== projectId);

  // Save to file
  fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2));

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Dev Panel running at http://localhost:${PORT}`);
  console.log(`📁 Active project: ${activeProject.name} (${activeProject.path})\n`);
});
