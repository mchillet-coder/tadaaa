# Tadaaa · site statique

HTML, CSS et JavaScript, sans framework ni étape de compilation.

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : choix rapide Martinique / en ligne, occasions, boutiques à découvrir |
| `zone.html` | Choix de la zone : En Martinique ou En ligne |
| `quiz.html` | Les 6 questions |
| `resultats.html` | Résultats, avec des filtres pour affiner |

## Les deux zones

**En Martinique** : les 20 boutiques et créateurs de `Tadaaa-boutiques-Martinique.xlsx`
(onglet « Boutiques »). Leurs produits ne sont pas encore relevés, donc le quiz rapproche
les réponses des colonnes de la fiche boutique :

| Question | Colonne de la fiche | Rôle |
|---|---|---|
| 2. Pour qui | Pour qui | filtre (« Tout le monde » convient à tous) |
| 4. Passions | Catégories quiz | filtre : au moins une catégorie en commun (table `cats` dans `commun.js`) |
| 5. Caractère | Catégories quiz | augmente le score uniquement |
| 6. Objet ou moment | Catégories quiz | « Un moment à vivre » = boutiques avec « Expériences & ateliers » |

Le budget et l’occasion ne filtrent pas encore ces boutiques : le filtre budget est grisé.
Les boutiques qui ne cochent pas tout restent visibles sous « Les autres boutiques de l’île ».
Le bouton mène au site de la boutique, sinon à son Instagram, sinon à son Facebook, sinon à son téléphone.
Pour le rhum et les liqueurs, la carte affiche le message sanitaire de la loi Évin.

**En ligne** : les 190 idées à commander du catalogue `Tadaaa-catalogue-Paris-200-cadeaux.xlsx`
(sites des boutiques parisiennes + Amazon), plus les boutiques de l’île qui vendent en ligne.

| Question | Colonne du catalogue | Rôle |
|---|---|---|
| 1. Occasion | Occasion | filtre (« Noël et anniversaire » compte pour les deux) |
| 2. Pour qui | Pour qui | filtre |
| 3. Budget | Budget | filtre (tranche exacte) |
| 4. Passions (jusqu’à 3) | Univers | filtre : au moins un univers en commun |
| 5. Caractère | Univers | augmente le score uniquement |
| 6. Objet ou moment | Catégorie | « Un moment à vivre » = Expériences & ateliers |

Les boutons « Voir le cadeau » utilisent la colonne **Lien suivi** (nouvel onglet, `rel="sponsored"`).

## Mettre à jour les données

Après avoir modifié un des fichiers Excel (et l’avoir **enregistré**) :

```bash
cd site
perl outils/xlsx-vers-json.pl ../Tadaaa-catalogue-Paris-200-cadeaux.xlsx ../Tadaaa-boutiques-Martinique.xlsx
```

Le script écrit `data/catalogue.json` et sa copie `data/catalogue.js`.
Perl et unzip sont fournis avec macOS : rien à installer.

Seules les colonnes utiles aux visiteurs sont publiées. Les colonnes de démarchage
(contact, statut, « Pourquoi pour Tadaaa », source) restent dans l’Excel.
Dans « Notes », seules les informations pratiques (rendez-vous, appeler avant) sont reprises.

**Avant la mise en ligne** : les 17 liens Amazon utilisent encore le tag d’exemple
`votretag-21`. Mettez votre vrai tag Amazon Partenaires dans l’onglet Réglages, enregistrez,
puis relancez le script.

## Ouvrir le site

- En ligne (n’importe quel hébergement statique) : le site lit `data/catalogue.json`.
- En double-cliquant sur `index.html` : le navigateur bloque la lecture du JSON en `file://`,
  le site charge alors `data/catalogue.js` à la place.
