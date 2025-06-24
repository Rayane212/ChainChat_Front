import sodium from 'libsodium-wrappers';

// Charge la librairie sodium avant toute opération
async function initSodium() {
    await sodium.ready;
}

// Génère une paire de clés ECDH (Curve25519)
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    await initSodium();
    const keyPair = sodium.crypto_box_keypair();
    return {
        publicKey: sodium.to_base64(keyPair.publicKey),
        privateKey: sodium.to_base64(keyPair.privateKey),
    };
}

// Dérive une clé secrète partagée via ECDH
export async function deriveSharedSecret(myPrivateKey: string, theirPublicKey: string): Promise<string> {
    await initSodium();
    const sharedKey = sodium.crypto_scalarmult(
        sodium.from_base64(myPrivateKey),
        sodium.from_base64(theirPublicKey)
    );
    return sodium.to_base64(sharedKey);
}

// Chiffre un message avec AES-GCM
export async function encryptMessage(message: string, sharedSecret: string): Promise<{ nonce: string; ciphertext: string }> {
    await initSodium();

    let sharedKey = sodium.from_base64(sharedSecret);

    if (!(sharedKey instanceof Uint8Array)) {
        throw new Error(`encryptMessage: sharedSecret must be a Uint8Array, received: ${typeof sharedSecret}`);
    }

    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = sodium.crypto_secretbox_easy(
        sodium.from_string(message),
        nonce,
        sharedKey 
    );

    return {
        nonce: sodium.to_base64(nonce),
        ciphertext: sodium.to_base64(ciphertext),
    };
}


// Déchiffre un message AES-GCM
export async function decryptMessage(ciphertext: string, nonce: string, sharedSecret: string): Promise<string | null> {
    await initSodium();
    const decrypted = sodium.crypto_secretbox_open_easy(
        sodium.from_base64(ciphertext),
        sodium.from_base64(nonce),
        sodium.from_base64(sharedSecret)
    );
    return decrypted ? sodium.to_string(decrypted) : null;
}

// Génère un HMAC pour assurer l’intégrité du message
export async function generateHMAC(ciphertext: string, sharedSecret: string): Promise<string> {
    await initSodium();
    const hmac = sodium.crypto_auth(sodium.from_base64(ciphertext), sodium.from_base64(sharedSecret));
    return sodium.to_base64(hmac);
}

// Génère une clé partagée pour un groupe et la chiffre pour chaque membre.
export async function generateGroupSharedSecret(publicKeys: { id: string, publicKey: string }[]) {
    await sodium.ready;
    
    // Génération d'une clé secrète aléatoire pour le groupe
    const sharedSecret = sodium.randombytes_buf(32); 
    const encryptedSharedSecret: any = {};

    // Chiffre la clé de groupe avec la clé publique de chaque membre et la stocke avec la `publicKey`
    publicKeys.forEach(member => {
        if (member.publicKey) {
            const sealedSecret = sodium.crypto_box_seal(
                sharedSecret,
                sodium.from_base64(member.publicKey)
            );
            encryptedSharedSecret[member.publicKey] = sodium.to_base64(sealedSecret); 
        }
    });

    return { encryptedSharedSecret };
}


// Déchiffre la clé partagée du groupe avec la clé privée de l'utilisateur
export async function decryptGroupSharedSecret(encryptedSharedSecret: string, privateKey: string, publicKey: string) {
    await sodium.ready;
    const sharedSecrets = JSON.parse(encryptedSharedSecret);

    if (!sharedSecrets[publicKey]) {
        throw new Error('No shared key found for this user.');
    }

    try {
        const sealedSecret = sodium.from_base64(sharedSecrets[publicKey]);
        
        const decryptedSecret = sodium.crypto_box_seal_open(
            sealedSecret, 
            sodium.from_base64(publicKey), 
            sodium.from_base64(privateKey)
        );

        if (!decryptedSecret) {
            throw new Error("Error: crypto_box_seal_open returned null. Incorrect key pair?");
        }

        return sodium.to_base64(decryptedSecret);
        
    } catch (error) {
        throw new Error("Unable to decrypt the shared key.");
    }
}

