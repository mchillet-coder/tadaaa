/* Tadaaa · résultats du quiz
   - En Martinique : les boutiques de l'île, rapprochées des réponses par
     « Pour qui » et « Catégories quiz » (pas encore de produits relevés).
   - En ligne : le catalogue filtré sur Pour qui, Univers, Budget et Occasion
     (+ le type de cadeau), trié par score. */
(function () {
  'use strict';
  var T = window.Tadaaa, Q = T.QUESTIONS, e = T.echapper;
  var r = T.reponses();
  if (!r.zone || !T.ZONES[r.zone]) r.zone = 'martinique';
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
    // Budget et tri par prix : seulement pour les idées en ligne, qui ont un prix.
    var mq = r.zone === 'martinique';
    form.budget.disabled = mq;
    form.tri.disabled = mq;
    document.getElementById('aide-budget').hidden = !mq;
  }

  form.addEventListener('change', function () {
    r.zone = form.zone.value;
    if (!form.budget.disabled) r.budget = form.budget.value;
    r.format = form.format.value;
    if (!form.tri.disabled) tri = form.tri.value;
    remplirFiltres();
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

  function labelsPassions(test) {
    var choisis = [];
    (r.passions || []).forEach(function (id) {
      var p = T.PASSIONS.filter(function (x) { return x.id === id; })[0];
      if (p && test(p)) choisis.push(p.label);
    });
    return choisis;
  }

  function afficherEntete(nb, mot) {
    var pour = T.pourQui(r.qui);
    var pluriel = nb > 1 ? mot + 's ' : mot + ' ';
    document.getElementById('res-titre').innerHTML = nb
      ? 'Tadaaa ! ' + nb + ' ' + e(pluriel) + e(pour)
      : 'Des ' + e(mot) + 's proches ' + e(pour);
    document.title = 'Tadaaa · ' + (nb ? nb + ' ' + pluriel : mot.charAt(0).toUpperCase() + mot.slice(1) + 's ') + pour;
    var chips = Q.map(function (q, i) {
      var v = r[q.cle];
      if (r.zone === 'martinique' && q.cle === 'budget') return '';
      var txt = q.resume(v);
      if (!txt) return '';
      return '<a class="pastille pastille--blanc" href="quiz.html?etape=' + (i + 1) + '">' + e(txt) + '</a>';
    }).join('');
    chips += '<a class="pastille pastille--vert" href="#filtre-zone">' + e(T.ZONES[r.zone].label) + '</a>';
    document.getElementById('res-chips').innerHTML = chips;
  }

  function videAutreZone(titre, texte, bouton) {
    return '<div class="res-vide"><span data-perso="surpris" data-couleur="bleu"></span>' +
      '<h2>' + titre + '</h2><p>' + texte + '</p>' +
      '<button type="button" class="btn btn--petit" id="btn-autre-zone">' + bouton + '</button></div>';
  }

  /* =========================================================
     En Martinique : boutiques et créateurs
     ========================================================= */
  function raisonsBoutique(b, ev) {
    var t = [];
    if (r.qui && b.pourQui.indexOf(r.qui) !== -1) t.push(T.libelleQui(r.qui));
    else if (b.pourQui.indexOf('Tout le monde') !== -1) t.push('Pour tout le monde');
    var choisis = labelsPassions(function (p) { return p.cats.some(function (c) { return b.categories.indexOf(c) !== -1; }); });
    if (choisis.length) t.push('Aime : ' + choisis.join(', ').toLowerCase());
    if (b.categories.indexOf('Expériences & ateliers') !== -1) t.push('Ateliers à offrir');
    return t;
  }

  function pourquoiPasBoutique(b, ev) {
    var t = [];
    if (!ev.criteres.qui) t.push('Plutôt ' + b.pourQui.map(function (q) { return T.libelleQui(q).toLowerCase(); }).join(', '));
    if (!ev.criteres.univers) t.push('Autre univers');
    if (!ev.criteres.format) t.push('Pas d’atelier');
    return t;
  }

  function vedetteBoutique(item) {
    var b = item.b, p = T.picto(item.ev.categories[0] || b.categories[0]);
    return '<article class="vedette cadeau cadeau--boutique">' +
      '<div class="cadeau__visuel" style="background:' + p.fond + '" aria-hidden="true">' + p.svg +
      '<span class="pastille pastille--blanc cadeau__score">Meilleure adresse · ' + item.ev.score + ' %</span></div>' +
      '<div class="vedette__infos">' +
      '<div class="cadeau__meta"><span>' + e(b.adresse) + '</span><span class="pastille pastille--vert">' + e(b.commune) + '</span></div>' +
      '<h2>' + e(b.nom) + '</h2>' +
      '<div class="vedette__raisons">' + raisonsBoutique(b, item.ev).map(function (x) { return '<span class="pastille">' + e(x) + '</span>'; }).join('') + '</div>' +
      '<p class="cadeau__texte" style="font-size:16px;padding:0">' + e(b.produits) + '</p>' +
      (b.infoPratique ? '<p class="cadeau__info" style="padding:0">' + e(b.infoPratique) + '</p>' : '') +
      (b.alcool ? '<p class="cadeau__info" style="padding:0">' + T.EVIN + '</p>' : '') +
      '<div class="vedette__bas">' + (b.venteEnLigne ? '<span class="pastille pastille--bleu" style="margin-right:auto">Vend aussi en ligne</span>' : '<span style="margin-right:auto"></span>') +
      T.lienBoutique(b, 'btn btn--grand') + '</div>' +
      '</div></article>';
  }

  function trierBoutiques(liste) {
    return liste.sort(function (a, b) { return b.ev.score - a.ev.score || a.b.nom.localeCompare(b.b.nom, 'fr'); });
  }

  function afficherMartinique() {
    var pour = T.pourQui(r.qui);
    var notes = (catalogue.boutiquesMartinique || []).map(function (b) { return { b: b, ev: T.evaluerBoutique(b, r) }; });
    var parfaites = trierBoutiques(notes.filter(function (x) { var k = x.ev.criteres; return k.qui && k.univers && k.format; }));
    var autres = trierBoutiques(notes.filter(function (x) { return parfaites.indexOf(x) === -1; }));

    afficherEntete(parfaites.length, 'boutique');

    var html = '';
    if (parfaites.length) {
      html += vedetteBoutique(parfaites[0]);
      if (parfaites.length > 1) {
        html += '<div class="grille-res">' + parfaites.slice(1).map(function (x) {
          return T.carteBoutique(x.b, { score: x.ev.score, pour: pour, categories: x.ev.categories });
        }).join('') + '</div>';
      }
    } else {
      html += videAutreZone('Aucune boutique de l’île ne coche toutes les cases…',
        'Regardez les autres adresses juste en dessous, ou les idées à commander en ligne.', 'Voir en ligne');
    }
    if (autres.length) {
      html += '<h2 class="res-sous-titre">' + (parfaites.length ? 'Les autres boutiques de l’île' : 'Toutes les boutiques de l’île') + '</h2>' +
        '<p class="res-sous-texte">Elles ne cochent pas toutes vos réponses, mais valent souvent le détour.</p>' +
        '<div class="grille-res">' + autres.map(function (x) {
          return T.carteBoutique(x.b, { score: x.ev.score, pour: pour, categories: x.ev.categories, raisons: pourquoiPasBoutique(x.b, x.ev) });
        }).join('') + '</div>';
    }
    html += '<p class="res-note">Adresses relevées le 9 novembre 2026 sur les fiches de l’office de tourisme et de Martinique Tour. ' +
      'Les produits et les prix de ces boutiques ne sont pas encore dans Tadaaa&nbsp;: le budget et l’occasion ne trient donc pas encore ces adresses. ' +
      'Les horaires ne sont pas vérifiés, appelez avant de passer.</p>';
    return html;
  }

  /* =========================================================
     En ligne : catalogue d'idées
     ========================================================= */
  function raisons(c) {
    var t = [];
    if (r.qui && c.pourQui.indexOf(r.qui) !== -1) t.push(T.libelleQui(r.qui));
    var choisis = labelsPassions(function (p) { return p.univers.some(function (u) { return c.univers.indexOf(u) !== -1; }); });
    if (choisis.length) t.push('Aime : ' + choisis.join(', ').toLowerCase());
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
    var c = item.c, p = T.picto(c.categorie);
    return '<article class="vedette cadeau">' +
      '<a class="cadeau__visuel" style="background:' + p.fond + '" ' + T.attributsLien(c) + ' tabindex="-1" aria-hidden="true">' + p.svg +
      '<span class="pastille pastille--blanc cadeau__score">Meilleure idée · ' + item.ev.score + ' %</span></a>' +
      '<div class="vedette__infos">' +
      '<div class="cadeau__meta"><span>' + e(c.boutique) + '</span>' + T.badgeLieu() + '</div>' +
      '<h2>' + e(c.nom) + '</h2>' +
      '<div class="vedette__raisons">' + raisons(c).map(function (x) { return '<span class="pastille">' + e(x) + '</span>'; }).join('') + '</div>' +
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

  function afficherEnLigne() {
    var base = catalogue.cadeaux.filter(function (c) { return c.zones.indexOf('en-ligne') !== -1; });
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

    afficherEntete(parfaits.length, 'idée');

    var html = '';
    if (parfaits.length) {
      var reste = parfaits;
      if (tri === 'pertinence') { html += vedette(parfaits[0]); reste = parfaits.slice(1); }
      if (reste.length) html += '<div class="grille-res">' + reste.map(function (x) { return carte(x); }).join('') + '</div>';
    } else {
      html += videAutreZone('Rien qui coche toutes les cases…',
        'Aucune idée en ligne ne correspond à toutes vos réponses. Essayez un autre budget, les boutiques de Martinique, ou regardez les idées proches juste en dessous.',
        'Voir en Martinique');
    }
    if (proches.length) {
      html += '<h2 class="res-sous-titre">' + (parfaits.length ? 'Pour aller plus loin' : 'Idées proches') + '</h2>' +
        '<p class="res-sous-texte">Elles visent la bonne personne, mais ne cochent pas toutes vos réponses.</p>' +
        '<div class="grille-res">' + proches.map(function (x) { return carte(x, pourquoiProche(x.ev, x.c)); }).join('') + '</div>';
    }

    // Boutiques de l'île qui vendent aussi sur leur site.
    var locales = (catalogue.boutiquesMartinique || []).filter(function (b) { return b.venteEnLigne; })
      .map(function (b) { return { b: b, ev: T.evaluerBoutique(b, r) }; })
      .filter(function (x) { return x.ev.criteres.qui && x.ev.criteres.format; });
    if (locales.length) {
      html += '<h2 class="res-sous-titre">Aussi en ligne, depuis la Martinique</h2>' +
        '<p class="res-sous-texte">Des boutiques de l’île qui vendent sur leur site.</p>' +
        '<div class="grille-res">' + trierBoutiques(locales).map(function (x) {
          return T.carteBoutique(x.b, { score: x.ev.score, pour: T.pourQui(r.qui), categories: x.ev.categories });
        }).join('') + '</div>';
    }

    html += '<p class="res-note">Prix relevés le 9 novembre 2026 sur le site de chaque boutique&nbsp;: vérifiez-les avant d’acheter, ' +
      'ainsi que la livraison vers la Martinique et son coût. Quand le prix n’est pas connu, on indique sa tranche de budget. ' +
      'Certains liens sont affiliés&nbsp;: Tadaaa peut recevoir une commission, sans changer le prix pour vous.</p>';
    return html;
  }

  function afficher() {
    sortie.innerHTML = r.zone === 'martinique' ? afficherMartinique() : afficherEnLigne();
    T.remplirPersos(sortie);

    var autre = document.getElementById('btn-autre-zone');
    if (autre) autre.addEventListener('click', function () {
      r.zone = r.zone === 'martinique' ? 'en-ligne' : 'martinique';
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
