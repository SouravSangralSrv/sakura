
export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export class FileSystemService {
  private static get electron() {
    return (window as any).require ? (window as any).require('electron') : null;
  }
  private static get fs() {
    return (window as any).require ? (window as any).require('fs') : null;
  }
  private static get path() {
    return (window as any).require ? (window as any).require('path') : null;
  }
  private static get os() {
    return (window as any).require ? (window as any).require('os') : null;
  }

  static isAvailable(): boolean {
    return !!(window as any).require;
  }

  static getDesktopPath(): string {
    if (!this.os || !this.path) return '';
    return this.path.join(this.os.homedir(), 'Desktop');
  }

  static getParentPath(currentPath: string): string {
    if (!this.path) return currentPath;
    return this.path.dirname(currentPath);
  }

  static getDirectoryInfo(dirPath?: string): FileItem[] | string {
    if (!this.fs || !this.path) return "System file access is only available when running in the Desktop App.";
    const targetPath = dirPath || this.getDesktopPath();
    try {
      const files = this.fs.readdirSync(targetPath);
      return files.map((file: string) => {
        const fullPath = this.path.join(targetPath, file);
        let isDirectory = false;
        try {
          isDirectory = this.fs.statSync(fullPath).isDirectory();
        } catch (e) {}
        return { name: file, path: fullPath, isDirectory };
      });
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }

  static listFiles(dirPath?: string): string {
    const info = this.getDirectoryInfo(dirPath);
    if (typeof info === 'string') return info;
    
    if (info.length === 0) return "The directory is empty.";
    return `Contents of directory: \n- ${info.slice(0, 50).map(f => `${f.name}${f.isDirectory ? '/' : ''}`).join('\n- ')}${info.length > 50 ? '\n...and more' : ''}`;
  }

  static readFile(filePath: string): string {
    if (!this.fs) return "Filesystem access unavailable.";
    try {
      const content = this.fs.readFileSync(filePath, 'utf8');
      return content.length > 5000 ? content.substring(0, 5000) + "... [Truncated]" : content;
    } catch (e: any) {
      return `Error reading file: ${e.message}`;
    }
  }

  static openFile(filePath: string): string {
    if (!this.electron) return "System shell access is only available when running in the Desktop App.";
    try {
      this.electron.shell.openPath(filePath);
      return `Successfully opened: ${filePath}`;
    } catch (e: any) {
      return `Error opening file: ${e.message}`;
    }
  }

  static openBrowser(url: string): string {
    if (!this.electron) return "Browser access is only available when running in the Desktop App.";
    try {
      this.electron.shell.openExternal(url);
      return `Opened URL: ${url}`;
    } catch (e: any) {
      return `Error opening browser: ${e.message}`;
    }
  }

  // Fix: Added createFolder to handle directory creation in FileBrowser.
  static createFolder(parentPath: string, folderName: string): boolean | string {
    if (!this.fs || !this.path) return "Filesystem access unavailable.";
    const fullPath = this.path.join(parentPath, folderName);
    try {
      if (this.fs.existsSync(fullPath)) return "Folder already exists.";
      this.fs.mkdirSync(fullPath);
      return true;
    } catch (e: any) {
      return `Error creating folder: ${e.message}`;
    }
  }

  // Fix: Added createFile to handle file creation in FileBrowser.
  static createFile(parentPath: string, fileName: string): boolean | string {
    if (!this.fs || !this.path) return "Filesystem access unavailable.";
    const fullPath = this.path.join(parentPath, fileName);
    try {
      if (this.fs.existsSync(fullPath)) return "File already exists.";
      this.fs.writeFileSync(fullPath, '');
      return true;
    } catch (e: any) {
      return `Error creating file: ${e.message}`;
    }
  }
}
