# 🛍️ Prototype Petites Annonces (Inspiré de Leboncoin)

Ce prototype constitue une **référence technique minimaliste, modulaire et très lisible**, spécialement pensée pour servir de guide à une équipe de 4 étudiants débutants en développement web.

---

## 🚀 Démarrage rapide (en 2 commandes)

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)

### 1. Installation et lancement du serveur
Ouvrez votre terminal dans ce dossier `prototype` puis exécutez :

```bash
cd back
npm install
npm start
```

### 2. Accéder au site
Ouvrez simplement votre navigateur sur :
👉 **[http://localhost:3000](http://localhost:3000)**

> 💡 **Astuce pratique :** Le serveur Express sert à la fois l'API (`/api/...`), les images uploadées (`/uploads/...`) et le site front-end (`/`). Tout fonctionne donc dès le lancement de la commande sans outil supplémentaire !  
> Si vous préférez développer le front avec l'extension **Live Server** de VS Code sur `http://127.0.0.1:5500`, cela fonctionne aussi parfaitement car le serveur a le **CORS** activé.

---

## 🎯 Périmètre fonctionnel

Ce prototype implémente **strictement** le cœur fonctionnel demandé, sans sur-ingénierie :

1. **Liste des annonces (`index.html`) :**
   - Grille responsive d'annonces.
   - Affichage de la photo principale, du titre et du prix formaté en euros.
   - Badge indiquant le nombre de photos disponibles.
   - Clic sur une carte pour naviguer vers sa vue détaillée.

2. **Détail d'une annonce (`annonce.html?id=...`) :**
   - Récupération dynamique de l'identifiant via l'URL (`URLSearchParams`).
   - Galerie photo interactive : grande image principale + miniatures cliquables pour changer l'image affichée.
   - Titre, prix en grand, date de mise en ligne et description complète (avec retours à la ligne respectés).
   - Bouton de retour vers la liste.

3. **Création d'annonce avec photos (`creer.html`) :**
   - Formulaire : titre, prix, description et upload de fichiers photos.
   - **Prévisualisation instantanée** des images sélectionnées avant envoi (via `URL.createObjectURL`).
   - Envoi au serveur en `multipart/form-data` avec `FormData`.
   - Enregistrement immédiat dans `data/annonces.json` et dossier `uploads/`.
   - Redirection automatique vers la nouvelle annonce créée.

---

## 📁 Structure des fichiers

```text
prototype/
├── README.md                  # Guide d'utilisation et de référence
├── back/                      # Partie SERVEUR & DONNÉES
│   ├── package.json           # Dépendances (express, cors, multer)
│   ├── server.js              # Serveur Express, routes API & upload
│   ├── data/
│   │   └── annonces.json      # Base de données simple au format JSON
│   └── uploads/               # Stockage des photos d'annonces
└── front/                     # Partie INTERFACE UTILISATEUR
    ├── index.html             # Page d'accueil : liste des annonces
    ├── annonce.html           # Page de détail d'une annonce
    ├── creer.html             # Formulaire de création d'annonce
    ├── assets/
    │   └── placeholder.svg    # Image par défaut si aucune photo
    ├── css/
    │   └── style.css          # Feuille de style sobre, moderne et responsive
    └── js/
        ├── api.js             # Appels réseau centralisés (fetch)
        ├── liste.js           # Logique d'affichage de la grille
        ├── detail.js          # Logique d'affichage du détail et galerie
        └── creer.js           # Gestion du formulaire et prévisualisations
```

---

## 👥 Répartition du travail suggérée pour 4 étudiants

La structure du code a été découpée pour que chaque membre de l'équipe puisse travailler sur un périmètre clair et indépendant :

| Membre | Rôle principal | Fichiers associés | Responsabilités |
|---|---|---|---|
| **Étudiant 1** | **Back-end & Données** | `back/server.js`, `back/data/annonces.json` | Configuration Express, routes REST, persistance JSON et stockage Multer. |
| **Étudiant 2** | **Réseau & Client API** | `front/js/api.js` | Fonctions `fetch()` centralisées, gestion des erreurs HTTP, formatage (prix, date). |
| **Étudiant 3** | **Pages Liste & Détail** | `front/index.html`, `front/annonce.html`, `front/js/liste.js`, `front/js/detail.js` | Manipulation du DOM, injection des données, navigation par ID (`?id=...`), galerie. |
| **Étudiant 4** | **Formulaire & Style CSS** | `front/creer.html`, `front/js/creer.js`, `front/css/style.css` | Validation formulaire, prévisualisation locale d'images, responsive design (Flexbox/Grid). |

---

## 🔌 Référence de l'API REST

| Méthode | Route | Description | Format de données |
|---|---|---|---|
| `GET` | `/api/annonces` | Récupère la liste de toutes les annonces (triées par date décroissante) | Réponse : tableau JSON `[{ id, titre, prix, photos, ... }]` |
| `GET` | `/api/annonces/:id` | Récupère le détail complet d'une annonce précise | Réponse : objet JSON ou statut `404` si introuvable |
| `POST` | `/api/annonces` | Crée une nouvelle annonce avec upload de photos | Requête : `multipart/form-data` (`titre`, `description`, `prix`, `photos`)<br>Réponse : objet JSON créé (statut `201`) |
| `GET` | `/uploads/:fichier` | Sert les images uploadées en fichier statique | Image directe (JPG, PNG, SVG...) |

---

## 💡 Notions clés pour les débutants

### 1. Comment le Front communique avec le Back (`fetch`)
Dans `front/js/api.js`, la fonction standard `fetch()` envoie des requêtes HTTP asynchrones avec `async / await` :
```javascript
const response = await fetch('http://localhost:3000/api/annonces');
const annonces = await response.json();
```

### 2. Comment fonctionne l'upload d'images (`FormData` & `multer`)
- Côté front (`front/js/creer.js`), on regroupe le texte et les fichiers dans un conteneur standard `FormData` :
  ```javascript
  const formData = new FormData(formulaireHtml);
  await fetch('/api/annonces', { method: 'POST', body: formData });
  ```
  *(Important : ne pas définir manuellement `Content-Type`, le navigateur le calcule automatiquement !)*
- Côté back (`back/server.js`), la bibliothèque `multer` extrait les fichiers, les enregistre dans le dossier `uploads/` et met les informations dans `req.files`.

### 3. Comment passer d'une page à l'autre avec un identifiant
Pour afficher le détail de l'annonce cliquée :
1. Dans `liste.js`, on génère un lien avec l'ID dans l'URL : `annonce.html?id=123`.
2. Dans `detail.js`, on lit cet ID avec :
   ```javascript
   const params = new URLSearchParams(window.location.search);
   const id = params.get('id');
   ```
3. On appelle ensuite l'API : `API.getAnnonceById(id)`.
