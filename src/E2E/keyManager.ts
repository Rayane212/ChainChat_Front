// ✅ OPTIMAL : KeyManager avec Web Crypto API natif - Aucune dépendance
import { deriveKeyFromPassword } from './encryption';

interface StoredKeyData {
  id: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string; // IV pour AES-GCM
  timestamp: number;
  version: string;
}

interface StoredPublicKey {
  id: string;
  publicKey: string;
  timestamp: number;
}

// Utilitaires de conversion
const encodeBase64 = (bytes: Uint8Array): string => {
  return btoa(String.fromCharCode(...bytes));
};

const decodeBase64 = (str: string): Uint8Array => {
  return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
};

export class NativeKeyManager {
  private dbName = 'E2EEKeyStore';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private readonly CURRENT_VERSION = '3.0'; // Version Web Crypto API

  constructor() {}

  // Initialiser IndexedDB
  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
          console.log('✅ IndexedDB keys store created');
        }
      };
    });
  }

  // ✅ Validation du mot de passe
  private validatePassword(password: any): void {
    console.log('🔍 Validating password:', {
      type: typeof password,
      isNull: password === null,
      isUndefined: password === undefined,
      length: typeof password === 'string' ? password.length : 'N/A'
    });

    if (password === null || password === undefined) {
      throw new Error('Password cannot be null or undefined');
    }

    if (typeof password !== 'string') {
      throw new Error(`Password must be a string, received: ${typeof password}`);
    }

    if (password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
    }

    console.log('✅ Password validation passed');
  }

  // ✅ Chiffrer et stocker la clé privée avec Web Crypto API natif
  async storePrivateKey(privateKey: string, password: any, userId: string): Promise<void> {
    console.log('🔑 NativeKeyManager.storePrivateKey called with:', {
      privateKeyType: typeof privateKey,
      privateKeyLength: privateKey?.length,
      passwordType: typeof password,
      userId: userId
    });

    await this.initDB();

    // ✅ VALIDATION
    try {
      this.validatePassword(password);
    } catch (error) {
      console.error('❌ Password validation failed:', error);
      throw error;
    }

    // Validation des autres paramètres
    if (!privateKey || typeof privateKey !== 'string') {
      throw new Error('Private key must be a non-empty string');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    try {
      console.log('🔐 Starting encryption with Web Crypto API...');

      // Générer un salt unique (32 bytes)
      const salt = crypto.getRandomValues(new Uint8Array(32));
      console.log('✅ Salt generated:', { length: salt.length });
      
      // Dériver une clé de chiffrement avec PBKDF2 natif
      const derivedKeyBytes = await deriveKeyFromPassword(password, salt);
      console.log('✅ Key derived from password');

      // Importer la clé dérivée pour AES-GCM
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        derivedKeyBytes,
        {
          name: 'AES-GCM',
        },
        false,
        ['encrypt']
      );
      
      // Générer un IV pour AES-GCM (12 bytes)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      console.log('✅ IV generated:', { length: iv.length });
      
      // Chiffrer la clé privée avec AES-GCM natif
      const privateKeyBytes = decodeBase64(privateKey);
      const encryptedPrivateKeyBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        cryptoKey,
        privateKeyBytes
      );
      
      console.log('✅ Private key encrypted:', { 
        encryptedLength: encryptedPrivateKeyBuffer.byteLength 
      });

      // Stocker dans IndexedDB
      const transaction = this.db!.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');
      
      const keyData: StoredKeyData = {
        id: `privateKey_${userId}`,
        encryptedPrivateKey: encodeBase64(new Uint8Array(encryptedPrivateKeyBuffer)),
        salt: encodeBase64(salt),
        iv: encodeBase64(iv),
        timestamp: Date.now(),
        version: this.CURRENT_VERSION
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(keyData);
        request.onerror = () => {
          console.error('❌ IndexedDB put failed:', request.error);
          reject(request.error);
        };
        request.onsuccess = () => {
          console.log('✅ Private key stored successfully');
          resolve();
        };
      });

    } catch (error) {
      console.error('❌ Error in storePrivateKey:', error);
      throw new Error(`Failed to store private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ✅ Récupérer et déchiffrer la clé privée avec Web Crypto API
  async getPrivateKey(password: string, userId: string): Promise<string> {
    await this.initDB();

    console.log('🔓 Getting private key for user:', userId);

    // Validation du mot de passe
    this.validatePassword(password);

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const transaction = this.db!.transaction(['keys'], 'readonly');
    const store = transaction.objectStore('keys');
    
    const keyData = await new Promise<StoredKeyData>((resolve, reject) => {
      const request = store.get(`privateKey_${userId}`);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (!request.result) {
          reject(new Error('Clé privée non trouvée'));
        } else {
          resolve(request.result);
        }
      };
    });

    console.log('✅ Private key data found, version:', keyData.version);

    // Reconstituer les données
    const salt = decodeBase64(keyData.salt);
    const iv = decodeBase64(keyData.iv);
    const encryptedPrivateKey = decodeBase64(keyData.encryptedPrivateKey);

    try {
      // Dériver la clé de déchiffrement avec PBKDF2 natif
      const derivedKeyBytes = await deriveKeyFromPassword(password, salt);

      // Importer la clé dérivée pour AES-GCM
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        derivedKeyBytes,
        {
          name: 'AES-GCM',
        },
        false,
        ['decrypt']
      );

      // Déchiffrer la clé privée avec AES-GCM natif
      const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        cryptoKey,
        encryptedPrivateKey
      );

      console.log('✅ Private key decrypted successfully');
      return encodeBase64(new Uint8Array(decryptedPrivateKeyBuffer));
      
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error('Mot de passe incorrect ou clé corrompue');
    }
  }

  // ✅ Stocker la clé publique (en clair)
  async storePublicKey(publicKey: string, userId: string): Promise<void> {
    await this.initDB();

    console.log('📝 Storing public key for user:', userId);

    if (!publicKey || typeof publicKey !== 'string') {
      throw new Error('Public key must be a non-empty string');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const transaction = this.db!.transaction(['keys'], 'readwrite');
    const store = transaction.objectStore('keys');
    
    const keyData: StoredPublicKey = {
      id: `publicKey_${userId}`,
      publicKey,
      timestamp: Date.now()
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(keyData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('✅ Public key stored successfully');
        resolve();
      };
    });
  }

  // ✅ Récupérer la clé publique
  async getPublicKey(userId: string): Promise<string> {
    await this.initDB();

    console.log('📖 Getting public key for user:', userId);

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const transaction = this.db!.transaction(['keys'], 'readonly');
    const store = transaction.objectStore('keys');
    
    const keyData = await new Promise<StoredPublicKey>((resolve, reject) => {
      const request = store.get(`publicKey_${userId}`);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (!request.result) {
          reject(new Error('Clé publique non trouvée'));
        } else {
          resolve(request.result);
        }
      };
    });

    console.log('✅ Public key retrieved successfully');
    return keyData.publicKey;
  }

  // ✅ Vérifier si les clés existent pour un utilisateur
  async hasKeys(userId: string): Promise<{ hasPrivate: boolean; hasPublic: boolean }> {
    await this.initDB();

    console.log('🔍 Checking keys existence for user:', userId);

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const transaction = this.db!.transaction(['keys'], 'readonly');
    const store = transaction.objectStore('keys');
    
    const [hasPrivate, hasPublic] = await Promise.all([
      new Promise<boolean>((resolve) => {
        const request = store.get(`privateKey_${userId}`);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => resolve(false);
      }),
      new Promise<boolean>((resolve) => {
        const request = store.get(`publicKey_${userId}`);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => resolve(false);
      })
    ]);

    console.log('✅ Keys existence checked:', { hasPrivate, hasPublic });
    return { hasPrivate, hasPublic };
  }

  // ✅ Supprimer toutes les clés d'un utilisateur
  async deleteUserKeys(userId: string): Promise<void> {
    await this.initDB();

    console.log('🗑️ Deleting keys for user:', userId);

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const transaction = this.db!.transaction(['keys'], 'readwrite');
    const store = transaction.objectStore('keys');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = store.delete(`privateKey_${userId}`);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      }),
      new Promise<void>((resolve, reject) => {
        const request = store.delete(`publicKey_${userId}`);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      })
    ]);

    console.log('✅ User keys deleted successfully');
  }

  // ✅ Fermer la base de données
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('✅ Database closed');
    }
  }
}

// ✅ SessionManager avec Web Crypto API
export class NativeSessionManager {
  private sessionKeys: { publicKey: string; privateKey: string } | null = null;
  private keyManager: NativeKeyManager;

  constructor(keyManager: NativeKeyManager) {
    this.keyManager = keyManager;
    console.log('✅ NativeSessionManager initialized');
  }

  async unlock(password: string, userId: string): Promise<void> {
    console.log('🔓 NativeSessionManager.unlock called for user:', userId);

    try {
      // Utiliser le keyManager natif
      const privateKey = await this.keyManager.getPrivateKey(password, userId);
      const publicKey = await this.keyManager.getPublicKey(userId);
      
      this.sessionKeys = { publicKey, privateKey };
      console.log('✅ Session unlocked successfully with Web Crypto API');
    } catch (error) {
      console.error('❌ Failed to unlock session:', error);
      throw new Error('Invalid password or corrupted keys');
    }
  }

  lock(): void {
    this.sessionKeys = null;
    console.log('🔒 Session locked');
  }

  isUnlocked(): boolean {
    const unlocked = this.sessionKeys !== null;
    console.log('🔍 Session unlock status:', unlocked);
    return unlocked;
  }

  getKeys(): { publicKey: string; privateKey: string } | null {
    return this.sessionKeys;
  }
}

// ✅ CORRECTED EXPORTS
export const keyManager = new NativeKeyManager();
export const sessionManager = new NativeSessionManager(keyManager);
export default keyManager;