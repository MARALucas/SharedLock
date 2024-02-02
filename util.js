const forge = require('node-forge')

function hashPassword(password) {
    let pwd = forge.md.sha256.create()
    pwd.update(password)
    return pwd.digest().toHex()
}

async function verify(connection, username, password) {
    const query = 'SELECT * FROM users WHERE username = ?';

    connection.query(query, [username], (err, result) => {
        if (err) {
            /*console.error('Erreur lors de la requête SQL :', err);
            res.status(500).send('Erreur interne du serveur');
            return;*/
            return false
        }

        if (result.length === 1) {
            const user = result[0];
            if(hashPassword(password) == user.password) {
                return hashPassword(password) == user.password
            }
        } else {
            return false
        }
    });
}

async function addUser(connection, data) {
    username = data['username']
    password = hashPassword(data['password'])
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

    connection.query(query, [username, password], (err, result) => {
        if (err) {
            console.error('Erreur lors de la requête SQL :', err);
            res.status(500).send('Erreur interne du serveur');
            return false;
        }

        if (result.affectedRows === 1) {
            return true
        }
    });
}

module.exports = {
    hashPassword: hashPassword, verify: verify, addUser: addUser
};