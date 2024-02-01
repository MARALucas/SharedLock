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

async function verify(username, password) {
    password = hashPassword(password)
    pass = await knex('users').where({ numsecu: numsecu }).select('password').first().catch(err => console.log(err))
    if (!pass) {
        return false
    }
    return pass.password == password
}

module.exports = {
    hashPassword: hashPassword, validateForm: validateForm
};