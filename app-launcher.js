// Secure Application Launcher for J.A.R.V.I.S Assistant
// This file should be used with the Electron backend

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

class AppLauncher {
  constructor() {
    this.platform = os.platform();
    this.allowedApps = new Set([
      // Web Browsers
      'chrome', 'firefox', 'msedge', 'safari',
      
      // Communication
      'discord', 'slack', 'zoom', 'teams', 'telegram', 'whatsapp',
      
      // Productivity
      'notepad', 'winword', 'excel', 'powerpnt', 'code', 'sublime_text',
      
      // Media
      'vlc', 'spotify', 'itunes',
      
      // System
      'calc', 'explorer', 'taskmgr', 'cmd', 'wt',
      
      // Creative
      'photoshop', 'mspaint', 'blender'
    ]);
  }

  async launchApplication(options) {
    try {
      const { executable, appName } = options;
      
      // Security check - only allow whitelisted applications
      if (!this.allowedApps.has(executable.toLowerCase())) {
        throw new Error(`Application "${executable}" is not authorized for launch.`);
      }

      console.log(`Preparing to launch ${appName} (${executable}) on ${this.platform}`);
      
      let launchCommand;
      let launchArgs = [];
      
      // Platform-specific launching
      switch (this.platform) {
        case 'win32':
          launchCommand = this.getWindowsCommand(executable);
          break;
        case 'darwin':
          launchCommand = this.getMacCommand(executable);
          break;
        case 'linux':
          launchCommand = this.getLinuxCommand(executable);
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }

      // Execute the launch command
      const result = await this.executeCommand(launchCommand, launchArgs);
      
      console.log(`Application ${appName} launched successfully`);
      
      return {
        success: true,
        appName,
        executable,
        platform: this.platform,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Failed to launch application:`, error);
      return {
        success: false,
        error: error.message,
        appName: options.appName,
        timestamp: new Date().toISOString()
      };
    }
  }

  getWindowsCommand(executable) {
    const windowsCommands = {
      'chrome': 'chrome',
      'firefox': 'firefox',
      'msedge': 'msedge',
      'safari': 'safari',
      'discord': 'discord',
      'slack': 'slack',
      'zoom': 'zoom',
      'teams': 'teams',
      'telegram': 'telegram',
      'whatsapp': 'whatsapp',
      'notepad': 'notepad',
      'winword': 'winword',
      'excel': 'excel',
      'powerpnt': 'powerpnt',
      'code': 'code',
      'sublime_text': 'sublime_text',
      'vlc': 'vlc',
      'spotify': 'spotify',
      'itunes': 'itunes',
      'calc': 'calc',
      'explorer': 'explorer',
      'taskmgr': 'taskmgr',
      'cmd': 'cmd',
      'wt': 'wt',
      'photoshop': 'photoshop',
      'mspaint': 'mspaint',
      'blender': 'blender'
    };

    const command = windowsCommands[executable];
    if (!command) {
      throw new Error(`Windows command not found for: ${executable}`);
    }

    // Use 'start' command to launch applications
    return `start "" "${command}"`;
  }

  getMacCommand(executable) {
    const macCommands = {
      'chrome': 'Google Chrome',
      'firefox': 'Firefox',
      'safari': 'Safari',
      'discord': 'Discord',
      'slack': 'Slack',
      'zoom': 'zoom.us',
      'teams': 'Microsoft Teams',
      'telegram': 'Telegram',
      'whatsapp': 'WhatsApp',
      'notepad': 'TextEdit',
      'code': 'Visual Studio Code',
      'vlc': 'VLC',
      'spotify': 'Spotify',
      'itunes': 'iTunes',
      'calc': 'Calculator',
      'terminal': 'Terminal',
      'photoshop': 'Adobe Photoshop',
      'mspaint': 'Preview',
      'blender': 'Blender'
    };

    const appName = macCommands[executable];
    if (!appName) {
      throw new Error(`macOS application not found for: ${executable}`);
    }

    return `open -a "${appName}"`;
  }

  getLinuxCommand(executable) {
    const linuxCommands = {
      'chrome': 'google-chrome',
      'firefox': 'firefox',
      'discord': 'discord',
      'slack': 'slack',
      'zoom': 'zoom',
      'teams': 'teams',
      'telegram': 'telegram-desktop',
      'code': 'code',
      'vlc': 'vlc',
      'spotify': 'spotify',
      'calc': 'gnome-calculator',
      'terminal': 'gnome-terminal',
      'blender': 'blender'
    };

    const command = linuxCommands[executable];
    if (!command) {
      throw new Error(`Linux command not found for: ${executable}`);
    }

    return command;
  }

  executeCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'ignore',
        detached: true
      });

      process.unref(); // Allow parent to exit independently

      process.on('error', (error) => {
        reject(new Error(`Failed to execute command: ${error.message}`));
      });

      process.on('spawn', () => {
        resolve(true);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Application launch timeout'));
      }, 5000);
    });
  }

  // Method to get list of available applications
  getAvailableApps() {
    return Array.from(this.allowedApps);
  }

  // Method to check if an application is available
  isAppAvailable(appName) {
    return this.allowedApps.has(appName.toLowerCase());
  }
}

// Export for use in Electron main process
module.exports = AppLauncher;

// Example usage in Electron main process:
/*
const AppLauncher = require('./app-launcher');
const appLauncher = new AppLauncher();

// Add this to your Electron IPC handlers:
ipcMain.handle('launch-app', async (event, options) => {
  return await appLauncher.launchApplication(options);
});

// Also add handler to get available apps:
ipcMain.handle('get-available-apps', async () => {
  return appLauncher.getAvailableApps();
});
*/
