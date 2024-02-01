const argon2 = require('argon2-browser');
const kdbxweb = require('kdbxweb');

/** 
 *  Définit l'implémentation Argon2 pour le moteur de chiffrement de kdbxweb en utilisant argon2-browser.
 * 
 * @param {string} password - Le mot de passe à hacher.
 * @param {string} salt - Le sel utilisé pour le hachage.
 * @param {number} memory - La taille de la mémoire à utiliser pour le hachage.
 * @param {number} iterations - Le nombre d'itérations pour le hachage.
 * @param {number} length - La longueur du hash résultant.
 * @param {number} parallelism - Le degré de parallélisme à utiliser pour le hachage.
 * @param {string} type - Le type d'argon à utiliser (d, i ou id).
 * @param {number} version - La version d'Argon2 à utiliser.
 * @returns {Promise<ArrayBuffer>} - Une Promise résolvant avec le hash Argon2 en tant qu'ArrayBuffer.
 * @throws {Error} - Lance une erreur si le mot de passe ou le sel est indéfini, ou s'il y a une erreur lors du hachage.
 */
kdbxweb.CryptoEngine.setArgon2Impl(async (password, salt, memory, iterations, length, parallelism, type, version) => {
    try {
        if (!password || !salt) {
            throw new Error('Password or salt is undefined.');
        }

        // Convert Uint8Array to ArrayBuffer
        const hash = await argon2.hash({
            pass: password,
            salt: salt,
            hashLen: length,
            time: iterations,
            mem: memory,
            parallelism,
            type: argon2.ArgonType[type],
            distPath: 'node_modules/argon2-browser'
        });

        // Convert the resulting hash (hex string) to Uint8Array
        const hashArrayBuffer = new Uint8Array(Buffer.from(hash, 'hex')).buffer;

        // Resolve the promise with the hash
        return Promise.resolve(hashArrayBuffer);
    } catch (error) {
        // Gérer les erreurs
        console.error('Error hashing with Argon2:', error);
        return Promise.reject(error);
    }
});

