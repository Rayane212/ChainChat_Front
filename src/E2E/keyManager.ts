import sodium from 'libsodium-wrappers';

interface StoredKeyData {
  id: string;
  encryptedPrivateKey: string;
  salt: string; // Base64 au lieu d'Array<number>
  nonce: string; // Base64 au lieu d'Array<number>
  timestamp: number;
  version: string; // Versioning des algos
}

interface StoredPublicKey {
  id: string;
  publicKey: string;
  timestamp: number;
}

export class SodiumKeyManager {
  private dbName = 'E2EEKeyStore';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private sodiumReady: Promise<void>;
  private readonly CURRENT_VERSION = '1.0';

  constructor() {
    // Initialiser sodium une seule fois et stocker la promesse
    this.sodiumReady = sodium.ready;
  }

  private async ensureSodiumReady() {
    await this.sodiumReady;
  }

  // Initialiser IndexedDB
  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
    });
  }

  // Dériver une clé de chiffrement à partir du mot de passe avec libsodium
  private async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
    await this.ensureSodiumReady();
    
    // Validation de la force du mot de passe
    if (password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    // Utiliser argon2id (plus sécurisé que PBKDF2)
    return sodium.crypto_pwhash(
      32, // longueur de la clé dérivée
      password,
      salt,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, // ~0.1 seconde
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, // ~64MB
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );
  }

  // Chiffrer et stocker la clé privée
  async storePrivateKey(privateKey: string, password: string, userId: string): Promise<void> {
    await this.initDB();
    await this.ensureSodiumReady();

    // Validation de la force du mot de passe
    if (password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
    }

    // Générer un salt unique
    const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
    
    // Dériver la clé de chiffrement
    const derivedKey = await this.deriveKeyFromPassword(password, salt);
    
    // Générer un nonce pour le chiffrement
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    
    // Chiffrer la clé privée
    const encryptedPrivateKey = sodium.crypto_secretbox_easy(
      sodium.from_base64(privateKey),
      nonce,
      derivedKey
    );

    // Stocker dans IndexedDB avec encodage Base64
    const transaction = this.db!.transaction(['keys'], 'readwrite');
    const store = transaction.objectStore('keys');
    
    const keyData: StoredKeyData = {
      id: `privateKey_${userId}`,
      encryptedPrivateKey: sodium.to_base64(encryptedPrivateKey),
      salt: sodium.to_base64(salt),
      nonce: sodium.to_base64(nonce),
      timestamp: Date.now(),
      version: this.CURRENT_VERSION
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(keyData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Récupérer et déchiffrer la clé privée
  async getPrivateKey(password: string, userId: string): Promise<string> {
    await this.initDB();
    await this.ensureSodiumReady();

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

    // Vérification de la version (pour migration future)
    if (keyData.version && keyData.version !== this.CURRENT_VERSION) {
      console.warn(`Version de clé obsolète: ${keyData.version}, actuelle: ${this.CURRENT_VERSION}`);
    }

    // Reconstituer les données à partir de Base64
    const salt = sodium.from_base64(keyData.salt);
    const nonce = sodium.from_base64(keyData.nonce);
    const encryptedPrivateKey = sodium.from_base64(keyData.encryptedPrivateKey);

    try {
      // Dériver la clé de déchiffrement
      const derivedKey = await this.deriveKeyFromPassword(password, salt);

      // Déchiffrer la clé privée
      const decryptedPrivateKey = sodium.crypto_secretbox_open_easy(
        encryptedPrivateKey,
        nonce,
        derivedKey
      );

      if (!decryptedPrivateKey) {
        throw new Error('Échec du déchiffrement');
      }

      return sodium.to_base64(decryptedPrivateKey);
    } catch (error) {
      throw new Error('Mot de passe incorrect ou clé corrompue');
    }
  }

  // Stocker la clé publique (peut être en clair)
  async storePublicKey(publicKey: string, userId: string): Promise<void> {
    await this.initDB();

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
      request.onsuccess = () => resolve();
    });
  }

  // Récupérer la clé publique
  async getPublicKey(userId: string): Promise<string> {
    await this.initDB();

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

    return keyData.publicKey;
  }

  // Vérifier si les clés existent pour un utilisateur
  async hasKeys(userId: string): Promise<{ hasPrivate: boolean; hasPublic: boolean }> {
    await this.initDB();

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

    return { hasPrivate, hasPublic };
  }

  // Supprimer toutes les clés d'un utilisateur
  async deleteUserKeys(userId: string): Promise<void> {
    await this.initDB();

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
  }

  // Nettoyer les clés expirées
  async cleanExpiredKeys(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    await this.initDB();

    const transaction = this.db!.transaction(['keys'], 'readwrite');
    const store = transaction.objectStore('keys');
    const now = Date.now();

    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const data = cursor.value;
        if (data.timestamp && (now - data.timestamp) > maxAge) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  // Fermer la base de données
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Gestionnaire de session pour garder les clés en mémoire
export class SessionManager {
  private privateKey: string | null = null;
  private publicKey: string | null = null;
  private lockTimer: NodeJS.Timeout | null = null;
  private keyManager: SodiumKeyManager;

  constructor() {
    this.keyManager = new SodiumKeyManager();
  }

  // Déverrouiller avec le mot de passe
  async unlock(password: string, userId: string): Promise<void> {
    this.privateKey = await this.keyManager.getPrivateKey(password, userId);
    this.publicKey = await this.keyManager.getPublicKey(userId);
    
    // Auto-verrouillage après 30 minutes d'inactivité
    this.resetAutoLock();
  }

  // Obtenir les clés de session (si déverrouillées)
  getKeys(): { privateKey: string; publicKey: string } | null {
    if (!this.privateKey || !this.publicKey) {
      return null;
    }
    
    // Réinitialiser le timer d'auto-verrouillage à chaque utilisation
    this.resetAutoLock();
    
    return {
      privateKey: this.privateKey,
      publicKey: this.publicKey
    };
  }

  // Vérifier si la session est déverrouillée
  isUnlocked(): boolean {
    return !!(this.privateKey && this.publicKey);
  }

  // Verrouiller manuellement
  lock(): void {
    this.privateKey = null;
    this.publicKey = null;
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }

  // Réinitialiser le timer d'auto-verrouillage
  private resetAutoLock(): void {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
    }
    
    // Auto-verrouillage après 30 minutes
    this.lockTimer = setTimeout(() => {
      this.lock();
    }, 30 * 60 * 1000);
  }

  // Nettoyer les ressources
  destroy(): void {
    this.lock();
    this.keyManager.close();
  }
}