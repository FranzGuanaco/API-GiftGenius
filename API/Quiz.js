const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const router = express.Router();

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



// filtre de recherche pour le quiz
router.get('/budget', async (req, res) => {
    // echelle pour filtrer le budget
    const { minBudget, maxBudget } = req.query;
    try {
      const budgetQuery = `SELECT products.pk AS product_id, products.*, price.*
                          FROM products
                          JOIN price ON products.pk = price.product
                          WHERE CAST(price.price AS numeric) < $1 AND CAST(price.price AS numeric) > $2;`
      
      const values = [minBudget, maxBudget]; // Utilisation de paramètres de requête pour prévenir les injections SQL
      const result = await client.query(budgetQuery, values);
      const budget = result.rows;
      console.log('elimination d\'un premier element', budget);
      res.json(budget);
        // Vérifiez si des produits ont été trouvés
        if (budget.length === 0) {
          return res.status(404).json({ message: "Aucun produit trouvé pour ce budget" });
        }      
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la récupération des marques:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  router.get('/occasion', async (req, res) => {
    const { productIds, occasionType } = req.query;  // Attend une liste d'identifiants de produits séparés par des virgules
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
      const reviewsQuery = `SELECT 
                              products.pk AS product_id, 
                              products.*, 
                              occasion.*
                            FROM products
                            JOIN occasion ON products.pk = occasion.product 
                            WHERE occasion.${occasionType} = TRUE AND products.pk = ANY($1);`
  
      const reviewsResult = await client.query(reviewsQuery, [ids]);
      res.json(reviewsResult.rows);
      console.log('elimination d\'un second element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des occasion:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  router.get('/gender', async (req, res) => {
    const { productIds, sexe_destinataire } = req.query;  // Attend une liste d'identifiants de produits séparés par des virgules
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
      const reviewsQuery = `SELECT 
                              products.pk AS product_id, 
                              products.*, 
                              sexe_destinataire.*
                            FROM products
                            JOIN sexe_destinataire ON products.pk = sexe_destinataire.product_id 
                            WHERE sexe_destinataire.${sexe_destinataire} = TRUE AND products.pk = ANY($1);`
      const reviewsResult = await client.query(reviewsQuery, [ids]);
      res.json(reviewsResult.rows);
      console.log('elimination d\'un troisieme element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des genres:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  
  router.get('/age', async (req, res) => {
    const { productIds, age_destinataire } = req.query;
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
  
      const reviewsQuery = `SELECT 
                            products.pk AS product_id, 
                            products.*, 
                            age_destinataire.*
                          FROM products
                          JOIN age_destinataire ON products.pk = age_destinataire.product_id 
                          WHERE age_destinataire.${age_destinataire} = TRUE AND products.pk = ANY($1);`
      const reviewsResult = await client.query(reviewsQuery, [ids]);
      res.json(reviewsResult.rows);
      console.log('Elimination d\'un quatrieme element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des ages:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  
  router.get('/present_kind', async (req, res) => {
    const { productIds, cadeau_type } = req.query;  // Attend une liste d'identifiants de produits séparés par des virgules
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
      const reviewsQuery = `SELECT 
                              products.pk AS product_id, 
                              products.*
                            FROM products
                            WHERE ${cadeau_type} = TRUE AND products.pk = ANY($1);`
      const reviewsResult = await client.query(reviewsQuery, [ids]);
      res.json(reviewsResult.rows);
      console.log('elimination d\'un cinquieme element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  router.get('/passion_practical', async (req, res) => {
    const { productIds, cadeau_type } = req.query;  // Attend une liste d'identifiants de produits séparés par des virgules
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
      const reviewsQuery = `SELECT products.pk AS product_id, products.*
                            FROM products
                            WHERE ${cadeau_type} = TRUE AND products.pk = ANY($1);`
      const reviewsResult = await client.query(reviewsQuery, [ids]);
      res.json(reviewsResult.rows);
      console.log('elimination d\'un sixieme element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  router.get('/category', async (req, res) => {
    const { productIds, products_category } = req.query;  // Attend une liste d'identifiants de produits séparés par des virgules
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
      const reviewsQuery = `SELECT products.pk AS product_id, products.*
                            FROM products
                            WHERE category = $2 AND products.pk = ANY($1);`
      const reviewsResult = await client.query(reviewsQuery, [ids, products_category]);
      res.json(reviewsResult.rows);
      console.log('Elimination d\'un septieme element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
   
  
  router.get('/subcategory', async (req, res) => {
    const { productIds, products_subcategory } = req.query;  // Attend une liste d'identifiants de produits séparés par des virgules
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
      const reviewsQuery = `SELECT products.pk AS product_id, products.*
                            FROM products
                            WHERE subcategory = $2 AND products.pk = ANY($1);`
      const reviewsResult = await client.query(reviewsQuery, [ids, products_subcategory]);
      res.json(reviewsResult.rows);
      console.log('Elimination d\'un huitieme element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  router.get('/s.subcategory', async (req, res) => {
    const { productIds, products_subcategory } = req.query;  // Attend une liste d'identifiants de produits séparés par des virgules
    try {
      const ids = productIds.split(',').map(id => Number(id.trim()));
      const reviewsQuery = `SELECT products.pk AS product_id, products.*
                            FROM products
                            WHERE subsubcategory = $2 AND products.pk = ANY($1);`
      const reviewsResult = await client.query(reviewsQuery, [ids, products_subcategory]);
      res.json(reviewsResult.rows);
      console.log('Elimination d\'un neuvieme element', reviewsResult.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  module.exports = router;