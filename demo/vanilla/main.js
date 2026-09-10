import StoreLocator from 'store-locator';

const locator = new StoreLocator({
  stores: window.demoStores,
  map: {
    options: {
      // MapLibre affiche l'overlay des gestes coopératifs en anglais par
      // défaut. La carte est ici dans une page française.
      locale: {
        'CooperativeGesturesHandler.WindowsHelpText': 'Utilisez Ctrl + molette pour zoomer',
        'CooperativeGesturesHandler.MacHelpText': 'Utilisez ⌘ + molette pour zoomer',
        'CooperativeGesturesHandler.MobileHelpText': 'Utilisez deux doigts pour déplacer la carte',
      },
    },
    locate: true,
    markers: {
      popup: (feature) => `
        <div class="name"><b>${feature.properties.store}</b></div>
        <div class="address">
          <div>${feature.properties.address}</div>
          <div>${feature.properties.area1}</div>
          <div>${feature.properties.city}</div>
          <div>${feature.properties.country}</div>
        </div>
      `,
      icon: (feature) => ({
        url: feature.properties.icon,
        size: [40, 44],
        anchor: 'bottom',
      }),
    },
  },
});

// Point d'ancrage documenté pour les tests E2E : les clusters sont rendus sur
// le canvas WebGL et ne sont donc pas atteignables par sélecteur CSS.
window.__storeLocator = locator;
