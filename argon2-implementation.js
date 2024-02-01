const argon2 = require('argon2-browser');
const kdbxweb = require('kdbxweb');

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

