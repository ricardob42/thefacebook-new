const DB_NAME = 'thefacebook-local-v2';
const STORE = 'posts';

let dbPromise;

function open() {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close();
        dbPromise = null;
      };
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function run(mode, work) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = work(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
  });
}

export const getAll = () => run('readonly', (store) => store.getAll());
export const save = (entry) => run('readwrite', (store) => store.put(entry));
export const remove = (id) => run('readwrite', (store) => store.delete(id));

export const replaceAll = (list) =>
  run('readwrite', (store) => {
    store.clear();
    list.forEach((entry) => store.put(entry));
  });
