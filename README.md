# impact-nva-demos — les démos de sites clients

Ce dépôt **sert des pages en ligne** (GitHub Pages, branche `main`).
Chaque sous-dossier est une démo fabriquée par **Braise**
(dépôt `impact-nva-braise`) et porte le nom d'un prospect suivi d'un code
aléatoire.

## Pourquoi un dépôt à part

Les démos ne vivent pas dans `site-paysagiste`, qui sert le site de vente
`impact-nva.fr`. Trois raisons :

1. **Le site de vente ne doit pas bouger** pour qu'une démo existe.
2. Une démo par prospect, c'est des dizaines de dossiers à terme.
3. Une démo n'est **pas** le site de vente : elle doit pouvoir vivre sous
   son propre sous-domaine.

## Ce qu'une démo contient — et ce qu'elle ne contient jamais

| Toujours | Jamais |
|---|---|
| `noindex` sur chaque page | un `robots.txt` ou un `sitemap.xml` (ils ne sont lus qu'à la racine d'un domaine) |
| formulaire inactif (`action=""`) | un prix, un lien Stripe |
| un code aléatoire dans l'adresse | une clé, un jeton, un secret |

Le code aléatoire sert à ce que **deux prospects concurrents du même secteur
ne puissent pas deviner l'adresse l'un de l'autre**. Il ne rend pas le lien
secret pour autant : qui le reçoit peut le transmettre. **Ne jamais mettre
dans une démo ce qu'on ne pourrait pas montrer à un tiers.**

## Ajouter une démo

Depuis le dépôt `impact-nva-braise` :

```bash
node outils/nouvelle-demo.js <donnees.json> --gabarit prestige --complet --domaine lepessotloic-sketch.github.io/impact-nva-demos --sortie ../impact-nva-demos
```

Puis une branche et une *pull request* — **jamais de poussée directe sur
`main`**, qui sert les pages en ligne.

## Les adresses

| | |
|---|---|
| aujourd'hui | `https://lepessotloic-sketch.github.io/impact-nva-demos/<démo>/` |
| le jour où le sous-domaine existe | `https://demo.impact-nva.fr/<démo>/` |

Le sous-domaine demande **un enregistrement DNS** chez le fournisseur du
domaine, puis un fichier `CNAME` à la racine de ce dépôt. Tant que le DNS
n'est pas posé, **ne pas ajouter le fichier `CNAME`** : GitHub Pages
basculerait sur le sous-domaine absent et l'adresse qui marche cesserait de
marcher.
