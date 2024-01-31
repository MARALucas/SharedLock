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
    $password = password_hash($data['password'], PASSWORD_DEFAULT);

    $requete = $connexion->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $requete->bind_param("ss", $username, $password);

    if ($requete->execute()) {
        echo "Inscription réussie !";

        setcookie(
            'LOGGED_USER',
            $username,
            [
                'expires' => time() + 365*24*3600,
                'secure' => true,
                'httponly' => true,
            ]
        );
    } else {
        echo "Erreur lors de l'inscription : " . $requete->error;
    }

    $requete->close();
    $connexion->close();

    header('Location: /');
    exit();
}
?>
