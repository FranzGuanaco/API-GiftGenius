const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 3000; // Le port sur lequel votre API écoutera

// Configuration de la connexion à la base de données PostgreSQL
const client = new Client({
  user: 'pierrechevin',
  host: 'localhost',
  database: 'GiftGenius',
  password: 'Elsalvador60?',
  port: 5432,
});

// Middleware pour gérer les erreurs de connexion à la base de données
client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL avec succès'))
  .catch(err => console.error('Erreur lors de la connexion à la base de données PostgreSQL:', err));

// Route pour récupérer tous les produits
app.get('/api/products', async (req, res) => {
  try {
    const query = 'SELECT * FROM products';
    const result = await client.query(query);
    const products = result.rows;
    res.json(products);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Écoute de l'API sur le port spécifié
app.listen(port, () => {
  console.log(`API en cours d'exécution sur le port ${port}`);
});
