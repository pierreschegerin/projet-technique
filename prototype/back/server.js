/**
 * ==============================================================================
 * SERVEUR BACK-END - PROTOTYPE PETITES ANNONCES (STYLE LEBONCOIN)
 * ==============================================================================
 * 
 * Ce fichier constitue le serveur Node.js / Express.
 * Il gère :
 * 1. L'API REST (liste, détail, création d'annonces).
 * 2. L'upload de fichiers photos via le middleware Multer.
 * 3. La persistance simple des données dans un fichier JSON local (data/annonces.json).
 * 4. La distribution des fichiers statiques (images uploadées et interface front-end).
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Chemins vers les dossiers clés
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'annonces.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const FRONT_DIR = path.join(__dirname, '../front');

// S'assurer que les dossiers nécessaires existent au démarrage
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ==============================================================================
// 1. MIDDLEWARES GLOBAUX
// ==============================================================================

// CORS : permet au front-end d'appeler l'API même s'il tourne sur un autre port (ex: Live Server)
app.use(cors());

// Analyse des corps de requêtes JSON et formulaires standards
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre le dossier des photos uploadées accessible publiquement via l'URL /uploads/...
app.use('/uploads', express.static(UPLOAD_DIR));

// Rendre également le dossier front accessible publiquement (ex: http://localhost:3000)
// Cela permet de tester tout le site en lançant une seule commande !
app.use(express.static(FRONT_DIR));

// ==============================================================================
// 2. CONFIGURATION DE L'UPLOAD PHOTO (MULTER)
// ==============================================================================

const storage = multer.diskStorage({
  // Dossier où stocker les images reçues
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  // Nom unique donné au fichier pour éviter les collisions : timestamp + nom nettoyé
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nomNettoye = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_');
    const nomUnique = `${Date.now()}-${nomNettoye}${extension}`;
    cb(null, nomUnique);
  }
});

// Filtre pour n'accepter que les fichiers de type image
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image sont acceptés (JPG, PNG, WEBP, SVG, etc.).'), false);
  }
};

// Initialisation de Multer (limite à 5 photos par annonce et 5 Mo par fichier)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ==============================================================================
// 3. FONCTIONS D'ACCÈS AUX DONNÉES (FICHIER JSON)
// ==============================================================================

// Données d'exemple initiales au cas où le fichier n'existe pas encore
const ANNONCES_PAR_DEFAUT = [
  {
    id: "1",
    titre: "Vélo de course vintage Peugeot",
    description: "Superbe vélo de course Peugeot des années 80 en excellent état de conservation. Cadre en acier Reynolds, 10 vitesses, freins révisés et câblerie neuve. Guidoline en cuir marron neuve. Pneus Michelin neufs. Idéal pour les trajets vélotaf en ville ou les sorties cyclo le week-end.",
    prix: 150,
    photos: [
      "/uploads/velo-1.svg",
      "/uploads/velo-2.svg"
    ],
    dateCreation: "2026-11-20T10:00:00.000Z"
  },
  {
    id: "2",
    titre: "Guitare acoustique folk Yamaha F310",
    description: "Guitare acoustique folk Yamaha F310 finition naturelle. Très bon état, parfaite pour débutants ou musiciens confirmés recherchant une guitare de voyage fiable. Sonorités chaudes et équilibrées. Jeu de cordes d'Addario neuf. Vendue avec sa housse de transport molletonnée et son accordeur électronique.",
    prix: 85,
    photos: [
      "/uploads/guitare-1.svg"
    ],
    dateCreation: "2026-11-21T14:30:00.000Z"
  },
  {
    id: "3",
    titre: "Console Nintendo Switch + 2 jeux",
    description: "Nintendo Switch modèle standard avec Joy-Cons bleu néon et rouge néon en excellent état esthétique et de fonctionnement (aucun problème de drift). Écran sous protection en verre trempé depuis l'achat. Livrée complète dans sa boîte d'origine avec le dock TV, chargeur officiel, support manette Joy-Con et 2 jeux en version cartouche : Zelda Breath of the Wild et Mario Kart 8 Deluxe.",
    prix: 210,
    photos: [
      "/uploads/switch-1.svg",
      "/uploads/switch-2.svg"
    ],
    dateCreation: "2026-11-22T09:15:00.000Z"
  }
];

/**
 * Lit la liste des annonces depuis data/annonces.json.
 * Si le fichier n'existe pas, il est créé avec les annonces par défaut.
 */
function getAnnonces() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      saveAnnonces(ANNONCES_PAR_DEFAUT);
      return ANNONCES_PAR_DEFAUT;
    }
    const contenu = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(contenu);
  } catch (err) {
    console.error("Erreur lors de la lecture du fichier d'annonces:", err);
    return [];
  }
}

/**
 * Écrit la liste des annonces dans data/annonces.json avec indentation lisible.
 */
function saveAnnonces(annonces) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(annonces, null, 2), 'utf-8');
  } catch (err) {
    console.error("Erreur lors de la sauvegarde du fichier d'annonces:", err);
    throw err;
  }
}

// ==============================================================================
// 4. ROUTES DE L'API REST
// ==============================================================================

/**
 * GET /api/annonces
 * Récupère la liste de toutes les annonces, triées de la plus récente à la plus ancienne.
 */
app.get('/api/annonces', (req, res) => {
  const annonces = getAnnonces();
  // Tri par date décroissante
  const annoncesTriees = [...annonces].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
  res.json(annoncesTriees);
});

/**
 * GET /api/annonces/:id
 * Récupère le détail d'une annonce spécifique par son identifiant.
 */
app.get('/api/annonces/:id', (req, res) => {
  const annonces = getAnnonces();
  const annonce = annonces.find(a => String(a.id) === String(req.params.id));

  if (!annonce) {
    return res.status(404).json({ error: "Annonce introuvable." });
  }

  res.json(annonce);
});

/**
 * POST /api/annonces
 * Crée une nouvelle annonce avec upload d'une ou plusieurs photos (champ 'photos').
 * Utilise multipart/form-data.
 */
app.post('/api/annonces', upload.array('photos', 5), (req, res) => {
  try {
    const { titre, description, prix } = req.body;

    // Validation simple des champs obligatoires
    if (!titre || titre.trim() === '') {
      return res.status(400).json({ error: "Le titre de l'annonce est obligatoire." });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: "La description de l'annonce est obligatoire." });
    }
    if (prix === undefined || prix === null || isNaN(Number(prix)) || Number(prix) < 0) {
      return res.status(400).json({ error: "Le prix doit être un nombre positif ou nul." });
    }

    // Récupération des chemins des photos uploadées
    const photos = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    // Création du nouvel objet annonce
    const nouvelleAnnonce = {
      id: Date.now().toString(), // Identifiant unique simple basé sur l'horodatage
      titre: titre.trim(),
      description: description.trim(),
      prix: Number(prix),
      photos: photos,
      dateCreation: new Date().toISOString()
    };

    // Ajout et enregistrement dans le fichier JSON
    const annonces = getAnnonces();
    annonces.push(nouvelleAnnonce);
    saveAnnonces(annonces);

    console.log(`[SUCCÈS] Nouvelle annonce créée : "${nouvelleAnnonce.titre}" (ID: ${nouvelleAnnonce.id})`);

    // Réponse HTTP 201 Created
    res.status(201).json(nouvelleAnnonce);
  } catch (err) {
    console.error("Erreur lors de la création de l'annonce:", err);
    res.status(500).json({ error: "Une erreur est survenue lors de l'enregistrement de l'annonce." });
  }
});

// Middleware de gestion d'erreur (ex: erreur Multer taille de fichier dépassée)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Erreur d'upload: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message || "Erreur lors du traitement de la requête." });
  }
  next();
});

// ==============================================================================
// 5. DÉMARRAGE DU SERVEUR
// ==============================================================================

app.listen(PORT, () => {
  console.log(`----------------------------------------------------------------`);
  console.log(`🚀 Serveur démarré avec succès !`);
  console.log(`📡 URL de l'API       : http://localhost:${PORT}/api/annonces`);
  console.log(`🌐 Accès au site web  : http://localhost:${PORT}`);
  console.log(`📁 Fichier de données : ${DATA_FILE}`);
  console.log(`🖼️  Dossier d'uploads  : ${UPLOAD_DIR}`);
  console.log(`----------------------------------------------------------------`);
});
