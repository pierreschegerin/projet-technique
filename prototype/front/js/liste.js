/**
 * ==============================================================================
 * LOGIQUE DE LA PAGE LISTE DES ANNONCES (index.html)
 * ==============================================================================
 * 
 * Ce script est exécuté sur la page d'accueil.
 * Il récupère la liste des annonces via l'API et génère dynamiquement
 * les cartes dans la grille HTML.
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('annoncesContainer');
  const countBadge = document.getElementById('annoncesCount');

  /**
   * Charge et affiche la liste des annonces depuis le serveur.
   */
  async function chargerAnnonces() {
    // Affichage d'un indicateur de chargement
    container.innerHTML = `
      <div class="loading-indicator">
        Chargement des annonces en cours...
      </div>
    `;

    try {
      const annonces = await API.getAnnonces();

      // Mise à jour du compteur dans le sous-titre
      if (countBadge) {
        countBadge.textContent = `${annonces.length} annonce${annonces.length > 1 ? 's' : ''} disponible${annonces.length > 1 ? 's' : ''}`;
      }

      // Cas 1 : Aucune annonce enregistrée
      if (annonces.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h2 class="empty-state-title">Aucune annonce pour le moment</h2>
            <p class="empty-state-text">Soyez le tout premier à mettre un objet en vente !</p>
            <a href="creer.html" class="btn btn-primary">+ Déposer une annonce</a>
          </div>
        `;
        return;
      }

      // Cas 2 : Des annonces existent, on construit la grille
      const grid = document.createElement('div');
      grid.className = 'annonces-grid';

      annonces.forEach(annonce => {
        // Choix de la première photo ou placeholder si aucune
        const photoPrincipale = (annonce.photos && annonce.photos.length > 0)
          ? API.getImageUrl(annonce.photos[0])
          : 'assets/placeholder.svg';

        const nombrePhotos = (annonce.photos && annonce.photos.length) || 0;
        const prixFormate = API.formatPrix(annonce.prix);
        const dateFormatee = API.formatDate(annonce.dateCreation);

        // Élément carte d'annonce
        const card = document.createElement('article');
        card.className = 'card-annonce';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Voir le détail de l'annonce : ${annonce.titre}`);

        card.innerHTML = `
          <div class="card-image-wrap">
            <img 
              src="${photoPrincipale}" 
              alt="${escapeHtml(annonce.titre)}" 
              class="card-image"
              loading="lazy"
              onerror="this.src='assets/placeholder.svg';"
            />
            ${nombrePhotos > 1 ? `<span class="card-badge-photos">📷 ${nombrePhotos}</span>` : ''}
          </div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(annonce.titre)}</h3>
            <div class="card-price">${prixFormate}</div>
            <div class="card-footer">
              <span>${dateFormatee ? 'Le ' + dateFormatee : 'Récemment'}</span>
              <span style="font-weight: 600; color: var(--primary);">Voir &rarr;</span>
            </div>
          </div>
        `;

        // Clic sur la carte : redirection vers la page de détail avec l'ID dans l'URL
        const allerAuDetail = () => {
          window.location.href = `annonce.html?id=${encodeURIComponent(annonce.id)}`;
        };

        card.addEventListener('click', allerAuDetail);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            allerAuDetail();
          }
        });

        grid.appendChild(card);
      });

      // Remplacement du contenu de chargement par la grille complète
      container.innerHTML = '';
      container.appendChild(grid);

    } catch (error) {
      // Affichage d'un message d'erreur si le serveur est inaccessible
      container.innerHTML = `
        <div class="alert alert-error visible">
          <strong>Impossible de contacter le serveur.</strong><br/>
          Assurez-vous que le back-end est bien démarré :
          <pre style="background: #ffffff; padding: 8px; margin-top: 8px; border-radius: 4px; font-family: monospace;">cd back && npm start</pre>
          <small style="color: #64748b;">Détail : ${escapeHtml(error.message)}</small>
        </div>
      `;
    }
  }

  /**
   * Sécurisation simple contre les injections XSS dans le HTML généré
   */
  function escapeHtml(texte) {
    if (!texte) return '';
    return String(texte)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Lancement du chargement au démarrage
  chargerAnnonces();
});
