const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 5432; // Le port sur lequel votre API écoutera

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


