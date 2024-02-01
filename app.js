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
// const bcrypt = require('bcrypt');
const util = require('./util')
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const argon2Implementation = require('./argon2-implementation.js');
const kdbxweb = require('kdbxweb');
const fs = require('fs');

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
            const username = req.query.username;

            //const hashedPassword = bcrypt.hash(req.query.password, 10);
            const hashedPassword = util.hashPassword(req.query.password);

            const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            connection.query(query, [username, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Erreur lors de la requête SQL :', err);
                    res.status(500).send('Erreur interne du serveur');
                    return;
                }
        
                if (result.affectedRows === 1) {
                    /*req.session.user = { username: username };
                    req.sesssion.active = true;
                    res.cookie('LOGGED_USER', username, {
                        expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
                        secure: true,
                        httpOnly: true
                    });*/
                    res.redirect("/")
                } else {
                    res.send('Erreur lors de l\'inscription');
                }
            });
        } else {
            res.redirect("/")
        }
    }
    res.render('index', {active: req.session.active})
});


// Route pour gérer la connexion
app.get('/login', async (req, res) => {
    if (["username", "password"].every(el => Object.keys(req.query).includes(el))){
        const username = req.query.username;
        const password = req.query.password;

        const query = 'SELECT * FROM users WHERE username = ?';
        connection.query(query, [username], (err, result) => {
            console.log("ok")
            if (err) {
                /*console.error('Erreur lors de la requête SQL :', err);
                res.status(500).send('Erreur interne du serveur');
                return;*/
            }

            if (result.length === 1) {
                console.log("ok")
                const user = result[0];
                if (util.hashPassword(req.query.password) === user.password) {
                    req.session.user = username;
                    req.session.active = true;
                    console.log("ok")
                    res.cookie('LOGGED_USER', username, {
                        expires: new Date(Date.now() + 365 * 24 * 3600 * 1000),
                        secure: true,
                        httpOnly: true
                    });

                    if (req.query.forward){
                        return res.redirect(req.query.forward)
                    }
                    else{
                        return res.redirect('/')
                    }
                } else {
                    return res.redirect('/login?error=true');
                }
            } else {
                res.redirect('/login?error=true');
            }
        });
    }
    res.render("index", {forward: req.query.forward, active: req.session.active})
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