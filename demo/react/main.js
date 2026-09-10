import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreLocatorMap } from 'store-locator/react';

const stores = window.demoStores;

const radio = (value, label, checked = false) => {
  return React.createElement(
    'label',
    null,
    React.createElement('input', {
      defaultChecked: checked,
      name: 'category',
      type: 'radio',
      value,
    }),
    label,
  );
};

const App = () => {
  return React.createElement(
    'main',
    { className: 'demo-shell' },
    React.createElement(
      'div',
      { className: 'demo-container' },
      React.createElement(
        'header',
        { className: 'demo-header' },
        React.createElement(
          'div',
          null,
          React.createElement('p', { className: 'demo-kicker' }, 'Démo React'),
          React.createElement('h1', null, 'Intégration React sans bundler dédié'),
          React.createElement(
            'p',
            null,
            'Cette démo charge React via ESM et le bundle React construit depuis la librairie.'
          ),
        ),
        React.createElement(
          'nav',
          { className: 'demo-nav' },
          React.createElement('a', { href: '../' }, 'Retour aux démos'),
          React.createElement('a', { href: '../vanilla/' }, 'Ouvrir la démo vanilla'),
        ),
      ),
      React.createElement(
        'section',
        { className: 'demo-panel' },
        React.createElement(
          'div',
          { className: 'demo-panel-header' },
          React.createElement(
            'div',
            null,
            React.createElement('h2', null, 'Carte interactive React'),
            React.createElement(
              'p',
              null,
              'Le composant StoreLocatorMap gère le montage de MapLibre et la synchronisation des filtres.'
            ),
          ),
        ),
        React.createElement(
          StoreLocatorMap,
          {
            className: 'store-locator',
            stores,
            mapClassName: 'store-locator-map',
            mapStyle: { minHeight: '72vh' },
            onReady: (instance) => {
              // Point d'ancrage documenté pour les tests E2E.
              window.__storeLocator = instance;
            },
            options: {
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
            },
          },
          React.createElement(
            'form',
            { className: 'store-locator-filters' },
            radio('', 'Tout', true),
            radio('Restaurants', 'Restaurants'),
            radio('Wineshops', 'Cavistes'),
          ),
        ),
        React.createElement(
          'p',
          { className: 'demo-note' },
          'Source d’entrée: ',
          React.createElement('code', null, 'dist/react.modern.mjs'),
        ),
      ),
    ),
  );
};

createRoot(document.getElementById('app')).render(React.createElement(App));
