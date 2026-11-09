/* Tadaaa · résultats du quiz
   Filtre le catalogue sur les colonnes Pour qui, Univers, Budget et Occasion
   (+ la zone choisie et le type de cadeau), puis trie par score. */
(function () {
  'use strict';
  var T = window.Tadaaa, Q = T.QUESTIONS, e = T.echapper;
  var r = T.reponses();
  if (!r.zone || !T.ZONES[r.zone]) r.zone = 'paris';
  var tri = new URLSearchParams(location.search).get('tri') || 'pertinence';
  var form = document.getElementById('filtres');
  var sortie = document.getElementById('resultats');
  var catalogue = null;

  var MILIEU_BUDGET = { 'Moins de 25 €': 18, '25–50 €': 37, '50–100 €': 75, '100–200 €': 150, '200 € et plus': 250 };
  function prixTri(c) { return typeof c.prix === 'number' ? c.prix : (MILIEU_BUDGET[c.budget] || 999); }

  function majUrl() {
    var qs = T.versUrl(r) + (tri !== 'pertinence' ? '&tri=' + tri : '');
    history.replaceState(null, '', '?' + qs);
    T.ecrireStockage(r);
  }

  function remplirFiltres() {
    form.zone.value = r.zone;
    form.budget.value = r.budget || '';
    form.format.value = r.format || '';
    form.tri.value = tri;
  }

  form.addEventListener('change', function () {
    r.zone = form.zone.value;
    r.budget = form.budget.value;
    r.format = form.format.value;
    tri = form.tri.value;
    majUrl();
    afficher();
  });

  function trier(liste) {
    return liste.sort(function (a, b) {
      if (tri === 'prix-asc') return prixTri(a.c) - prixTri(b.c);
      if (tri === 'prix-desc') return prixTri(b.c) - prixTri(a.c);
      return b.ev.score - a.ev.score || prixTri(a.c) - prixTri(b.c);
    });
  }

  function raisons(c, ev) {
    var t = [];
    if (r.qui && c.pourQui.indexOf(r.qui) !== -1) t.push(T.libelleQui(r.qui));
    var choisis = [];
    (r.passions || []).forEach(function (id) {
      var p = T.PASSIONS.filter(function (x) { return x.id === id; })[0];
      if (p && p.univers.some(function (u) { return c.univers.indexOf(u) !== -1; })) choisis.push(p.label);
    });
    if (choisis.length) t.push('Aime : ' + choisis.join(', ').toLowerCase());
    if (r.occasion && c.occasion.indexOf(r.occasion) !== -1) t.push(r.occasion);
    if (!choisis.length) c.univers.slice(0, 2).forEach(function (u) { t.push(u); });
    return t;
  }

  function pourquoiProche(ev, c) {
    var t = [];
    if (!ev.criteres.budget) t.push('Budget ' + c.budget);
    if (!ev.criteres.univers) t.push('Autre univers');
    if (!ev.criteres.occasion) t.push('Pas spécialement pour ' + r.occasion);
    return t;
  }

  function vedette(item) {
    var c = item.c, p = T.picto(c.categorie), b = catalogue.boutiques[c.boutique];
    var lieu = r.zone === 'paris' && b && b.adresse ? ' · ' + b.adresse : '';
    return '<article class="vedette cadeau">' +
      '<a class="cadeau__visuel" style="background:' + p.fond + '" ' + T.attributsLien(c) + ' tabindex="-1" aria-hidden="true">' + p.svg +
      '<span class="pastille pastille--blanc cadeau__score">Meilleure idée · ' + item.ev.score + ' %</span></a>' +
      '<div class="vedette__infos">' +
      '<div class="cadeau__meta"><span>' + e(c.boutique + lieu) + '</span>' + T.badgeLieu(c, catalogue, r.zone) + '</div>' +
      '<h2>' + e(c.nom) + '</h2>' +
      '<div class="vedette__raisons">' + raisons(c, item.ev).map(function (x) { return '<span class="pastille">' + e(x) + '</span>'; }).join('') + '</div>' +
      '<div class="vedette__bas"><span class="prix">' + T.prix(c) + '</span>' +
      '<a class="btn btn--grand" ' + T.attributsLien(c) + '>Voir le cadeau ' + T.FLECHE + '<span class="sr-only"> chez ' + e(c.boutique) + ' (nouvel onglet)</span></a></div>' +
      '</div></article>';
  }

  function carte(item, extra) {
    var html = T.carteCadeau(item.c, catalogue, { score: item.ev.score, pour: T.pourQui(r.qui), zone: r.zone });
    if (extra && extra.length) {
      html = html.replace('<h3>', '<div class="vedette__raisons" style="padding:0 4px">' + extra.map(function (x) { return '<span class="pastille pastille--jaune">' + e(x) + '</span>'; }).join('') + '</div><h3>');
    }
    return html;
  }

  function afficherEntete(nb) {
    var pour = T.pourQui(r.qui);
    document.getElementById('res-titre').innerHTML = nb
      ? 'Tadaaa ! ' + nb + (nb > 1 ? ' idées ' : ' idée ') + e(pour)
      : 'Des idées proches ' + e(pour);
    document.title = 'Tadaaa · ' + (nb ? nb + (nb > 1 ? ' idées ' : ' idée ') : 'Idées ') + pour;
    var chips = Q.map(function (q, i) {
      var v = r[q.cle];
      var txt = q.resume(v);
      if (!txt) return '';
      return '<a class="pastille pastille--blanc" href="quiz.html?etape=' + (i + 1) + '">' + e(txt) + '</a>';
    }).join('');
    chips += '<a class="pastille pastille--vert" href="#filtre-zone">' + e(T.ZONES[r.zone].label) + '</a>';
    document.getElementById('res-chips').innerHTML = chips;
  }

  function afficher() {
    var base = catalogue.cadeaux.filter(function (c) { return c.zones.indexOf(r.zone) !== -1; });
    var notes = base.map(function (c) { return { c: c, ev: T.evaluer(c, r) }; })
      .filter(function (x) { return x.ev.criteres.format; });

    // Correspondance stricte : Pour qui + Univers + Budget + Occasion.
    var parfaits = trier(notes.filter(function (x) {
      var k = x.ev.criteres; return k.qui && k.occasion && k.budget && k.univers;
    }));
    // Idées proches : la bonne personne, mais un autre budget, univers ou occasion.
    var proches = trier(notes.filter(function (x) {
      var k = x.ev.criteres; return k.qui && !(k.occasion && k.budget && k.univers);
    })).slice(0, parfaits.length >= 9 ? 6 : 12);

    afficherEntete(parfaits.length);

    var html = '';
    if (parfaits.length) {
      var reste = parfaits;
      if (tri === 'pertinence') { html += vedette(parfaits[0]); reste = parfaits.slice(1); }
      if (reste.length) html += '<div class="grille-res">' + reste.map(function (x) { return carte(x); }).join('') + '</div>';
    } else {
      html += '<div class="res-vide"><span data-perso="surpris" data-couleur="bleu"></span>' +
        '<h2>Rien qui coche toutes les cases…</h2>' +
        '<p>Aucun cadeau ' + (r.zone === 'paris' ? 'à Paris' : 'en ligne') + ' ne correspond à toutes vos réponses. Essayez un autre budget, ' +
        (r.zone === 'paris' ? 'la livraison en ligne' : 'les boutiques de Paris') + ', ou regardez les idées proches juste en dessous.</p>' +
        '<button type="button" class="btn btn--petit" id="btn-autre-zone">Voir ' + (r.zone === 'paris' ? 'en ligne' : 'à Paris') + '</button></div>';
    }
    if (proches.length) {
      html += '<h2 class="res-sous-titre">' + (parfaits.length ? 'Pour aller plus loin' : 'Idées proches') + '</h2>' +
        '<p class="res-sous-texte">Elles visent la bonne personne, mais ne cochent pas toutes vos réponses.</p>' +
        '<div class="grille-res">' + proches.map(function (x) { return carte(x, pourquoiProche(x.ev, x.c)); }).join('') + '</div>';
    }
    html += '<p class="res-note">Prix relevés le 9 novembre 2026 sur le site de chaque boutique&nbsp;: vérifiez-les avant d’acheter. ' +
      'Quand le prix n’est pas connu, on indique sa tranche de budget. Certains liens sont affiliés&nbsp;: Tadaaa peut recevoir une commission, sans changer le prix pour vous.</p>';
    sortie.innerHTML = html;
    T.remplirPersos(sortie);

    var autre = document.getElementById('btn-autre-zone');
    if (autre) autre.addEventListener('click', function () {
      r.zone = r.zone === 'paris' ? 'en-ligne' : 'paris';
      remplirFiltres(); majUrl(); afficher();
    });
  }

  remplirFiltres();
  T.ecrireStockage(r);
  T.chargerCatalogue().then(function (cat) {
    catalogue = cat;
    afficher();
  }).catch(function () {
    sortie.innerHTML = '<div class="res-vide"><h2>Le catalogue n’a pas pu être chargé.</h2><p>Vérifiez que le dossier <code>data</code> est bien à côté de cette page, puis rechargez.</p></div>';
  });
})();
