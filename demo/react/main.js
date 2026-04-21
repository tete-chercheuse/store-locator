import React from 'https://esm.sh/react@19.2.0?dev';
import { createRoot } from 'https://esm.sh/react-dom@19.2.0/client?dev';

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    document.head.appendChild(script);
  });
};

window.React = React;

await loadScript('../../dist/react.umd.js');

const { StoreLocatorMap } = window.StoreLocatorReact;
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
            'Cette démo charge React via ESM et le wrapper UMD React construit depuis la librairie.'
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
              'Le composant StoreLocatorMap gère le montage de Leaflet et la synchronisation des filtres.'
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
            options: {
              map: {
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
                    iconUrl: feature.properties.icon,
                    iconSize: [40, 44],
                    iconAnchor: [20, 44],
                    popupAnchor: [0, -44],
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
          React.createElement('code', null, 'dist/react.umd.js'),
        ),
      ),
    ),
  );
};

createRoot(document.getElementById('app')).render(React.createElement(App));
