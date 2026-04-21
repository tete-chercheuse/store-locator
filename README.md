# Store Locator

`store-locator` est une librairie front-end basée sur Leaflet qui permet de créer rapidement une carte interactive de points de vente avec:

- clustering des marqueurs
- popups et icônes personnalisables
- filtres HTML natifs
- support GeoJSON ou tableaux d’objets géolocalisés
- intégration TypeScript
- intégration React via une entrée dédiée

## Sommaire

- [Installation](#installation)
- [Entrées du package](#entrées-du-package)
- [Lancer les démos](#lancer-les-démos)
- [Format des données `stores`](#format-des-données-stores)
- [Exemple JavaScript vanilla](#exemple-javascript-vanilla)
- [Exemple TypeScript](#exemple-typescript)
- [Exemples React](#exemples-react)
- [API de la classe `StoreLocator`](#api-de-la-classe-storelocator)
- [Options disponibles](#options-disponibles)
- [Scripts de développement et de test](#scripts-de-développement-et-de-test)

## Installation

```bash
npm install tete-chercheuse/store-locator leaflet
```

Si tu utilises l’entrée React, `react` doit déjà être installé dans ton application:

```bash
npm install react
```

## Entrées du package

Le package expose deux points d’entrée:

- `store-locator`
  Utilisation du cœur de la librairie, en JavaScript ou TypeScript.
- `store-locator/react`
  Utilisation via `StoreLocatorMap` et `useStoreLocator`.

## Lancer les démos

Une page d’accueil regroupe les deux démos:

```bash
npm run demo
```

Ensuite:

- démo vanilla: `http://127.0.0.1:4173/vanilla/`
- démo React: `http://127.0.0.1:4173/react/`

La commande `npm run demo` ne dépend plus de `gulp`. Elle s’appuie sur un petit serveur Node natif.

Si tu veux rebuilder le bundle UMD principal pendant le développement de la démo vanilla, lance aussi:

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

## Exemple TypeScript

Exemple complet: [examples/typescript/basic.ts](./examples/typescript/basic.ts)

Le cœur de la librairie est écrit en TypeScript et peut être utilisé dans un projet strictement typé:

```ts
import StoreLocator from 'store-locator';

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
    wrapper: document.querySelector('.store-locator'),
    filters: document.querySelector('.store-locator-filters'),
    map: document.getElementById('store-locator-map'),
  },
  map: {
    locate: true,
    markers: {
      popup: (feature) => feature.properties.store,
      icon: (feature) => ({
        iconUrl: feature.properties.icon,
        iconSize: [40, 44],
        iconAnchor: [20, 44],
        popupAnchor: [0, -44],
      }),
    },
  },
});

storeLocator.invalidateSize();
```

Pour les intégrations React, Next.js ou les projets où tu veux éviter d’importer directement `leaflet`, `markers.icon` accepte aussi directement:

- une URL `string`
- un objet compatible `L.IconOptions`
- une factory qui retourne l’un des deux

Le même principe s’applique à `markers.popup`, qui accepte:

- une `string`
- un `HTMLElement`
- un objet compatible `L.PopupOptions` avec une clé `content`
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
          iconUrl: markerPin.src,
          iconSize: [40, 44],
          iconAnchor: [20, 44],
          popupAnchor: [0, -44],
        },
        popup: {
          content: '<strong>Ma boutique</strong>',
          maxWidth: 280,
        },
      },
    },
  }}
/>
```

## Exemples React

Le package expose une entrée dédiée:

```tsx
import { StoreLocatorMap, useStoreLocator } from 'store-locator/react';
```

### Composant `StoreLocatorMap`

Exemple complet: [examples/react/StoreLocatorMapExample.tsx](./examples/react/StoreLocatorMapExample.tsx)

> ⚠️ **Important — mémoïsation de `stores`** : si tu passes `stores` en littéral inline (`stores={[{ lat, lng }]}`), une nouvelle référence est créée à chaque render du composant parent. Le hook interne appelle alors `setStores()` à chaque render, ce qui vide et recrée tous les marqueurs/clusters — coûteux et potentiellement source d'état incohérent pendant une interaction utilisateur (drag, zoom).
>
> Mémoïse toujours `stores` avec `useMemo` dès qu'il provient de props ou d'un état amont :
>
> ```tsx
> const stores = useMemo(
>   () => rawData.map((item) => ({ lat: item.lat, lng: item.lng, ...item })),
>   [rawData]
> );
> ```

```tsx
import { StoreLocatorMap } from 'store-locator/react';

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
    >
      <form className="store-locator-filters">{/* filtres */}</form>
    </StoreLocatorMap>
  );
}
```

### Hook `useStoreLocator`

Exemple complet: [examples/react/useStoreLocatorExample.tsx](./examples/react/useStoreLocatorExample.tsx)

> ⚠️ **Important — mémoïsation de `stores`** : avec `useStoreLocator`, une référence instable de `stores` provoque aussi un appel à `setStores()` à chaque render. Le résultat est le même: les clusters sont vidés puis recréés inutilement, avec un risque accru pendant un drag, un zoom ou une animation.
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

export function StoresMap({ stores }) {
  const wrapperRef = useRef(null);
  const filtersRef = useRef(null);
  const mapRef = useRef(null);

  useStoreLocator({
    stores,
    wrapperRef,
    filtersRef,
    mapRef,
  });

  return (
    <div ref={wrapperRef}>
      <form ref={filtersRef} className="store-locator-filters">{/* filtres */}</form>
      <div ref={mapRef} style={{ minHeight: 480 }} />
    </div>
  );
}
```

Pour un framework SSR, l’entrée React doit être utilisée côté client.

## API de la classe `StoreLocator`

### `new StoreLocator(options)`

Crée une nouvelle instance et initialise la carte.

### `setStores(stores, filters?, recenter?, maxZoom?)`

Remplace les données affichées et rafraîchit les marqueurs.

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

### `refreshClusters(filters?, recenter?, maxZoom?)`

Vide puis reconstruit les clusters selon les filtres passés.

### `invalidateSize(options?)`

Relance le calcul de taille de la carte Leaflet. Utile après affichage dans un panneau ou une modale.

### `destroy()`

Supprime les écouteurs d’événements et détruit proprement la carte.

## Options disponibles

Valeurs par défaut:

```js
{
  stores: null,
  map: {
    refreshRecenter: false,
    initialRecenter: true,
    locate: false,
    options: {
      zoom: 2,
      maxZoom: 18,
      minZoom: 2,
      center: [0, 0],
      gestureHandling: true
    },
    tiles: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
      }
    },
    markers: {
      icon: null,
      popup: null,
      clustersOptions: {
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: false,
        disableClusteringAtZoom: 15
      }
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

- `stores`
  Données des points de vente.
- `map.locate`
  Active le bouton de géolocalisation.
- `map.refreshRecenter`
  Recentre automatiquement la carte après filtrage.
- `map.initialRecenter`
  Ajuste le zoom initial sur les données disponibles.
- `map.markers.popup`
  Accepte une chaîne, une instance `L.Popup` ou une fonction.
- `map.markers.icon`
  Accepte une instance `L.Icon`, `L.DivIcon` ou une fonction.
- `selectors`
  Sélecteurs CSS utilisés si tu ne fournis pas `elements`.
- `elements`
  Références DOM directes, très utiles avec React ou tout autre framework.

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
