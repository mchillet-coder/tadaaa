/* Tadaaa · la machine à cadeaux
   À l'arrivée sur les résultats, juste après le quiz (sur mobile), une petite
   machine à sous tourne pendant que les idées se calculent, puis s'arrête sur
   les réponses : la personne, le budget et son goût principal.
   Ce script est chargé tout en haut du <body> pour couvrir la page dès le début. */
(function () {
  'use strict';
  var T = window.Tadaaa;
  var drapeau = null;
  try { drapeau = sessionStorage.getItem('tadaaa-tirage'); sessionStorage.removeItem('tadaaa-tirage'); } catch (e) { /* pas de stockage */ }
  if (!drapeau || !window.matchMedia('(max-width: 720px)').matches) return;

  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var r = T.reponses();
  var e = T.echapper;

  /* ---------- Ce qui s'affiche sur les rouleaux ---------- */
  var ETOILE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="currentColor"/></svg>';
  var EPINGLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s-7.5-6.6-7.5-12.2a7.5 7.5 0 0 1 15 0C19.5 15.4 12 22 12 22z" fill="#F5793B"/><circle cx="12" cy="9.8" r="2.8" fill="#fff"/></svg>';
  var BUDGET_COURT = { 'Moins de 25 €': '−25 €', '25–50 €': '25–50 €', '50–100 €': '50–100 €', '100–200 €': '100–200 €', '200 € et plus': '200 € +' };

  function casePerso(nom, couleur) { return '<div class="rouleau__case">' + T.perso(nom, couleur) + '</div>'; }
  function casePicto(cat) { return '<div class="rouleau__case">' + T.picto(cat).svg + '</div>'; }
  function caseTexte(txt) { return '<div class="rouleau__case"><span class="rouleau__texte' + (txt.length > 6 ? ' rouleau__texte--long' : '') + '">' + e(txt) + '</span></div>'; }

  var PERSOS = [['soleil', 'jaune'], ['fleur', 'rose'], ['trefle', 'bleu'], ['coeur', 'orange'], ['croix', 'vert'], ['eclat', 'orange'], ['bulle', 'bleu']];
  var PICTOS = ['Déco & maison', 'Livres', 'Gastronomie', 'Plantes & fleurs', 'Bougies & parfums', 'Mode & accessoires', 'Jeux & loisirs', 'Beauté & soin'];
  var PRIX = ['20 €', '35 €', '50 €', '80 €', '15 €', '120 €'];

  function hasard(t) { return t[Math.floor(Math.random() * t.length)]; }

  // Case finale de chaque rouleau
  var qui = T.PERSO_QUI[r.qui] || ['trefle', 'bleu'];
  var finPerso = casePerso(qui[0], qui[1]);
  var finBudget = r.zone === 'en-ligne' && r.budget ? caseTexte(BUDGET_COURT[r.budget] || r.budget)
    : '<div class="rouleau__case">' + EPINGLE + '</div>';
  var passion = (r.passions || []).map(function (id) { return T.trouver(T.PASSIONS, id); }).filter(Boolean)[0];
  var finGout = casePicto(passion ? passion.picto : 'Gastronomie');

  var NB = 14; // cases qui défilent avant la case finale
  function bande(genre, fin) {
    var html = '';
    for (var i = 0; i < NB; i++) {
      html += genre === 'perso' ? casePerso.apply(null, hasard(PERSOS)) : genre === 'prix' ? caseTexte(hasard(PRIX)) : casePicto(hasard(PICTOS));
    }
    // case finale, puis une case de plus pour le petit rebond
    return html + fin + (genre === 'perso' ? casePerso.apply(null, hasard(PERSOS)) : genre === 'prix' ? caseTexte(hasard(PRIX)) : casePicto(hasard(PICTOS)));
  }

  // Résumé des réponses sous la machine
  var gouts = (r.passions || []).map(function (id) { var p = T.trouver(T.PASSIONS, id); return p ? p.label.toLowerCase() : ''; }).filter(Boolean);
  var resume = [
    r.qui ? T.libelleQui(r.qui) : '',
    r.occasion || '',
    r.zone === 'en-ligne' ? (r.budget || '') : 'En Martinique',
    gouts.length ? gouts.join(' et ') : ''
  ].filter(Boolean).join(' · ');

  var lampes = '';
  for (var l = 0; l < 9; l++) lampes += '<span></span>';

  var html =
    '<div class="tirage" id="tirage" role="status" aria-live="polite">' +
      '<div class="tirage__haut"><img src="assets/img/logo.svg" alt="Tadaaa" width="150" height="24"></div>' +
      '<p class="tirage__titre">On cherche<br>le cadeau parfait…</p>' +
      '<div class="machine" aria-hidden="true">' +
        '<div class="machine__tete"><span class="machine__etoile">' + ETOILE + '</span><div class="machine__lampes">' + lampes + '</div></div>' +
        '<div class="machine__corps">' +
          '<div class="machine__fenetre">' +
            '<div class="rouleau"><div class="rouleau__bande">' + bande('perso', finPerso) + '</div></div>' +
            '<div class="rouleau"><div class="rouleau__bande">' + bande('prix', finBudget) + '</div></div>' +
            '<div class="rouleau"><div class="rouleau__bande">' + bande('picto', finGout) + '</div></div>' +
          '</div>' +
          '<div class="machine__plaque">TADAAA</div>' +
        '</div>' +
        '<div class="machine__levier"><span class="machine__tige"></span><span class="machine__boule"></span></div>' +
        '<div class="machine__socle"><span></span></div>' +
      '</div>' +
      '<div class="tirage__points" aria-hidden="true"><span></span><span></span><span></span></div>' +
      '<p class="tirage__resume">' + e(resume) + '</p>' +
      '<span class="sr-only">Recherche des idées en cours.</span>' +
    '</div>';

  document.documentElement.classList.add('tirage-actif');
  document.body.insertAdjacentHTML('afterbegin', html);
  var ecran = document.getElementById('tirage');
  var bandes = ecran.querySelectorAll('.rouleau__bande');

  // Arrêt des rouleaux l'un après l'autre (en ms après le début)
  var DEBUT = 250, ARRETS = [1150, 1550, 1950], FIN = calme ? 1100 : 2600;

  function lancer() {
    ecran.classList.add('tirage--tire'); // le levier descend
    var h = bandes[0].firstElementChild.getBoundingClientRect().height;
    bandes.forEach(function (b, i) {
      var duree = calme ? 0 : ARRETS[i] - DEBUT;
      b.style.transition = duree ? 'transform ' + duree + 'ms cubic-bezier(.18,.72,.26,1.1)' : 'none';
      b.style.transform = 'translateY(' + (-NB * h) + 'px)';
      setTimeout(function () { b.parentNode.classList.add('rouleau--arrete'); }, calme ? 0 : ARRETS[i]);
    });
  }

  function terminer() {
    if (!ecran.parentNode || ecran.classList.contains('tirage--fin')) return;
    ecran.classList.add('tirage--fin');
    document.documentElement.classList.remove('tirage-actif');
    setTimeout(function () { if (ecran.parentNode) ecran.parentNode.removeChild(ecran); }, 400);
    var titre = document.getElementById('res-titre');
    if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus({ preventScroll: true }); }
  }

  requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(lancer, calme ? 0 : DEBUT); }); });
  setTimeout(terminer, FIN);
  ecran.addEventListener('click', terminer); // un appui pour passer
})();
