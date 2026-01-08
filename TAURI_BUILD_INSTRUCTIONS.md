# Building Nujoom Invoices as Windows .exe

This guide will help you build a native Windows executable using Tauri.

## Prerequisites

### 1. Install Rust
Download and install Rust from: https://rustup.rs/
- Run the installer and follow the prompts
- Restart your terminal after installation
- Verify: `rustc --version`

### 2. Install Visual Studio Build Tools (Windows)
Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Select "Desktop development with C++"
- This is required for compiling native code on Windows

### 3. Install WebView2 Runtime (Windows 10/11)
Usually pre-installed on Windows 11. For Windows 10:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Setup Steps

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd <project-folder>
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Install Tauri CLI
```bash
npm install -D @tauri-apps/cli
```

### 4. Create App Icons
Create a `src-tauri/icons/` folder and add your icons:
- Copy your logo as `icon.ico` (Windows icon)
- Copy your logo as `icon.png` (32x32, 128x128, 256x256)

You can use https://convertio.co/ to convert PNG to ICO.

Or run this to generate icons automatically (requires a 1024x1024 PNG):
```bash
npx @tauri-apps/cli icon public/pwa-icon-512.png
```

### 5. Development Mode
Test the app in development:
```bash
npm run tauri dev
```

### 6. Build for Production
Create the Windows .exe:
```bash
npm run tauri build
```

The executable will be in:
- `src-tauri/target/release/Nujoom Invoices.exe` (portable)
- `src-tauri/target/release/bundle/msi/` (installer)
- `src-tauri/target/release/bundle/nsis/` (NSIS installer)

## Troubleshooting

### "cargo not found"
Restart your terminal or run:
```bash
source $HOME/.cargo/env
```

### Build errors on Windows
Make sure Visual Studio Build Tools are installed with C++ support.

### WebView2 errors
Install the WebView2 runtime from Microsoft.

## Distribution

After building, you can distribute:
1. **Portable .exe** - Single file, no installation needed
2. **MSI Installer** - Traditional Windows installer
3. **NSIS Installer** - Modern installer with options

## Size Comparison
- Tauri .exe: ~10-15 MB
- Electron .exe: ~150+ MB

Your app uses the system's WebView2, so it's much smaller!
