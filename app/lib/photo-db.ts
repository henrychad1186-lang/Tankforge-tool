// encoding: utf-8
/**
 * IndexedDB storage for Pre-Bury photo image data.
 * Photo metadata (id, caption, category, timestamp) stays in the job's localStorage
 * state; the compressed JPEG data URLs live here so they don't fill the ~5 MB
 * localStorage quota. Records are keyed by [jobId, photoId].
 */

const DB_NAME = "ust-hub-photos-db";
const DB_VERSION = 1;
const STORE_NAME = "photos";

export interface StoredPhoto {
  jobId: string;
  id: string;
  dataUrl: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available in this environment"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: ["jobId", "id"] });
        store.createIndex("jobId", "jobId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return openDatabase().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const req = fn(tx.objectStore(STORE_NAME));
        tx.oncomplete = () => resolve(req ? req.result : undefined);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

export function savePhotos(photos: StoredPhoto[]): Promise<void> {
  if (photos.length === 0) return Promise.resolve();
  return run("readwrite", (store) => {
    photos.forEach((p) => store.put(p));
  }).then(() => undefined);
}

export function deletePhoto(jobId: string, id: string): Promise<void> {
  return run("readwrite", (store) => store.delete([jobId, id])).then(() => undefined);
}

export async function getJobPhotos(jobId: string): Promise<StoredPhoto[]> {
  const result = await run<StoredPhoto[]>("readonly", (store) => store.index("jobId").getAll(jobId));
  return result ?? [];
}

export async function getAllPhotos(): Promise<StoredPhoto[]> {
  const result = await run<StoredPhoto[]>("readonly", (store) => store.getAll());
  return result ?? [];
}

export function deleteJobPhotos(jobId: string): Promise<void> {
  return run("readwrite", (store) => {
    const req = store.index("jobId").openKeyCursor(IDBKeyRange.only(jobId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  }).then(() => undefined);
}

export async function copyJobPhotos(fromJobId: string, toJobId: string): Promise<void> {
  const photos = await getJobPhotos(fromJobId);
  await savePhotos(photos.map((p) => ({ ...p, jobId: toJobId })));
}

export function clearAllPhotos(): Promise<void> {
  return run("readwrite", (store) => store.clear()).then(() => undefined);
}
