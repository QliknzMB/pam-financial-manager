# Build Instructions

## For Windows Users (Your PC)

1. **Navigate to dev-panel folder:**
   ```powershell
   cd C:\Projects\pam-financial-manager\dev-panel
   ```

2. **Install Electron dependencies:**
   ```powershell
   npm install electron electron-builder --save-dev
   ```

3. **Build the Windows app:**
   ```powershell
   npm run build:win
   ```

4. **Wait for build to complete** (may take a few minutes first time)

5. **Find your app:**
   - Look in `C:\Projects\pam-financial-manager\dev-panel\dist\`
   - You'll see `PAM Dev Panel Setup.exe`

6. **Run the installer or portable version!**

## To Run Without Building

If you just want to test it:

```powershell
npm run electron
```

This opens the app window without creating an .exe file.

## Distribution

Once built, you can:
- Copy the .exe to other Windows PCs
- Install it on multiple machines
- Run it without Node.js installed
- Use it completely offline

The app will run all commands in whatever folder you put it in (or you can configure the working directory in config.json).
