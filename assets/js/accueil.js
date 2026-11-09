/* Tadaaa · accueil : compte à rebours, idées du moment, liste des boutiques */
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
      // Idées du moment : 4 cadeaux avec un prix connu, de catégories différentes, tirés au hasard.
      var avecPrix = cat.cadeaux.filter(function (c) { return typeof c.prix === 'number' && c.prix < 100; });
      melanger(avecPrix);
      var vues = {}, choix = [];
      avecPrix.forEach(function (c) {
        if (choix.length < 4 && !vues[c.categorie]) { vues[c.categorie] = true; choix.push(c); }
      });
      document.getElementById('idees-grille').innerHTML = choix.map(function (c) { return T.carteCadeau(c, cat); }).join('');

      var liste = document.getElementById('liste-boutiques');
      if (liste) {
        liste.innerHTML = Object.keys(cat.boutiques).sort(function (a, b) { return a.localeCompare(b, 'fr'); })
          .map(function (n) { return '<li class="pastille">' + T.echapper(n) + '</li>'; }).join('');
      }
    }).catch(function () {
      document.getElementById('idees-grille').innerHTML = '<p class="chargement">Les idées n’ont pas pu être chargées.</p>';
    });
  });

  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[k]; t[k] = x; }
  }
})();
