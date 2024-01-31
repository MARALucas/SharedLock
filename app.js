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

const kdbxweb = require('kdbxweb');
const fs = require('fs');

app.get('/', (req, res) => {
    res.send('Bonjour, Node.js et Express !');
  });
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`Le serveur écoute sur le port ${port}`);
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