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
const util = require('./util')
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const argon2Implementation = require('./argon2-implementation.js');
const kdbxweb = require('kdbxweb');
const fs = require('fs');
const { Console } = require('console');
require('dotenv').config()

/*
// Utiliser le module cookie-parser pour analyser les cookies
app.use(cookieParser());

// Configuration de la gestion de sessions avec express-session
app.use(sessions({
    secret: '686Q5r-/yv[kVH', 
    resave: false,
    saveUninitialized: true,
}));

// Configuration de la connexion à la base de données MySQL
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'user',
    password: 'user',
    database: 'test'
});

// Établir la connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Échec de la connexion :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

// Configuration d'Express
app.use(express.static("public"));
app.set('view engine', 'ejs');

// Route pour la page d'accueil
app.get('/', (req, res) => {
    req.session.active = false;
    res.render('index', {active: req.session.active});
  });
  
app.listen(port, '0.0.0.0', () => {
    console.log(`Le serveur écoute sur le port ${port}`);
});


// La route pour gérer l'inscription
app.get('/register', async (req, res) => {
    // Vérifier si les champs requis (username, password, confirmpassword) sont présents dans la requête
    if (["username", "password", "confirmpassword"].every(el => Object.keys(req.query).includes(el))) {
        // Vérifier si le mot de passe et la confirmation du mot de passe correspondent
        if (req.query.password == req.query.confirmpassword) {
            // Supprimer le champ 'confirmpassword' de l'objet req.query
            delete req.query['confirmpassword'];

            // Appeler la fonction addUser de l'utilitaire 'util' pour ajouter un utilisateur
            if (await util.addUser(connection, req.query)) {
                // Rediriger vers la page d'accueil si l'inscription est réussie
                return res.redirect("/");
            }
        } else {
            // Rediriger vers la page d'accueil si le mot de passe et la confirmation ne correspondent pas
            return res.redirect("/");
        }
    }

    // Rendre la page d'accueil avec une éventuelle indication d'activité de session (req.session.active)
    res.render('index', { active: req.session.active });
});


// Route pour gérer la connexion
app.get('/login', async (req, res) => {
    if (["username", "password"].every(el => Object.keys(req.query).includes(el))){
        const username = req.query.username;
        const password = req.query.password;

        if(util.verify(connection, username, password)) {
            req.session.user = username;
            req.session.active = true;
            res.cookie('LOGGED_USER', username, { maxAge: 900000, httpOnly: true });
            /*res.cookie('LOGGED_USER', username, {
                expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
                secure: true,
                httpOnly: true
            });
            // Rediriger vers la page demandée après la connexion (forward)
            if (req.query.forward){
                return res.redirect(req.query.forward)
            }
            else{
                return res.redirect('/')
            }*/
      /*  }
    }
    res.render("index", {forward: req.query.forward, active: req.session.active})
});

// La route pour gérer la déconnexion
app.get('/logout',(req, res) => {
    // Détruire la session
    req.session.destroy()  
    // Définir la session à null
    req.session = null;
    // Effacer le cookie associé à l'utilisateur connecté
    res.clearCookie('LOGGED_USER');
    // Rediriger l'utilisateur vers la page d'accueil après la déconnexion
    res.redirect('/')
})

app.get('/keepass', (req, res) => {
    data = {
        username: req.session.user,
        site: req.query.site
    }
})


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

        console.log('Master Password:', masterPassword);
        console.log('Master Password Type:', typeof masterPassword);

        if (fileExists) {
            // Charge la base de données existante si le fichier existe
            console.log("Database file exists");
            const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(masterPassword));
            console.log('Before key derivation');
            const loadedDb = await kdbxweb.Kdbx.load(fs.readFileSync(dbPath), credentials);
            console.log('After key derivation');
            return loadedDb;
        } else {
            // Crée une nouvelle base de données si le fichier n'existe pas
            console.log("Creating a new database");     
            const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(masterPassword));
            const newDb = kdbxweb.Kdbx.create(credentials, 'database');

            // Enregistre la nouvelle base de données au chemin de fichier spécifié
            console.log('Before saving new database');
            const buffer = Buffer.from(await newDb.save());
            console.log('After saving new database');

            console.log('Before writing new database file');
            await fs.promises.writeFile(dbPath, buffer);
            console.log('After writing new database file'); 

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

/**
 * Récupère le mot de passe associé à un nom d'utilisateur et un site donnés depuis la base de données.
 * 
 * @param {string} username - Le nom d'utilisateur pour lequel récupérer le mot de passe.
 * @param {string} site - Le site pour lequel récupérer le mot de passe.
 * @returns {Promise<string>} - Une promesse qui se résout avec le mot de passe, ou est rejetée avec une erreur.
 */
async function getPasswordForUserAndSite(username, site) {
    try {
        // Charge ou crée la base de données en utilisant le chemin spécifié et le mot de passe principal.
        const db = await loadOrCreateDatabase(databasePath, masterPassword);

        // Récupère le mot de passe associé au nom d'utilisateur et au site donnés depuis la base de données.
        const password = getPassword(db, username, site);

        // Retourne le mot de passe récupéré.
        return password;
    } catch (error) {
        // Si une erreur survient pendant le processus, lance une nouvelle erreur avec un message descriptif.
        throw new Error('Impossible de récupérer le mot de passe : ' + error.message);
    }
}


/*
// Exemple d'utilisation :
(async () => {
    try {
        const username = 'utilisateurExemple';
        const site = 'exemple.com';

        // Appelle la fonction pour obtenir le mot de passe pour le nom d'utilisateur et le site spécifiés.
        const password = await getPasswordForUserAndSite(username, site);

        // Journalise le mot de passe récupéré.
        console.log('Mot de passe :', password);
    } catch (error) {
        // Gère les erreurs en journalisant un message d'erreur.
        console.error('Erreur :', error.message);
    }
})();*/