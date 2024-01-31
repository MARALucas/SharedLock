<?php
session_start();
$serveur = "localhost";
$utilisateur = "";
$motdepasse = "";
$basededonnees = "";

$data = $_POST;
$connexion = new mysqli($serveur, $utilisateur, $motdepasse, $basededonnees);

if ($connexion->connect_error) {
    echo "Échec de la connexion : " . $connexion->connect_error;
    die("Échec de la connexion : " . $connexion->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($data['username']) && isset($data['password'])) {
    $username = $data['username'];
    $password = $data['password'];

    $requete = $connexion->prepare("SELECT * FROM users WHERE username = ?");
    $requete->bind_param("s", $username);

    $requete->execute();
    $resultat = $requete->get_result();

    if ($resultat->num_rows == 1) {
        $utilisateur = $resultat->fetch_assoc();
        if (password_verify($password, $utilisateur['password'])) {
            setcookie(
                'LOGGED_USER',
                $username,
                [
                    'expires' => time() + 365*24*3600,
                    'secure' => true,
                    'httponly' => true,
                ]
            );
            echo "Connexion réussie !";
        } else {
            echo "Mot de passe incorrect !";
        }
    } else {
        echo "Nom d'utilisateur incorrect !";
    }

    $requete->close();
    $connexion->close();

    exit();
}

if(isset($data['logout'])) {
    setcookie('LOGGED_USER', '', time() - 3600, '/');
    session_destroy();
    header('Location: /');
    exit();
}
?>
