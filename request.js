const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Configuration de la base de données
const connection = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: ''
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Échec de la connexion :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

// Utilisation de body-parser pour récupérer les données POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Utilisation de cookie-parser pour manipuler les cookies
app.use(cookieParser());

// Route pour gérer l'inscription
app.post('/request_register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const hashedPassword = bcrypt.hashSync(password, 10); // Hash du mot de passe

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Erreur lors de la requête SQL :', err);
            res.status(500).send('Erreur interne du serveur');
            return;
        }

        if (result.affectedRows === 1) {
            res.cookie('LOGGED_USER', username, {
                expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
                secure: true,
                httpOnly: true
            });
            res.send('Inscription réussie !');
        } else {
            res.send('Erreur lors de l\'inscription');
        }
    });
});


// Route pour gérer la connexion
app.post('/request_login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], (err, result) => {
        if (err) {
            console.error('Erreur lors de la requête SQL :', err);
            res.status(500).send('Erreur interne du serveur');
            return;
        }

        if (result.length === 1) {
            const user = result[0];
            if (password === user.password) {
                res.cookie('LOGGED_USER', username, {
                    expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
                    secure: true,
                    httpOnly: true
                });
                res.send('Connexion réussie !');
            } else {
                res.send('Mot de passe incorrect !');
            }
        } else {
            res.send('Nom d\'utilisateur incorrect !');
        }
    });
});

// Route pour gérer la déconnexion
app.post('/request_logout', (req, res) => {
    res.clearCookie('LOGGED_USER');
    res.send('Déconnexion réussie !');
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
});
