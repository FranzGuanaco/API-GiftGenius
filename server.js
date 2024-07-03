const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

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

// Importer les routes
const interfaceAPIRoutes = require('./API/InterfaceAPI');
const quizRoutes = require('./API/Quiz');
const huggingFaceRoutes = require('./API/OpenAIQuiz'); // Nouvelle route OpenAI

// Utiliser les routes
app.use('/api/interface', interfaceAPIRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/claude', huggingFaceRoutes);

// Ajout du code pour démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
