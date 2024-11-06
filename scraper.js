const puppeteer = require('puppeteer');
const fs = require('fs'); // Importer le module fs pour écrire dans un fichier

const url = 'https://www.kool.to/';
const channelId = 'channel-1684642409'; // Remplacez par l'ID de la chaîne que vous souhaitez scraper

let currentM3U8Url = null; // Variable pour stocker l'URL actuelle

// Fonction pour envoyer l'URL au fichier url.txt (remplacer le contenu à chaque nouvelle URL)
const sendUrlToFile = (url) => {
  fs.writeFile('url.txt', url + '\n', (err) => { // Remplace le fichier à chaque fois
    if (err) {
      console.error('Erreur d\'écriture dans le fichier :', err);
    } else {
      console.log('URL mise à jour dans le fichier url.txt :', url);
    }
  });
};

// Fonction de scraping pour récupérer l'URL m3u8
const scrapeM3U8 = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Intercepter les requêtes
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    request.continue();
  });

  // Intercepter les réponses
  page.on('response', async (response) => {
    const responseUrl = response.url();
    
    // Vérifier si l'URL de la réponse est un fichier m3u8
    if (responseUrl.includes('.m3u8') && responseUrl.startsWith('http')) {
      console.log('URL m3u8 valide trouvée :', responseUrl);
      currentM3U8Url = responseUrl; // Mettre à jour l'URL actuelle
      
      // Vérifier si l'URL ne contient pas "kool.to" avant de l'envoyer
      if (!responseUrl.includes("kool.to")) {
        // Envoyer l'URL au fichier (écraser l'ancien contenu)
        sendUrlToFile(responseUrl);
      } else {
        console.log("URL de Kool.to détectée, envoi annulé : " + responseUrl);
      }
    } else {
      console.log('URL non valide ou incorrecte :', responseUrl);
    }
  });

  // Ouvrir le site dans le navigateur Puppeteer
  await page.goto(url);

  // Attendre que le bouton de la chaîne soit visible
  await page.waitForSelector(`#${channelId}`);

  // Cliquez sur le bouton de la chaîne pour charger le flux
  console.log(`Clique sur le bouton pour la chaîne: ${channelId}`);
  await page.click(`#${channelId}`);

  // Attendre un moment pour que le contenu de la page se charge
  await new Promise(resolve => setTimeout(resolve, 5000)); // Ajustez si nécessaire

  await browser.close();
};

// Fonction pour rafraîchir l'URL toutes les 2 minutes
const refreshM3U8Url = async () => {
  setInterval(async () => {
    await scrapeM3U8(); // Rafraîchir l'URL en appelant la fonction scrapeM3U8
  }, 2 * 60 * 1000); // 2 minutes en millisecondes
};

// Exécuter le scraping toutes les 3 minutes
setInterval(scrapeM3U8, 3 * 60 * 1000); // 3 minutes en millisecondes

// Appeler la fonction une première fois immédiatement
scrapeM3U8();
refreshM3U8Url(); // Démarrer le rafraîchissement de l'URL
