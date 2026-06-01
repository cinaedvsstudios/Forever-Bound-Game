(() => {
  'use strict';

  const VERSION = '0.1.0';
  const DB_NAME = 'artifex.projectFolder';
  const DB_VERSION = 1;
  const STORE_NAME = 'connections';
  const ACTIVE_CONNECTION_KEY = 'active-project-folder';

  const SAVE_STATUS = Object.freeze({
    SAVED: 'Saved to Project Folder',
    LOCAL_DRAFT_ONLY: 'Local Draft Only',
    PROJECT_FILE_CHANGED: 'Project File Changed',
    CONFLICT: 'Conflict',
    PERMISSION_REQUIRED: 'Permission Required',
    NO_FOLDER_CONNECTED: 'No Folder Connected',
    SAVE_FAILED: 'Save Failed'
  });

  const FOLDER_STATUS = Object.freeze({
    CONNECTED: 'connected',
    PERMISSION_REQUIRED: 'permission-required',
    NO_FOLDER_CONNECTED: 'no-folder-connected',
    UNSUPPORTED: 'unsupported',
    ERROR: 'error'
  });

  const state = {
    folderStatus: FOLDER_STATUS.NO_FOLDER_CONNECTED,
    saveStatus: SAVE_STATUS.NO_FOLDER_CONNECTED,
    handle: null,
    folderName: null,
    projectId: null,
    lastError: null,
    lastCheckedAt: null
  };

  function supportsFileSystemAccess() {
    return typeof window.showDirectoryPicker === 'function';
  }

  function cloneState() {
    return {
      folderStatus: state.folderStatus,
      saveStatus: state.saveStatus,
      folderName: state.folderName,
      projectId: state.projectId,
      lastError: state.lastError,
      lastCheckedAt: state.lastCheckedAt,
      supported: supportsFileSystemAccess()
    };
  }

  function emitState() {
    window.dispatchEvent(new CustomEvent('artifex:project-folder-state', { detail: cloneState() }));
  }

  function setState(next) {
    Object.assign(state, next, { lastCheckedAt: new Date().toISOString() });
    emitState();
    return cloneState();
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is unavailable in this browser.'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error || new Error('Unable to open project-folder database.'));
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  async function storeConnection(record) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(record, ACTIVE_CONNECTION_KEY);
      transaction.oncomplete = () => {
        database.close();
        resolve(record);
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error || new Error('Unable to store project-folder connection.'));
      };
    });
  }

  async function readStoredConnection() {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(ACTIVE_CONNECTION_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Unable to read project-folder connection.'));
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => {
        database.close();
        reject(transaction.error || new Error('Unable to read project-folder connection.'));
      };
    });
  }

  async function clearStoredConnection() {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(ACTIVE_CONNECTION_KEY);
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error || new Error('Unable to remove project-folder connection.'));
      };
    });
  }

  function cleanRelativePath(path) {
    const raw = String(path || '').trim().replace(/\\/g, '/');
    if (!raw || raw.startsWith('/') || /^[a-zA-Z]:\//.test(raw) || raw.includes('://')) {
      throw new Error('A project-relative path is required.');
    }
    const segments = raw.split('/').filter(Boolean);
    if (!segments.length || segments.some((segment) => segment === '.' || segment === '..')) {
      throw new Error('The project-relative path is invalid.');
    }
    return segments;
  }

  async function queryPermission(handle) {
    if (!handle) return 'denied';
    if (typeof handle.queryPermission !== 'function') return 'granted';
    return handle.queryPermission({ mode: 'readwrite' });
  }

  async function requestPermission(handle) {
    if (!handle) return 'denied';
    if (typeof handle.requestPermission !== 'function') return 'granted';
    return handle.requestPermission({ mode: 'readwrite' });
  }

  async function useHandle(record, requestAccess = false) {
    if (!record?.handle) {
      state.handle = null;
      return setState({
        folderStatus: FOLDER_STATUS.NO_FOLDER_CONNECTED,
        saveStatus: SAVE_STATUS.NO_FOLDER_CONNECTED,
        folderName: null,
        projectId: null,
        lastError: null
      });
    }
    const permission = requestAccess ? await requestPermission(record.handle) : await queryPermission(record.handle);
    state.handle = record.handle;
    if (permission !== 'granted') {
      return setState({
        folderStatus: FOLDER_STATUS.PERMISSION_REQUIRED,
        saveStatus: SAVE_STATUS.PERMISSION_REQUIRED,
        folderName: record.folderName || record.handle.name || null,
        projectId: record.projectId || null,
        lastError: null
      });
    }
    return setState({
      folderStatus: FOLDER_STATUS.CONNECTED,
      saveStatus: SAVE_STATUS.SAVED,
      folderName: record.folderName || record.handle.name || null,
      projectId: record.projectId || null,
      lastError: null
    });
  }

  async function restoreConnection() {
    if (!supportsFileSystemAccess()) {
      return setState({
        folderStatus: FOLDER_STATUS.UNSUPPORTED,
        saveStatus: SAVE_STATUS.NO_FOLDER_CONNECTED,
        lastError: 'Direct folder access is not supported in this browser.'
      });
    }
    try {
      return await useHandle(await readStoredConnection(), false);
    } catch (error) {
      return setState({
        folderStatus: FOLDER_STATUS.ERROR,
        saveStatus: SAVE_STATUS.SAVE_FAILED,
        lastError: error.message || String(error)
      });
    }
  }

  async function connectProjectFolder(projectId = null) {
    if (!supportsFileSystemAccess()) {
      throw new Error('Direct project-folder access is not supported in this browser.');
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const record = {
        handle,
        folderName: handle.name || null,
        projectId: projectId || null,
        connectedAt: new Date().toISOString()
      };
      await storeConnection(record);
      return await useHandle(record, true);
    } catch (error) {
      if (error?.name === 'AbortError') return cloneState();
      setState({ folderStatus: FOLDER_STATUS.ERROR, saveStatus: SAVE_STATUS.SAVE_FAILED, lastError: error.message || String(error) });
      throw error;
    }
  }

  async function reauthoriseProjectFolder() {
    const record = await readStoredConnection();
    if (!record?.handle) throw new Error('No connected project folder is stored in this browser.');
    return useHandle(record, true);
  }

  async function forgetProjectFolder() {
    await clearStoredConnection();
    state.handle = null;
    return setState({
      folderStatus: FOLDER_STATUS.NO_FOLDER_CONNECTED,
      saveStatus: SAVE_STATUS.NO_FOLDER_CONNECTED,
      folderName: null,
      projectId: null,
      lastError: null
    });
  }

  function requireWritableHandle() {
    if (!state.handle || state.folderStatus !== FOLDER_STATUS.CONNECTED) {
      throw new Error('A writable project folder is not connected.');
    }
    return state.handle;
  }

  async function getDirectory(path, create = false) {
    const segments = cleanRelativePath(path);
    let directory = requireWritableHandle();
    for (const segment of segments) directory = await directory.getDirectoryHandle(segment, { create });
    return directory;
  }

  async function getFileHandle(path, create = false) {
    const segments = cleanRelativePath(path);
    const filename = segments.pop();
    let directory = requireWritableHandle();
    for (const segment of segments) directory = await directory.getDirectoryHandle(segment, { create });
    return directory.getFileHandle(filename, { create });
  }

  async function ensureDirectory(path) {
    await getDirectory(path, true);
    return path;
  }

  async function readText(path) {
    const handle = await getFileHandle(path, false);
    const file = await handle.getFile();
    return file.text();
  }

  async function writeText(path, content) {
    return writeBlob(path, new Blob([String(content ?? '')], { type: 'text/plain;charset=utf-8' }));
  }

  async function readBytes(path) {
    const handle = await getFileHandle(path, false);
    const file = await handle.getFile();
    return new Uint8Array(await file.arrayBuffer());
  }

  async function writeBytes(path, bytes) {
    return writeBlob(path, bytes instanceof Blob ? bytes : new Blob([bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || [])]));
  }

  async function writeBlob(path, content) {
    try {
      const handle = await getFileHandle(path, true);
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      setState({ saveStatus: SAVE_STATUS.SAVED, lastError: null });
      return path;
    } catch (error) {
      setState({ saveStatus: SAVE_STATUS.SAVE_FAILED, lastError: error.message || String(error) });
      throw error;
    }
  }

  async function readJson(path) {
    return JSON.parse(await readText(path));
  }

  async function writeJson(path, value) {
    return writeText(path, `${JSON.stringify(value, null, 2)}\n`);
  }

  async function fileExists(path) {
    try {
      await getFileHandle(path, false);
      return true;
    } catch (error) {
      if (error?.name === 'NotFoundError') return false;
      throw error;
    }
  }

  async function directoryExists(path) {
    try {
      await getDirectory(path, false);
      return true;
    } catch (error) {
      if (error?.name === 'NotFoundError') return false;
      throw error;
    }
  }

  function markLocalDraftOnly() {
    return setState({ saveStatus: SAVE_STATUS.LOCAL_DRAFT_ONLY });
  }

  window.ArtifexProjectFolder = {
    version: VERSION,
    saveStatus: SAVE_STATUS,
    folderStatus: FOLDER_STATUS,
    getState: cloneState,
    supportsFileSystemAccess,
    restoreConnection,
    connectProjectFolder,
    reauthoriseProjectFolder,
    forgetProjectFolder,
    ensureDirectory,
    readText,
    writeText,
    readBytes,
    writeBytes,
    writeBlob,
    readJson,
    writeJson,
    fileExists,
    directoryExists,
    markLocalDraftOnly
  };

  window.dispatchEvent(new CustomEvent('artifex:project-folder-client-ready', { detail: window.ArtifexProjectFolder }));
  restoreConnection();
})();
