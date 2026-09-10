# Store Locator

`store-locator` est une librairie front-end basée sur MapLibre GL JS qui permet de créer rapidement une carte interactive de points de vente avec:

- fond de carte vectoriel OpenFreeMap, sans clé d’API ni quota
- clustering des marqueurs sur GPU
- popups et icônes personnalisables
- filtres HTML natifs
- support GeoJSON ou tableaux d’objets géolocalisés
- intégration TypeScript
- intégration React via une entrée dédiée

## Sommaire

- [Installation](#installation)
- [Prérequis](#prérequis)
- [Entrées du package](#entrées-du-package)
- [Fond de carte](#fond-de-carte)
- [Lancer les démos](#lancer-les-démos)
- [Format des données `stores`](#format-des-données-stores)
- [Exemple JavaScript vanilla](#exemple-javascript-vanilla)
- [Exemple TypeScript](#exemple-typescript)
- [Exemples React](#exemples-react)
- [Clustering](#clustering)
- [API de la classe `StoreLocator`](#api-de-la-classe-storelocator)
- [Options disponibles](#options-disponibles)
- [Scripts de développement et de test](#scripts-de-développement-et-de-test)
- [Migration depuis la v2](#migration-depuis-la-v2)

## Installation

```bash
npm install tete-chercheuse/store-locator maplibre-gl
```

`maplibre-gl` est une `peerDependency` : ton application contrôle sa version.

Si tu utilises l’entrée React, `react` doit déjà être installé:

```bash
npm install react
```

## Prérequis

### Charge le CSS de MapLibre toi-même

**La librairie n’importe pas la feuille de style de MapLibre.** C’est le point
qui fait perdre le plus de temps : sans elle, la carte s’affiche mais les
contrôles de zoom sont empilés sans mise en forme, les popups sont mal
positionnées et l’attribution est illisible.

Avec un bundler:

```js
import 'maplibre-gl/dist/maplibre-gl.css';
```

Sans bundler:

```html
<link href="node_modules/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet">
```

L’importer depuis le point d’entrée casserait l’installation sans étape de
build: microbundle externalise `maplibre-gl`, sous-chemin CSS compris, et le
spécificateur nu survivrait tel quel dans le bundle publié, où aucune importmap
ne peut le résoudre.

### ESM uniquement

Le package ne publie ni CommonJS ni UMD, comme `maplibre-gl@6`. Un projet en
`require()` pur doit migrer. Sans bundler, passe par `<script type="module">` et
une importmap — voir [`demo/vanilla/index.html`](./demo/vanilla/index.html).

### WebGL 2

Requis par MapLibre GL JS v6. Il n’existe pas de repli raster.

## Entrées du package

Le package expose deux points d’entrée:

- `store-locator`
  Utilisation du cœur de la librairie, en JavaScript ou TypeScript.
- `store-locator/react`
  Utilisation via `StoreLocatorMap` et `useStoreLocator`.

## Fond de carte

Le style par défaut est **embarqué dans la librairie** : une variante de
OpenFreeMap Bright, dans `src/styles/default-style.ts`. Sources, glyphes et
sprite pointent tous sur [OpenFreeMap](https://openfreemap.org) — sans clé
d'API, sans quota, usage commercial autorisé.

Il est embarqué plutôt que référencé par URL : c'est un aller-retour réseau de
moins sur le chemin critique du premier affichage, pour 4,8 ko gzippés.

### Modifier le style

Édite-le dans [Maputnik](https://maputnik.github.io), exporte le JSON, puis :

```bash
node scripts/import-style.mjs ~/Downloads/mon-style.json
```

Le script valide le style, écarte les clés que Maputnik ajoute hors
spécification, normalise ce que les types de MapLibre refusent alors que son
parseur l'accepte, et réécrit le module. Il affiche les polices utilisées :
`clusters.textFont` doit en faire partie, sinon le compteur des clusters ne
s'affichera pas.

### Utiliser un autre style

`map.style` accepte une URL ou un objet `StyleSpecification` complet, donc
n'importe quel fournisseur de tuiles vectorielles. Le style Bright public reste
exporté :

```js
import StoreLocator, { OPENFREEMAP_BRIGHT } from 'store-locator';

new StoreLocator({ stores, map: { style: OPENFREEMAP_BRIGHT } });
```

Les autres styles publics d'OpenFreeMap fonctionnent aussi : `liberty`,
`positron`, `dark`, `fiord`.

MapLibre injecte automatiquement l'attribution portée par le style. **Ne la
désactive pas** : elle satisfait l'obligation OpenStreetMap et OpenMapTiles.

## Lancer les démos

Une page d’accueil regroupe les deux démos:

```bash
npm run demo
```

Ensuite:

- démo vanilla: `http://127.0.0.1:4173/vanilla/`
- démo React: `http://127.0.0.1:4173/react/`

La commande s’appuie sur un petit serveur Node natif, sans dépendance.

Si tu veux reconstruire les bundles ESM pendant le développement de la démo
vanilla, lance aussi:

```bash
npm run watch
```

## Format des données `stores`

`stores` accepte trois formats:

1. un `FeatureCollection` GeoJSON
2. un tableau de `Feature<Point>`
3. un tableau d’objets simples avec coordonnées

Les coordonnées peuvent être fournies avec l’une de ces combinaisons:

- `lat` / `lng`
- `lat` / `lon`
- `lat` / `longitude`
- `latitude` / `lng`
- `latitude` / `lon`
- `latitude` / `longitude`

Exemple minimal:

```ts
const stores = [
  {
    store: 'Maison Rivera',
    category: 'Bakery',
    lat: 16.2411,
    lng: -61.5336,
  },
];
```

Sur un `Feature` GeoJSON, l’ordre est celui de la norme, `[longitude, latitude]`.

> ⚠️ **MapLibre valide les latitudes.** Une paire inversée lève
> `Invalid LngLat latitude value` pendant le chargement du style, avant que
> `whenReady()` ne résolve — le symptôme est donc une carte figée au zoom
> initial, pas un message clair. Filtre tes données sur
> `Math.abs(coordinates[1]) > 90` en cas de doute.

Chaque feature reçoit un `id` numérique séquentiel à la racine du GeoJSON, qui
sert de clé de diff aux marqueurs et **écrase** un `id` racine que tu
fournirais. Ton identifiant métier reste intact dans `properties`.

## Exemple JavaScript vanilla

Exemple complet: [examples/vanilla/basic.js](./examples/vanilla/basic.js)

Markup HTML:

```html
<div class="store-locator">
  <form class="store-locator-filters">
    <label>
      <input checked name="category" type="radio" value="">
      Tout
    </label>
    <label>
      <input name="category" type="radio" value="Bakery">
      Boulangeries
    </label>
    <label>
      <input name="category" type="radio" value="Coffee">
      Cafes
    </label>
  </form>
  <div id="store-locator-map"></div>
</div>
```

Initialisation:

```js
import StoreLocator from 'store-locator';
import 'maplibre-gl/dist/maplibre-gl.css';

new StoreLocator({
  stores,
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters',
  },
  map: {
    locate: true,
    markers: {
      popup: (feature) => feature.properties.store,
    },
  },
});
```

L’overlay des gestes coopératifs de MapLibre est en anglais par défaut. Pour une
page française, passe un `locale`:

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

[`demo/vanilla/main.js`](./demo/vanilla/main.js) en montre un exemple complet.

## Exemple TypeScript

Exemple complet: [examples/typescript/basic.ts](./examples/typescript/basic.ts)

Le cœur de la librairie est écrit en TypeScript et peut être utilisé dans un projet strictement typé:

```ts
import StoreLocator from 'store-locator';
import 'maplibre-gl/dist/maplibre-gl.css';

type DemoStore = {
  id: string;
  store: string;
  category: 'Bakery' | 'Coffee';
  address: string;
  city: string;
  country: string;
  icon: string;
  lat: number;
  lng: number;
};

const storeLocator = new StoreLocator<DemoStore>({
  stores,
  elements: {
    wrapper: document.querySelector<HTMLElement>('.store-locator'),
    filters: document.querySelector<HTMLFormElement>('.store-locator-filters'),
    map: document.getElementById('store-locator-map'),
  },
  map: {
    locate: true,
    markers: {
      popup: (feature) => feature.properties.store,
      icon: (feature) => ({
        url: feature.properties.icon,
        size: [40, 44],
        // Sans ancrage explicite, MapLibre centre l’image sur la coordonnée.
        // Pour un pin, on veut sa pointe en bas.
        anchor: 'bottom',
      }),
    },
  },
});

await storeLocator.whenReady();
```

Pour les intégrations React, Next.js ou les projets où tu veux éviter d’importer directement `maplibre-gl`, `markers.icon` accepte aussi directement:

- une URL `string`
- un `HTMLElement`
- un objet aligné sur `MarkerOptions` (`url`, `size`, `element`, `anchor`, `offset`, `className`, `rotation`)
- une factory qui retourne l’une de ces formes

Le même principe s’applique à `markers.popup`, qui accepte:

- une `string`
- un `HTMLElement`
- un objet aligné sur `PopupOptions` avec une clé `content`
- une factory qui retourne l’une de ces formes

Exemple Next.js avec un asset statique:

```tsx
import markerPin from '@/public/marker-store.svg';

const stores = useMemo(() => rawStores, [rawStores]);

<StoreLocatorMap
  stores={stores}
  options={{
    map: {
      markers: {
        icon: {
          url: markerPin.src,
          size: [40, 44],
          anchor: 'bottom',
        },
        popup: {
          content: '<strong>Ma boutique</strong>',
          maxWidth: '280px',
        },
      },
    },
  }}
/>
```

> ⚠️ `maxWidth` est une chaîne CSS côté MapLibre, pas un nombre.

## Exemples React

Le package expose une entrée dédiée:

```tsx
import { StoreLocatorMap, useStoreLocator } from 'store-locator/react';
```

### Composant `StoreLocatorMap`

Exemple complet: [examples/react/StoreLocatorMapExample.tsx](./examples/react/StoreLocatorMapExample.tsx)

> ⚠️ **Important — mémoïsation de `stores`** : si tu passes `stores` en littéral inline (`stores={[{ lat, lng }]}`), une nouvelle référence est créée à chaque render du composant parent. Le hook interne appelle alors `setStores()` à chaque render, ce qui réattribue tous les `id` et reconstruit tous les marqueurs — coûteux et potentiellement source d’état incohérent pendant une interaction utilisateur (drag, zoom).
>
> Mémoïse toujours `stores` avec `useMemo` dès qu’il provient de props ou d’un état amont :
>
> ```tsx
> const stores = useMemo(
>   () => rawData.map((item) => ({ lat: item.lat, lng: item.lng, ...item })),
>   [rawData]
> );
> ```

```tsx
import { StoreLocatorMap } from 'store-locator/react';
import 'maplibre-gl/dist/maplibre-gl.css';

export function StoresMap({ stores }) {
  return (
    <StoreLocatorMap
      stores={stores}
      mapStyle={{ minHeight: 480 }}
      options={{
        map: {
          locate: true,
          markers: {
            popup: (feature) => feature.properties.name,
          },
        },
      }}
      onReady={(instance) => {
        // Se déclenche après le chargement du style MapLibre : la source et les
        // couches n’existent pas avant.
        instance.map?.setMaxZoom(17);
      }}
    >
      <form className="store-locator-filters">{/* filtres */}</form>
    </StoreLocatorMap>
  );
}
```

### Hook `useStoreLocator`

Exemple complet: [examples/react/useStoreLocatorExample.tsx](./examples/react/useStoreLocatorExample.tsx)

> ⚠️ **Important — mémoïsation de `stores`** : avec `useStoreLocator`, une référence instable de `stores` provoque aussi un appel à `setStores()` à chaque render. Le résultat est le même: tous les marqueurs sont reconstruits inutilement, avec un risque accru pendant un drag, un zoom ou une animation.
>
> Si `stores` vient d’un calcul, d’une prop ou d’un état amont, stabilise toujours sa référence avec `useMemo` :
>
> ```tsx
> const stores = useMemo(
>   () => rawData.map((item) => ({ lat: item.lat, lng: item.lng, ...item })),
>   [rawData]
> );
> ```

```tsx
import { useRef } from 'react';
import { useStoreLocator } from 'store-locator/react';
import 'maplibre-gl/dist/maplibre-gl.css';

export function StoresMap({ stores }) {
  const wrapperRef = useRef(null);
  const filtersRef = useRef(null);
  const mapRef = useRef(null);

  const { ready, error } = useStoreLocator({
    stores,
    wrapperRef,
    filtersRef,
    mapRef,
  });

  return (
    <div ref={wrapperRef} aria-busy={!ready}>
      {error && <p role="alert">{error.message}</p>}
      <form ref={filtersRef} className="store-locator-filters">{/* filtres */}</form>
      <div ref={mapRef} style={{ minHeight: 480 }} />
    </div>
  );
}
```

Le hook retourne `{ instance, ready, error }`. `ready` ne passe à `true` qu’après
le chargement du style MapLibre, pas à la construction de l’instance ;
`instance` est disponible dès la construction, mais sa carte n’a ni source ni
couches avant que `ready` ne bascule.

Pour un framework SSR, l’entrée React doit être utilisée côté client.

## Clustering

Le clustering est actif par défaut. Les clusters sont rendus par des couches
MapLibre, sur GPU: ils se stylisent par options, y compris par expressions
MapLibre pilotées par les données.

```js
map: {
  clusters: {
    enabled: true,
    radius: 50,
    maxZoom: 11,
    minPoints: 2,
    color: ['step', ['get', 'point_count'], '#60a5fa', 10, '#2563eb', 50, '#1e3a8a'],
    size:  ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
    textFont: ['Noto Sans Regular'],
  },
}
```

`textFont` doit désigner une police présente dans les glyphes du style chargé.

Un clic sur un cluster zoome dessus. Les points **non** clusterisés restent des
marqueurs DOM (`.maplibregl-marker`), synchronisés au fil des déplacements.

La source et les couches ont des identifiants stables:

| Identifiant | Rôle |
|---|---|
| `store-locator` | la source GeoJSON clusterisée |
| `store-locator-clusters` | les bulles de cluster |
| `store-locator-cluster-count` | le compteur |
| `store-locator-points` | couche invisible sur les points non clusterisés |

Un cluster n’étant pas un nœud DOM, il n’est atteignable que par l’API de la
carte:

```js
instance.map.queryRenderedFeatures({ layers: ['store-locator-clusters'] });
```

## API de la classe `StoreLocator`

### `new StoreLocator(options)`

Crée une nouvelle instance et démarre la carte. Le constructeur est synchrone,
mais la source et les couches n’existent qu’après le chargement du style: les
appels antérieurs sont mis en file d’attente et fusionnés.

Lève si `stores` est absent, si le conteneur n’est pas trouvé, ou si le conteneur
porte déjà une carte vivante — appelle `destroy()` sur l’instance précédente
avant d’en créer une seconde sur le même élément.

### `whenReady()`

Retourne une promesse résolue quand le style MapLibre est chargé et que les
couches sont en place.

```js
const locator = new StoreLocator({ stores });
await locator.whenReady();
```

La promesse résout aussi si `destroy()` est appelé avant, pour ne laisser aucun
appelant en attente. Le getter `destroyed` distingue les deux cas.

### `setStores(stores, filters?, recenter?, maxZoom?)`

Remplace les données affichées et rafraîchit la carte.

### `setFilters(filters?, wrapper?)`

Associe ou réassocie le formulaire de filtres.

`filters` peut être:

- un sélecteur CSS
- un élément `HTMLFormElement`
- `null`

`wrapper` peut être:

- un sélecteur CSS
- un élément HTML
- `null`

### `refresh(filters?, recenter?, maxZoom?)`

Réapplique les filtres à la source et resynchronise les marqueurs.

### `resize()`

Relance le calcul de taille de la carte. Rarement nécessaire: MapLibre observe
déjà le conteneur depuis son constructeur. Utile pour les cas qui échappent à
cette observation, comme révéler une carte dans un panneau auparavant masqué.

### `destroy()`

Supprime les écouteurs d’événements, détruit la carte et libère le conteneur.

### Propriétés publiques

| Propriété | Type | Rôle |
|---|---|---|
| `map` | `Map \| null` | l’instance MapLibre, pour tout ce que la librairie n’expose pas |
| `filters` | `HTMLFormElement \| null` | le formulaire de filtres associé |
| `options` | `StoreLocatorResolvedOptions` | les options après fusion avec les défauts |
| `destroyed` | `boolean` | `true` dès que `destroy()` a été appelé |

## Options disponibles

Valeurs par défaut:

```js
{
  stores: null,
  map: {
    refreshRecenter: false,
    initialRecenter: true,
    locate: false,
    navigation: true,
    style: 'https://tiles.openfreemap.org/styles/bright',
    options: {
      zoom: 2,
      maxZoom: 18,
      minZoom: 0,
      center: [0, 0],
      cooperativeGestures: true
    },
    markers: {
      icon: null,
      popup: null
    },
    clusters: {
      enabled: true,
      radius: 50,
      maxZoom: 11,
      minPoints: 2,
      color: '#2563eb',
      size: 18,
      strokeColor: '#ffffff',
      strokeWidth: 2,
      textColor: '#ffffff',
      textSize: 12,
      textFont: ['Noto Sans Regular']
    },
    fitBoundsOptions: {
      padding: 48,
      maxZoom: 16
    }
  },
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters'
  },
  elements: {
    wrapper: null,
    map: null,
    filters: null
  }
}
```

Résumé des options importantes:

- `stores` — données des points de vente.
- `map.style` — style vectoriel, URL ou objet `StyleSpecification`.
- `map.locate` — ajoute le bouton de géolocalisation (`GeolocateControl`).
- `map.navigation` — ajoute les boutons de zoom (`NavigationControl`). Activé par
  défaut, car MapLibre n’en ajoute aucun de lui-même.
- `map.refreshRecenter` — recentre la carte après filtrage.
- `map.initialRecenter` — ajuste le zoom initial sur les données.
- `map.options` — options `MapOptions` de MapLibre, `locale` comprise. `container`
  et `style` en sont exclus : la librairie les pilote via `elements`/`selectors` et
  `map.style`. ⚠️ `center` est en `[longitude, latitude]`.
- `map.markers.icon` — URL, `HTMLElement`, objet aligné sur `MarkerOptions`, ou
  factory recevant la feature.
- `map.markers.popup` — chaîne HTML, `HTMLElement`, objet aligné sur
  `PopupOptions` avec une clé `content`, ou factory.
- `map.clusters` — options de clustering et de style des bulles. Accepte des
  expressions MapLibre pour `color`, `size` et les autres champs de peinture.
- `map.fitBoundsOptions` — `padding` et `maxZoom` appliqués au recentrage. Le
  `padding` accepte un nombre ou un objet `{ top, bottom, left, right }`, utile
  quand un panneau de filtres masque un côté de la carte. Le `maxZoom` à 16 évite
  qu’un filtrage jusqu’à un unique magasin ne projette au niveau du bâtiment sur
  des tuiles surzoomées.
- `selectors` — sélecteurs CSS utilisés si tu ne fournis pas `elements`.
- `elements` — références DOM directes, utiles avec React.

> ⚠️ **Contenu des popups** — `markers.popup` injecte le HTML fourni via
> `Popup.setHTML()`, sans assainissement. Si ton contenu provient de données
> non maîtrisées, assainis-le avant, ou passe un `HTMLElement` construit avec
> `textContent`.

## Scripts de développement et de test

```bash
npm run build
npm run demo
npm run test
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

Les tests E2E couvrent les deux démos:

- `demo/vanilla`
- `demo/react`

Ils chargent le style et les tuiles depuis OpenFreeMap: une connexion réseau est
nécessaire.

## Migration depuis la v2

Voir [docs/MIGRATION-v2-v3.md](./docs/MIGRATION-v2-v3.md) et
[CHANGELOG.md](./CHANGELOG.md).
