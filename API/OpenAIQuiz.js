const express = require('express');
const { Client } = require('pg');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // Charge les variables d'environnement

// Récupération de la clé API à partir des variables d'environnement
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PG_PASSWORD = process.env.PG_PASSWORD;

router.use(express.json());

const client = new Client({
  user: 'pierrechevin',
  host: 'localhost',
  database: 'GiftGenius',
  password: PG_PASSWORD,
  port: 5432, // Port pour la connexion à PostgreSQL
});

// Connecter au client PostgreSQL
client.connect();

router.post('/generate', async (req, res) => {
    console.log('Requête reçue sur /generate');
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        const remainingCategories = await getRemainingCategories();
        console.log('Remaining categories:', remainingCategories); 

        let modifiedPrompt = prompt;
        if (remainingCategories.length > 0) {
            const remainingCategory = remainingCategories[0]; // Supposons que vous voulez la première catégorie restante
            modifiedPrompt = `${prompt} ${remainingCategory}.`;
        }
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                messages: [{ role: 'user', content: modifiedPrompt }],
            },
            {
                headers: {
                    'x-api-key': ANTHROPIC_API_KEY, // Utilise la clé API depuis les variables d'environnement
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('API Response:', response.data);

        const generatedText = response.data.content[0].text;
        res.json({ generatedText });
    } catch (error) {
        console.error('Error generating text:', error);

        const errorDetails = error.response ? error.response.data : { message: error.message };
        res.status(500).json({ error: 'Error generating text', details: errorDetails });
    }
});

async function getRemainingCategories() {
    try {
        const query = `
            SELECT category
            FROM products;
        `;
        const result = await client.query(query);
        return result.rows.map(row => row.category);
    } catch (error) {
        console.error('Error fetching remaining categories:', error);
        return [];
    }
}

module.exports = router;
