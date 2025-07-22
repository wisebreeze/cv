import JSZip from 'jszip';

const STORAGE_TYPES = ['memory', 'indexedDB', 'localStorage'];

const joinPaths = (...paths) => {
  return paths.join('/').replace(/\/+/g, '/');
}

const normalizeListPath = path => {
  let normalized = path
    .replace(/\/+/g, '/')
    .replace(/^\/?/, '/')
    .replace(/\/?$/, '/');
  
  // 处理根目录特殊情况
  if (normalized === '//') normalized = '/';
  
  // 确保路径不以中间内容匹配
  if (normalized !== '/') {
    normalized = normalized.replace(/([^/])$/, '$1/');
  }
  return normalized;
}

const normalizeZipPath = zipPath => {
  return zipPath
    .replace(/\/\/+/g, '/')
    .replace(/^\/?(.+?)\/?$/, '$1');
}

const hasExtension = path => {
  const filename = path.split('/').pop();
  return filename.includes('.') && 
    filename.lastIndexOf('.') > 0 &&
    filename.lastIndexOf('.') < filename.length - 1;
}

const parseData = (content, path) => {
  const ext = path.split('.').pop().toLowerCase();
  if (ext === 'json') return JSON.parse(content);
  return content;
}

const processData = data => {
  if (typeof data === 'object' && !(data instanceof Blob)) {
    return JSON.stringify(data);
  }
  return data || '';
}

const getFileExtension = path => {
  const fileName = path.split('/').pop();
  const lastDotIndex = fileName.lastIndexOf('.');
  
  if (lastDotIndex > 0 && lastDotIndex < fileName.length - 1) {
    return fileName.slice(lastDotIndex);
  }
  return '';
}

const splitFileName = name => {
  const lastDotIndex = name.lastIndexOf('.');
  if (lastDotIndex > 0 && lastDotIndex < name.length - 1) {
    return [
      name.slice(0, lastDotIndex),
      name.slice(lastDotIndex)
    ];
  }
  return [name, ''];
}

const getRelativePath = (basePath, targetPath) => {
  const normalize = (path, isDirectory) => {
    path = path.replace(/\/+/g, '/');
    if (isDirectory && !path.endsWith('/')) {
      path += '/';
    }
    return path;
  };
  const base = normalize(basePath, true);
  const target = normalize(targetPath, false);
  if (!target.startsWith(base)) {
    return null;
  }
  if (base === target) {
    return "/";
  }
  const relativePath = target.slice(base.length);
  return relativePath;
}

const wrapResult = (result, callback) => {
  if (callback) {
    callback(null, result);
    return result;
  }
  return Promise.resolve(result);
}

const handleError = (error, callback) => {
  const message = error instanceof Error ? error.message : String(error);
  if (callback) {
    callback(message);
  } else {
    console.error('FileSystem Error:', message);
  }
}

export default class FileSystem {
  constructor(storageType = 'memory') {
    if (!STORAGE_TYPES.includes(storageType)) {
      throw new Error(`Invalid storage type: ${storageType}`);
    }
    window.fs = FileSystem
    window.test = this

    this.storageType = storageType;
    this.fileSystem = this._initStorage();
    this.mimeExtensions = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'application/json': 'json',
      'text/plain': 'txt',
    };
  }

  async write(path, data, options = {}, callback) {
    try {
      if (!path) throw new Error('Path is required');
      
      const { overwrite = true, createTime = new Date(), modifyTime = new Date() } = options;
      const resolvedPath = this._resolvePath(path, data);
      
      if (!(await this._shouldWriteFile(resolvedPath, overwrite))) {
        return wrapResult(false, callback);
      }

      const processedData = processData(data);
      await this._saveFile(resolvedPath, processedData, { createTime, modifyTime });
      
      return wrapResult(true, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult(false, callback);
    }
  }

  async read(path, callback) {
    try {
      if (!path) throw new Error('Path is required');
      
      const fileData = await this._getFile(path);
      if (!fileData) return wrapResult(null, callback);
      
      const result = parseData(fileData.content, path);
      return wrapResult(result, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult(null, callback);
    }
  }

  async exist(path, callback) {
    try {
      if (!path) throw new Error('Path is required');
      const exists = await this.fileSystem.exists(path);
      return wrapResult(exists, callback);
    } catch (error) {
      return wrapResult(false, callback);
    }
  }

  async remove(path, callback) {
    try {
      if (!path) throw new Error('Path is required');

      if (path === '/' || path === '') {
        await this.fileSystem.clear();
        return wrapResult(true, callback);
      }

      let removed = false;
      const isFile = hasExtension(path);
  
      if (!isFile) {
        // 先尝试删除文件夹
        const dirPath = path.endsWith('/') ? path : `${path}/`;
        const allFiles = await this._getAllFiles();
        const folderFiles = allFiles.filter(f => f.path.startsWith(dirPath));
  
        if (folderFiles.length > 0) {
          await Promise.all(folderFiles.map(f => this.fileSystem.deleteFile(f.path)));
          removed = true;
        } else {
          // 再尝试删除无后缀文件
          const fileExists = await this.fileSystem.exists(path);
          if (fileExists) {
            await this.fileSystem.deleteFile(path);
            removed = true;
          }
        }
      } else {
        // 直接删除文件
        const fileExists = await this.fileSystem.exists(path);
        if (fileExists) {
          await this.fileSystem.deleteFile(path);
          removed = true;
        }
      }
  
      return wrapResult(removed, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult(false, callback);
    }
  }

  async rename(path, name, callback) {
    try {
      if (!path || !name) throw new Error('Both path and name are required');
      
      // 获取原文件信息
      const fileData = await this._getFile(path);
      if (!fileData) throw new Error('Source file not found');
  
      // 生成新路径
      const newPath = this._generateNewPath(path, name);
      
      // 检查新路径是否存在
      if (await this.fileSystem.exists(newPath)) {
        throw new Error('Target path already exists');
      }
  
      // 移动文件
      await this._saveFile(newPath, fileData.content, fileData.metadata);
      await this.fileSystem.deleteFile(path);
      
      return wrapResult(true, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult(false, callback);
    }
  }

  async mkdir(path, callback) {
    try {
      if (!path) throw new Error('Path is required');
      
      // 标准化目录路径
      const dirPath = normalizeListPath(path);
      
      // 检查目录是否已存在
      if (await this.exist(dirPath)) {
        return wrapResult(true, callback);
      }
  
      // 创建目录标记文件
      await this.write(dirPath, '', { 
        overwrite: false,
        isDirectory: true
      });
      
      return wrapResult(true, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult(false, callback);
    }
  }

  async importFromZip(zipFile, overwrite = true, progressCallback) {
    try {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      const files = zipData.files;
      
      const totalFiles = Object.keys(files).length;
      let processed = 0;
      
      // 文本文件检测函数
      const isTextFile = async (file) => {
        try {
          // 尝试读取文件内容为文本
          const textContent = await file.async('text');
          
          // 检查文本是否包含非可打印字符
          for (let i = 0; i < Math.min(textContent.length, 1000); i++) {
            const charCode = textContent.charCodeAt(i);
            // 检查非可打印字符（除制表符、换行符、回车符外）
            if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) {
              return false;
            }
          }
          
          return true;
        } catch (e) {
          return false;
        }
      };
  
      // 递归处理压缩包结构
      const processEntry = async (relativePath, file) => {
        if (file.dir) {
          // 创建目录
          await this.mkdir(relativePath);
          progressCallback?.(++processed, totalFiles);
        } else {
          // 检测文件类型
          let content;
          if (await isTextFile(file)) {
            // 处理文本文件
            content = await file.async('text');
          } else {
            // 处理二进制文件
            content = await file.async('blob');
          }
          
          // 写入文件系统
          await this.write(
            relativePath, 
            content, 
            { overwrite }, 
            () => progressCallback?.(++processed, totalFiles)
          );
        }
      };
  
      // 并行处理所有文件
      await Promise.all(
        Object.entries(files).map(([path, file]) => 
          processEntry(normalizeZipPath(path), file)
        )
      );
      
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }

  async exportToZip(filename = 'export.zip', progressCallback, completedCallback) {
    const zip = new JSZip();
    const files = await this._getAllFiles();
    files.forEach(({ path, content }) => {
      zip.file(path, content);
    });
    return zip.generateAsync({ type: 'blob' }, progressCallback)
      .then(blob => {
        const downloadBlob = (blob, fileName) => {
          if (typeof Blob === 'undefined') {
            handleError('Your browser does not support file downloading');
            return;
          }
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, fileName);
            return;
          }
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          if (/(iPod|iPhone|iPad)/i.test(navigator.userAgent)) {
            document.body.appendChild(link);
            const event = new MouseEvent('touchstart', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            link.dispatchEvent(event);
          } else {
            document.body.appendChild(link);
            link.click();
          }
          setTimeout(() => {
            try {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            } catch (e) {
              handleError('Resource cleanup failure (' + e + ')');
            }
          }, 1000);
        };
        downloadBlob(blob, filename);
        if (completedCallback) completedCallback();
        return true;
      })
      .catch(error => {
        handleError(error);
        return false;
      });
  }

  async list(path = '/', callback) {
    try {
      // 标准化路径格式
      let normalizedPath = normalizeListPath(path);
      const allEntries = await this._getAllFiles();
      const resultSet = new Set();
  
      // 获取所有存储路径（包含显式目录）
      const allPaths = [
        ...allEntries.map(f => f.path),
        ...allEntries.filter(f => f.metadata?.isDirectory).map(f => f.path)
      ];
      normalizedPath = normalizedPath.replace(/^\//, '');
  
      // 遍历处理每个路径
      for (let fullPath of allPaths) {
        fullPath = fullPath.replace(/^\//, '');
        if (normalizedPath === "") resultSet.add(fullPath);
        else if (fullPath.startsWith(normalizedPath)) resultSet.add(getRelativePath(normalizedPath, fullPath));
      }
      const sortedResult = Array.from(resultSet).sort((a, b) => {
        const isDirA = a.endsWith('/');
        const isDirB = b.endsWith('/');
        return isDirB - isDirA || a.localeCompare(b);
      });
  
      return wrapResult(sortedResult, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult([], callback);
    }
  }

  async copy(sourcePath, targetDir, overwrite = true, callback) {
    try {
      // 参数校验
      if (!sourcePath || !targetDir) {
        throw new Error('Both source and target paths are required');
      }
  
      // 标准化路径
      const normalizedSource = sourcePath.replace(/\/+/g, '/').replace(/\/$/, '');
      const normalizedTarget = normalizeListPath(targetDir);
  
      // 验证源路径存在
      if (!await this.exist(normalizedSource)) {
        throw new Error(`Source path not found: ${normalizedSource}`);
      }
  
      // 验证目标路径是目录
      if (!await this._isDirectory(normalizedTarget)) {
        throw new Error(`Target is not a directory: ${normalizedTarget}`);
      }
  
      // 执行复制操作
      const isDirectory = await this._isDirectory(normalizedSource);
      if (isDirectory) {
        await this._copyDirectory(normalizedSource, normalizedTarget, overwrite);
      } else {
        await this._copyFile(normalizedSource, normalizedTarget, overwrite);
      }
  
      return wrapResult(true, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult(false, callback);
    }
  }

  async move(sourcePath, targetDir, overwrite = true, callback) {
    try {
      // 参数校验
      if (!sourcePath || !targetDir) {
        throw new Error('Both source and target paths are required');
      }
  
      // 标准化路径
      const normalizedSource = sourcePath.replace(/\/+/g, '/').replace(/\/$/, '');
      const normalizedTarget = normalizeListPath(targetDir);
  
      // 验证源路径存在
      if (!await this.exist(normalizedSource)) {
        throw new Error(`Source path not found: ${normalizedSource}`);
      }
  
      // 先执行复制
      const copySuccess = await this.copy(
        normalizedSource,
        normalizedTarget,
        overwrite
      );
      if (!copySuccess) return wrapResult(false, callback);
  
      // 复制成功后删除原路径
      const removeSuccess = await this.remove(normalizedSource);
      return wrapResult(removeSuccess, callback);
    } catch (error) {
      handleError(error, callback);
      return wrapResult(false, callback);
    }
  }

  // 私有方法
  _initStorage() {
    switch (this.storageType) {
      case 'indexedDB':
        return new IndexedDBStorage();
      case 'localStorage':
        return new LocalStorage();
      default:
        return new MemoryStorage();
    }
  }

  async _isDirectory(path) {
    const normalized = path.endsWith('/') ? path : path + '/';
    const list = await this.list(normalized);
    return list.length > 0 || await this.exist(normalized);
  }

  _resolvePath(originalPath, data) {
    // 处理目录路径
    if (originalPath.endsWith('/')) {
      return originalPath;
    }
  
    const pathParts = originalPath.split('/');
    const fileName = pathParts.pop() || '';
  
    // 检查是否已有扩展名
    const lastDotIndex = fileName.lastIndexOf('.');
    const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;
  
    let finalFileName = fileName;
    if (!hasExtension) {
      const ext = this._getExtension(data);
      if (ext) {
        finalFileName = `${fileName}${ext}`;
      }
    }
    return [...pathParts, finalFileName].join('/');
  }

  _getExtension(data) {
    if (data instanceof Blob) {
      const ext = this.mimeExtensions[data.type] || 'bin';
      return ext ? `.${ext}` : '';
    }
    if (typeof data === 'object') return '.json';
    if (typeof data === 'string') return '.txt';
    return '';
  }

  _generateNewPath(oldPath, newName) {
    const pathParts = oldPath.split('/');
    pathParts.pop(); // 移除旧文件名
    
    // 处理扩展名
    const oldExt = getFileExtension(oldPath);
    const [baseName, newExt] = splitFileName(newName);
    
    const finalName = newExt ? `${baseName}${newExt}` : `${baseName}${oldExt}`;
    return [...pathParts, finalName].join('/');
  }

  async _copyFile(sourcePath, targetDir, overwrite) {
    const fileName = sourcePath.split('/').pop();
    const targetPath = joinPaths(targetDir, fileName);
  
    if (!overwrite && await this.exist(targetPath)) {
      return;
    }
  
    const content = await this.read(sourcePath);
    await this.write(targetPath, content, { overwrite });
  }

  async _copyDirectory(sourceDir, targetDir, overwrite) {
    // 创建目标目录结构
    const dirName = sourceDir.split('/').filter(Boolean).pop() + '/';
    const newTargetDir = joinPaths(targetDir, dirName);
    await this.mkdir(newTargetDir);
  
    // 递归复制内容
    const entries = await this.list(sourceDir);
    for (const entry of entries) {
      const fullSourcePath = joinPaths(sourceDir, entry);
      if (entry.endsWith('/')) {
        await this._copyDirectory(fullSourcePath, newTargetDir, overwrite);
      } else {
        await this._copyFile(fullSourcePath, newTargetDir, overwrite);
      }
    }
  }

  async _saveFile(path, content, metadata) {
    await this.fileSystem.saveFile(path, content, metadata);
  }
  
  async _getFile(path) {
    return this.fileSystem.getFile(path);
  }

  async _getAllFiles() {
    return this.fileSystem.getAllFiles();
  }

  async _shouldWriteFile(path, overwrite) {
    const exists = await this.fileSystem.exists(path);
    return overwrite || !exists;
  }
}

// 存储适配器
class MemoryStorage {
  constructor() {
    this.files = new Map();
  }

  async exists(path) {
    // 检查目录时需要特殊处理
    if (path.endsWith('/')) {
      return Array.from(this.files.keys()).some(k => 
        k.startsWith(path) || k === path
      );
    }
    return this.files.has(path);
  }

  async getFile(path) {
    return this.files.get(path);
  }

  async saveFile(path, content, metadata) {
    // 处理目录标记
    if (metadata?.isDirectory) {
      this.files.set(path, {
        content: '[DIR]',
        metadata: { ...metadata, isDirectory: true }
      });
    } else {
      this.files.set(path, { content, metadata });
    }
  }

  async getAllFiles() {
    return Array.from(this.files.entries()).map(([path, data]) => ({ path, ...data }));
  }

  async deleteFile(path) {
    this.files.delete(path);
  }

  async clear() {
    this.files.clear();
    if (this.metadata) this.metadata.clear();
    return true;
  }
}

// localStorage适配器
class LocalStorage {
  constructor() {
    this.prefix = 'fs_';
  }

  async exists(path) {
    return localStorage.getItem(this.prefix + path) !== null;
  }

  async getFile(path) {
    const data = localStorage.getItem(this.prefix + path);
    return data ? JSON.parse(data) : null;
  }

  async saveFile(path, content, metadata) {
    const storageKey = this.prefix + path;
    const isDirectory = metadata?.isDirectory;

    // 处理目录标记
    const data = {
      content: isDirectory ? '[DIR]' : content,
      metadata: {
        ...metadata,
        isDirectory: !!isDirectory
      }
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      throw new Error(`LocalStorage quota exceeded: ${error.message}`);
    }
  }

  async getAllFiles() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .map(k => ({
        path: k.slice(this.prefix.length),
        ...JSON.parse(localStorage.getItem(k))
      }));
  }

  async deleteFile(path) {
    localStorage.removeItem(this.prefix + path);
  }

  async clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .forEach(k => localStorage.removeItem(k));
    return true;
  }
}

class IndexedDBStorage {
  constructor() {
    this.dbName = 'FileSystemDB';
    this.storeName = 'files';
  }

  // 私有方法：打开数据库连接
  _openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'path' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async exists(path) {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = path.endsWith('/') ? 
        store.openCursor(IDBKeyRange.lowerBound(path)) : 
        store.get(path);

      request.onsuccess = () => {
        if (path.endsWith('/')) {
          resolve(!!request.result?.key.startsWith(path));
        } else {
          resolve(!!request.result);
        }
      };
      request.onerror = () => resolve(false);
    });
  }

  async getFile(path) {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(path);

      request.onsuccess = () => {
        const data = request.result;
        resolve(data ? { 
          content: data.content, 
          metadata: data.metadata || {} 
        } : null);
      };
      request.onerror = () => reject(null);
    });
  }

  async saveFile(path, content, metadata) {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const fileData = {
        path,
        content: metadata?.isDirectory ? '[DIR]' : content,
        metadata: {
          ...metadata,
          isDirectory: !!metadata?.isDirectory,
          createTime: metadata.createTime || new Date(),
          modifyTime: metadata.modifyTime || new Date(),
        }
      };
      const request = store.put(fileData);
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async delete(path) {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(path);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(false);
    });
  }

  async getAllFiles() {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push({
            path: cursor.key,
            content: cursor.value.content,
            metadata: cursor.value.metadata
          });
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject([]);
    });
  }

  async clear() {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(false);
    });
  }
}