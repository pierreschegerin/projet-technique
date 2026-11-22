/**
 * ==============================================================================
 * LOGIQUE DE LA PAGE DÉTAIL D'UNE ANNONCE (annonce.html)
 * ==============================================================================
 * 
 * Ce script :
 * 1. Récupère l'ID de l'annonce passé dans l'URL (ex: annonce.html?id=123).
 * 2. Interroge l'API via `API.getAnnonceById(id)`.
 * 3. Affiche les détails complets (titre, prix, description, date).
 * 4. Met en place la galerie interactive avec changement de photo au clic.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('detailContainer');

  // Récupération de l'identifiant dans les paramètres de recherche de l'URL (?id=...)
  const params = new URLSearchParams(window.location.search);
  const annonceId = params.get('id');

  // Si aucun identifiant n'est présent dans l'URL
  if (!annonceId) {
    afficherErreur("Aucun identifiant d'annonce n'a été spécifié dans l'URL.");
    return;
  }

  try {
    const annonce = await API.getAnnonceById(annonceId);
    afficherDetail(annonce);
  } catch (error) {
    afficherErreur(error.message);
  }

  /**
   * Construit et affiche le contenu complet de l'annonce dans la page.
   */
  function afficherDetail(annonce) {
    // Mise à jour du titre de l'onglet du navigateur
    document.title = `${annonce.titre} - Le Bon Coin (Prototype)`;

    const photos = (annonce.photos && annonce.photos.length > 0) ? annonce.photos : [];
    const photoPrincipale = photos.length > 0 ? API.getImageUrl(photos[0]) : 'assets/placeholder.svg';
    const prixFormate = API.formatPrix(annonce.prix);
    const dateFormatee = API.formatDate(annonce.dateCreation);

    container.innerHTML = `
      <div class="nav-back">
        <a href="index.html" class="link-back">&larr; Retour à la liste des annonces</a>
      </div>

      <div class="detail-layout">
        <!-- Colonne gauche : Photos et Description complète -->
        <div class="detail-main">
          <!-- Galerie photos -->
          <div class="gallery-container">
            <div class="gallery-main-image-wrap">
              <img 
                id="mainImage" 
                src="${photoPrincipale}" 
                alt="${escapeHtml(annonce.titre)}" 
                class="gallery-main-image"
                onerror="this.src='assets/placeholder.svg';"
              />
            </div>

            <!-- Miniatures cliquables s'il y a plus d'une photo -->
            ${photos.length > 1 ? `
              <div class="gallery-thumbs" id="thumbsContainer">
                ${photos.map((p, index) => `
                  <img 
                    src="${API.getImageUrl(p)}" 
                    alt="Photo ${index + 1}" 
                    class="gallery-thumb ${index === 0 ? 'active' : ''}" 
                    data-full-src="${API.getImageUrl(p)}"
                  />
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Section Description -->
          <h2 class="detail-section-title">Description</h2>
          <div class="detail-description">${escapeHtml(annonce.description)}</div>
        </div>

        <!-- Colonne droite : Encart Titre, Prix et Informations -->
        <aside class="detail-sidebar">
          <div class="detail-summary-card">
            <h1 class="detail-ad-title">${escapeHtml(annonce.titre)}</h1>
            <div class="detail-price">${prixFormate}</div>

            <ul class="detail-meta-list">
              <li><strong>Mise en ligne :</strong> ${dateFormatee ? 'Le ' + dateFormatee : 'Non renseignée'}</li>
              <li><strong>Référence annonce :</strong> #${escapeHtml(annonce.id)}</li>
            </ul>

            <div class="detail-notice-box">
              <strong>💡 Information prototype :</strong><br/>
              Conformément au périmètre strict du projet d'apprentissage, la messagerie et le paiement ne sont pas implémentés.
            </div>

            <div style="margin-top: 18px;">
              <a href="creer.html" class="btn btn-outline" style="width: 100%; text-align: center;">
                + Déposer une autre annonce
              </a>
            </div>
          </div>
        </aside>
      </div>
    `;

    // Activation du changement de photo principale lors d'un clic sur une miniature
    if (photos.length > 1) {
      const thumbs = container.querySelectorAll('.gallery-thumb');
      const mainImage = document.getElementById('mainImage');

      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          // Mise à jour de la grande image
          mainImage.src = thumb.getAttribute('data-full-src');
          // Mise à jour visuelle de la miniature active
          thumbs.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });
      });
    }
  }

  /**
   * Affiche un message d'erreur convivial en cas d'annonce introuvable.
   */
  function afficherErreur(message) {
    container.innerHTML = `
      <div class="nav-back">
        <a href="index.html" class="link-back">&larr; Retour à la liste des annonces</a>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h2 class="empty-state-title">Annonce introuvable</h2>
        <p class="empty-state-text">${escapeHtml(message)}</p>
        <a href="index.html" class="btn btn-primary">Voir toutes les annonces</a>
      </div>
    `;
  }

  /**
   * Sécurisation simple contre les injections XSS
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
});
