/**
 * ==============================================================================
 * LOGIQUE DU FORMULAIRE DE CRÉATION D'ANNONCE (creer.html)
 * ==============================================================================
 * 
 * Ce script :
 * 1. Gère la sélection et la prévisualisation instantanée des photos en local.
 * 2. Intercepte la soumission du formulaire (`submit`).
 * 3. Valide les champs côté client.
 * 4. Construit un objet standard `FormData` et l'envoie au serveur via `API.createAnnonce`.
 * 5. Redirige immédiatement vers la page de détail de l'annonce créée.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('annonceForm');
  const photosInput = document.getElementById('photosInput');
  const previewGrid = document.getElementById('previewGrid');
  const submitBtn = document.getElementById('submitBtn');
  const errorAlert = document.getElementById('errorAlert');
  const successAlert = document.getElementById('successAlert');

  // Stocke les URLs temporaires créées pour la prévisualisation (à libérer en mémoire)
  let activePreviewUrls = [];

  // ==============================================================================
  // 1. PRÉVISUALISATION LOCALE DES PHOTOS SÉLECTIONNÉES
  // ==============================================================================

  photosInput.addEventListener('change', () => {
    // Nettoyer les anciennes URLs temporaires de la mémoire
    activePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    activePreviewUrls = [];
    previewGrid.innerHTML = '';

    const files = Array.from(photosInput.files);

    if (files.length === 0) {
      return;
    }

    // Limiter l'affichage à 5 photos maximum (règle du serveur)
    if (files.length > 5) {
      afficherAlerteErreur("Vous ne pouvez sélectionner que 5 photos maximum par annonce.");
    } else {
      cacherAlerteErreur();
    }

    files.slice(0, 5).forEach((file, index) => {
      // Vérification basique du type de fichier
      if (!file.type.startsWith('image/')) return;

      // Création d'une URL locale temporaire grâce à l'API URL du navigateur
      const objectUrl = URL.createObjectURL(file);
      activePreviewUrls.push(objectUrl);

      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      previewItem.innerHTML = `
        <img src="${objectUrl}" alt="Aperçu ${index + 1}" class="preview-img" />
        <span class="preview-badge">${index === 0 ? 'Principale' : `#${index + 1}`}</span>
      `;
      previewGrid.appendChild(previewItem);
    });
  });

  // ==============================================================================
  // 2. SOUMISSION DU FORMULAIRE ET ENVOI AU BACK-END
  // ==============================================================================

  form.addEventListener('submit', async (event) => {
    // Empêche le rechargement par défaut de la page HTML
    event.preventDefault();

    cacherAlerteErreur();
    cacherAlerteSucces();

    // Récupération des valeurs textuelles pour validation simple
    const titre = document.getElementById('titreInput').value.trim();
    const prix = document.getElementById('prixInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();

    // Validation côté client
    if (!titre) {
      afficherAlerteErreur("Veuillez renseigner un titre pour votre annonce.");
      return;
    }
    if (prix === '' || isNaN(Number(prix)) || Number(prix) < 0) {
      afficherAlerteErreur("Veuillez renseigner un prix valide (nombre positif ou nul).");
      return;
    }
    if (!description) {
      afficherAlerteErreur("Veuillez rédiger une description pour votre bien.");
      return;
    }

    // Préparation de l'objet FormData (prend automatiquement les champs texte et les fichiers photos)
    const formData = new FormData(form);

    // Verrouillage du bouton pour éviter les doubles clics
    submitBtn.disabled = true;
    const texteBoutonInitial = submitBtn.textContent;
    submitBtn.textContent = "Publication en cours...";

    try {
      // Appel réseau vers le back-end
      const nouvelleAnnonce = await API.createAnnonce(formData);

      // Notification de succès
      afficherAlerteSucces("Annonce publiée avec succès ! Redirection en cours vers votre annonce...");

      // Redirection automatique vers la page de détail de l'annonce créée après 1 seconde
      setTimeout(() => {
        window.location.href = `annonce.html?id=${encodeURIComponent(nouvelleAnnonce.id)}`;
      }, 1000);

    } catch (error) {
      afficherAlerteErreur(error.message || "Une erreur est survenue lors de la publication de l'annonce.");
      // Réactivation du bouton
      submitBtn.disabled = false;
      submitBtn.textContent = texteBoutonInitial;
    }
  });

  // ==============================================================================
  // 3. FONCTIONS UTILITAIRES D'AFFICHAGE DES ALERTES
  // ==============================================================================

  function afficherAlerteErreur(message) {
    errorAlert.textContent = message;
    errorAlert.classList.add('visible');
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function cacherAlerteErreur() {
    errorAlert.textContent = '';
    errorAlert.classList.remove('visible');
  }

  function afficherAlerteSucces(message) {
    successAlert.textContent = message;
    successAlert.classList.add('visible');
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function cacherAlerteSucces() {
    successAlert.textContent = '';
    successAlert.classList.remove('visible');
  }
});
