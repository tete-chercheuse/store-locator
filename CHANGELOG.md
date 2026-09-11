# Changelog

## 3.1.0

Installation sans étape manuelle : `npm install` puis `import`, sans plus rien à
charger à côté.

### Ajouts

- **La feuille de style de MapLibre est embarquée et injectée** à la création de
  la carte. C'était le prérequis qui faisait perdre le plus de temps, et il
  n'était pas franchissable par un `import` depuis le point d'entrée :
  microbundle externalise `maplibre-gl`, sous-chemin CSS compris, et le
  spécificateur nu survivait dans le bundle publié, où aucune importmap ne peut
  le résoudre.

  Elle est insérée en tête de `<head>`, donc avant les feuilles de
  l'application, qui gardent la priorité à spécificité égale — et une seule
  fois, quel que soit le nombre de cartes. Coût : 14,8 ko gzippés sur un bundle
  qui en pesait 15,2. Ce n'est pas du poids net, l'application chargeait déjà ce
  fichier ; on y gagne un aller-retour réseau, on y perd un cache séparé.

  `map.injectCss: false` rend la main. `map.cssNonce` couvre les CSP sans
  `style-src 'unsafe-inline'`, la balise étant en ligne.

- **Les avertissements d'icônes manquantes sont éteints.** Les couches POI
  d'OpenFreeMap Bright tirent le nom de leur icône de la donnée des tuiles —
  `["get","class"]` — et le vocabulaire d'OpenMapTiles dépasse les 264 icônes du
  sprite : `bollard`, `bicycle_parking`, `swimming_pool` n'y sont pas. MapLibre
  journalisait un avertissement par identifiant. L'écart est en amont, le style
  Bright public porte les mêmes expressions.

  Une image 1×1 transparente est désormais fournie pour ces identifiants. Le
  rendu ne change pas — le POI garde son libellé sans pictogramme — seule la
  console se vide. `map.resolveMissingImages: false` restitue les
  avertissements.

- `unresolvedImages: string[]` sur l'instance, qui liste ces identifiants : le
  silence ci-dessus ne doit pas noyer un `addImage` oublié dans l'application.

- **Le worker de MapLibre est livré empaqueté**, et plus rien à recopier dans
  `public/`. MapLibre ne sait pas travailler sans worker — `Dispatcher.initActors`
  lève `No actors found` si le pool est vide, et c'est là que vivent l'analyse
  des tuiles et supercluster — mais il déduit son URL de `import.meta.url` et
  abandonne si ce n'est pas une URL `http(s)`. Webpack réécrivant cette
  expression en `file://`, l'URL retombait sur `''` et `new Worker('')` allait
  chercher la page HTML comme script : carte grise, aucune tuile, aucune erreur
  en console.

  Le worker est empaqueté en un fichier autonome par
  `scripts/bundle-worker.mjs`, puis désigné par
  `new URL('./store-locator-worker.cjs', import.meta.url)`. Webpack 5 et Vite 7
  émettent ce fichier comme asset et réécrivent l'URL — vérifié en construisant
  réellement les deux, puis en ouvrant le résultat ; sans bundler, il est le
  voisin du module publié. **Next.js reste à vérifier** : la documentation de
  MapLibre signale qu'il émet l'asset d'un `new URL` sans son voisin, en mode
  Turbopack comme en `next build --webpack`. Le worker livré ici n'a aucun
  voisin, donc le cas devrait passer, mais la mesure manque. Un seul fichier était
  indispensable : un bundler n'émet pas le graphe d'un `new URL`, et le worker
  d'origine importe `./maplibre-gl-shared.mjs` par un spécificateur relatif.

  Format IIFE et extension `.cjs`, parce que MapLibre décide du type de worker
  sur ce seul suffixe : un worker classique est reconnu partout, là où un worker
  de module demande Firefox 114 ou plus.

  `map.workerUrl` court-circuite le worker livré. Comme le protocole entre les
  deux threads est interne à MapLibre, la librairie refuse son worker si la
  version installée n'est pas sur la même mineure, et le dit en console : un
  message précis vaut mieux qu'une carte grise. Les codes de messages, le
  `RequestResponseMessageMap` publié et les 78 clés du registre de sérialisation
  sont restés identiques de 6.8.0 à 6.9.0, mais rien ne le garantit.

### Corrections

- `extend` écrasait une valeur par défaut avec un `undefined` explicite.
  `new StoreLocator({ stores, map: undefined })` effaçait donc toute la
  configuration de carte et levait sur `initialRecenter` — ce qui arrive dès
  qu'une prop React optionnelle n'est pas passée, `map={props.mapConfig}`.
  `null` reste une valeur signifiante : `markers.icon`, `cssNonce` et
  `workerUrl` l'ont pour défaut.

### Interne

- `maplibre-gl` passe en 6.9.0 côté développement. Le CSS embarqué est
  inchangé, seule sa constante de version bouge.

## 3.0.1

- L'attribution est repliée derrière son bouton ⓘ au chargement. MapLibre
  l'affiche dépliée jusqu'au premier déplacement de la carte, et n'expose aucune
  option pour l'en empêcher : `compact: true` est déjà son défaut et pose les
  deux classes ensemble. Le repli emprunte le chemin de MapLibre lui-même — la
  classe `maplibregl-compact-show` retirée, l'attribut `open` du `<details>`
  laissé en place, comme le fait `_updateCompactMinimize` sur `drag`.

## 3.0.0

Migration de Leaflet vers MapLibre GL JS et des tuiles raster CARTO vers les
tuiles vectorielles OpenFreeMap (style Bright). CARTO a mis fin à son service
de tuiles gratuit et sans clé d’API.

Guide de migration : [docs/MIGRATION-v2-v3.md](./docs/MIGRATION-v2-v3.md).

### Ruptures

- `map.options.minZoom` passe de `2` à `0`. La valeur héritée de la v2 écrasait
  silencieusement le recentrage initial : sur un jeu multi-continental,
  `fitBounds` calculait un zoom de 1,48 qui était ramené à 2, laissant 66 des
  214 magasins du jeu de démonstration hors écran, sans aucun signal. Un
  plancher reste légitime pour un locator régional — c'est désormais à
  l'appelant de le poser.
- `map.clusters.maxZoom` passe de `14` à `11`. Mesuré sur Paris : à 14, un
  cluster de deux ou trois magasins ne s'ouvrait qu'au zoom 15, soit le niveau
  de la rue. À 11, il s'ouvre au zoom 12, niveau du quartier.

- Le paquet est publié en **ESM uniquement** : les formats CommonJS et UMD, les
  champs `main`, `unpkg` et `amdName` sont supprimés. `maplibre-gl@6` ne publie
  lui-même ni l’un ni l’autre.
- `maplibre-gl@^6.8.0` devient une `peerDependency`. Les cinq paquets Leaflet
  sont retirés.
- **WebGL 2** est requis.
- **Le CSS de MapLibre n’est pas importé par la librairie** : c’est à
  l’application de le charger, soit `import 'maplibre-gl/dist/maplibre-gl.css'`
  avec un bundler, soit une balise `<link>` sans bundler. L’importer depuis le
  point d’entrée casserait l’installation sans étape de build, microbundle
  externalisant le sous-chemin CSS d’une dépendance pair. Pour la même raison,
  le `package.json` ne déclare aucun champ `sideEffects`.
- **MapLibre valide les latitudes**, ce que Leaflet ne faisait pas : une
  coordonnée `[lat, lng]` inversée levait jusqu’ici zéro erreur, la projection
  Mercator de Leaflet écrêtant silencieusement à ±85°. Vérifie tes données avant
  de migrer — l’erreur part de `fitBounds()` pendant le chargement du style,
  donc avant que `whenReady()` ne résolve, et le symptôme est une carte figée
  plutôt qu’un message clair.
- `map.options.center` passe de `[latitude, longitude]` à `[longitude, latitude]`.
- `map.tiles` est remplacé par `map.style`, qui accepte une URL ou un objet
  `StyleSpecification`.
- `map.options.gestureHandling` devient `map.options.cooperativeGestures`, natif
  MapLibre. Le comportement maison de la v2 — molette activée au clic, désactivée
  au `mouseout` — disparaît. L’overlay est en anglais par défaut, `map.options.locale`
  le traduit.
- `markers.clustersOptions` devient `map.clusters`, avec les noms d’options
  MapLibre. `showCoverageOnHover` et `spiderfyOnMaxZoom` sont supprimés.
- **Le rayon de regroupement passe de 80 px à 50 px** : la v2 héritait du défaut
  de `leaflet.markercluster`, la v3 prend celui de MapLibre. `clusters: { radius: 80 }`
  restaure le rendu précédent.
- Le contrat des icônes est aligné sur `MarkerOptions` : `iconUrl` → `url`,
  `iconSize` → `size`, `iconAnchor` → `anchor`, `popupAnchor` supprimé. Les
  instances `L.Icon` et `L.DivIcon` cèdent la place à un `HTMLElement` ou à la
  clé `element`.
- Le contrat des popups est aligné sur `PopupOptions` : `maxWidth` devient une
  chaîne CSS, et les instances `L.Popup` ne sont plus acceptées.
- `invalidateSize(options?)` devient `resize()`, sans argument.
  `refreshClusters()` devient `refresh()`.
- La propriété `clusters` de l’instance est supprimée : les clusters sont des
  couches MapLibre, plus un `FeatureGroup`. Ils ne sont plus des nœuds DOM et ne
  sont donc atteignables que par
  `map.queryRenderedFeatures({ layers: ['store-locator-clusters'] })`.
- La librairie ne crée plus de `ResizeObserver` : MapLibre v6 observe le
  conteneur depuis son constructeur.
- Chaque feature reçoit un `id` numérique séquentiel, qui écrase un `id` racine
  fourni par l’appelant. L’identifiant métier reste dans `properties`.
- Les déclarations de types écrites à la main dans `types/` sont supprimées au
  profit de celles générées dans `dist/`.

### Ajouts

- Le style par défaut est désormais **embarqué** : une variante de OpenFreeMap
  Bright, dans `src/styles/default-style.ts`, régénérable par
  `node scripts/import-style.mjs`. Un aller-retour réseau de moins au premier
  affichage, pour 4,8 ko gzippés. `OPENFREEMAP_BRIGHT` reste exporté.
- Le décalage de la popup est dérivé de la géométrie de l'icône. MapLibre ne le
  fait que pour son marqueur par défaut : avec un élément fourni, la popup
  s'ancrait sur la coordonnée, donc par-dessus l'icône. Le principe de
  `popupAnchor` de Leaflet est ainsi rétabli, sous forme d'une table indexée par
  ancrage pour que le placement reste correct quand la popup bascule.

- `whenReady(): Promise<StoreLocator>`, nécessaire car MapLibre ne reçoit ses
  couches qu’après le chargement du style. Résout aussi sur `destroy()`, pour ne
  laisser aucun appelant en attente.
- Getter `destroyed: boolean`, qui distingue « la carte est prête » de
  « l’instance a été détruite » après `whenReady()`.
- Côté React, `onReady` se déclenche après le chargement du style et non plus
  après la construction ; `ready` suit.
- `map.navigation` (`true` par défaut) ajoute un `NavigationControl` : MapLibre
  n’ajoute aucun contrôle de zoom de lui-même.
- `map.fitBoundsOptions`, avec pour défaut `{ padding: 48, maxZoom: 16 }`. Le
  `maxZoom` évite qu’un filtrage jusqu’à un unique magasin, dont l’emprise est
  dégénérée, ne projette au niveau du bâtiment sur des tuiles surzoomées.
- Un clic sur un cluster zoome dessus via `getClusterExpansionZoom()`.
- Les clusters se stylisent par options ou par expressions MapLibre pilotées par
  les données (`color`, `size`, `strokeColor`, `strokeWidth`, `textColor`,
  `textSize`, `textFont`).
- La constante `OPENFREEMAP_BRIGHT` est exportée par le point d’entrée principal.

### Interne

- Découpage de `src/store-locator.ts` en modules dédiés sous `src/map/` et
  `src/utils/`.
- Le filtrage, le calcul de bounds et la normalisation des icônes et popups sont
  des modules purs, testés sans mock.
- Les marqueurs DOM des points non clusterisés sont synchronisés avec les tuiles
  chargées, avec détection d’un `id` réutilisé désignant un autre magasin.
- Les rafraîchissements demandés avant le chargement du style sont mis en file et
  **fusionnés**, pour que le recentrage initial survive à un `setFilters()`.
- La sonde `_leaflet_id` du garde-fou « conteneur déjà initialisé » est remplacée
  par un `WeakSet`, qui n’écrit pas dans le DOM.
- 31 des 214 features du jeu de données de démonstration portaient des
  coordonnées inversées, corruption préexistante révélée par la validation
  MapLibre.
