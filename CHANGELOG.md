# Changelog

## 3.0.0

Migration de Leaflet vers MapLibre GL JS et des tuiles raster CARTO vers les
tuiles vectorielles OpenFreeMap (style Bright). CARTO a mis fin à son service
de tuiles gratuit et sans clé d’API.

Guide de migration : [docs/MIGRATION-v2-v3.md](./docs/MIGRATION-v2-v3.md).

### Ruptures

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
