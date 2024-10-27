const express = require('express');
const { Client } = require('pg'); // outil (appelé "Client" de la biblio pg) qui  aide à parler avec une base de données PostgreSQL
const bodyParser = require('body-parser');
const router = express.Router();
require('dotenv').config(); // Charge les variables d'environnement

// Récupération de la clé API à partir des variables d'environnement
const PG_PASSWORD = process.env.PG_PASSWORD;

// Configuration de la connexion à la base de données PostgreSQL
const client = new Client({
  user: 'pierrechevin',
  host: 'localhost',
  database: 'GiftGenius',
  password: PG_PASSWORD,
  port: 5432, // Port pour la connexion à PostgreSQL, pas pour l'API Express
});

// Middleware pour gérer les erreurs de connexion à la base de données
client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL avec succès'))
  .catch(err => console.error('Erreur lors de la connexion à la base de données PostgreSQL:', err));

// Afficher le produit (nom description) par categories, afficher leur vendeurs et leurs prix)
// Select * categories from products
router.get('/products', async (req, res) => {
  try {
    const query = `SELECT p.category, 
    array_agg(p.brand) AS brand, 
    array_agg(p.name) AS name,
    array_agg(p.description) AS desc,
    array_agg(DISTINCT p.seller_id) AS seller, 
    array_agg(DISTINCT r.link) AS link,
    (SELECT COUNT(*) FROM products) AS total_product_count
              FROM products p
              JOIN price r ON p.seller_id = r.seller
              GROUP BY p.category;`
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
router.get('/Filtremarque', async (req, res) => {
  const {brand_name} = req.query
  try {
    const brandFilter = brand_name.split(',')
    const query = `SELECT p.category, 
                      array_agg(p.name) AS name, 
                      array_agg(DISTINCT p.seller_id) AS seller, 
                      array_agg(p.description) AS desc,
                      array_agg(DISTINCT r.link) AS link
                          
                          FROM products p
                          JOIN price r ON p.seller_id = r.seller
                          WHERE p.brand = ANY($1)
                          GROUP BY p.category;`
    const value = [brandFilter];
    const result = await client.query(query, value);
    const brands = result.rows;
    console.log('le filtre marque fonctionne correctement', brands);
    res.json(brands);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des marques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// filtre pour les vendeurs
router.get('/Filtrevendeur', async (req, res) => {
  const { seller_name } = req.query;
  try {
    const sellerFilter = seller_name.split(',');
    const query = `
                  SELECT p.category, 
                      array_agg(p.name) AS name, 
                      array_agg(DISTINCT p.seller_id) AS seller, 
                      array_agg(p.description) AS desc,
                      array_agg(DISTINCT r.link) AS link
                  FROM products p
                  JOIN seller s ON p.seller_id = s.pk
                  JOIN price r ON p.seller_id = r.seller
                  WHERE s.name = ANY($1)
                    GROUP BY p.category;`;

    const value = [sellerFilter];
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
router.get('/Filtre/vendeur/marque', async (req, res) => {
  const { seller_name, brand_name } = req.query;
  try {
    // Split les paramètres de requête pour créer des tableaux
    const sellerFilter = seller_name.split(',');
    const brandFilter = brand_name.split(',');

    const query = `
                    SELECT p.category, 
                        array_agg(p.name) AS name, 
                        array_agg(DISTINCT p.seller_id) AS seller, 
                        array_agg(p.description) AS desc,
                        array_agg(DISTINCT r.link) AS link
                    FROM products p
                    JOIN seller s ON p.seller_id = s.pk
                    JOIN price r ON p.seller_id = r.seller
                    WHERE s.name = ANY($1) AND p.brand = ANY($2)
                    GROUP BY p.category;`

    // Utilisez les tableaux filtrés comme valeurs pour la requête
    const values = [sellerFilter, brandFilter];
    const result = await client.query(query, values);
    const sellerBrand = result.rows;
    console.log('le filtre vendeur/marque fonctionne', sellerBrand);
    res.json(sellerBrand);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// filtre pour les categories des produits
router.get('/categoriesfilter', async (req, res) => {
  // Ici, on s'attend à ce que `category_name` soit une chaîne de caractères avec des catégories séparées par des virgules, par exemple "cat1,cat2,cat3"
  const { category_name } = req.query;
  try {
    // Transformer la chaîne de catégories en un tableau
    const categories = category_name.split(',');

    const query = `SELECT p.category, 
                      array_agg(p.name) AS name, 
                      array_agg(DISTINCT p.seller_id) AS seller, 
                      array_agg(p.description) AS desc,
                      array_agg(DISTINCT r.link) AS link
                  FROM products p
                  JOIN seller s ON p.seller_id = s.pk
                  JOIN price r ON p.seller_id = r.seller
                  WHERE p.category = ANY($1)
                  GROUP BY p.category;`
    // Notez que PostgreSQL attend un tableau pour le placeholder `$1`, donc on entoure `categories` de parenthèses supplémentaires
    const value = [categories];
    const result = await client.query(query, value);
    const brands = result.rows;
    console.log('Le filtre marque fonctionne correctement', brands);
    res.json(brands);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des marques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// filtre pour les categories et marque
router.get('/Filtre/category/marque', async (req, res) => {
  const { category_name, brand_name } = req.query;
  try {
    // Split les paramètres de requête pour créer des tableaux
    const categoryFilter = category_name.split(',');
    const brandFilter = brand_name.split(',');

    const query = `
                    SELECT p.category, 
                        array_agg(p.name) AS name, 
                        array_agg(DISTINCT p.seller_id) AS seller, 
                        array_agg(p.description) AS desc,
                        array_agg(DISTINCT r.link) AS link
                    FROM products p
                    JOIN seller s ON p.seller_id = s.pk
                    JOIN price r ON p.seller_id = r.seller
                    WHERE p.brand = ANY($2) AND p.category = ANY($1)
                    GROUP BY p.category;`

    // Utilisez les tableaux filtrés comme valeurs pour la requête
    const values = [categoryFilter, brandFilter];
    const result = await client.query(query, values);
    const catBrand = result.rows;
    console.log('le filtre category/marque fonctionne', catBrand);
    res.json(catBrand);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// filtre pour les categories et vendeur
router.get('/Filtre/category/vendeur', async (req, res) => {
  const { category_name, seller_name } = req.query;
  try {
    // Split les paramètres de requête pour créer des tableaux
    const categoryFilter = category_name.split(',');
    const sellerFilter = seller_name.split(',');

    const query = `
                    SELECT p.category, 
                        array_agg(p.name) AS name, 
                        array_agg(DISTINCT p.seller_id) AS seller, 
                        array_agg(p.description) AS desc,
                        array_agg(DISTINCT r.link) AS link
                    FROM products p
                    JOIN seller s ON p.seller_id = s.pk
                    JOIN price r ON p.seller_id = r.seller
                    WHERE s.name = ANY($2) AND p.category = ANY($1)
                    GROUP BY p.category;`

    // Utilisez les tableaux filtrés comme valeurs pour la requête
    const values = [categoryFilter, sellerFilter];
    const result = await client.query(query, values);
    const catBrand = result.rows;
    console.log('le filtre category/marque fonctionne', catBrand);
    res.json(catBrand);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// filtre pour les categories/marque/vendeur des produits
router.get('/Filtre/vendeur/marque/categorie', async (req, res) => {
  const { seller_name, brand_name, category_name } = req.query;
  try {
    // Split les chaînes de requête pour créer des tableaux de filtres
    const sellerFilter = seller_name.split(',');
    const brandFilter = brand_name.split(',');
    const categoryFilter = category_name.split(',');

    const query = `
                    SELECT p.category, 
                        array_agg(p.name) AS name, 
                        array_agg(DISTINCT p.seller_id) AS seller, 
                        array_agg(p.description) AS desc,
                        array_agg(DISTINCT r.link) AS link
                    FROM products p
                    JOIN seller s ON p.seller_id = s.pk
                    JOIN price r ON p.seller_id = r.seller
                    WHERE s.name = ANY($1) AND p.brand = ANY($2) AND p.category = ANY($3)
                    GROUP BY p.category;`;

    // Utilisez les tableaux filtrés comme valeurs pour la requête
    const values = [sellerFilter, brandFilter, categoryFilter];
    const result = await client.query(query, values);
    const sellerBrandCategory = result.rows;
    console.log('le filtre vendeur/marque/categorie fonctionne', sellerBrandCategory);
    res.json(sellerBrandCategory);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// affichage de l'ensemble des sous categories
router.get('/category/subcategory/subsubcategory', async (req, res) => {
  try {
    const query = `
                    SELECT category, 
                    array_agg(DISTINCT subcategory) AS subcategory, 
                    array_agg(DISTINCT subsubcategory) AS subsubcategory
                      FROM (
                            SELECT DISTINCT category, subcategory, subsubcategory
                      FROM products) AS distinct_products
                    GROUP BY category;`

    const result = await client.query(query);
    const categories = result.rows;
    console.log('les categories et sous categories sont', categories);
    res.json(categories);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des categoris:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// donner la description pour le produit selectionné
router.get('/description', async (req, res) => {
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
router.get('/marques', async (req, res) => {
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
router.get('/vendeur', async (req, res) => {

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


router.get('/', async (req, res) => {
  try {
    const query = 'Hello'
    res.json(query);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


module.exports = router;

