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

const kdbxweb = require('kdbxweb');
const fs = require('fs');

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

/*
 ###        ##       ####   ###  ##  #######  ##   ##  #####
  ##       ####     ##  ##   ##  ##   ##   #  ###  ##   ## ##
  ##      ##  ##   ##        ## ##    ## #    #### ##   ##  ##
  #####   ##  ##   ##        ####     ####    ## ####   ##  ##
  ##  ##  ######   ##        ## ##    ## #    ##  ###   ##  ##
  ##  ##  ##  ##    ##  ##   ##  ##   ##   #  ##   ##   ## ##
 ######   ##  ##     ####   ###  ##  #######  ##   ##  #####

*/

/*
// Function to load or create a KeePass database
async function loadOrCreateDatabase(dbPath, masterPassword) {
    try {
        const fileExists = fs.existsSync(dbPath);
        if (fileExists) {
            const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(masterPassword));
            return await kdbxweb.Kdbx.load(fs.readFileSync(dbPath), credentials);
        } else {
            const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(masterPassword));
            const newDb = kdbxweb.Kdbx.create(credentials, 'My KeePass Database');
            await fs.promises.writeFile(dbPath, await newDb.save());
            return newDb;
        }
    } catch (error) {
        console.error('Error loading/creating database:', error);
        throw error;
    }
}

// Function to check or generate a password for a given username and site
function getPassword(db, username, site) {
    const defaultGroup = db.getDefaultGroup();

    // Check if the subgroup (username) exists
    let userGroup = defaultGroup.groups.find(group => group.name === username);
    if (!userGroup) {
        // Create the subgroup if it doesn't exist
        userGroup = db.createGroup(defaultGroup, username);
    }

    // Check if the entry (site) exists
    let entry = userGroup.entries.find(entry => entry.fields.Site === site);
    if (entry) {
        // Entry exists, return the password
        return entry.fields.Password.getText();
    } else {
        // Entry doesn't exist, generate a password
        const newPassword = generateRandomPassword();
        
        // Create the entry and set its fields
        entry = db.createEntry(userGroup);
        entry.fields.Site = site;
        entry.fields.Username = username;
        entry.fields.Password = kdbxweb.ProtectedValue.fromString(newPassword);

        // Save the changes to the database
        db.save();

        // Return the generated password
        return newPassword;
    }
}

// Function to generate a random password
function generateRandomPassword() {
    // Your password generation logic here
    // For simplicity, you can use a library like 'crypto-random-string'
    return 'GeneratedPassword123';
}

// Example usage
const databasePath = 'path/to/your/database.kdbx';
const masterPassword = 'YourMasterPassword';

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