document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.querySelector('.login-container');
    const registerContainer = document.querySelector('.register-container');

    // Vérifier si le cookie LOGGED_USER est présent
    const isLoggedIn = document.cookie.includes('LOGGED_USER');

    // Afficher ou masquer les formulaires en fonction de la connexion
    if (isLoggedIn) {
        loginContainer.style.display = 'none'; // Masquer le formulaire de connexion
        registerContainer.style.display = 'none'; // Masquer le formulaire d'inscription
    } else {
        loginContainer.style.display = 'block'; // Afficher le formulaire de connexion
        registerContainer.style.display = 'block'; // Afficher le formulaire d'inscription
    }
});
