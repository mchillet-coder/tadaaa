/* Tadaaa · accueil : compte à rebours, boutiques à découvrir, communes de Martinique */
(function () {
  'use strict';
  var T = window.Tadaaa;

  document.addEventListener('DOMContentLoaded', function () {
    var j = T.joursAvantNoel();
    var compteur = document.getElementById('compteur-noel');
    if (compteur) compteur.textContent = j === 0 ? 'C’est Noël !' : 'J-' + j + ' avant Noël';

    // Un nouveau parcours commence depuis l’accueil : on repart de zéro.
    T.ecrireStockage({});

    T.chargerCatalogue().then(function (cat) {
      // À découvrir : 4 boutiques de Martinique tirées au hasard, de catégories différentes.
      var boutiques = (cat.boutiquesMartinique || []).slice();
      melanger(boutiques);
      var vues = {}, choix = [];
      boutiques.forEach(function (b) {
        if (choix.length < 4 && !vues[b.categories[0]]) { vues[b.categories[0]] = true; choix.push(b); }
      });
      document.getElementById('idees-grille').innerHTML = choix.map(function (b) { return T.carteBoutique(b); }).join('');

      var liste = document.getElementById('liste-boutiques');
      if (liste) {
        liste.innerHTML = (cat.boutiquesMartinique || []).map(function (b) { return b.commune; })
          .filter(function (c, i, t) { return t.indexOf(c) === i; })
          .sort(function (a, b) { return a.localeCompare(b, 'fr'); })
          .map(function (n) { return '<li class="pastille">' + T.echapper(n) + '</li>'; }).join('');
      }
    }).catch(function () {
      document.getElementById('idees-grille').innerHTML = '<p class="chargement">Les boutiques n’ont pas pu être chargées.</p>';
    });
  });

  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[k]; t[k] = x; }
  }
})();
