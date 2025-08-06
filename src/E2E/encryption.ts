// ✅ OPTIMAL : Web Crypto API natif - Aucune dépendance, performance native
// Support navigateur : 99%+ (IE11+, tous les navigateurs modernes)

// Utilitaires de conversion
const encodeBase64 = (bytes: Uint8Array): string => {
  return btoa(String.fromCharCode(...bytes));
};

const decodeBase64 = (str: string): Uint8Array => {
  return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
};

const stringToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

const bytesToString = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes);
};

// ✅ Génère une paire de clés ECDH avec P-256 (très bien supporté)
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  console.log('🔑 Generating key pair with native Web Crypto API...');
  
  try {
    // Générer une paire de clés ECDH P-256 (équivalent sécurité à X25519)
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256', // Très bien supporté, sécurisé
      },
      true, // extractable
      ['deriveKey', 'deriveBits']
    );

    // Exporter les clés en format raw
    const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    
    console.log('✅ Key pair generated with Web Crypto API:', {
      publicKeyLength: publicKeyBuffer.byteLength,
      privateKeyLength: privateKeyBuffer.byteLength
    });
    
    return {
      publicKey: encodeBase64(new Uint8Array(publicKeyBuffer)),
      privateKey: encodeBase64(new Uint8Array(privateKeyBuffer)),
    };
  } catch (error) {
    console.error('❌ Failed to generate key pair:', error);
    throw error;
  }
}

// ✅ Dérive une clé secrète partagée via ECDH natif
export async function deriveSharedSecret(myPrivateKey: string, theirPublicKey: string): Promise<string> {
  console.log('🔐 Deriving shared secret with Web Crypto API...');
  
  try {
    // Importer notre clé privée
    const privateKeyBuffer = decodeBase64(myPrivateKey);
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false,
      ['deriveKey', 'deriveBits']
    );

    // Importer leur clé publique
    const publicKeyBuffer = decodeBase64(theirPublicKey);
    const publicKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false,
      []
    );

    // Dériver le secret partagé
    const sharedSecretBuffer = await crypto.subtle.deriveBits(
      {
        name: 'ECDH',
        public: publicKey,
      },
      privateKey,
      256 // 32 bytes
    );
    
    console.log('✅ Shared secret derived with Web Crypto API:', { 
      length: sharedSecretBuffer.byteLength 
    });
    return encodeBase64(new Uint8Array(sharedSecretBuffer));
  } catch (error) {
    console.error('❌ Failed to derive shared secret:', error);
    throw error;
  }
}

// ✅ Chiffre un message avec AES-GCM natif (plus rapide que ChaCha20)
export async function encryptMessage(message: string, sharedSecret: string): Promise<{ nonce: string; ciphertext: string }> {
  console.log('🔒 Encrypting message with native AES-GCM...');
  
  try {
    const keyBuffer = decodeBase64(sharedSecret);
    
    // Importer la clé pour AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
      },
      false,
      ['encrypt']
    );

    // Générer un IV aléatoire (12 bytes pour AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const messageBytes = stringToBytes(message);
    
    // Chiffrer avec AES-GCM natif
    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      messageBytes
    );
    
    console.log('✅ Message encrypted with AES-GCM:', { 
      ivLength: iv.length,
      ciphertextLength: ciphertextBuffer.byteLength 
    });
    
    return {
      nonce: encodeBase64(iv),
      ciphertext: encodeBase64(new Uint8Array(ciphertextBuffer)),
    };
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw error;
  }
}

// ✅ Déchiffre un message avec AES-GCM natif
export async function decryptMessage(ciphertext: string, nonce: string, sharedSecret: string): Promise<string | null> {
  console.log('🔓 Decrypting message with native AES-GCM...');
  
  try {
    const keyBuffer = decodeBase64(sharedSecret);
    
    // Importer la clé pour AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
      },
      false,
      ['decrypt']
    );

    const iv = decodeBase64(nonce);
    const ciphertextBuffer = decodeBase64(ciphertext);
    
    // Déchiffrer avec AES-GCM natif
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      ciphertextBuffer
    );
    
    const message = bytesToString(new Uint8Array(plaintextBuffer));
    console.log('✅ Message decrypted with AES-GCM');
    return message;
    
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return null;
  }
}

// ✅ Dérive une clé à partir d'un mot de passe avec PBKDF2 natif
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
  console.log('🔑 Deriving key from password with native PBKDF2...');
  
  try {
    // Importer le mot de passe comme clé de base
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      stringToBytes(password),
      {
        name: 'PBKDF2',
      },
      false,
      ['deriveKey']
    );
    
    // Dériver une clé AES avec PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // Sécurisé pour 2024+
        hash: 'SHA-256',
      },
      passwordKey,
      {
        name: 'AES-GCM',
        length: 256, // 32 bytes
      },
      true, // extractable pour pouvoir l'exporter
      ['encrypt', 'decrypt']
    );
    
    // Exporter la clé pour obtenir les bytes bruts
    const keyBuffer = await crypto.subtle.exportKey('raw', derivedKey);
    
    console.log('✅ Key derived from password with PBKDF2:', { 
      length: keyBuffer.byteLength 
    });
    return new Uint8Array(keyBuffer);
  } catch (error) {
    console.error('❌ Key derivation failed:', error);
    throw error;
  }
}

// ✅ Génère un HMAC avec Web Crypto API natif
export async function generateHMAC(ciphertext: string, sharedSecret: string): Promise<string> {
  console.log('🔐 Generating HMAC with Web Crypto API...');
  
  try {
    const keyBuffer = decodeBase64(sharedSecret);
    const messageBuffer = decodeBase64(ciphertext);
    
    // Importer la clé pour HMAC
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
    
    // Générer le HMAC
    const signature = await crypto.subtle.sign(
      'HMAC',
      hmacKey,
      messageBuffer
    );
    
    console.log('✅ HMAC generated');
    return encodeBase64(new Uint8Array(signature));
  } catch (error) {
    console.error('❌ HMAC generation failed:', error);
    throw error;
  }
}

// ✅ Gestion des groupes avec Web Crypto API natif
export async function generateGroupSharedSecret(publicKeys: { id: string, publicKey: string }[]): Promise<{ encryptedSharedSecret: Record<string, string> }> {
  console.log('🏢 Generating group shared secret with Web Crypto API...');
  
  try {
    // Générer un secret de groupe aléatoire
    const groupSecret = crypto.getRandomValues(new Uint8Array(32));
    const encryptedSharedSecret: Record<string, string> = {};
    
    // Pour chaque membre, chiffrer le secret avec une clé éphémère
    for (const member of publicKeys) {
      if (member.publicKey) {
        // Générer une paire de clés éphémère
        const ephemeralKeyPair = await crypto.subtle.generateKey(
          {
            name: 'ECDH',
            namedCurve: 'P-256',
          },
          true,
          ['deriveKey', 'deriveBits']
        );
        
        // Importer la clé publique du membre
        const memberPublicKeyBuffer = decodeBase64(member.publicKey);
        const memberPublicKey = await crypto.subtle.importKey(
          'raw',
          memberPublicKeyBuffer,
          {
            name: 'ECDH',
            namedCurve: 'P-256',
          },
          false,
          []
        );
        
        // Dériver une clé de chiffrement
        const sharedKey = await crypto.subtle.deriveKey(
          {
            name: 'ECDH',
            public: memberPublicKey,
          },
          ephemeralKeyPair.privateKey,
          {
            name: 'AES-GCM',
            length: 256,
          },
          false,
          ['encrypt']
        );
        
        // Chiffrer le secret de groupe
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedGroupSecret = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv: iv,
          },
          sharedKey,
          groupSecret
        );
        
        // Exporter la clé publique éphémère
        const ephemeralPublicKeyBuffer = await crypto.subtle.exportKey('raw', ephemeralKeyPair.publicKey);
        
        // Combiner clé publique éphémère + IV + secret chiffré
        const payload = new Uint8Array(
          ephemeralPublicKeyBuffer.byteLength + iv.length + encryptedGroupSecret.byteLength
        );
        payload.set(new Uint8Array(ephemeralPublicKeyBuffer), 0);
        payload.set(iv, ephemeralPublicKeyBuffer.byteLength);
        payload.set(new Uint8Array(encryptedGroupSecret), ephemeralPublicKeyBuffer.byteLength + iv.length);
        
        encryptedSharedSecret[member.publicKey] = encodeBase64(payload);
      }
    }
    
    console.log('✅ Group shared secret generated for', publicKeys.length, 'members');
    return { encryptedSharedSecret };
  } catch (error) {
    console.error('❌ Group shared secret generation failed:', error);
    throw error;
  }
}

export async function decryptGroupSharedSecret(encryptedSharedSecret: string, privateKey: string, publicKey: string): Promise<string> {
  console.log('🔓 Decrypting group shared secret with Web Crypto API...');
  
  try {
    const sharedSecrets = JSON.parse(encryptedSharedSecret);
    
    if (!sharedSecrets[publicKey]) {
      throw new Error('No shared key found for this user.');
    }
    
    const payload = decodeBase64(sharedSecrets[publicKey]);
    
    // Extraire les composants (P-256 raw public key = 65 bytes, IV = 12 bytes)
    const ephemeralPublicKeyBuffer = payload.slice(0, 65);
    const iv = payload.slice(65, 77);
    const encrypted = payload.slice(77);
    
    // Importer notre clé privée
    const myPrivateKeyBuffer = decodeBase64(privateKey);
    const myPrivateKey = await crypto.subtle.importKey(
      'pkcs8',
      myPrivateKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false,
      ['deriveKey']
    );
    
    // Importer la clé publique éphémère
    const ephemeralPublicKey = await crypto.subtle.importKey(
      'raw',
      ephemeralPublicKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false,
      []
    );
    
    // Dériver la clé de déchiffrement
    const sharedKey = await crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: ephemeralPublicKey,
      },
      myPrivateKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['decrypt']
    );
    
    // Déchiffrer le secret de groupe
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      sharedKey,
      encrypted
    );
    
    console.log('✅ Group shared secret decrypted');
    return encodeBase64(new Uint8Array(decryptedBuffer));
    
  } catch (error) {
    console.error('❌ Failed to decrypt group shared secret:', error);
    throw new Error("Unable to decrypt the shared key.");
  }
}