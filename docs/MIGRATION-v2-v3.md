# Migration `store-locator` v2 → v3

La v3 remplace Leaflet par MapLibre GL JS et les tuiles raster CARTO par les
tuiles vectorielles OpenFreeMap (style Bright). C’est une rupture assumée :
l’API publique est alignée sur MapLibre, sans alias de compatibilité.

Ce guide est ordonné par ce qui te coûtera le plus cher. Les trois premières
sections décrivent des pannes silencieuses — pas d’erreur de compilation, pas de
message clair — dont la dernière peut geler ta carte sans rien afficher dans la
console.

## Avant de commencer

| À vérifier | Pourquoi |
|---|---|
| Tes coordonnées sont dans les bornes | MapLibre les valide, Leaflet non → [§1](#1-vérifie-tes-coordonnées-avant-tout-le-reste) |
| Ton projet est en ESM | Le paquet ne publie plus ni CommonJS ni UMD → [§2](#2-dépendances-et-format-du-paquet) |
| Tes cibles navigateur ont WebGL 2 | MapLibre GL JS v6 l’exige → [§2](#2-dépendances-et-format-du-paquet) |
| Tu charges le CSS de Leaflet | À retirer, la librairie injecte celui de MapLibre → [§3](#3-le-css-de-maplibre-est-désormais-injecté-par-la-librairie) |

## 1. Vérifie tes coordonnées avant tout le reste

**MapLibre valide les coordonnées. Leaflet ne le faisait pas.** C’est le piège
le plus coûteux de cette migration, parce que le symptôme ne ressemble pas à un
problème de données.

La projection Mercator de Leaflet écrêtait silencieusement les latitudes hors
bornes à ±85° : un magasin dont le `[lat, lng]` était inversé se contentait de
s’afficher au bord de la carte, année après année, sans que personne ne le
remarque. MapLibre, lui, lève :

```text
Invalid LngLat latitude value: must be between -90 and 90
```

Et l’erreur part de deux endroits — `fitBounds()` via le calcul d’emprise, et
`Marker.setLngLat()`. Comme le recentrage initial s’exécute pendant le
chargement du style, **avant que `whenReady()` ne résolve**, ce que tu observes
n’est pas « mes données sont fausses » mais :

- la carte reste au zoom initial, vide,
- `whenReady()` ne résout jamais,
- côté React, `onReady` ne part jamais et `ready` reste à `false`.

Ce n’est pas théorique : **31 des 214 features du jeu de démonstration de ce
dépôt étaient corrompues de cette façon**, sans que ça se voie depuis des
années.

Passe tes données au crible avant de mettre à jour :

```js
const suspects = stores.features.filter((feature) => {
  return Math.abs(feature.geometry.coordinates[1]) > 90;
});

console.log(suspects.length, 'features à coordonnées inversées');
```

Sur des objets plats plutôt que du GeoJSON, la même vérification porte sur les
champs eux-mêmes :

```js
const suspects = stores.filter((store) => Math.abs(store.lat) > 90);
```

Une latitude supérieure à 90 en valeur absolue ne peut être qu’une longitude
rangée au mauvais endroit. Inverse la paire, ne la supprime pas.

> Une longitude hors bornes, elle, ne lève pas : MapLibre enroule les longitudes
> autour du globe. Seule la latitude est validée strictement.

## 2. Dépendances et format du paquet

```bash
npm uninstall leaflet leaflet-gesture-handling leaflet.locatecontrol leaflet.markercluster @types/leaflet
npm install maplibre-gl
```

`maplibre-gl` est désormais une `peerDependency` (`^6.8.0`) : c’est ton
application qui contrôle sa version.

### Le paquet est publié en ESM uniquement

`maplibre-gl@6` est du pur ESM — pas de bundle UMD, pas d’entrée CommonJS.
`store-locator@3` non plus. Les champs `main`, `unpkg` et `amdName` ont disparu
du `package.json`, ainsi que les fichiers `dist/*.js` et `dist/*.umd.js`.

- Un projet bundlé (Vite, Next, Nuxt, Astro, webpack 5) fonctionne sans changement.
- Un projet en CommonJS pur (`require()`) doit migrer vers ESM.
- Un chargement par balise `<script>` doit passer par `<script type="module">`
  et une importmap. Voir [`demo/vanilla/index.html`](../demo/vanilla/index.html).

Les déclarations de types écrites à la main dans `types/` sont supprimées au
profit de celles générées dans `dist/`. Si tu pointais vers `types/…`
directement, retire cette référence : le champ `exports` s’en charge.

### WebGL 2 est requis

MapLibre GL JS v6 exige **WebGL 2**. Les navigateurs sans WebGL 2 ne sont plus
supportés — en pratique, tout ce qui est antérieur à 2017 environ. Il n’existe
pas de repli raster.

## 3. Le CSS de MapLibre est désormais injecté par la librairie

**Rien à charger.** La feuille de style de MapLibre est embarquée depuis la
3.1.0 et injectée à la création de la carte, en tête de `<head>`.

Si ton application v2 chargeait la feuille de Leaflet, retire-la : elle ne sert
plus à rien.

```diff
- import 'leaflet/dist/leaflet.css';
- import 'leaflet.markercluster/dist/MarkerCluster.css';
```

Et n’ajoute pas son équivalent MapLibre : ce serait une seconde copie des mêmes
règles. Si tu préfères la piloter toi-même — CSP stricte, feuille déjà présente
pour d’autres cartes —, `map: { injectCss: false }` rend la main, et
`map: { cssNonce }` couvre le cas du nonce.

<details>
<summary>Pourquoi elle est embarquée en chaîne, et non importée</summary>

microbundle externalise `maplibre-gl`, sous-chemin CSS compris. Un
`import 'maplibre-gl/dist/maplibre-gl.css'` depuis le point d’entrée laisserait
le spécificateur nu survivre tel quel dans le bundle publié — et aucune
importmap ne peut le résoudre, une réponse `text/css` ne pouvant pas être
évaluée comme module script. Cela casserait exactement le chemin d’installation
que le README annonce : depuis GitHub, sans étape de build.

Pour la même raison, le `package.json` ne déclare **aucun champ
`sideEffects`**.
</details>

## 4. Le centre de la carte est inversé

Aucune erreur n’est levée, la carte s’affiche simplement au mauvais endroit.

```js
// v2 — Leaflet : [latitude, longitude]
map: { options: { center: [48.8566, 2.3522] } }

// v3 — MapLibre : [longitude, latitude]
map: { options: { center: [2.3522, 48.8566] } }
```

L’ordre `[longitude, latitude]` est celui du GeoJSON. Les données `stores`, elles,
n’ont pas changé de contrat : les objets plats acceptent toujours `lat`/`lng` (et
leurs variantes `latitude`, `lon`, `longitude`), et les `Feature` GeoJSON étaient
déjà en `[longitude, latitude]`.

## 5. Le fond de carte : `map.tiles` devient `map.style`

```js
// v2
map: {
  tiles: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
    options: { attribution: '…', subdomains: 'abcd' },
  },
}

// v3 — un style vectoriel, URL ou objet StyleSpecification
map: {
  style: 'https://tiles.openfreemap.org/styles/bright',
}
```

C’est le défaut, tu n’as donc rien à écrire pour l’obtenir. La constante est
aussi exportée :

```js
import StoreLocator, { OPENFREEMAP_BRIGHT } from 'store-locator';
```

Les autres styles OpenFreeMap fonctionnent sans code supplémentaire :
`liberty`, `positron`, `dark`, `fiord`. `style` accepte également un objet
`StyleSpecification` complet, donc n’importe quel fournisseur de tuiles
vectorielles.

L’attribution est injectée automatiquement par MapLibre depuis le style. **Ne
la désactive pas** : elle satisfait l’obligation OpenStreetMap / OpenMapTiles.
Elle est aussi plus discrète : là où Leaflet affichait une barre permanente,
elle est repliée derrière son bouton ⓘ au chargement et s’ouvre au clic.

## 6. Icônes

Le contrat est aligné sur les `MarkerOptions` de MapLibre.

| v2 (`L.IconOptions`) | v3 |
|---|---|
| `iconUrl` | `url` |
| `iconSize: [40, 44]` | `size: [40, 44]` |
| `iconAnchor: [20, 44]` | `anchor: 'bottom'` |
| `popupAnchor: [0, -44]` | à supprimer : l’ancrage du pin suffit |
| `tooltipAnchor` | supprimé, MapLibre n’a pas de tooltip |
| `iconRetinaUrl`, `shadowUrl`, `shadowSize`, `shadowAnchor`, `shadowRetinaUrl` | supprimés |
| instance `L.Icon` / `L.DivIcon` | un `HTMLElement`, ou `{ element }` |
| `className` | `className`, inchangé |
| — | `offset`, `rotation`, nouveaux (`MarkerOptions`) |

```js
// v2
icon: (feature) => ({
  iconUrl: feature.properties.icon,
  iconSize: [40, 44],
  iconAnchor: [20, 44],
  popupAnchor: [0, -44],
})

// v3
icon: (feature) => ({
  url: feature.properties.icon,
  size: [40, 44],
  anchor: 'bottom',
})
```

La librairie n’impose aucun ancrage implicite. Sans `anchor`, l’ancrage MapLibre
par défaut (`center`) s’applique, ce qui centre l’image sur la coordonnée — pour
un pin, on veut presque toujours `anchor: 'bottom'`.

`icon` accepte toujours une URL en chaîne, un `HTMLElement`, un objet d’options,
ou une factory recevant la feature. Un objet sans `url` ni `element` ne produit
aucune icône : le marqueur retombe alors sur le pin par défaut de MapLibre.

## 7. Popups

### Le placement est de nouveau automatique

Leaflet dérivait la position de la popup de `iconSize` et `popupAnchor`.
MapLibre ne le fait que pour son propre marqueur : avec un élément fourni — le
cas dès que tu passes une icône — la popup s'ancrait sur la coordonnée
elle-même, donc par-dessus l'icône.

La librairie rétablit ce comportement. Dès que `icon.size` est renseigné, la
popup se place juste à l'extérieur de l'icône, du côté correspondant à
l'ancrage retenu par MapLibre. Rien à faire :

```js
markers: {
  icon: () => ({ url: '/pin.svg', size: [40, 44], anchor: 'bottom' }),
  popup: (feature) => feature.properties.store,
}
```

Un `offset` explicite sur la popup reste prioritaire. Et sans `size` — une
icône fournie sous forme d'élément DOM brut, dont les dimensions ne sont pas
mesurables avant insertion — le placement revient à MapLibre.


Le contrat est aligné sur les `PopupOptions` de MapLibre.

| v2 | v3 |
|---|---|
| `maxWidth: 280` | `maxWidth: '280px'`, une chaîne CSS |
| instance `L.Popup` | supprimée : passe une chaîne, un `HTMLElement`, ou un objet |
| `minWidth`, `maxHeight`, `autoPan`, `autoPanPadding`, `keepInView`, `autoClose`, `closeOnEscapeKey` | sans équivalent, supprimés |

Les champs disponibles sont ceux de `PopupOptions` : `anchor`, `offset`,
`className`, `maxWidth`, `closeButton`, `closeOnClick`, `closeOnMove`,
`focusAfterOpen`, `padding`, `subpixelPositioning`. La clé `content` reste la
convention de la librairie pour le contenu.

```js
// v3
popup: {
  content: '<strong>Ma boutique</strong>',
  maxWidth: '280px',
}
```

## 8. Clustering

Les options quittent `markers.clustersOptions` pour `map.clusters`, avec les
noms MapLibre.

```js
// v2
markers: {
  clustersOptions: {
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: false,
    disableClusteringAtZoom: 15,
  },
}

// v3
clusters: {
  enabled: true,
  radius: 50,
  maxZoom: 11,      // plus bas que l’équivalent v2, voir ci-dessous
  minPoints: 2,
}
```

`showCoverageOnHover` et `spiderfyOnMaxZoom` n’ont **aucun équivalent** MapLibre
et ont été supprimés. Un clic sur un cluster zoome dessus, via
`getClusterExpansionZoom()`.

⚠️ **Le rayon de regroupement change de valeur.** La v2 ne surchargeait jamais
`maxClusterRadius`, elle héritait donc du défaut de `leaflet.markercluster`,
**80 px**. Le défaut v3 est **50 px**, celui de MapLibre. À zoom égal, tu
obtiendras donc des clusters plus nombreux et plus petits. Pour retrouver le
rendu v2 :

```js
clusters: { radius: 80 }
```

**Le zoom de dégroupement change aussi.** L’équivalent exact de
`disableClusteringAtZoom: 15` serait `maxZoom: 14` :
`leaflet.markercluster` calcule en interne `disableClusteringAtZoom - 1`, et
MapLibre regroupe jusqu’à `clusterMaxZoom` inclus. À z14 les deux regroupent,
à z15 les deux dégroupent.

Le défaut v3 est pourtant **11**, volontairement plus bas. Mesuré sur Paris avec
`maxZoom: 14`, un cluster de deux ou trois magasins ne s’ouvrait qu’au zoom 15,
soit le niveau de la rue — il fallait donc zoomer à fond pour voir des points
que le compteur annonçait à deux. À 11, il s’ouvre au zoom 12, niveau du
quartier. Pour retrouver strictement le comportement v2 :

```js
clusters: { radius: 80, maxZoom: 14 }
```

### Le plancher de zoom a disparu

`map.options.minZoom` passe de `2` à `0`, et c’est une correction, pas un
réglage. Le plancher hérité de la v2 écrasait silencieusement le recentrage
initial : sur un jeu de données multi-continental, `fitBounds` calculait
correctement un zoom de 1,48, que le plancher ramenait à 2 — laissant 66 des
214 magasins du jeu de démonstration hors écran, sans le moindre avertissement.

Si tes magasins tiennent dans une région, un plancher reste utile pour empêcher
l’utilisateur de dézoomer jusqu’à la vue mondiale. Pose-le toi-même, en
vérifiant qu’il laisse passer le recentrage :

```js
map: { options: { minZoom: 4 } }
```

### Les clusters ne sont plus des nœuds DOM

Ils sont rendus par des couches MapLibre, sur GPU. Ils se stylisent donc par
options — y compris par expressions MapLibre pilotées par les données — plutôt
qu’en CSS :

```js
clusters: {
  color: ['step', ['get', 'point_count'], '#60a5fa', 10, '#2563eb', 50, '#1e3a8a'],
  size:  ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
  strokeColor: '#ffffff',
  strokeWidth: 2,
  textColor: '#ffffff',
  textSize: 12,
  textFont: ['Noto Sans Regular'],
}
```

`textFont` doit désigner une police présente dans les glyphes du style chargé.
Le défaut, `Noto Sans Regular`, est la pile la plus utilisée du style Bright et
son endpoint de glyphes la sert. Si tu changes de style, vérifie sa liste de
polices : une police absente se manifeste par une erreur console explicite et un
compteur vide.

**Conséquence pour tes tests et ton CSS :** tout sélecteur visant
`.marker-cluster` est mort. Un cluster n’est plus atteignable que par l’API de
la carte :

```js
instance.map.queryRenderedFeatures({ layers: ['store-locator-clusters'] });
```

Les points **non** clusterisés, eux, restent des marqueurs DOM
(`.maplibregl-marker`), synchronisés par la librairie au fil des déplacements.

Trois couches et une source sont ajoutées, avec des identifiants stables :

| Identifiant | Rôle |
|---|---|
| `store-locator` | la source GeoJSON clusterisée |
| `store-locator-clusters` | les bulles de cluster |
| `store-locator-cluster-count` | le compteur |
| `store-locator-points` | couche invisible sur les points non clusterisés |

## 9. Méthodes renommées, supprimées, ajoutées

| v2 | v3 |
|---|---|
| `invalidateSize(options?)` | `resize()`, sans argument |
| `refreshClusters(filters?, recenter?, maxZoom?)` | `refresh(filters?, recenter?, maxZoom?)` |
| propriété `clusters` | **supprimée** : les clusters sont des couches, plus un `FeatureGroup` |
| — | `whenReady(): Promise<StoreLocator>` **nouveau** |
| — | getter `destroyed: boolean` **nouveau** |

`setStores()`, `setFilters()` et `destroy()` gardent leur signature.

`resize()` reste utile, mais rarement : **la librairie ne crée plus de
`ResizeObserver`.** MapLibre v6 observe le conteneur lui-même, depuis son
constructeur. L’appel manuel ne sert donc plus qu’aux cas où l’observation ne
suffit pas — révéler une carte dans un panneau auparavant masqué, par exemple.

## 10. L’initialisation est désormais asynchrone

MapLibre ne peut recevoir ses couches qu’après avoir chargé son style. Le
constructeur reste synchrone et les appels antérieurs sont mis en file
d’attente, mais toute lecture de l’état de la carte doit attendre :

```js
const locator = new StoreLocator({ stores });

await locator.whenReady();
// La source et les couches existent seulement à partir d'ici.
```

`whenReady()` résout aussi si `destroy()` est appelé avant le chargement du
style, afin de ne laisser aucun appelant en attente. Le getter `destroyed`
permet de distinguer les deux cas :

```js
const instance = await locator.whenReady();

if(instance.destroyed) {
  return;
}
```

Côté React, `onReady` se déclenche maintenant après le chargement du style, et
non plus après la construction. `ready` ne passe à `true` qu’à ce moment.

## 11. Gestes coopératifs

```js
// v2 — via leaflet-gesture-handling
map: { options: { gestureHandling: true } }

// v3 — natif MapLibre
map: { options: { cooperativeGestures: true } }
```

C’est le défaut dans les deux versions. En v2, la librairie ajoutait en plus un
comportement maison — molette activée au clic, désactivée au `mouseout` — qui
disparaît : `cooperativeGestures` le remplace entièrement.

**L’overlay de MapLibre est en anglais par défaut.** Passe un `locale` pour le
traduire :

```js
map: {
  options: {
    locale: {
      'CooperativeGesturesHandler.WindowsHelpText': 'Utilisez Ctrl + molette pour zoomer',
      'CooperativeGesturesHandler.MacHelpText': 'Utilisez ⌘ + molette pour zoomer',
      'CooperativeGesturesHandler.MobileHelpText': 'Utilisez deux doigts pour déplacer la carte',
    },
  },
}
```

[`demo/vanilla/main.js`](../demo/vanilla/main.js) en montre un exemple complet.

## 12. Autres changements

- **`map.navigation` est un nouveau défaut à `true`.** MapLibre n’ajoute aucun
  contrôle de zoom de lui-même, contrairement à Leaflet. Passe `false` si tu
  fournis tes propres boutons.
- **`map.locate` est inchangé**, mais s’appuie désormais sur le
  `GeolocateControl` de MapLibre plutôt que sur `leaflet.locatecontrol`. Les
  classes CSS du bouton changent en conséquence.
- **`map.fitBoundsOptions` est nouveau**, avec pour défaut
  `{ padding: 48, maxZoom: 16 }`. Le `padding` évite que les pins collent aux
  bords lors du recentrage ; il accepte un nombre ou un objet
  `{ top, bottom, left, right }`, utile quand un panneau de filtres masque un
  côté de la carte. Le `maxZoom` plafonne le recentrage : sans lui, filtrer
  jusqu’à un unique magasin donne une emprise dégénérée et `fitBounds` retombe
  sur le `maxZoom` de la carte, soit 18, ce qui projette au niveau du bâtiment
  sur des tuiles surzoomées.
- **Chaque feature reçoit un `id` numérique séquentiel** à la racine du GeoJSON,
  qui **écrase systématiquement** un `id` racine fourni par l’appelant. C’est la
  clé de diff des marqueurs. Ton identifiant métier reste intact dans
  `properties`. Conséquence : l’`id` étant positionnel, réordonner les mêmes
  stores reconstruit tous les marqueurs.
- **Réutiliser un conteneur lève toujours une erreur**, mais la sonde a changé :
  un `WeakSet` interne remplace la lecture de `_leaflet_id` sur l’élément. Le
  message est identique, et `destroy()` libère le conteneur.

## 13. Le contenu des popups n’est toujours pas assaini

`markers.popup` injecte le HTML fourni via `Popup.setHTML()`, sans
assainissement — comme en v2. Si ton contenu provient de données non maîtrisées,
assainis-le avant, ou passe un `HTMLElement` construit avec `textContent`.
