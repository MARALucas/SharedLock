const argon2 = require('argon2');
const kdbxweb = require('kdbxweb');



kdbxweb.CryptoEngine.setArgon2Impl(async (password, salt, memory, iterations, length, parallelism, type, version) => {
    try {     
        if (!password || !salt) {
            throw new Error('Password or salt is undefined.');
        }

        console.log('Argon2 Input Parameters:', { password, salt, memory, iterations, length, parallelism, type, version });
        
        const hash = await argon2.hash(
            password, // Assurez-vous que password est une chaîne de caractères
            salt,
            length,
            iterations,
            memory,
            parallelism,
            type,
            distPath= 'node_modules/argon2-browser'
        );
        
        console.log('Argon2 Hash Result:', hash);

        // Convert the resulting hash (hex string) to Uint8Array
        const hashArrayBuffer = new Uint8Array(Buffer.from(hash, 'hex')).buffer;

        // Resolve the promise with the hash
        return Promise.resolve(hashArrayBuffer);
    } catch (error) {
        console.error('Error hashing with Argon2:', error);
        return Promise.reject(error);
    }
});

