const forge = require('node-forge')


function validateForm() {
    var password = document.getElementById('password').value;
    var confirm_password = document.getElementById('confirm_password').value;
    var error_message = document.getElementById('error-message');

    if (password.length < 15) {
        error_message.innerHTML = "Le mot de passe doit avoir au moins 15 caractères.";
        return false;
    }
    if (!/[A-Z]/.test(password)) {
        error_message.innerHTML = "Le mot de passe doit contenir au moins une majuscule.";
        return false;
    }
    if (!/[a-z]/.test(password)) {
        error_message.innerHTML = "Le mot de passe doit contenir au moins une minuscule.";
        return false;
    }
    if (!/\d/.test(password)) {
        error_message.innerHTML = "Le mot de passe doit contenir au moins un chiffre.";
        return false;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        error_message.innerHTML = "Le mot de passe doit contenir au moins un caractère spécial.";
        return false;
    }
    if (password !== confirm_password) {
        error_message.innerHTML = "Les mots de passe ne correspondent pas.";
        return false;
    }
    
    error_message.innerHTML = "";
    return true;
}

function hashPassword(password) {
    let pwd = forge.md.sha256.create()
    pwd.update(password)
    return pwd.digest().toHex()
}

async function verify(connection, username, password) {
    password = hashPassword(password)
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
            return util.hashPassword(req.query.password) === user.password
        } else {
            return false
        }
    });
}

async function addUser(connection, data) {
    console.log(data)
    username = data['username']
    password = hashPassword(data['password'])
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

    connection.query(query, [username, password], (err, result) => {
        if (err) {
            console.error('Erreur lors de la requête SQL :', err);
            res.status(500).send('Erreur interne du serveur');
            return false;
        }

        return result.affectedRows === 1
    });
}


module.exports = {
    hashPassword: hashPassword, validateForm: validateForm, verify: verify, addUser: addUser
};