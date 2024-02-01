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
require('dotenv').config()


app.use(cookieParser());

app.use(sessions({
    secret: '686Q5r-/yv[kVH', 
    resave: false,
    saveUninitialized: true,
}));

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'user',
    password: 'user',
    database: 'test'
});

connection.connect((err) => {
    if (err) {
        console.error('Échec de la connexion :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    req.session.active = false;
    res.render('index', {active: req.session.active});
  });
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`Le serveur écoute sur le port ${port}`);
  });


// Route pour gérer l'inscription
app.get('/register', async (req, res) => {
    if (["username", "password", "confirmpassword"].every(el => Object.keys(req.query).includes(el))){
        if (req.query.password == req.query.confirmpassword){
            delete req.query['confirmpassword'];

            if(await util.addUser(connection, req.query)) {
                return res.redirect("/")
            }

        } else {
            return res.redirect("/")
        }
    }
    res.render('index', {active: req.session.active})
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

            if (req.query.forward){
                return res.redirect(req.query.forward)
            }
            else{
                return res.redirect('/')
            }*/
        }
    }
    res.render("index", {forward: req.query.forward, active: req.session.active})
});

app.get('/logout',(req, res) => {
    req.session.destroy()
    req.session = null
    res.clearCookie('LOGGED_USER');

    delete session
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
            console.log("test0");
            const test = await newDb.save();
            console.log("test1");
            const buffer = Buffer.from(test);
            console.log("test2");
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
/*
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
*/