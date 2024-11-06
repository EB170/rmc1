const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cron = require('node-cron');  // Pour exécuter scraper.js de manière régulière

const app = express();
const port = 3000;

// Servir les fichiers statiques dans le répertoire 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route pour obtenir l'URL de flux depuis url.txt
app.get('/get-url', (req, res) => {
    fs.readFile('url.txt', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Erreur lors de la lecture du fichier');
            return;
        }
        res.json({ url: data.trim() });  // Renvoyer l'URL dans un format JSON
    });
});

// Exécuter scraper.js à chaque lancement du serveur
exec('node scraper.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Erreur lors de l'exécution de scraper.js: ${err}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});

// Planifier l'exécution de scraper.js toutes les 2 minutes
cron.schedule('*/2 * * * *', () => {
    console.log('Exécution de scraper.js...');
    exec('node scraper.js', (err, stdout, stderr) => {
        if (err) {
            console.error(`Erreur lors de l'exécution de scraper.js: ${err}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur local lancé sur http://localhost:${port}`);
});
