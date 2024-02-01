/*
   ###                                 ##                          ###
  ## ##                                ##                           ##
   #      ######    ####    #####     #####    ####    #####        ##
 ####      ##  ##  ##  ##   ##  ##     ##     ##  ##   ##  ##    #####
  ##       ##      ##  ##   ##  ##     ##     ######   ##  ##   ##  ##
  ##       ##      ##  ##   ##  ##     ## ##  ##       ##  ##   ##  ##
 ####     ####      ####    ##  ##      ###    #####   ##  ##    ######

*/
const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const util = require('./util')
const argon2Implementation = require('./argon2-implementation.js');
const kdbxweb = require('kdbxweb');
require('dotenv').config() //gestion de secret
const fs = require('fs');

/*
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');

// Configuration de la base de données
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'user',
    password: 'user',
    database: 'test'
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
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// Utilisation de cookie-parser pour manipuler les cookies
// app.use(cookieParser());



app.use(express.static("public"))

app.get('/', (req, res) => {
    res.send('');
  });
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`Le serveur écoute sur le port ${port}`);
  });


// Route pour gérer l'inscription
app.get('/register', async (req, res) => {
    if (["username", "password", "confirmpassword"].every(el => Object.keys(req.query).includes(el))){
        if (req.query.password == req.query.confirmpassword){
            delete req.query['confirmpassword']
            const username = req.query.username

            //const hashedPassword = bcrypt.hash(req.query.password, 10);
            const hashedPassword = util.hashPassword(req.query.password)
            console.log(req.query.password)
            console.log(hashedPassword)

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
        }
    }
});


// Route pour gérer la connexion
app.get('/login', async (req, res) => {
    if (["username", "password"].every(el => Object.keys(req.query).includes(el))){
        const username = req.query.username;
        const password = req.query.password;

        const query = 'SELECT * FROM users WHERE username = ?';
        connection.query(query, [username], (err, result) => {
            if (err) {
                console.error('Erreur lors de la requête SQL :', err);
                res.status(500).send('Erreur interne du serveur');
                return;
            }

            if (result.length === 1) {
                const user = result[0];
                if (util.hashPassword(req.query.password) === user.password) {
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
    }
});

// Route pour gérer la déconnexion
app.post('/logout', (req, res) => {
    res.clearCookie('LOGGED_USER');
    res.send('Déconnexion réussie !');
});
*/


/*
 ###        ##       ####   ###  ##  #######  ##   ##  #####
  ##       ####     ##  ##   ##  ##   ##   #  ###  ##   ## ##
  ##      ##  ##   ##        ## ##    ## #    #### ##   ##  ##
  #####   ##  ##   ##        ####     ####    ## ####   ##  ##
  ##  ##  ######   ##        ## ##    ## #    ##  ###   ##  ##
  ##  ##  ##  ##    ##  ##   ##  ##   ##   #  ##   ##   ## ##
 ######   ##  ##     ####   ###  ##  #######  ##   ##  #####

*/


/**
 *  Charge une base de données KeePass existante depuis le chemin de fichier spécifié
 *  ou en crée une nouvelle si le fichier n'existe pas.
 * 
 * @param {string} dbPath - Le chemin du fichier de la base de données KeePass.
 * @param {string} masterPassword - Le mot de passe principal pour déverrouiller ou créer la base de données.
 * @returns {Promise<Kdbx>} - Une Promise résolvant la base de données KeePass chargée ou nouvellement créée (objet Kdbx).
 * @throws {Error} - Lance une erreur s'il y a un problème lors du chargement ou de la création de la base de données.
 */
async function loadOrCreateDatabase(dbPath, masterPassword) {
    try {
        // Vérifie si le fichier de la base de données existe
        const fileExists = fs.existsSync(dbPath);

        if (fileExists) {
            // Charge la base de données existante si le fichier existe
            const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(masterPassword));
            return await kdbxweb.Kdbx.load(fs.readFileSync(dbPath), credentials);
        } else {
            // Crée une nouvelle base de données si le fichier n'existe pas     
            const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(masterPassword));
            const newDb = kdbxweb.Kdbx.create(credentials, 'My KeePass Database');

            console.log(masterPassword);
            console.log(typeof masterPassword);
            // Enregistre la nouvelle base de données au chemin de fichier spécifié
            const buffer = Buffer.from(await newDb.save());
            await fs.promises.writeFile(dbPath, buffer);


            

            // Retourne la base de données nouvellement créée
            return newDb;
        }
    } catch (error) {
        console.error('Error loading/creating database:', error);
        throw error;
    }
}

/**
 * Vérifie l'existence d'un mot de passe pour un nom d'utilisateur et un site donnés,
 * et génère un nouveau mot de passe si aucun n'est trouvé.
 * 
 * @param {*} db - La base de données KeePass.
 * @param {string} username - Le nom d'utilisateur associé au mot de passe.
 * @param {string} site - Le site pour lequel le mot de passe est utilisé.
 * @returns {string} - Le mot de passe existant ou nouvellement généré.
 */
function getPassword(db, username, site) {
    const defaultGroup = db.getDefaultGroup();

    // Vérifie si le sous-groupe (username) existe
    let userGroup = defaultGroup.groups.find(group => group.name === username);
    if (!userGroup) {
        // Crée le sous-groupe s'il n'existe pas
        userGroup = db.createGroup(defaultGroup, username);
    }

    // Vérifie si l'entrée (site) existe
    let entry = userGroup.entries.find(entry => entry.fields.Site === site);
    if (entry) {
        // L'entrée existe, retourne le mot de passe
        return entry.fields.Password.getText();
    } else {
        // L'entrée n'existe pas, génère un nouveau mot de passe
        const newPassword = generateRandomPassword();
        
        // Crée l'entrée et définit ses champs
        entry = db.createEntry(userGroup);
        entry.fields.Site = site;
        entry.fields.Username = username;
        entry.fields.Password = kdbxweb.ProtectedValue.fromString(newPassword);

        // Enregistre les modifications dans la base de données
        db.save();

        // Retourne le mot de passe généré
        return newPassword;
    }
}

/**
 * 
 * @returns New pass
 */
function generateRandomPassword() {
    // Your password generation logic here
    // For simplicity, you can use a library like 'crypto-random-string'
    return 'GeneratedPassword123';
}

// sweet secret
const databasePath = 'database.kdbx';
const masterPassword =  process.env.DBPassword;
(async () => {
    try {
        const db = await loadOrCreateDatabase(databasePath, masterPassword);
        const username = 'sampleUser';
        const site = 'example.com';
        const password = getPassword(db, username, site);
        console.log('Password:', password);
    } catch (error) {
        console.error('Error:', error);
    }
})();

