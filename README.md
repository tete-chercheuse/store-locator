# Store Locator

This module allows to quickly setup a store locator module on a website.

## Install
```bash
npm install --save tete-chercheuse/store-locator
```
or
```bash
bower install --save tete-chercheuse/store-locator 
```

## Usage
Add a template like this in your html with eventualy the filters that you want :
```html
<div class="store-locator">
  <form class="store-locator-filters">
    <label>
      <input checked name="category" type="radio" value="">
      Tout
    </label>
    <label>
      <input name="category" type="radio" value="Restaurants">
      Restaurants
    </label>
    <label>
      <input name="category" type="radio" value="Wineshops">
      Wineshops
    </label>
  </form>
  <div id="store-locator-map"></div>
</div>
```
And init the plugin
```javascript
const storeLocator = new StoreLocator({
    stores: stores,
    map: {
      markers: {
        popup: (feature) => L.popup().setContent(`
          <div class="name"><b>${feature.properties.store}</b></div>
          <div class="address">
            <div>${feature.properties.address}</div>
            <div>${feature.properties.area1}</div>
            <div>${feature.properties.city}</div>
            <div>${feature.properties.country}</div>
          </div>
        `),
        icon: (feature) => L.icon({
          iconUrl: feature.properties.icon,
          iconSize: [40, 44],
          iconAnchor: [20, 44],
          popupAnchor: [0, -44],
        })
      },
      refreshRecenter: false
    }
});
```
## Options
The options above are the defaults :
```javascript
{
  stores: null,
  map: {
    initialSettings: {
      zoom: 2,
      lat: 0,
      lng: 0
    },
    options: {
      scrollWheelZoom: false
    },
    tiles: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        minZoom: 2
      }
    },
    markers: {
      icon: null,
      popup: null
    },
    refreshRecenter: true
  },
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters'
  }
}
```
