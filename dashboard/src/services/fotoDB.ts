// IndexedDB-Service für Foto-Blobs + Metadaten.
// LocalStorage scheidet aus (5-MB-Limit); IndexedDB trägt beliebig viele Bilder.

import type { FotoMetadaten } from '@/domain/types';

const DB_NAME = 'ccpro_fotos_v1';
const DB_VERSION = 1;
const STORE_BLOBS = 'blobs';
const STORE_META = 'metadaten';

// Maximale lange Seite nach Komprimierung.
const MAX_PX = 1600;
const JPEG_Q = 0.85;

function dbOeffnen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS);
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        const store = db.createObjectStore(STORE_META, { keyPath: 'id' });
        store.createIndex('kundeId', 'kundeId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Skaliert und komprimiert ein Bild auf max MAX_PX (lange Seite) als JPEG.
async function komprimieren(
  datei: File,
): Promise<{ blob: Blob; breite: number; hoehe: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(datei);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (Math.max(w, h) > MAX_PX) {
        if (w >= h) {
          h = Math.round((h / w) * MAX_PX);
          w = MAX_PX;
        } else {
          w = Math.round((w / h) * MAX_PX);
          h = MAX_PX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas-Kontext nicht verfügbar'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve({ blob, breite: w, hoehe: h });
          else reject(new Error('canvas.toBlob fehlgeschlagen'));
        },
        'image/jpeg',
        JPEG_Q,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Bild konnte nicht geladen werden'));
    };
    img.src = objUrl;
  });
}

// Speichert ein Foto (Blob + Metadaten) in IndexedDB.
export async function fotoSpeichern(
  meta: Omit<FotoMetadaten, 'groesse_bytes' | 'breite_px' | 'hoehe_px'>,
  datei: File,
): Promise<FotoMetadaten> {
  const { blob, breite, hoehe } = await komprimieren(datei);
  const vollMeta: FotoMetadaten = {
    ...meta,
    groesse_bytes: blob.size,
    breite_px: breite,
    hoehe_px: hoehe,
  };
  const db = await dbOeffnen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_BLOBS, STORE_META], 'readwrite');
    tx.objectStore(STORE_BLOBS).put(blob, meta.id);
    tx.objectStore(STORE_META).put(vollMeta);
    tx.oncomplete = () => {
      db.close();
      resolve(vollMeta);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Lädt ein einzelnes Foto (Blob + Metadaten).
export async function fotoLaden(
  id: string,
): Promise<{ meta: FotoMetadaten; blob: Blob } | undefined> {
  const db = await dbOeffnen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_BLOBS, STORE_META], 'readonly');
    const blobReq = tx.objectStore(STORE_BLOBS).get(id);
    const metaReq = tx.objectStore(STORE_META).get(id);
    tx.oncomplete = () => {
      db.close();
      if (blobReq.result && metaReq.result) {
        resolve({ meta: metaReq.result as FotoMetadaten, blob: blobReq.result as Blob });
      } else {
        resolve(undefined);
      }
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Alle Metadaten eines Kunden, neueste zuerst.
export async function fotosNachKunde(kundeId: string): Promise<FotoMetadaten[]> {
  const db = await dbOeffnen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, 'readonly');
    const req = tx.objectStore(STORE_META).index('kundeId').getAll(kundeId);
    tx.oncomplete = () => {
      db.close();
      resolve(
        (req.result as FotoMetadaten[]).sort((a, b) =>
          b.zeitstempel.localeCompare(a.zeitstempel),
        ),
      );
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Löscht Blob und Metadaten eines Fotos.
export async function fotoLoeschen(id: string): Promise<void> {
  const db = await dbOeffnen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_BLOBS, STORE_META], 'readwrite');
    tx.objectStore(STORE_BLOBS).delete(id);
    tx.objectStore(STORE_META).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Gibt eine temporäre Object-URL zurück. Caller muss URL.revokeObjectURL() aufrufen.
export async function fotoObjectUrl(id: string): Promise<string | undefined> {
  const result = await fotoLaden(id);
  if (!result) return undefined;
  return URL.createObjectURL(result.blob);
}
