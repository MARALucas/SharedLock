function validatePassword(password) {
    // Vérifier la longueur minimale
    if (password.length < 15) {
        return false;
    }

    // Vérifier s'il contient au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[^A-Za-z0-9]/; // Tout caractère qui n'est ni une lettre ni un chiffre

    if (!uppercaseRegex.test(password) ||
        !lowercaseRegex.test(password) ||
        !digitRegex.test(password) ||
        !specialCharRegex.test(password)) {
        return false;
    }

    return true;
}

// Fonction pour valider le formulaire d'inscription
function validateForm() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmpassword').value;
    var errorMessage = document.getElementById('error-message');

    // Validation du mot de passe
    if (!validatePassword(password)) {
        errorMessage.textContent = "Le mot de passe doit respecter les critères de sécurité : une longueur minimale à 15 caractères, une majuscule, une minuscule, un chiffre, un caractère spécial";
        return false; // Empêche l'envoi du formulaire
    }

    // Vérification si les mots de passe correspondent
    if (password !== confirmPassword) {
        errorMessage.textContent = "Les mots de passe ne correspondent pas.";
        return false; // Empêche l'envoi du formulaire
    }

    // Si tout est valide, le formulaire peut être envoyé
    return true;
}