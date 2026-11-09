/* Tadaaa · quiz en 6 questions */
(function () {
  'use strict';
  var T = window.Tadaaa, Q = T.QUESTIONS;
  // Couleur de chaque piste de progression et des choix sélectionnés (texte blanc sur le vert).
  var PALETTE = [
    { c: T.COULEURS.jaune, t: '#1A1A1A' }, { c: T.COULEURS.rose, t: '#1A1A1A' }, { c: T.COULEURS.orange, t: '#1A1A1A' },
    { c: T.COULEURS.bleu, t: '#1A1A1A' }, { c: T.COULEURS.vert, t: '#FFFFFF' }, { c: T.COULEURS.jaune, t: '#1A1A1A' }
  ];
  var CHOIX_COULEURS = [
    { c: T.COULEURS.vert, t: '#FFFFFF' }, { c: T.COULEURS.rose, t: '#1A1A1A' }, { c: T.COULEURS.jaune, t: '#1A1A1A' },
    { c: T.COULEURS.bleu, t: '#1A1A1A' }, { c: T.COULEURS.orange, t: '#1A1A1A' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var etapeDemandee = parseInt(params.get('etape'), 10);
  var modeEdition = etapeDemandee >= 1 && etapeDemandee <= Q.length;
  var stockees = T.reponses();
  var r;

  if (modeEdition) {
    // Retour depuis les résultats pour modifier une réponse : on garde tout.
    r = stockees;
  } else {
    // Nouveau parcours : seulement la zone + ce qui est passé dans l’URL (ex. ?occasion=Noël).
    r = { zone: params.get('zone') || stockees.zone };
    Q.forEach(function (q) {
      if (!params.has(q.cle)) return;
      r[q.cle] = q.type === 'multi' ? params.get(q.cle).split(',').filter(Boolean) : params.get(q.cle);
    });
  }
  if (!r.zone || !T.ZONES[r.zone]) {
    location.replace('zone.html' + location.search);
    return;
  }
  T.ecrireStockage(r);

  var index = modeEdition ? etapeDemandee - 1 : premiereSansReponse();
  var minuteur = null;

  function premiereSansReponse() {
    for (var i = 0; i < Q.length; i++) if (!r.hasOwnProperty(Q[i].cle)) return i;
    return Q.length - 1;
  }
  function aRepondu(q) { return r.hasOwnProperty(q.cle); }

  function afficher(i, focus) {
    clearTimeout(minuteur);
    index = i;
    var q = Q[i];

    // progression
    var pistes = $('pistes').children;
    for (var k = 0; k < pistes.length; k++) pistes[k].style.background = k <= i ? PALETTE[k].c : '';
    $('progression-texte').textContent = 'Question ' + (i + 1) + ' sur ' + Q.length;

    // scène illustrée
    $('scene').style.background = q.scene.fond;
    $('scene-ruban').setAttribute('stroke', PALETTE[i].c);
    $('scene-perso').innerHTML = T.perso(q.scene.perso, q.scene.couleur);
    $('scene-bulle').textContent = bulle(q);

    // rappel des réponses précédentes
    var html = '<a class="pastille pastille--vert" href="zone.html">' + T.ZONES[r.zone].label + ' ✎</a>';
    Q.forEach(function (autre, j) {
      if (j === i || !aRepondu(autre)) return;
      var txt = autre.resume(r[autre.cle]);
      if (txt) html += '<button type="button" class="pastille" data-aller="' + j + '" style="border:0;cursor:pointer" title="Modifier">' + T.echapper(txt) + '</button>';
    });
    $('resume').innerHTML = html;

    // question
    $('question-titre').textContent = q.titre.replace('lui', r.qui === 'Couple' || r.qui === 'Famille' ? 'leur' : 'lui');
    $('question-sous-titre').textContent = q.sousTitre;
    var boite = $('question-choix');
    boite.className = 'choix apparait' + (q.type === 'cartes' ? ' choix--cartes' : '');
    boite.setAttribute('role', q.type === 'multi' ? 'group' : 'radiogroup');
    boite.setAttribute('aria-labelledby', 'question-titre');
    boite.innerHTML = q.options.map(function (o, n) {
      var col = CHOIX_COULEURS[n % CHOIX_COULEURS.length];
      return '<button type="button" class="choix__btn" data-valeur="' + T.echapper(o.valeur) + '" style="--c:' + col.c + ';--c-texte:' + col.t + '">' +
        (o.perso ? '<span data-perso="' + o.perso + '" data-couleur="' + o.couleur + '"></span>' : '') + T.echapper(o.label) + '</button>';
    }).join('');
    T.remplirPersos(boite);
    majChoix();

    // boutons du bas
    $('btn-precedent').textContent = i === 0 ? 'Changer de zone' : 'Question précédente';
    var passer = $('btn-passer');
    passer.hidden = !q.passer;
    passer.textContent = q.passer || '';
    majSuivant();

    if (focus) $('question-titre').focus({ preventScroll: true });
    if (focus && window.innerWidth < 1080) $('panneau').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bulle(q) {
    if (q.cle === 'passions' && r.passions && r.passions.length) {
      var noms = r.passions.map(function (id) { var p = T.PASSIONS.filter(function (x) { return x.id === id; })[0]; return p ? p.label.toLowerCase() : ''; });
      return '« Hmm… ' + noms.join(', ') + '. Je commence à voir le genre de personne. »';
    }
    return q.scene.bulle;
  }

  function estChoisi(q, v) {
    if (!aRepondu(q)) return false;
    return q.type === 'multi' ? (r[q.cle] || []).indexOf(v) !== -1 : r[q.cle] === v;
  }

  function majChoix() {
    var q = Q[index];
    var plein = q.type === 'multi' && (r[q.cle] || []).length >= q.max;
    $('question-choix').querySelectorAll('.choix__btn').forEach(function (b) {
      var on = estChoisi(q, b.getAttribute('data-valeur'));
      b.setAttribute(q.type === 'multi' ? 'aria-pressed' : 'aria-checked', on ? 'true' : 'false');
      if (q.type !== 'multi') b.setAttribute('role', 'radio');
      b.disabled = plein && !on;
      if (q.type === 'multi' && on) {
        // couleur selon l’ordre de sélection : vert, rose, jaune
        var col = CHOIX_COULEURS[r[q.cle].indexOf(b.getAttribute('data-valeur')) % CHOIX_COULEURS.length];
        b.style.setProperty('--c', col.c); b.style.setProperty('--c-texte', col.t);
      }
    });
    if (q.cle === 'passions') $('scene-bulle').textContent = bulle(q);
  }

  function majSuivant() {
    var q = Q[index], btn = $('btn-suivant');
    var dernier = modeEdition || index === Q.length - 1;
    btn.firstChild.textContent = dernier ? 'Voir les idées ' : 'Continuer ';
    btn.disabled = q.type !== 'multi' && !aRepondu(q);
  }

  function suivant() {
    T.ecrireStockage(r);
    if (modeEdition || index === Q.length - 1) {
      location.href = 'resultats.html?' + T.versUrl(r);
    } else {
      afficher(index + 1, true);
    }
  }

  $('question-choix').addEventListener('click', function (e) {
    var b = e.target.closest('.choix__btn');
    if (!b || b.disabled) return;
    var q = Q[index], v = b.getAttribute('data-valeur');
    if (q.type === 'multi') {
      var liste = (r[q.cle] || []).slice(), pos = liste.indexOf(v);
      if (pos === -1) liste.push(v); else liste.splice(pos, 1);
      r[q.cle] = liste.slice(0, q.max);
      T.ecrireStockage(r);
      majChoix(); majSuivant();
    } else {
      r[q.cle] = v;
      T.ecrireStockage(r);
      majChoix(); majSuivant();
      minuteur = setTimeout(suivant, 280); // petit temps pour voir la sélection
    }
  });

  $('resume').addEventListener('click', function (e) {
    var b = e.target.closest('[data-aller]');
    if (b) afficher(parseInt(b.getAttribute('data-aller'), 10), true);
  });

  $('btn-suivant').addEventListener('click', function () {
    var q = Q[index];
    if (q.type === 'multi' && !aRepondu(q)) r[q.cle] = [];
    suivant();
  });
  $('btn-passer').addEventListener('click', function () {
    var q = Q[index];
    r[q.cle] = q.type === 'multi' ? [] : '';
    suivant();
  });
  $('btn-precedent').addEventListener('click', function () {
    if (index === 0) location.href = 'zone.html';
    else afficher(index - 1, true);
  });

  afficher(index, false);
})();
