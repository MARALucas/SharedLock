// Vérifier si le cookie existe
const loggedUser = document.cookie.includes('LOGGED_USER');

// Sélectionner les éléments des formulaires
const loginForm = document.querySelector('.login-container');
const registerForm = document.querySelector('.register-container');

// Masquer ou afficher les formulaires en fonction de la présence du cookie
if (loggedUser) {
    // Masquer les formulaires s'il existe un utilisateur connecté
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
} else {
    // Afficher les formulaires s'il n'existe pas d'utilisateur connecté
    loginForm.style.display = 'block';
    registerForm.style.display = 'block';
}