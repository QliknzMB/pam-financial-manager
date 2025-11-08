# PAM Dev Panel - Desktop App

Run the dev panel as a standalone Windows application!

## Quick Start

### Option 1: Run without building (requires Node.js)

```bash
npm install electron --save-dev
npm run electron
```

### Option 2: Build Windows .exe

1. **Install dependencies:**
   ```bash
   npm install --save-dev electron electron-builder
   ```

2. **Build the executable:**
   ```bash
   npm run build:win
   ```

3. **Find your app:**
   - Look in `dev-panel/dist/` folder
   - Double-click `PAM Dev Panel Setup.exe` to install
   - Or run the portable version

## Features

✅ Runs completely offline
✅ No browser needed
✅ Same functionality as web version
✅ Execute PowerShell/CMD commands
✅ Manage git, npm, dev server
✅ Fully configurable via config.json

## Building for Distribution

The built app will be in `dev-panel/dist/`:
- `PAM Dev Panel Setup.exe` - Installer
- Portable version (no install needed)

You can copy this to other Windows PCs and run it anywhere!

## Configuration

Same as web version - edit `config.json` to customize:
- Project name and icon
- Commands and buttons
- Theme colors
- Quick links

## Running Commands

The app executes commands in the parent directory (your project folder), so all git/npm commands work exactly as if you ran them in PowerShell.

## System Requirements

- Windows 10 or later
- No other dependencies needed after building!
