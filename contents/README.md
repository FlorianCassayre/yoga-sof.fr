# Contenus du site

Ce répertoire contient les contenus modifiables du site.

Ce fichier `README.md` sert uniquement de documentation ; il n'apparait pas sur le site et ne devrait pas être modifié. 

## Types de fichiers

Deux types de fichiers sont modifiables : `.mdx` et `.tsx`/`.ts`.

### Fichiers `.mdx`

[MDX](https://mdxjs.com/) est une extension de [Markdown](https://fr.wikipedia.org/wiki/Markdown), un langage de balisage léger.
La principale différence de MDX est qu'il est capable d'interagir avec React, le framework utilisé pour développer l'interface.
Ainsi, il est possible d'y importer des composants écrits en React ou bien d'importer ce fichier dans React.

La syntaxe applicable est partiellement décrite [ici](https://docs.github.com/fr/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).
En principe seules les fonctionnalités de formatage de base sont réellement utiles.

### Fichiers `.tsx`

Il s'agit de code source [TypeScript](https://www.typescriptlang.org/fr/) étendu pour supporter les balises React.

Le code ne devrait pas être modifié, seulement le contenu.

### Images

Les images se trouvent dans un autre répertoire : [`public/images`](https://github.com/FlorianCassayre/yoga-sof.fr/tree/master/public/images)

Elles ne peuvent malheureusement pas être modifiée/complétées depuis l'éditeur proposé par GitHub, il faut faire une demande.

## Proposer une modification depuis GitHub

Merci de suivre les étapes suivantes pour proposer une modification :

1. Depuis GitHub, se rendre dans le répertoire [`FlorianCassayre/yoga-sof.fr/contents`](https://github.com/FlorianCassayre/yoga-sof.fr/tree/master/contents)
   * Vérifier que vous vous trouvez sur `FlorianCassayre/yoga-sof.fr`, et non sur votre _fork_ personnel (~~`VOTRE_NOM/yoga-sof.fr`~~). Le lien ci-dessus mène vers le bon dépôt
2. Identifier le fichier à modifier et cliquer dessus
3. Cliquer sur l'icône crayon en haut à droite pour ouvrir l'éditeur. Un message bleu devrait apparaître en haut indiquant que les modifications seront appliquées sur votre _fork_
4. Appliquer les modifications souhaitées depuis l'éditeur
5. Optionnellement, ajouter un titre décrivant les changements. Autrement un message par défaut sera utilisé. La description n'est pas nécessaire
6. Cliquer sur "**Propose changes**"
7. La page devrait maintenant s'intituler "**Comparing changes**", les changements s'affichent en bas en utilisant le code couleur suivant :
   * Vert : le contenu a été ajouté
   * Rouge : le contenu a été supprimé
8. Vérifier ces changements et si tout semble correct cliquer sur "**Create pull request**"
9. Le titre et la description sont automatiquement pré-remplis avec les informations entrées précédemment, inutile de les modifier. Enfin, cliquer sur "**Create pull request**"

Un modérateur vérifiera vos changements, et les intègrera prochainement.

Cette méthode ne permet que de modifier un seul fichier à la fois.
Il est possible d'ajouter d'autres changements à partir de l'étape **7** (ou supérieur).
Pour ce faire il faut se placer **dans votre _fork_ personnel** sur la branche ("Switch branches/tags") dans laquelle les changements ont été enregistrés ; généralement celle-ci se nomme `patch-X` (le nom de la branche est affiché à l'écran à partir de l'étape **7**).
Ensuite naviguer dans le répertoire `contents` et répéter la procédure à partir de l'étape **2**
