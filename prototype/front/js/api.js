/**
 * ==============================================================================
 * MODULE D'APPELS API (FRONT-END)
 * ==============================================================================
 * 
 * Ce fichier centralise tous les échanges réseau entre le navigateur (front-end)
 * et le serveur Node.js / Express (back-end).
 * 
 * Il utilise l'API standard `fetch()` du JavaScript moderne (ES6+).
 * 
 * Pourquoi centraliser les appels ici ?
 * - Évite de répéter les URL et la gestion des erreurs dans chaque page.
 * - Si le port ou l'adresse du serveur change, on ne modifie que la constante ci-dessous.
 */

// Adresse de base du serveur back-end
// (Si vous lancez le serveur sur un autre port, modifiez simplement cette ligne)
const API_BASE_URL = 'http://localhost:3000';

const API = {
  /**
   * 1. RÉCUPÉRER TOUTES LES ANNONCES
   * Envoie une requête HTTP GET vers /api/annonces.
   * Retourne un tableau d'objets annonce.
   */
  async getAnnonces() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/annonces`);

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status}) : Impossible de récupérer les annonces.`);
      }

      const annonces = await response.json();
      return annonces;
    } catch (error) {
      console.error("Erreur dans API.getAnnonces :", error);
      throw error;
    }
  },

  /**
   * 2. RÉCUPÉRER LE DÉTAIL D'UNE ANNONCE PAR SON ID
   * Envoie une requête HTTP GET vers /api/annonces/:id.
   * Retourne l'objet annonce correspondant.
   */
  async getAnnonceById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/annonces/${encodeURIComponent(id)}`);

      if (response.status === 404) {
        throw new Error("Cette annonce n'existe pas ou a été supprimée.");
      }

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status}) : Impossible de charger l'annonce.`);
      }

      const annonce = await response.json();
      return annonce;
    } catch (error) {
      console.error(`Erreur dans API.getAnnonceById(${id}) :`, error);
      throw error;
    }
  },

  /**
   * 3. CRÉER UNE NOUVELLE ANNONCE
   * Envoie une requête HTTP POST avec un objet FormData contenant :
   * - titre (texte)
   * - description (texte)
   * - prix (nombre)
   * - photos (fichiers images uploadés)
   * 
   * Note pédagogique importante :
   * Avec `fetch` et un `FormData`, il ne faut SURTOUT PAS définir manuellement
   * le header 'Content-Type'. Le navigateur s'en charge automatiquement
   * en ajoutant la frontière ("boundary") requise pour le multipart/form-data.
   */
  async createAnnonce(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/annonces`, {
        method: 'POST',
        body: formData
        // Ne pas mettre 'Content-Type': 'multipart/form-data', le navigateur le fait lui-même !
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur serveur (${response.status}) lors de la création.`);
      }

      return data;
    } catch (error) {
      console.error("Erreur dans API.createAnnonce :", error);
      throw error;
    }
  },

  /**
   * FONCTION UTILITAIRE : RÉSOUDRE L'URL D'UNE IMAGE
   * Si l'annonce a une image stockée dans /uploads/..., on construit l'URL complète
   * vers le serveur (ex: http://localhost:3000/uploads/photo.jpg).
   * Si aucune photo n'est présente, on renvoie une image de substitution locale (placeholder).
   */
  getImageUrl(photoPath) {
    if (!photoPath) {
      return 'assets/placeholder.svg';
    }
    // Si c'est déjà une URL complète (ex: http://...)
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    // Sinon, on préfixe avec l'adresse du serveur
    return `${API_BASE_URL}${photoPath}`;
  },

  /**
   * FONCTION UTILITAIRE : FORMATER UN PRIX EN EUROS
   * Exemple : 150 -> "150 €"
   */
  formatPrix(prix) {
    if (prix === undefined || prix === null || isNaN(Number(prix))) {
      return 'Prix non spécifié';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(Number(prix));
  },

  /**
   * FONCTION UTILITAIRE : FORMATER UNE DATE
   * Exemple : "2026-11-20T10:00:00.000Z" -> "20 nov. 2026"
   */
  formatDate(dateIso) {
    if (!dateIso) return '';
    try {
      const date = new Date(dateIso);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }
};
