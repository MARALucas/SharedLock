<?php if (!isset($_COOKIE['LOGGED_USER'])) : ?>
    <div class="login-container">
        <h2>Connexion</h2>
        <form class="login-form" action="request_login.php" method="POST">
            <div class="form-group">
                <input type="text" id="username" name="username" placeholder="Nom d'utilisateur" required>
            </div>

            <div class="form-group">
                <input type="password" id="password" name="password" placeholder="Mot de passe" required>
            </div>

            <button type="submit">Se Connecter</button>
        </form>
    </div>

    <div class="register-container">
        <h2>Inscription</h2>
        <form class="register-form" action="request_register.php" method="post">
            <div class="form-group">
                    <input type="text" id="username" name="username" placeholder="Nom d'utilisateur" required>
                </div>
    
            <div class="form-group">
                <input type="password" id="password" name="password" placeholder="Mot de passe" required>
            </div>
    
            <div class="form-group">
                <input type="password" id="confirm_password" name="confirm_password" placeholder="Confirmez le mot de passe" required>
            </div>
    
            <button type="submit">S'inscrire</button>
            <p class="error-message" id="error-message"></p>
        </form>
    </div>
    
    <script>
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
    </script>

<?php else : ?>
    <div class="container">
        <div class="alert alert-success" role="alert">
            Bonjour <?php echo $_COOKIE['LOGGED_USER']; ?> et bienvenue sur le site !
        </div>

        <form action="request_login.php" method="POST">
            <button type="submit" name="logout">Déconnexion</button>
        </form>
    </div>
<?php endif; ?>
