const express = require('express');
const { Client } = require('pg');
const app = express();
const port = 3001; 
const cors = require('cors');

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000'
  }));
  

// Configuration de la connexion à la base de données PostgreSQL
const client = new Client({
  user: 'pierrechevin',
  host: 'localhost',
  database: 'GiftGenius',
  password: 'Elsalvador60?',
  port: 5432, // Port pour la connexion à PostgreSQL, pas pour l'API Express
});

// Middleware pour gérer les erreurs de connexion à la base de données
client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL avec succès'))
  .catch(err => console.error('Erreur lors de la connexion à la base de données PostgreSQL:', err));


// Afficher le produit (nom description) par categories, afficher leur vendeurs et leurs prix)
// Select * categories from products
app.get('/api/products', async (req, res) => {
  try {
    const query = 'SELECT category, array_agg(name) FROM products GROUP BY category';
    const result = await client.query(query);
    const products = result.rows;
    console.log(products);
    res.json(products);
    
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// filtre pour les marques des marques
app.get('/api/Filtremarque', async (req, res) => {
  const {brand_name} = req.query
  try {
    const query = 'SELECT category, array_agg(name) FROM products WHERE brand = $1 GROUP BY category';
    const value = [brand_name];
    const result = await client.query(query, value);
    const brands = result.rows;
    console.log('le filtre marque fonctionne', brands);
    res.json(brands);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des marques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// filtre pour les vendeurs
app.get('/api/Filtrevendeur', async (req, res) => {
  const { seller_name } = req.query;
  try {
    const query = `
    SELECT p.category, array_agg(s.name) AS array_agg
    FROM products p
    JOIN seller s ON p.seller_id = s.pk
    WHERE s.name = $1
    GROUP BY p.category;`;

    const value = [seller_name];
    const result = await client.query(query, value);
    const seller = result.rows;
    console.log('le filtre vendeur fonctionne', seller);
    res.json(seller);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// filtre pour les vendeurs et marque
app.get('/api/Filtre/vendeur/marque', async (req, res) => {
  const { seller_name, brand_name} = req.query;
  try {
    const query = `
    SELECT p.category, array_agg(s.name) AS array_agg
    FROM products p
    JOIN seller s ON p.seller_id = s.pk
    WHERE s.name = $1 AND brand = $2
    GROUP BY p.category;`;

    const value = [seller_name, brand_name];
    const result = await client.query(query, value);
    const sellerBrand = result.rows;
    console.log('le filtre vendeur/marque fonctionne', sellerBrand);
    res.json(sellerBrand);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// donner la description pour le produit selectionné
app.get('/api/description', async (req, res) => {
  // Utilisez `req.query` pour les requêtes GET
  const { nom_prod } = req.query;

  try {
    const query = 'SELECT description FROM products WHERE name = $1';
    const values = [nom_prod]; // Utilisation de paramètres de requête pour prévenir les injections SQL
    const result = await client.query(query, values);
    const descrip = result.rows;
    console.log('ca marche', descrip);
    res.json(descrip);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// afficher l'ensemble des marques
app.get('/api/marques', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT brand  FROM products';
    const result = await client.query(query);
    const brands = result.rows;
    console.log('la liste marche', brands);
    res.json(brands);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des marques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// afficher l'ensemble des vendeurs
app.get('/api/vendeur', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT name  FROM seller';
    const result = await client.query(query);
    const brands = result.rows;
    console.log('la liste marche', brands);
    res.json(brands);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des marques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.get('/', async (req, res) => {
  try {
    const query = 'Hello'
    res.json(products);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajout du code pour démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
