/* =========================================================
   Tadaaa · code commun à toutes les pages
   ========================================================= */
(function () {
  'use strict';

  var COULEURS = { bleu: '#99B7F5', vert: '#267F53', orange: '#F5793B', rose: '#F296BD', jaune: '#FCCA59' };

  /* ---------- Personnages (repris de la maquette) ---------- */
  function oeil(x, y, r, dx, dy) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/>' +
      '<circle cx="' + (x + dx) + '" cy="' + (y + dy) + '" r="' + r * 0.65 + '" fill="#1A1A1A"/>' +
      '<circle cx="' + (x + dx - 2) + '" cy="' + (y + dy - 3) + '" r="' + r * 0.2 + '" fill="#fff"/>';
  }
  function yeux(x1, x2, y, r, dx, dy) { return oeil(x1, y, r, dx, dy) + oeil(x2, y, r, dx, dy); }
  var SOURIRE = '<path d="M45 60q5 9 10 0" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"/>';
  var BOUCHE_OUVERTE = '<path d="M40 60h20a10 10 0 0 1-20 0z" fill="#1A1A1A"/><ellipse cx="50" cy="66" rx="5" ry="2.6" fill="#E8553A"/>';
  var PERSOS = {
    soleil: function (c) {
      return '<polygon points="98,50 86.7,59.8 91.6,74 76.9,76.9 74,91.6 59.8,86.7 50,98 40.2,86.7 26,91.6 23.1,76.9 8.4,74 13.3,59.8 2,50 13.3,40.2 8.4,26 23.1,23.1 26,8.4 40.2,13.3 50,2 59.8,13.3 74,8.4 76.9,23.1 91.6,26 86.7,40.2" fill="' + c + '" stroke="' + c + '" stroke-width="4" stroke-linejoin="round"/>' + yeux(40, 60, 44, 10, 3, 1) + SOURIRE;
    },
    fleur: function (c) {
      return '<g fill="' + c + '"><circle cx="50" cy="28" r="22"/><circle cx="72.8" cy="44.6" r="22"/><circle cx="64.1" cy="71.4" r="22"/><circle cx="35.9" cy="71.4" r="22"/><circle cx="27.2" cy="44.6" r="22"/><circle cx="50" cy="52" r="24"/></g>' +
        oeil(41, 50, 9.5, 2, 1) + '<path d="M54 50q5-6 10 0" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"/><path d="M43 60h14a7 7 0 0 1-14 0z" fill="#1A1A1A"/><ellipse cx="50" cy="64.5" rx="4.5" ry="2.3" fill="#E8553A"/>';
    },
    trefle: function (c) {
      return '<g fill="' + c + '"><circle cx="29" cy="29" r="23"/><circle cx="71" cy="29" r="23"/><circle cx="29" cy="71" r="23"/><circle cx="71" cy="71" r="23"/><rect x="26" y="26" width="48" height="48"/></g>' +
        yeux(40, 60, 44, 9.5, 1.5, 2) + '<path d="M34 59q16 16 32 0" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"/>';
    },
    surpris: function (c) {
      return '<g fill="' + c + '"><circle cx="29" cy="29" r="23"/><circle cx="71" cy="29" r="23"/><circle cx="29" cy="71" r="23"/><circle cx="71" cy="71" r="23"/><rect x="26" y="26" width="48" height="48"/></g>' +
        yeux(40, 60, 44, 10, -2, -2.5) + '<ellipse cx="50" cy="62" rx="5" ry="5.5" fill="#1A1A1A"/>';
    },
    coeur: function (c) {
      return '<path d="M50 90C20 68 6 50 10 31C14 13 38 10 50 29C62 10 86 13 90 31C94 50 80 68 50 90z" fill="' + c + '"/><path d="M33 44q6-7 12 0M55 44q6-7 12 0" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"/><path d="M40 55q10 11 20 0" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"/>';
    },
    croix: function (c) {
      return '<g fill="' + c + '"><rect x="6" y="33" width="88" height="34" rx="17" transform="rotate(45 50 50)"/><rect x="6" y="33" width="88" height="34" rx="17" transform="rotate(-45 50 50)"/></g>' +
        yeux(42, 58, 46, 8, 1.5, 1) + '<path d="M45 57h10a5 5 0 0 1-10 0z" fill="#1A1A1A"/>';
    },
    eclat: function (c) {
      return '<circle cx="50" cy="50" r="41" fill="' + c + '"/><circle cx="50" cy="50" r="44" fill="none" stroke="' + c + '" stroke-width="8" stroke-dasharray="5 4.2"/>' +
        yeux(38, 62, 44, 12, 2, 2) + '<path d="M38 62h24a12 12 0 0 1-24 0z" fill="#1A1A1A"/><ellipse cx="50" cy="69" rx="6" ry="3" fill="#FCCA59"/>';
    },
    bulle: function (c) {
      return '<path d="M92 8V60a32 32 0 0 1-32 32H40A32 32 0 0 1 8 60V40A32 32 0 0 1 40 8z" fill="' + c + '"/>' + yeux(40, 60, 44, 9.5, 2, 1) + BOUCHE_OUVERTE;
    },
    hexa: function (c) {
      return '<polygon points="50,7 89,29 89,71 50,93 11,71 11,29" fill="' + c + '" stroke="' + c + '" stroke-width="8" stroke-linejoin="round"/>' + yeux(40, 60, 44, 10, -1.5, 1) +
        '<ellipse cx="56" cy="67" rx="4.5" ry="6" fill="#E8553A"/><path d="M40 60q10 9 20 0" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"/>';
    },
    fantome: function (c) {
      return '<path d="M10 96V50a40 40 0 0 1 80 0V96z" fill="' + c + '"/>' + yeux(39, 61, 52, 10, 3, -2.5) + '<ellipse cx="50" cy="68" rx="4.5" ry="4" fill="#1A1A1A"/>';
    },
    carre: function (c) {
      return '<rect x="8" y="8" width="84" height="84" rx="24" fill="' + c + '"/>' + yeux(38, 62, 40, 11, 2, 1) +
        '<ellipse cx="50" cy="66" rx="9" ry="11" fill="#1A1A1A"/><rect x="44.5" y="58" width="5" height="6" rx="1" fill="#fff"/><rect x="50.5" y="58" width="5" height="6" rx="1" fill="#fff"/><ellipse cx="50" cy="72" rx="5" ry="3" fill="#E8553A"/>';
    }
  };

  function perso(nom, couleur) {
    var f = PERSOS[nom] || PERSOS.soleil;
    var c = COULEURS[couleur] || couleur || COULEURS.jaune;
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + f(c) + '</svg>';
  }
  function remplirPersos(racine) {
    (racine || document).querySelectorAll('[data-perso]').forEach(function (el) {
      if (!el.firstElementChild) el.innerHTML = perso(el.getAttribute('data-perso'), el.getAttribute('data-couleur'));
    });
  }

  /* ---------- Pictogrammes par catégorie du catalogue ---------- */
  var PICTOS = {
    'Mode & accessoires': ['#FFF6DF', '<path d="M30 40h40l6 46H24z" fill="#267F53"/><path d="M38 42c0-16 24-16 24 0" fill="none" stroke="#1A1A1A" stroke-width="5" stroke-linecap="round"/><rect x="24" y="76" width="52" height="10" fill="#FCCA59"/>'],
    'Déco & maison': ['#FDEDF4', '<path d="M40 18h20v12c10 6 16 16 16 30 0 16-12 26-26 26S24 76 24 60c0-14 6-24 16-30z" fill="#F296BD"/><path d="M27 58h46" stroke="#F5793B" stroke-width="6"/><rect x="38" y="14" width="24" height="8" rx="4" fill="#1A1A1A"/>'],
    'Art de la table': ['#EEF3FE', '<circle cx="50" cy="56" r="32" fill="#fff"/><circle cx="50" cy="56" r="22" fill="#99B7F5"/><circle cx="50" cy="56" r="10" fill="#fff"/>'],
    'Bougies & parfums': ['#FFF6DF', '<rect x="32" y="46" width="36" height="42" rx="8" fill="#fff"/><path d="M50 16c8 10 8 18 0 24-8-6-8-14 0-24z" fill="#F5793B"/><rect x="48.5" y="38" width="3" height="9" fill="#1A1A1A"/>'],
    'Jouets enfant': ['#E6F1EB', '<rect x="16" y="52" width="32" height="32" rx="6" fill="#F5793B"/><rect x="52" y="52" width="32" height="32" rx="6" fill="#99B7F5"/><rect x="34" y="18" width="32" height="32" rx="6" fill="#FCCA59"/>'],
    'Jeux & loisirs': ['#FEEEE5', '<rect x="22" y="22" width="56" height="56" rx="14" fill="#fff" transform="rotate(-8 50 50)"/><g fill="#1A1A1A"><circle cx="36" cy="38" r="5"/><circle cx="50" cy="50" r="5"/><circle cx="64" cy="62" r="5"/><circle cx="64" cy="36" r="5"/><circle cx="36" cy="64" r="5"/></g>'],
    'Gastronomie': ['#FDEDF4', '<rect x="20" y="40" width="60" height="44" rx="6" fill="#267F53"/><rect x="16" y="30" width="68" height="16" rx="5" fill="#267F53"/><rect x="45" y="30" width="10" height="54" fill="#FCCA59"/><path d="M50 30c-10-14-24-8-14 0M50 30c10-14 24-8 14 0" fill="none" stroke="#FCCA59" stroke-width="6" stroke-linecap="round"/>'],
    'Beauté & soin': ['#EEF3FE', '<rect x="32" y="36" width="36" height="50" rx="12" fill="#F296BD"/><rect x="42" y="18" width="16" height="20" rx="4" fill="#1A1A1A"/><rect x="40" y="52" width="20" height="16" rx="3" fill="#fff"/>'],
    'Papeterie': ['#FFF6DF', '<rect x="24" y="18" width="46" height="66" rx="6" fill="#99B7F5"/><rect x="24" y="18" width="10" height="66" fill="#1A1A1A" opacity=".85"/><path d="M70 30l10 4-16 50-8 6-1-10z" fill="#F5793B"/>'],
    'Plantes & fleurs': ['#E6F1EB', '<path d="M50 54C40 44 38 30 50 16c12 14 10 28 0 38z" fill="#267F53"/><path d="M50 56C38 54 26 46 22 36c14-2 24 6 28 20zM50 56c12-2 24-10 28-20-14-2-24 6-28 20z" fill="#2E9A63"/><path d="M32 58h36l-6 30H38z" fill="#F296BD"/>'],
    'Expériences & ateliers': ['#FEEEE5', '<path d="M14 34h72v10a8 8 0 0 0 0 16v10H14V60a8 8 0 0 0 0-16z" fill="#F5793B"/><path d="M62 36v32" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"/><path d="M36 44l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#FCCA59"/>'],
    'High-tech & photo': ['#EEF3FE', '<rect x="16" y="32" width="68" height="48" rx="12" fill="#1A1A1A"/><rect x="28" y="24" width="20" height="12" rx="4" fill="#1A1A1A"/><circle cx="50" cy="56" r="16" fill="#FCCA59"/><circle cx="50" cy="56" r="7" fill="#F5793B"/><circle cx="72" cy="42" r="3" fill="#fff"/>'],
    'Curiosités': ['#E6F1EB', '<circle cx="44" cy="44" r="24" fill="#fff" stroke="#1A1A1A" stroke-width="7"/><path d="M62 62l20 20" stroke="#1A1A1A" stroke-width="10" stroke-linecap="round"/><path d="M44 32l3 8 8 1-6 6 2 8-7-4-7 4 2-8-6-6 8-1z" fill="#F296BD"/>'],
    'Livres': ['#EEF3FE', '<path d="M50 28C40 22 26 22 16 26v52c10-4 24-4 34 2z" fill="#fff"/><path d="M50 28c10-6 24-6 34-2v52c-10-4-24-4-34 2z" fill="#99B7F5"/>'],
    'Cuisine & café': ['#FFF6DF', '<path d="M24 40h46v20a20 20 0 0 1-20 20h-6a20 20 0 0 1-20-20z" fill="#F5793B"/><path d="M70 46h4a10 10 0 0 1 0 20h-6" fill="none" stroke="#F5793B" stroke-width="6"/><path d="M38 18c-4 6 4 10 0 16M52 18c-4 6 4 10 0 16" fill="none" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/>']
  };
  function picto(categorie) {
    var p = PICTOS[categorie] || PICTOS['Déco & maison'];
    return { fond: p[0], svg: '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + p[1] + '</svg>' };
  }

  /* ---------- Questions du quiz ----------
     Chaque question correspond à une colonne du catalogue :
     occasion → « Occasion », qui → « Pour qui », budget → « Budget »,
     passions + caractere → « Univers », format → « Catégorie ». */
  var PASSIONS = [
    { id: 'design', label: 'Déco & design', univers: ['Design'] },
    { id: 'creatif', label: 'Créatif', univers: ['Créatif'] },
    { id: 'gourmand', label: 'Gourmandise', univers: ['Gourmand', 'Café & thé'] },
    { id: 'nature', label: 'Nature & plantes', univers: ['Nature'] },
    { id: 'cocooning', label: 'Cocooning', univers: ['Cocooning'] },
    { id: 'bienetre', label: 'Bien-être', univers: ['Bien-être', 'Sport & bien-être'] },
    { id: 'jeux', label: 'Jeux', univers: ['Jeux', 'Jeux vidéo'] },
    { id: 'humour', label: 'Humour', univers: ['Humour'] },
    { id: 'voyage', label: 'Voyage & montagne', univers: ['Voyage', 'Montagne'] },
    { id: 'paris', label: 'Paris', univers: ['Paris'] },
    { id: 'lecture', label: 'Lecture', univers: ['Lecture'] },
    { id: 'curiosite', label: 'Sciences & curiosités', univers: ['Curiosité', 'Astro', 'Animaux'] },
    { id: 'mode', label: 'Mode', univers: ['Mode'] },
    { id: 'tech', label: 'Tech & photo', univers: ['Tech', 'Photo'] },
    { id: 'musique', label: 'Musique', univers: ['Musique'] },
    { id: 'amour', label: 'Amour', univers: ['Amour'] },
    { id: 'eveil', label: 'Éveil des tout-petits', univers: ['Éveil', 'Famille'] }
  ];
  var CARACTERES = [
    { id: 'drole', label: 'L’humour', univers: ['Humour', 'Jeux', 'Jeux vidéo'] },
    { id: 'confort', label: 'Le confort', univers: ['Cocooning', 'Bien-être', 'Sport & bien-être'] },
    { id: 'beau', label: 'Les belles choses', univers: ['Design', 'Mode', 'Paris'] },
    { id: 'curieux', label: 'La curiosité', univers: ['Curiosité', 'Lecture', 'Astro', 'Voyage', 'Montagne'] },
    { id: 'gourmand', label: 'La gourmandise', univers: ['Gourmand', 'Café & thé'] },
    { id: 'manuel', label: 'Le fait main', univers: ['Créatif', 'Nature', 'Photo'] }
  ];

  var QUESTIONS = [
    {
      cle: 'occasion', titre: 'C’est pour quelle occasion ?', sousTitre: 'On garde les idées qui vont avec.',
      type: 'cartes', resume: function (v) { return v || 'Sans occasion'; },
      options: [
        { valeur: 'Noël', label: 'Noël', perso: 'soleil', couleur: 'jaune' },
        { valeur: 'Anniversaire', label: 'Anniversaire', perso: 'eclat', couleur: 'orange' },
        { valeur: '', label: 'Juste pour faire plaisir', perso: 'coeur', couleur: 'rose' }
      ],
      scene: { fond: '#FFF6DF', perso: 'soleil', couleur: 'jaune', bulle: '« Une fête, un anniversaire ou juste comme ça ? Tout est une bonne raison. »' }
    },
    {
      cle: 'qui', titre: 'C’est pour qui ?', sousTitre: 'La personne qui va faire tadaaa.',
      type: 'pastilles', resume: function (v) { return libelleQui(v); },
      options: [
        { valeur: 'Femme', label: 'Une femme' }, { valeur: 'Homme', label: 'Un homme' },
        { valeur: 'Couple', label: 'Un couple' }, { valeur: 'Famille', label: 'Toute la famille' },
        { valeur: 'Ado', label: 'Un ado' }, { valeur: 'Enfant', label: 'Un enfant' },
        { valeur: 'Bébé', label: 'Un bébé' }, { valeur: 'Collègue', label: 'Un collègue' },
        { valeur: 'Secret Santa', label: 'Un Secret Santa' }
      ],
      scene: { fond: '#FDEDF4', perso: 'fleur', couleur: 'rose', bulle: '« Dites-m’en un peu plus. Je ne cherche pas pareil pour mamie et pour un collègue. »' }
    },
    {
      cle: 'budget', titre: 'Combien voulez-vous dépenser ?', sousTitre: 'Prix relevés dans les boutiques, à vérifier sur leur site.',
      type: 'pastilles', resume: function (v) { return v; },
      options: ['Moins de 25 €', '25–50 €', '50–100 €', '100–200 €', '200 € et plus'].map(function (b) { return { valeur: b, label: b }; }),
      scene: { fond: '#FEEEE5', perso: 'eclat', couleur: 'orange', bulle: '« Petit prix ou grosse surprise, il y a de quoi faire. »' }
    },
    {
      cle: 'passions', titre: 'Qu’est-ce qui lui plaît ?', sousTitre: 'Choisissez jusqu’à 3 passions.',
      type: 'multi', max: 3, passer: 'Je ne sais pas trop', resume: function (v) {
        return v && v.length ? v.map(function (id) { return (trouver(PASSIONS, id) || {}).label; }).filter(Boolean).join(', ') : 'Toutes les passions';
      },
      options: PASSIONS.map(function (p) { return { valeur: p.id, label: p.label }; }),
      scene: { fond: '#EEF3FE', perso: 'surpris', couleur: 'bleu', bulle: '« Hmm… je commence à voir le genre de personne. »' }
    },
    {
      cle: 'caractere', titre: 'Ce qui lui ressemble le plus ?', sousTitre: 'Un seul choix, celui qui vient en premier.',
      type: 'pastilles', passer: 'Difficile à dire', resume: function (v) { var c = trouver(CARACTERES, v); return c ? c.label : ''; },
      options: CARACTERES.map(function (c) { return { valeur: c.id, label: c.label }; }),
      scene: { fond: '#E6F1EB', perso: 'croix', couleur: 'vert', bulle: '« Dernière ligne droite. Là, je cerne le personnage. »' }
    },
    {
      cle: 'format', titre: 'Plutôt un objet ou un moment ?', sousTitre: 'Les ateliers se vivent à Paris, chez des artisans.',
      type: 'cartes', resume: function (v) { return v === 'moment' ? 'Un moment à vivre' : v === 'objet' ? 'Un objet à garder' : ''; },
      options: [
        { valeur: 'objet', label: 'Un objet à garder', perso: 'carre', couleur: 'bleu' },
        { valeur: 'moment', label: 'Un moment à vivre', perso: 'hexa', couleur: 'rose' },
        { valeur: '', label: 'Peu importe', perso: 'trefle', couleur: 'jaune' }
      ],
      scene: { fond: '#FFF6DF', perso: 'trefle', couleur: 'bleu', bulle: '« Une dernière et je vous montre tout. Tadaaa approche ! »' }
    }
  ];

  function trouver(liste, id) { for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i]; return null; }
  function libelleQui(v) {
    return ({ Femme: 'Une femme', Homme: 'Un homme', Couple: 'Un couple', Famille: 'Toute la famille', Ado: 'Un ado', Enfant: 'Un enfant', 'Bébé': 'Un bébé', 'Collègue': 'Un collègue', 'Secret Santa': 'Secret Santa' })[v] || 'Tout le monde';
  }
  function pourQui(v) {
    return ({ Femme: 'pour elle', Homme: 'pour lui', Couple: 'pour eux deux', Famille: 'pour toute la famille', Ado: 'pour votre ado', Enfant: 'pour un enfant', 'Bébé': 'pour bébé', 'Collègue': 'pour votre collègue', 'Secret Santa': 'pour le Secret Santa' })[v] || 'à offrir';
  }
  var ZONES = {
    paris: { label: 'À Paris', court: 'Paris' },
    'en-ligne': { label: 'En ligne', court: 'En ligne' }
  };

  /* ---------- Réponses : URL + stockage de session ---------- */
  var CLE_STOCKAGE = 'tadaaa-reponses';
  var CHAMPS = ['zone', 'occasion', 'qui', 'budget', 'passions', 'caractere', 'format'];

  function lireStockage() {
    try { return JSON.parse(sessionStorage.getItem(CLE_STOCKAGE) || '{}') || {}; } catch (e) { return {}; }
  }
  function ecrireStockage(r) {
    try { sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(r)); } catch (e) { /* navigation privée : on continue sans */ }
  }
  function lireUrl() {
    var p = new URLSearchParams(location.search), r = {};
    CHAMPS.forEach(function (c) {
      if (!p.has(c)) return;
      r[c] = c === 'passions' ? p.get(c).split(',').filter(Boolean) : p.get(c);
    });
    return r;
  }
  function versUrl(r) {
    var p = new URLSearchParams();
    CHAMPS.forEach(function (c) {
      var v = r[c];
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v = v.join(',');
      p.set(c, v);
    });
    return p.toString();
  }
  function reponses() {
    var r = lireStockage(), u = lireUrl();
    Object.keys(u).forEach(function (k) { r[k] = u[k]; });
    return r;
  }

  /* ---------- Chargement du catalogue ----------
     En ligne (http/https) : data/catalogue.json.
     En double-cliquant sur le fichier (file://), fetch est bloqué :
     on charge alors data/catalogue.js, copie générée du même fichier. */
  var promesseCatalogue = null;
  function chargerCatalogue() {
    if (promesseCatalogue) return promesseCatalogue;
    promesseCatalogue = new Promise(function (ok, ko) {
      if (window.TADAAA_CATALOGUE) return ok(window.TADAAA_CATALOGUE);
      function parScript() {
        var s = document.createElement('script');
        s.src = 'data/catalogue.js';
        s.onload = function () { window.TADAAA_CATALOGUE ? ok(window.TADAAA_CATALOGUE) : ko(new Error('catalogue vide')); };
        s.onerror = function () { ko(new Error('catalogue introuvable')); };
        document.head.appendChild(s);
      }
      if (location.protocol === 'file:' || !window.fetch) return parScript();
      fetch('data/catalogue.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(ok)
        .catch(parScript);
    });
    return promesseCatalogue;
  }

  /* ---------- Correspondance cadeau ↔ réponses ---------- */
  function unionUnivers(ids, liste) {
    var u = [];
    (ids || []).forEach(function (id) { var p = trouver(liste, id); if (p) u = u.concat(p.univers); });
    return u;
  }
  function croise(a, b) { return a.some(function (x) { return b.indexOf(x) !== -1; }); }
  function estMoment(c) { return c.categorie === 'Expériences & ateliers'; }

  // Renvoie le détail des critères remplis et un score sur 100.
  function evaluer(c, r) {
    var univPassions = unionUnivers(r.passions, PASSIONS);
    var caractere = trouver(CARACTERES, r.caractere);
    var crit = {
      occasion: !r.occasion || c.occasion.indexOf(r.occasion) !== -1,
      qui: !r.qui || c.pourQui.indexOf(r.qui) !== -1 || c.pourQui.indexOf('Tout le monde') !== -1,
      budget: !r.budget || c.budget === r.budget,
      univers: !univPassions.length || croise(c.univers, univPassions),
      caractere: !caractere || croise(c.univers, caractere.univers),
      format: !r.format || (r.format === 'moment' ? estMoment(c) : !estMoment(c))
    };
    var poids = { occasion: 14, qui: 26, budget: 20, univers: 24, caractere: 10, format: 6 };
    var total = 0, obtenu = 0;
    Object.keys(poids).forEach(function (k) { total += poids[k]; if (crit[k]) obtenu += poids[k]; });
    // bonus : plusieurs passions touchées
    var nbPassions = (r.passions || []).filter(function (id) { var p = trouver(PASSIONS, id); return p && croise(c.univers, p.univers); }).length;
    var score = Math.round(obtenu / total * 92 + Math.min(nbPassions, 2) * 4);
    return { criteres: crit, score: Math.min(score, 99), nbPassions: nbPassions };
  }

  /* ---------- Affichage ---------- */
  function echapper(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  var fmtEntier = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  var fmtCentimes = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
  function prix(c) {
    if (typeof c.prix === 'number') return (c.prix % 1 ? fmtCentimes : fmtEntier).format(c.prix);
    return '<small>Budget :</small> ' + echapper(c.budget);
  }
  function badgeLieu(c, catalogue, zone) {
    var b = catalogue.boutiques[c.boutique];
    var arr = b && b.arrondissement ? b.arrondissement.split(' ')[0] : '';
    var aParis = c.zones.indexOf('paris') !== -1, enLigne = c.zones.indexOf('en-ligne') !== -1;
    if (zone === 'en-ligne' && enLigne) return '<span class="pastille pastille--bleu">Livré chez vous</span>';
    if (aParis) {
      var t = c.typeBoutique.indexOf('Ateliers') !== -1 ? 'Atelier à Paris' : 'Paris ' + (arr && /\d/.test(arr) ? arr : '');
      return '<span class="pastille pastille--vert">' + echapper(t.trim()) + '</span>';
    }
    return '<span class="pastille pastille--bleu">En ligne</span>';
  }
  var FLECHE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function attributsLien(c) {
    return 'href="' + echapper(c.lienSuivi) + '" target="_blank" rel="sponsored noopener"';
  }
  function carteCadeau(c, catalogue, opts) {
    opts = opts || {};
    var p = picto(c.categorie);
    var score = opts.score != null ? '<span class="pastille pastille--blanc cadeau__score">' + opts.score + ' % ' + echapper(opts.pour || '') + '</span>' : '';
    return '<article class="cadeau">' +
      '<a class="cadeau__visuel" style="background:' + p.fond + '" ' + attributsLien(c) + ' tabindex="-1" aria-hidden="true">' + p.svg + score + '</a>' +
      '<div class="cadeau__meta"><span>' + echapper(c.boutique) + ' · ' + echapper(c.categorie) + '</span>' + badgeLieu(c, catalogue, opts.zone) + '</div>' +
      '<h3>' + echapper(c.nom) + '</h3>' +
      '<div class="cadeau__bas"><span class="prix">' + prix(c) + '</span>' +
      '<a class="btn btn--petit" ' + attributsLien(c) + '>Voir le cadeau<span class="sr-only"> ' + echapper(c.nom) + ' chez ' + echapper(c.boutique) + ' (nouvel onglet)</span></a></div>' +
      '</article>';
  }

  /* ---------- Jours avant Noël ---------- */
  function joursAvantNoel() {
    var auj = new Date(); auj.setHours(0, 0, 0, 0);
    var noel = new Date(auj.getFullYear(), 11, 25);
    if (auj > noel) noel = new Date(auj.getFullYear() + 1, 11, 25);
    return Math.round((noel - auj) / 864e5);
  }

  document.addEventListener('DOMContentLoaded', function () {
    remplirPersos();
    var annee = document.querySelectorAll('[data-annee]');
    annee.forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });

  window.Tadaaa = {
    COULEURS: COULEURS, QUESTIONS: QUESTIONS, PASSIONS: PASSIONS, CARACTERES: CARACTERES, ZONES: ZONES,
    perso: perso, remplirPersos: remplirPersos, picto: picto,
    reponses: reponses, ecrireStockage: ecrireStockage, versUrl: versUrl,
    chargerCatalogue: chargerCatalogue, evaluer: evaluer, estMoment: estMoment,
    carteCadeau: carteCadeau, badgeLieu: badgeLieu, prix: prix, attributsLien: attributsLien,
    echapper: echapper, pourQui: pourQui, libelleQui: libelleQui, joursAvantNoel: joursAvantNoel, FLECHE: FLECHE
  };
})();
