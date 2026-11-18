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
    var suite = nb ? nb + ' ' + pluriel + pour : 'Des ' + mot + 's proches ' + pour;
    document.getElementById('res-titre').innerHTML = (nb ? '<span class="res-cri">Tadaaa&nbsp;!</span> ' : '') +
      '<span class="res-suite">' + e(suite) + '</span>';
    // Version mobile : une ligne de rappel sous le grand « tadaaa ! »
    document.getElementById('res-recap').textContent = [suite, r.occasion, r.zone === 'en-ligne' ? r.budget : T.ZONES[r.zone].label]
      .filter(Boolean).join(' · ');
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
      html += fiche(vedetteBoutique(parfaites[0]), parfaites[0], 'Parfait ' + pour);
      if (parfaites.length > 1) {
        html += '<div class="grille-res">' + parfaites.slice(1).map(function (x, i) {
          return fiche(T.carteBoutique(x.b, { score: x.ev.score, pour: pour, categories: x.ev.categories }), x, i < 2 ? 'Très bon choix' : 'Bonne idée');
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
          return fiche(T.carteBoutique(x.b, { score: x.ev.score, pour: pour, categories: x.ev.categories, raisons: pourquoiPasBoutique(x.b, x.ev) }), x, 'À découvrir');
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
      var decalage = 0;
      if (tri === 'pertinence') { html += fiche(vedette(parfaits[0]), parfaits[0], 'Parfait ' + T.pourQui(r.qui)); reste = parfaits.slice(1); decalage = 1; }
      if (reste.length) html += '<div class="grille-res">' + reste.map(function (x, i) {
        var rang = i + decalage;
        return fiche(carte(x), x, rang === 0 ? 'Parfait ' + T.pourQui(r.qui) : rang < 3 ? 'Très bon choix' : 'Bonne idée');
      }).join('') + '</div>';
    } else {
      html += videAutreZone('Rien qui coche toutes les cases…',
        'Aucune idée en ligne ne correspond à toutes vos réponses. Essayez un autre budget, les boutiques de Martinique, ou regardez les idées proches juste en dessous.',
        'Voir en Martinique');
    }
    if (proches.length) {
      html += '<h2 class="res-sous-titre">' + (parfaits.length ? 'Pour aller plus loin' : 'Idées proches') + '</h2>' +
        '<p class="res-sous-texte">Elles visent la bonne personne, mais ne cochent pas toutes vos réponses.</p>' +
        '<div class="grille-res">' + proches.map(function (x) { return fiche(carte(x, pourquoiProche(x.ev, x.c)), x, 'Idée proche'); }).join('') + '</div>';
    }

    // Boutiques de l'île qui vendent aussi sur leur site.
    var locales = (catalogue.boutiquesMartinique || []).filter(function (b) { return b.venteEnLigne; })
      .map(function (b) { return { b: b, ev: T.evaluerBoutique(b, r) }; })
      .filter(function (x) { return x.ev.criteres.qui && x.ev.criteres.format; });
    if (locales.length) {
      html += '<h2 class="res-sous-titre">Aussi en ligne, depuis la Martinique</h2>' +
        '<p class="res-sous-texte">Des boutiques de l’île qui vendent sur leur site.</p>' +
        '<div class="grille-res">' + trierBoutiques(locales).map(function (x) {
          return fiche(T.carteBoutique(x.b, { score: x.ev.score, pour: T.pourQui(r.qui), categories: x.ev.categories }), x, 'Depuis la Martinique');
        }).join('') + '</div>';
    }

    html += '<p class="res-note">Prix relevés le 9 novembre 2026 sur le site de chaque boutique&nbsp;: vérifiez-les avant d’acheter, ' +
      'ainsi que la livraison vers la Martinique et son coût. Quand le prix n’est pas connu, on indique sa tranche de budget. ' +
      'Certains liens sont affiliés&nbsp;: Tadaaa peut recevoir une commission, sans changer le prix pour vous.</p>';
    return html;
  }

  /* =========================================================
     Version mobile : liste compacte, fiche cadeau et « Bon cadeau ! »
     ========================================================= */
  var fiches = [];
  var RETOUR = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  var COEUR = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S3 14.6 3 8.7A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 9 2.1c0 5.9-9 11.8-9 11.8z" stroke="#1A1A1A" stroke-width="2" stroke-linejoin="round"/></svg>';
  var ETOILE = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="currentColor"/></svg>';
  var EPINGLE = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s-7.5-6.6-7.5-12.2a7.5 7.5 0 0 1 15 0C19.5 15.4 12 22 12 22z" fill="#F5793B"/><circle cx="12" cy="9.8" r="2.8" fill="#fff"/></svg>';

  // Ajoute à une carte ce que la liste mobile affiche : étiquette, mots-clés et bouton qui ouvre la fiche.
  function fiche(html, item, etiquette) {
    var n = fiches.push({ item: item, etiquette: etiquette }) - 1;
    var x = item.c || item.b;
    var mots = item.c ? [x.categorie, x.univers[0]] : [x.commune, x.categories[0]];
    html = html.replace(/<h([23])>/, '<span class="cadeau__etiquette">' + e(etiquette) + '</span><h$1>');
    html = html.replace(/<\/h([23])>/, '</h$1><p class="cadeau__mots">' + e(mots.filter(Boolean).join(' · ')) + '</p>');
    var fin = html.lastIndexOf('</article>');
    return html.slice(0, fin) + '<button type="button" class="cadeau__ouvrir" data-fiche="' + n + '"><span class="sr-only">Voir la fiche : ' + e(x.nom) + '</span></button>' + html.slice(fin);
  }

  function enListe(t) { return t.length > 1 ? t.slice(0, -1).join(', ') + ' et ' + t[t.length - 1] : (t[0] || ''); }
  function pourquoiTexte(item) {
    var t = [], x = item.c || item.b;
    var ses = r.qui === 'Couple' || r.qui === 'Famille' ? 'leurs' : 'ses';
    var gouts = item.c
      ? labelsPassions(function (p) { return p.univers.some(function (u) { return x.univers.indexOf(u) !== -1; }); })
      : labelsPassions(function (p) { return p.cats.some(function (c) { return x.categories.indexOf(c) !== -1; }); });
    if (gouts.length) t.push('ça colle à ' + ses + ' goûts (' + gouts.join(', ').toLowerCase() + ')');
    if (r.qui && x.pourQui.indexOf(r.qui) !== -1) t.push('c’est pensé pour ' + T.libelleQui(r.qui).toLowerCase());
    if (item.c) {
      if (r.occasion && x.occasion.indexOf(r.occasion) !== -1) t.push('ça tombe bien pour ' + r.occasion);
      if (r.budget && x.budget === r.budget) t.push('ça tient dans votre budget (' + r.budget + ')');
    } else if (x.categories.indexOf('Expériences & ateliers') !== -1) {
      t.push('on peut y offrir un atelier');
    }
    var phrase = t.length ? enListe(t) + '.' : 'une idée proche de vos réponses.';
    return phrase.charAt(0).toUpperCase() + phrase.slice(1);
  }

  function pictoItem(item) {
    return T.picto(item.c ? item.c.categorie : ((item.ev.categories && item.ev.categories[0]) || item.b.categories[0]));
  }

  // Idées gardées (le cœur) : seulement dans ce navigateur.
  function cle(item) { var x = item.c || item.b; return x.nom + '|' + (x.boutique || x.commune); }
  function favoris() { try { return JSON.parse(localStorage.getItem('tadaaa-favoris') || '[]'); } catch (er) { return []; } }
  function basculerFavori(item) {
    var f = favoris(), k = cle(item), pos = f.indexOf(k);
    if (pos === -1) f.push(k); else f.splice(pos, 1);
    try { localStorage.setItem('tadaaa-favoris', JSON.stringify(f)); } catch (er) { /* navigation privée */ }
    return pos === -1;
  }
  function boutonCoeur(item, classe) {
    return '<button type="button" class="' + classe + '" data-coeur aria-pressed="' + (favoris().indexOf(cle(item)) !== -1) + '" aria-label="Garder cette idée">' + COEUR + '</button>';
  }

  function contenuFiche(f) {
    var it = f.item, x = it.c || it.b, p = pictoItem(it);
    var leur = r.qui === 'Couple' || r.qui === 'Famille' ? 'leur' : 'lui';
    var html = '<div class="fiche__visuel" style="background:' + p.fond + '">' + p.svg +
      '<button type="button" class="fiche__rond fiche__retour" data-fermer aria-label="Revenir aux idées">' + RETOUR + '</button>' +
      boutonCoeur(it, 'fiche__rond fiche__coeur') + '</div>' +
      '<div class="fiche__corps">' +
      '<span class="cadeau__etiquette">' + e(f.etiquette) + '</span>' +
      '<h2 id="fiche-titre">' + e(x.nom) + '</h2>';
    if (it.c) html += '<p class="fiche__prix">' + T.prix(x) + '</p><p class="fiche__chez">Chez ' + e(x.boutique) + '</p>';
    else html += '<p class="fiche__chez">' + EPINGLE + e(x.adresse || x.commune) + '</p>';
    html += '<p class="fiche__pourquoi"><strong>Pourquoi ça va ' + leur + ' plaire&nbsp;:</strong> ' + e(pourquoiTexte(it)) + '</p>';
    if (it.b) {
      html += '<p class="fiche__texte">' + e(x.produits) + '</p>' +
        (x.infoPratique ? '<p class="cadeau__info">' + e(x.infoPratique) + '</p>' : '') +
        (x.alcool ? '<p class="cadeau__info">' + T.EVIN + '</p>' : '');
    }
    html += '<div class="fiche__actions">';
    if (it.c) {
      html += '<a class="btn btn--jaune btn--grand btn--plein" data-offre ' + T.attributsLien(x) + '>Voir l’offre en ligne ' + ETOILE + '</a>' +
        '<p class="fiche__note">Lien partenaire&nbsp;: Tadaaa peut recevoir une petite commission, sans surcoût pour vous.</p>';
    } else {
      html += T.lienBoutique(x, 'btn btn--jaune btn--grand btn--plein').replace('<a ', '<a data-offre ');
      if (x.lien && x.telephone) html += '<a class="btn btn--blanc btn--grand btn--plein" href="tel:' + e(x.telephone.replace(/\s/g, '')) + '">Appeler · ' + e(x.telephone) + '</a>';
      if (x.venteEnLigne) html += '<p class="fiche__note">Cette boutique vend aussi en ligne.</p>';
    }
    return html + '</div></div>';
  }

  // Écran « Bon cadeau ! » : quand on revient sur Tadaaa après avoir ouvert l'offre.
  function contenuBonCadeau(f) {
    var it = f.item, x = it.c || it.b, p = pictoItem(it), autres = fiches.length - 1;
    var detail = (it.c ? T.prix(x) : e(x.commune)) +
      (autres > 0 ? ' · ' + autres + (autres > 1 ? ' autres idées' : ' autre idée') : '');
    return '<div class="fiche__corps fiche__bon">' +
      '<button type="button" class="fiche__rond fiche__retour" data-fermer aria-label="Revenir aux idées">' + RETOUR + '</button>' +
      '<h2 id="fiche-titre">Bon cadeau&nbsp;!</h2><span class="fiche__etoile" aria-hidden="true">' + ETOILE + '</span>' +
      '<p class="fiche__chez">Vos idées ' + e(T.pourQui(r.qui)) + ' restent ici, prêtes à partager.</p>' +
      '<div class="bon__carte"><span class="bon__visuel" style="background:' + p.fond + '">' + p.svg + '</span>' +
      '<span class="bon__texte"><strong>' + e(x.nom) + '</strong><span>' + detail + '</span></span>' +
      boutonCoeur(it, 'bon__coeur') + '</div>' +
      '<button type="button" class="btn btn--bleu btn--grand btn--plein" data-partager>Partager ma liste</button>' +
      '<a class="btn btn--blanc btn--grand btn--plein" href="zone.html" data-autre>Un cadeau pour quelqu’un d’autre&nbsp;?</a>' +
      (T.INSTAGRAM ? '<a class="bon__insta" href="' + e(T.INSTAGRAM) + '" target="_blank" rel="noopener"><span data-perso="trefle" data-couleur="bleu"></span>' +
        '<span><strong>Suivez-nous sur Instagram</strong>Des idées cadeaux chaque semaine</span><span class="bon__suivre">Suivre</span></a>' : '') +
      '<button type="button" class="lien-souligne fiche__revenir" data-fermer>Revenir aux idées</button>' +
      '</div>';
  }

  var ecranFiche = null, ficheOuverte = null;
  function ouvrirFiche(n) {
    var f = fiches[n];
    if (!f) return;
    if (!ecranFiche) {
      ecranFiche = document.createElement('div');
      ecranFiche.className = 'fiche';
      ecranFiche.setAttribute('role', 'dialog');
      ecranFiche.setAttribute('aria-modal', 'true');
      ecranFiche.setAttribute('aria-labelledby', 'fiche-titre');
      ecranFiche.hidden = true;
      document.body.appendChild(ecranFiche);
      ecranFiche.addEventListener('click', clicFiche);
    }
    ficheOuverte = f;
    ecranFiche.classList.remove('fiche--bon');
    ecranFiche.innerHTML = contenuFiche(f);
    ecranFiche.hidden = false;
    ecranFiche.scrollTop = 0;
    document.documentElement.classList.add('fiche-ouverte');
    history.pushState({ fiche: n }, '');
    ecranFiche.querySelector('.fiche__retour').focus();
  }
  function fermerFiche(depuisHistorique) {
    if (!ecranFiche || ecranFiche.hidden) return;
    ecranFiche.hidden = true;
    document.documentElement.classList.remove('fiche-ouverte');
    if (!depuisHistorique && history.state && history.state.fiche != null) history.back();
    var b = sortie.querySelector('[data-fiche="' + fiches.indexOf(ficheOuverte) + '"]');
    if (b) b.focus({ preventScroll: true });
  }
  function partager(btn) {
    var donnees = { title: 'Mes idées cadeaux Tadaaa', text: 'Les idées Tadaaa ' + T.pourQui(r.qui), url: location.href };
    if (navigator.share) { navigator.share(donnees).catch(function () { /* partage annulé */ }); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { btn.textContent = 'Lien copié !'; }, function () {});
  }
  function clicFiche(ev) {
    var t = ev.target;
    if (t.closest('[data-fermer]')) { fermerFiche(false); return; }
    var coeur = t.closest('[data-coeur]');
    if (coeur) { coeur.setAttribute('aria-pressed', basculerFavori(ficheOuverte.item)); return; }
    if (t.closest('[data-partager]')) { partager(t.closest('[data-partager]')); return; }
    if (t.closest('[data-autre]')) { T.ecrireStockage({}); return; }
    if (t.closest('[data-offre]')) {
      // L'offre s'ouvre dans un nouvel onglet ; en revenant, on trouve « Bon cadeau ! ».
      var f = ficheOuverte;
      setTimeout(function () {
        if (ecranFiche.hidden || ficheOuverte !== f) return;
        ecranFiche.classList.add('fiche--bon');
        ecranFiche.innerHTML = contenuBonCadeau(f);
        T.remplirPersos(ecranFiche);
        ecranFiche.scrollTop = 0;
      }, 500);
    }
  }
  window.addEventListener('popstate', function () { fermerFiche(true); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') fermerFiche(false); });
  sortie.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-fiche]');
    if (b) ouvrirFiche(+b.getAttribute('data-fiche'));
  });

  function afficher() {
    fiches = [];
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
