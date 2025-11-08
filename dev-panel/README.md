# Dev Panel

A simple, configurable web-based control panel for development tasks. Works with any Node.js project!

## Quick Start

1. **Install dependencies:**
   ```bash
   cd dev-panel
   npm install
   ```

2. **Start the panel:**
   ```bash
   npm start
   ```

3. **Open in your browser:**
   ```
   http://localhost:3030
   ```

## 🎨 Configuration

The panel is fully configurable via `config.json`. Customize it for any project!

### Basic Configuration

```json
{
  "projectName": "My Awesome Project",
  "projectIcon": "🚀",
  "devPanelPort": 3030,
  "devServerPort": 3000,
  "devServerCommand": "npm run dev"
}
```

### Adding Custom Commands

```json
{
  "commands": {
    "myCommand": {
      "label": "My Custom Command",
      "icon": "⚡",
      "command": "npm run custom-script",
      "color": "primary"
    }
  }
}
```

**Available Colors:** `primary`, `success`, `danger`, `secondary`, `info`

### Adding Quick Links

```json
{
  "quickLinks": [
    {
      "label": "Admin Panel",
      "icon": "⚙️",
      "url": "http://localhost:3000/admin"
    }
  ]
}
```

### Customizing Theme

```json
{
  "theme": {
    "primaryColor": "#667eea",
    "secondaryColor": "#764ba2"
  }
}
```

## 📁 Use With Other Projects

### Method 1: Copy to Another Project

1. Copy the entire `dev-panel` folder to your other project
2. Edit `config.json` to match your project
3. Run `npm install` and `npm start`

### Method 2: Reuse Configuration

1. Copy `config.template.json` to `config.json`
2. Edit the settings for your project:
   - Project name and icon
   - Ports
   - Commands (add/remove as needed)
   - Quick links
   - Theme colors

### Example: React Project

```json
{
  "projectName": "My React App",
  "projectIcon": "⚛️",
  "devPanelPort": 3030,
  "devServerPort": 3000,
  "devServerCommand": "npm start",
  "commands": {
    "gitPull": { "label": "Git Pull", "icon": "📥", "command": "git pull", "color": "primary" },
    "npmInstall": { "label": "NPM Install", "icon": "📦", "command": "npm install", "color": "secondary" },
    "startDev": { "label": "Start Dev", "icon": "▶️", "special": "start-dev", "color": "success" },
    "stopDev": { "label": "Stop Dev", "icon": "⏹️", "special": "stop-dev", "color": "danger" },
    "test": { "label": "Run Tests", "icon": "🧪", "command": "npm test", "color": "info" },
    "build": { "label": "Build", "icon": "🔨", "command": "npm run build", "color": "secondary" }
  },
  "quickLinks": [
    { "label": "App", "icon": "🌐", "url": "http://localhost:3000" }
  ]
}
```

### Example: Python/Django Project

```json
{
  "projectName": "My Django App",
  "projectIcon": "🐍",
  "devPanelPort": 3030,
  "devServerPort": 8000,
  "devServerCommand": "python manage.py runserver",
  "commands": {
    "gitPull": { "label": "Git Pull", "icon": "📥", "command": "git pull", "color": "primary" },
    "pipInstall": { "label": "Pip Install", "icon": "📦", "command": "pip install -r requirements.txt", "color": "secondary" },
    "startDev": { "label": "Start Server", "icon": "▶️", "special": "start-dev", "color": "success" },
    "stopDev": { "label": "Stop Server", "icon": "⏹️", "special": "stop-dev", "color": "danger" },
    "migrate": { "label": "Migrate DB", "icon": "🗄️", "command": "python manage.py migrate", "color": "info" },
    "test": { "label": "Run Tests", "icon": "🧪", "command": "python manage.py test", "color": "info" }
  },
  "quickLinks": [
    { "label": "App", "icon": "🌐", "url": "http://localhost:8000" },
    { "label": "Admin", "icon": "⚙️", "url": "http://localhost:8000/admin" }
  ]
}
```

## 🎯 Features

- ✅ Fully configurable for any project
- ✅ Custom commands with any shell command
- ✅ Quick links to your app pages
- ✅ Real-time server status indicator
- ✅ Terminal-style output display
- ✅ Beautiful, customizable theme
- ✅ No need to keep terminal windows open

## 📝 Configuration Reference

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `projectName` | string | Display name of your project | "Dev Panel" |
| `projectIcon` | string | Emoji icon for your project | "🚀" |
| `devPanelPort` | number | Port for the dev panel server | 3030 |
| `devServerPort` | number | Port where your dev server runs | 3000 |
| `devServerCommand` | string | Command to start your dev server | "npm run dev" |
| `commands` | object | Custom command buttons | {} |
| `quickLinks` | array | Quick access links | [] |
| `theme.primaryColor` | string | Primary theme color (hex) | "#667eea" |
| `theme.secondaryColor` | string | Secondary theme color (hex) | "#764ba2" |

### Command Object Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `label` | string | Button text | ✅ |
| `icon` | string | Button icon (emoji) | ✅ |
| `command` | string | Shell command to run | ⚠️ (or use `special`) |
| `special` | string | Special handler (`start-dev` or `stop-dev`) | ⚠️ (or use `command`) |
| `color` | string | Button color theme | ✅ |
| `disabled` | boolean | Hide this button | ❌ |

## 🚀 Tips

1. **Keep it running:** Leave the dev panel open in a browser tab
2. **Bookmark it:** Add `http://localhost:3030` to your bookmarks
3. **Customize freely:** Add any commands you use frequently
4. **Multiple projects:** Run on different ports for each project
5. **Share configs:** Save and reuse configs across similar projects
