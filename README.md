# Tadaaa · site statique

HTML, CSS et JavaScript, sans framework ni étape de compilation.

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : choix rapide Paris / en ligne, occasions, idées du moment |
| `zone.html` | Choix de la zone : À Paris ou En ligne |
| `quiz.html` | Les 6 questions |
| `resultats.html` | Résultats filtrés, avec des filtres pour affiner |

## Comment le quiz filtre le catalogue

| Question | Colonne de l’Excel | Rôle |
|---|---|---|
| 1. Occasion | Occasion | filtre (« Noël et anniversaire » compte pour les deux) |
| 2. Pour qui | Pour qui | filtre |
| 3. Budget | Budget | filtre (tranche exacte) |
| 4. Passions (jusqu’à 3) | Univers | filtre : au moins un univers en commun |
| 5. Caractère | Univers | augmente le score uniquement |
| 6. Objet ou moment | Catégorie | « Un moment à vivre » = Expériences & ateliers |

Zone : **À Paris** = boutiques parisiennes + ateliers Wecandoo. **En ligne** = sites
des boutiques parisiennes + Amazon (les ateliers sont exclus, ils se vivent à Paris).

Les cadeaux qui remplissent les 4 filtres s’affichent en premier. En dessous, « Pour aller plus loin »
montre ceux qui conviennent à la bonne personne mais ratent le budget, l’univers ou l’occasion.

Les boutons « Voir le cadeau » utilisent la colonne **Lien suivi** (s’ouvrent dans un nouvel onglet, `rel="sponsored"`).

## Mettre à jour le catalogue

Après avoir modifié l’Excel (et l’avoir **enregistré**, pour que les formules Budget et Lien suivi soient recalculées) :

```bash
cd site
perl outils/xlsx-vers-json.pl ../Tadaaa-catalogue-Paris-200-cadeaux.xlsx
```

Le script écrit `data/catalogue.json` et sa copie `data/catalogue.js`.
Perl et unzip sont fournis avec macOS : rien à installer.

**Avant la mise en ligne** : les 17 liens Amazon utilisent encore le tag d’exemple
`votretag-21`. Mettez votre vrai tag Amazon Partenaires dans l’onglet Réglages, enregistrez,
puis relancez le script.

## Ouvrir le site

- En ligne (n’importe quel hébergement statique) : le site lit `data/catalogue.json`.
- En double-cliquant sur `index.html` : le navigateur bloque la lecture du JSON en `file://`,
  le site charge alors `data/catalogue.js` à la place.
