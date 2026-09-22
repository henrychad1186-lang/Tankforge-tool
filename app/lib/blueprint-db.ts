// encoding: utf-8
/**
 * IndexedDB storage utility for storing large blueprint images and PDFs offline.
 * This prevents filling up localStorage quotas (usually 5MB max).
 */

const DB_NAME = "ust-hub-blueprints-db";
const DB_VERSION = 1;
const STORE_NAME = "blueprint-files";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "storageKey" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredBlueprintFile {
  storageKey: string;
  jobId: string;
  sheetId: string;
  fileName: string;
  fileType: string;
  dataUrl: string;
  updatedAt: string;
}

export async function saveBlueprintFile(fileData: StoredBlueprintFile): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(fileData);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getBlueprintFile(storageKey: string): Promise<StoredBlueprintFile | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(storageKey);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteBlueprintFile(storageKey: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(storageKey);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Error deleting blueprint from IndexedDB:", err);
  }
}
