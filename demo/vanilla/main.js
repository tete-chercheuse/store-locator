/* global StoreLocator, demoStores */

new StoreLocator({
  stores: demoStores,
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
});
