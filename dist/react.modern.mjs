import { useState, useRef, useEffect, createElement } from 'react';
import { Map as Map$1, NavigationControl, GeolocateControl, Marker, Popup } from 'maplibre-gl';

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}

const style = {
  "version": 8,
  "sources": {
    "ne2_shaded": {
      "maxzoom": 6,
      "tileSize": 256,
      "tiles": ["https://tiles.openfreemap.org/natural_earth/ne2sr/{z}/{x}/{y}.png"],
      "type": "raster"
    },
    "openmaptiles": {
      "type": "vector",
      "url": "https://tiles.openfreemap.org/planet"
    }
  },
  "sprite": "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
  "glyphs": "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  "layers": [{
    "id": "background",
    "type": "background",
    "paint": {
      "background-color": "rgba(244, 240, 239, 1)"
    }
  }, {
    "id": "landcover-glacier",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landcover",
    "filter": ["==", ["get", "subclass"], "glacier"],
    "paint": {
      "fill-color": "#fff",
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 10, 0.3]
    }
  }, {
    "id": "landuse-residential",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "filter": ["match", ["get", "class"], ["neighbourhood", "residential"], true, false],
    "paint": {
      "fill-color": ["interpolate", ["linear"], ["zoom"], 12, "hsla(30,19%,90%,0.4)", 16, "hsla(30,19%,90%,0.2)"]
    }
  }, {
    "id": "landuse-suburb",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "maxzoom": 10,
    "filter": ["==", ["get", "class"], "suburb"],
    "paint": {
      "fill-color": ["interpolate", ["linear"], ["zoom"], 8, "hsla(30,19%,90%,0.4)", 10, "hsla(30,19%,90%,0.0)"]
    }
  }, {
    "id": "landuse-commercial",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "filter": ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["==", ["get", "class"], "commercial"]],
    "paint": {
      "fill-color": "hsla(0,60%,87%,0.23)"
    }
  }, {
    "id": "landuse-industrial",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "filter": ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["match", ["get", "class"], ["dam", "garages", "industrial"], true, false]],
    "paint": {
      "fill-color": "hsla(49,100%,88%,0.34)"
    }
  }, {
    "id": "landuse-cemetery",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "filter": ["==", ["get", "class"], "cemetery"],
    "paint": {
      "fill-color": "#e0e4dd"
    }
  }, {
    "id": "landuse-hospital",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "filter": ["==", ["get", "class"], "hospital"],
    "paint": {
      "fill-color": "#fde"
    }
  }, {
    "id": "landuse-school",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "filter": ["==", ["get", "class"], "school"],
    "paint": {
      "fill-color": "#f0e8f8"
    }
  }, {
    "id": "landuse-railway",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landuse",
    "filter": ["==", ["get", "class"], "railway"],
    "paint": {
      "fill-color": "hsla(30,19%,90%,0.4)"
    }
  }, {
    "id": "park",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "park",
    "filter": ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
    "paint": {
      "fill-color": "rgba(161, 231, 168, 1)",
      "fill-opacity": ["interpolate", ["exponential", 1.8], ["zoom"], 9, 0.5, 12, 0.2]
    }
  }, {
    "id": "landcover-wood",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landcover",
    "filter": ["==", ["get", "class"], "wood"],
    "paint": {
      "fill-antialias": ["step", ["zoom"], false, 9, true],
      "fill-color": "rgba(196, 242, 190, 1)",
      "fill-outline-color": "hsla(0,0%,0%,0.03)"
    }
  }, {
    "id": "landcover-grass",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landcover",
    "filter": ["==", ["get", "class"], "grass"],
    "paint": {
      "fill-color": "#89df93",
      "fill-opacity": 0.5
    }
  }, {
    "id": "landcover-grass-park",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "park",
    "filter": ["==", ["get", "class"], "public_park"],
    "paint": {
      "fill-color": "#d8e8c8",
      "fill-opacity": 0.8
    }
  }, {
    "id": "waterway_tunnel",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "minzoom": 14,
    "filter": ["all", ["match", ["get", "class"], ["canal", "river", "stream"], true, false], ["==", ["get", "brunnel"], "tunnel"]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-dasharray": [2, 4],
      "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 13, 0.5, 20, 6]
    }
  }, {
    "id": "waterway-other",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "filter": ["all", ["match", ["get", "class"], ["canal", "river", "stream"], false, true], ["==", ["get", "intermittent"], 0]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 13, 0.5, 20, 2]
    }
  }, {
    "id": "waterway-other-intermittent",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "filter": ["all", ["match", ["get", "class"], ["canal", "river", "stream"], false, true], ["==", ["get", "intermittent"], 1]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-dasharray": [4, 3],
      "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 13, 0.5, 20, 2]
    }
  }, {
    "id": "waterway-stream-canal",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "filter": ["all", ["match", ["get", "class"], ["canal", "stream"], true, false], ["!=", ["get", "brunnel"], "tunnel"], ["==", ["get", "intermittent"], 0]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 13, 0.5, 20, 6]
    }
  }, {
    "id": "waterway-stream-canal-intermittent",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "filter": ["all", ["match", ["get", "class"], ["canal", "stream"], true, false], ["!=", ["get", "brunnel"], "tunnel"], ["==", ["get", "intermittent"], 1]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-dasharray": [4, 3],
      "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 13, 0.5, 20, 6]
    }
  }, {
    "id": "waterway-river",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "filter": ["all", ["==", ["get", "class"], "river"], ["!=", ["get", "brunnel"], "tunnel"], ["!=", ["get", "intermittent"], 1]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 10, 0.8, 20, 6]
    }
  }, {
    "id": "waterway-river-intermittent",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "filter": ["all", ["==", ["get", "class"], "river"], ["!=", ["get", "brunnel"], "tunnel"], ["==", ["get", "intermittent"], 1]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-dasharray": [3, 2.5],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 10, 0.8, 20, 6]
    }
  }, {
    "id": "water",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "water",
    "filter": ["all", ["!=", ["get", "intermittent"], 1], ["!=", ["get", "brunnel"], "tunnel"]],
    "paint": {
      "fill-color": "rgba(152, 220, 254, 1)"
    }
  }, {
    "id": "water-intermittent",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "water",
    "filter": ["==", ["get", "intermittent"], 1],
    "paint": {
      "fill-color": "hsl(210,67%,85%)",
      "fill-opacity": 0.7
    }
  }, {
    "id": "landcover-ice-shelf",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landcover",
    "filter": ["==", ["get", "subclass"], "ice_shelf"],
    "paint": {
      "fill-color": "#fff",
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 10, 0.3]
    }
  }, {
    "id": "landcover-sand",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "landcover",
    "filter": ["==", ["get", "class"], "sand"],
    "paint": {
      "fill-color": "rgba(245, 238, 188, 1)",
      "fill-opacity": 1
    }
  }, {
    "id": "building",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "building",
    "paint": {
      "fill-antialias": true,
      "fill-color": ["interpolate", ["linear"], ["zoom"], 15.5, "#f2eae2", 16, "#dfdbd7"]
    }
  }, {
    "id": "building-top",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "building",
    "paint": {
      "fill-color": "#f2eae2",
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 16, 1],
      "fill-outline-color": "#dfdbd7",
      "fill-translate": ["interpolate", ["linear"], ["zoom"], 14, ["literal", [0, 0]], 16, ["literal", [-2, -2]]]
    }
  }, {
    "id": "tunnel-service-track-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["service", "track"], true, false]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#cfcdca",
      "line-dasharray": [0.5, 0.25],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 15, 1, 16, 4, 20, 11]
    }
  }, {
    "id": "tunnel-motorway-link-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "motorway"], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(200, 147, 102, 1)",
      "line-dasharray": [0.5, 0.25],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 1, 13, 3, 14, 4, 20, 15]
    }
  }, {
    "id": "tunnel-minor-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "minor"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#cfcdca",
      "line-dasharray": [0.5, 0.25],
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.5, 1],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 0.5, 13, 1, 14, 4, 20, 15]
    }
  }, {
    "id": "tunnel-link-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-dasharray": [0.5, 0.25],
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 1, 13, 3, 14, 4, 20, 15]
    }
  }, {
    "id": "tunnel-secondary-tertiary-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["secondary", "tertiary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-dasharray": [0.5, 0.25],
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 8, 1.5, 20, 17]
    }
  }, {
    "id": "tunnel-trunk-primary-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["primary", "trunk"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 5, 0.4, 6, 0.6, 7, 1.5, 20, 22]
    }
  }, {
    "id": "tunnel-motorway-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "motorway"], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-dasharray": [0.5, 0.25],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 5, 0.4, 6, 0.6, 7, 1.5, 20, 22]
    }
  }, {
    "id": "tunnel-path",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "path"]],
    "paint": {
      "line-color": "#cba",
      "line-dasharray": [1.5, 0.75],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 15, 1.2, 20, 4]
    }
  }, {
    "id": "tunnel-motorway-link",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "motorway"], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(244, 209, 158, 1)",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12.5, 0, 13, 1.5, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "tunnel-service-track",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["service", "track"], true, false]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 15.5, 0, 16, 2, 20, 7.5]
    }
  }, {
    "id": "tunnel-link",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff4c6",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12.5, 0, 13, 1.5, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "tunnel-minor",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "minor"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 13.5, 0, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "tunnel-secondary-tertiary",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["secondary", "tertiary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff4c6",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 7, 0.5, 20, 10]
    }
  }, {
    "id": "tunnel-trunk-primary",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["primary", "trunk"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff4c6",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 7, 0.5, 20, 18]
    }
  }, {
    "id": "tunnel-motorway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "motorway"], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#ffdaa6",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 7, 0.5, 20, 18]
    }
  }, {
    "id": "tunnel-railway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "tunnel"], ["==", ["get", "class"], "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-dasharray": [2, 2],
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14, 0.4, 15, 0.75, 20, 2]
    }
  }, {
    "id": "ferry",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["match", ["get", "class"], ["ferry"], true, false],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(108, 159, 182, 1)",
      "line-dasharray": [2, 2],
      "line-width": 1.1,
      "line-opacity": 0
    }
  }, {
    "id": "aeroway-taxiway-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "aeroway",
    "minzoom": 12,
    "filter": ["match", ["get", "class"], ["taxiway"], true, false],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(153, 153, 153, 1)",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 2, 17, 12]
    }
  }, {
    "id": "aeroway-runway-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "aeroway",
    "minzoom": 12,
    "filter": ["match", ["get", "class"], ["runway"], true, false],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(153, 153, 153, 1)",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 5, 17, 55]
    }
  }, {
    "id": "aeroway-area",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "aeroway",
    "minzoom": 4,
    "filter": ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["match", ["get", "class"], ["runway", "taxiway"], true, false]],
    "paint": {
      "fill-color": "rgba(255, 255, 255, 1)",
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 1]
    }
  }, {
    "id": "aeroway-taxiway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "aeroway",
    "minzoom": 4,
    "filter": ["all", ["match", ["get", "class"], ["taxiway"], true, false], ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(255, 255, 255, 1)",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0, 12, 1],
      "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 1, 17, 10]
    }
  }, {
    "id": "aeroway-runway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "aeroway",
    "minzoom": 4,
    "filter": ["all", ["match", ["get", "class"], ["runway"], true, false], ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(255, 255, 255, 1)",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0, 12, 1],
      "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 4, 17, 50]
    }
  }, {
    "id": "road_area_pier",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["==", ["get", "class"], "pier"]],
    "paint": {
      "fill-antialias": true,
      "fill-color": "#f8f4f0"
    }
  }, {
    "id": "road_pier",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "class"], ["pier"], true, false]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#f8f4f0",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 15, 1, 17, 4]
    }
  }, {
    "id": "highway-area",
    "type": "fill",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false], ["match", ["get", "class"], ["pier"], false, true]],
    "paint": {
      "fill-antialias": false,
      "fill-color": "hsla(0,0%,89%,0.56)",
      "fill-opacity": 0.9,
      "fill-outline-color": "#cfcdca"
    }
  }, {
    "id": "highway-motorway-link-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["==", ["get", "class"], "motorway"], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 1, 13, 3, 14, 4, 20, 15]
    }
  }, {
    "id": "highway-link-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 1, 13, 3, 14, 4, 20, 15]
    }
  }, {
    "id": "highway-minor-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["!=", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["minor", "service", "track"], true, false]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#cfcdca",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.5, 1],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 0.5, 13, 1, 14, 4, 20, 15]
    }
  }, {
    "id": "highway-secondary-tertiary-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["secondary", "tertiary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 8, 1.5, 20, 17]
    }
  }, {
    "id": "highway-primary-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 5,
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["primary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 7, 0, 8, 0.6, 9, 1.5, 20, 22]
    }
  }, {
    "id": "highway-trunk-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 5,
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["trunk"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0, 6, 1],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 5, 0, 6, 0.6, 7, 1.5, 20, 22]
    }
  }, {
    "id": "highway-motorway-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 4,
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["==", ["get", "class"], "motorway"], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0, 5, 1],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 4, 0, 5, 0.4, 6, 0.6, 7, 1.5, 20, 22]
    }
  }, {
    "id": "highway-path",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["==", ["get", "class"], "path"]],
    "paint": {
      "line-color": "#cba",
      "line-dasharray": [1.5, 0.75],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 15, 1.2, 20, 4]
    }
  }, {
    "id": "highway-motorway-link",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 12,
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["==", ["get", "class"], "motorway"], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12.5, 0, 13, 1.5, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "highway-link",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12.5, 0, 13, 1.5, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "highway-minor",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["!=", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["minor", "service", "track"], true, false]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 13.5, 0, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "highway-secondary-tertiary",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["secondary", "tertiary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 8, 0.5, 20, 13]
    }
  }, {
    "id": "highway-primary",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["primary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 8.5, 0, 9, 0.5, 20, 18]
    }
  }, {
    "id": "highway-trunk",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["match", ["get", "class"], ["trunk"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 7, 0.5, 20, 18]
    }
  }, {
    "id": "highway-motorway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 5,
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["==", ["get", "class"], "motorway"], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 7, 0.5, 20, 18]
    }
  }, {
    "id": "railway-transit",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "class"], "transit"], ["match", ["get", "brunnel"], ["tunnel"], false, true]],
    "paint": {
      "line-color": "hsla(0,0%,73%,0.77)",
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14, 0.4, 20, 1]
    }
  }, {
    "id": "railway-transit-hatching",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "class"], "transit"], ["match", ["get", "brunnel"], ["tunnel"], false, true]],
    "paint": {
      "line-color": "hsla(0,0%,73%,0.68)",
      "line-dasharray": [0.2, 8],
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14.5, 0, 15, 2, 20, 6]
    }
  }, {
    "id": "railway-service",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "class"], "rail"], ["has", "service"]],
    "paint": {
      "line-color": "hsla(0,0%,73%,0.77)",
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14, 0.4, 20, 1]
    }
  }, {
    "id": "railway-service-hatching",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "class"], "rail"], ["has", "service"]],
    "paint": {
      "line-color": "hsla(0,0%,73%,0.68)",
      "line-dasharray": [0.2, 8],
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14.5, 0, 15, 2, 20, 6]
    }
  }, {
    "id": "railway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["!", ["has", "service"]], ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["==", ["get", "class"], "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14, 0.4, 15, 0.75, 20, 2]
    }
  }, {
    "id": "railway-hatching",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["!", ["has", "service"]], ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true], ["==", ["get", "class"], "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-dasharray": [0.2, 8],
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14.5, 0, 15, 3, 20, 8]
    }
  }, {
    "id": "bridge-motorway-link-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "motorway"], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 1, 13, 3, 14, 4, 20, 19]
    }
  }, {
    "id": "bridge-link-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 1, 13, 3, 14, 4, 20, 19]
    }
  }, {
    "id": "bridge-secondary-tertiary-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["secondary", "tertiary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 5, 0.4, 7, 0.6, 8, 1.5, 20, 21]
    }
  }, {
    "id": "bridge-trunk-primary-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["primary", "trunk"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "hsl(28,76%,67%)",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 5, 0.4, 6, 0.6, 7, 1.5, 20, 26]
    }
  }, {
    "id": "bridge-motorway-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "motorway"], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 5, 0.4, 6, 0.6, 7, 1.5, 20, 26]
    }
  }, {
    "id": "bridge-minor-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["minor", "service", "track"], true, false]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#cfcdca",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.5, 1],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12, 0.5, 13, 1, 14, 6, 20, 24]
    }
  }, {
    "id": "bridge-path-casing",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "path"]],
    "paint": {
      "line-color": "#f8f4f0",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 15, 1.2, 20, 18]
    }
  }, {
    "id": "bridge-path",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "path"]],
    "paint": {
      "line-color": "#cba",
      "line-dasharray": [1.5, 0.75],
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 15, 1.2, 20, 4]
    }
  }, {
    "id": "bridge-motorway-link",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "motorway"], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12.5, 0, 13, 1.5, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "bridge-link",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false], ["==", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 12.5, 0, 13, 1.5, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "bridge-minor",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["minor", "service", "track"], true, false]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff",
      "line-opacity": 1,
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 13.5, 0, 14, 2.5, 20, 11.5]
    }
  }, {
    "id": "bridge-secondary-tertiary",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["secondary", "tertiary"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 8, 0.5, 20, 13]
    }
  }, {
    "id": "bridge-trunk-primary",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["match", ["get", "class"], ["primary", "trunk"], true, false], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 7, 0.5, 20, 18]
    }
  }, {
    "id": "bridge-motorway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "motorway"], ["!=", ["get", "ramp"], 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": ["interpolate", ["exponential", 1.2], ["zoom"], 6.5, 0, 7, 0.5, 20, 18]
    }
  }, {
    "id": "bridge-railway",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14, 0.4, 15, 0.75, 20, 2]
    }
  }, {
    "id": "bridge-railway-hatching",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "filter": ["all", ["==", ["get", "brunnel"], "bridge"], ["==", ["get", "class"], "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-dasharray": [0.2, 8],
      "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 14.5, 0, 15, 3, 20, 8]
    }
  }, {
    "id": "cablecar",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["==", ["get", "subclass"], "cable_car"],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "hsl(0,0%,70%)",
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1, 19, 2.5]
    }
  }, {
    "id": "cablecar-dash",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["==", ["get", "subclass"], "cable_car"],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "hsl(0,0%,70%)",
      "line-dasharray": [2, 3],
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 3, 19, 5.5]
    }
  }, {
    "id": "boundary_3",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "boundary",
    "minzoom": 5,
    "filter": ["all", [">=", ["get", "admin_level"], 3], ["<=", ["get", "admin_level"], 6], ["!=", ["get", "maritime"], 1], ["!=", ["get", "disputed"], 1], ["!", ["has", "claimed_by"]]],
    "paint": {
      "line-color": "hsl(0,0%,70%)",
      "line-dasharray": [1, 1],
      "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1, 11, 2]
    }
  }, {
    "id": "boundary_2",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "boundary",
    "filter": ["all", ["==", ["get", "admin_level"], 2], ["!=", ["get", "maritime"], 1], ["!=", ["get", "disputed"], 1], ["!", ["has", "claimed_by"]]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "hsl(248,7%,66%)",
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.4, 4, 1],
      "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1, 5, 1.2, 12, 3]
    }
  }, {
    "id": "boundary_disputed",
    "type": "line",
    "source": "openmaptiles",
    "source-layer": "boundary",
    "filter": ["all", ["!=", ["get", "maritime"], 1], ["==", ["get", "disputed"], 1]],
    "paint": {
      "line-color": "hsl(248,7%,66%)",
      "line-dasharray": [1, 2],
      "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1, 5, 1.2, 12, 3]
    }
  }, {
    "id": "road_oneway",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 15,
    "filter": ["all", ["==", ["get", "oneway"], 1], ["match", ["get", "class"], ["minor", "motorway", "primary", "secondary", "service", "tertiary", "trunk"], true, false]],
    "layout": {
      "icon-image": "oneway",
      "icon-padding": 2,
      "icon-rotate": 90,
      "icon-rotation-alignment": "map",
      "icon-size": ["interpolate", ["linear"], ["zoom"], 15, 0.5, 19, 1],
      "symbol-placement": "line",
      "symbol-spacing": 75
    },
    "paint": {
      "icon-opacity": 0.5
    }
  }, {
    "id": "road_oneway_opposite",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation",
    "minzoom": 15,
    "filter": ["all", ["==", ["get", "oneway"], -1], ["match", ["get", "class"], ["minor", "motorway", "primary", "secondary", "service", "tertiary", "trunk"], true, false]],
    "layout": {
      "icon-image": "oneway",
      "icon-padding": 2,
      "icon-rotate": -90,
      "icon-rotation-alignment": "map",
      "icon-size": ["interpolate", ["linear"], ["zoom"], 15, 0.5, 19, 1],
      "symbol-placement": "line",
      "symbol-spacing": 75
    },
    "paint": {
      "icon-opacity": 0.5
    }
  }, {
    "id": "waterway_line_label",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "waterway",
    "minzoom": 10,
    "filter": ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false],
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": 350,
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-letter-spacing": 0.2,
      "text-max-width": 5,
      "text-size": 14
    },
    "paint": {
      "text-color": "#74aee9",
      "text-halo-color": "rgba(255,255,255,0.7)",
      "text-halo-width": 1.5
    }
  }, {
    "id": "water_name_point_label",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "water_name",
    "filter": ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false],
    "layout": {
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-letter-spacing": 0.2,
      "text-max-width": 5,
      "text-size": ["interpolate", ["linear"], ["zoom"], 0, 10, 8, 14]
    },
    "paint": {
      "text-color": "#495e91",
      "text-halo-color": "rgba(255,255,255,0.7)",
      "text-halo-width": 1.5
    }
  }, {
    "id": "water_name_line_label",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "water_name",
    "filter": ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false],
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": 350,
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-letter-spacing": 0.2,
      "text-max-width": 5,
      "text-size": 14
    },
    "paint": {
      "text-color": "#495e91",
      "text-halo-color": "rgba(255,255,255,0.7)",
      "text-halo-width": 1.5
    }
  }, {
    "id": "poi_r20",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "poi",
    "minzoom": 17,
    "filter": ["all", ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false], [">=", ["get", "rank"], 20]],
    "layout": {
      "icon-image": ["match", ["get", "subclass"], ["florist", "furniture"], ["get", "subclass"], ["get", "class"]],
      "text-anchor": "top",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-max-width": 9,
      "text-offset": [0, 0.6],
      "text-size": 12
    },
    "paint": {
      "text-color": "#666",
      "text-halo-blur": 0.5,
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    }
  }, {
    "id": "poi_r7",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "poi",
    "minzoom": 16,
    "filter": ["all", ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false], [">=", ["get", "rank"], 7], ["<", ["get", "rank"], 20]],
    "layout": {
      "icon-image": ["match", ["get", "subclass"], ["florist", "furniture"], ["get", "subclass"], ["get", "class"]],
      "text-anchor": "top",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-max-width": 9,
      "text-offset": [0, 0.6],
      "text-size": 12
    },
    "paint": {
      "text-color": "#666",
      "text-halo-blur": 0.5,
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    }
  }, {
    "id": "poi_r1",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "poi",
    "minzoom": 15,
    "filter": ["all", ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false], [">=", ["get", "rank"], 1], ["<", ["get", "rank"], 7]],
    "layout": {
      "icon-image": ["match", ["get", "subclass"], ["florist", "furniture"], ["get", "subclass"], ["get", "class"]],
      "text-anchor": "top",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-max-width": 9,
      "text-offset": [0, 0.6],
      "text-size": 12
    },
    "paint": {
      "text-color": "#666",
      "text-halo-blur": 0.5,
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    }
  }, {
    "id": "poi_transit",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "poi",
    "filter": ["match", ["get", "class"], ["airport", "bus", "rail"], true, false],
    "layout": {
      "icon-image": ["to-string", ["get", "class"]],
      "icon-size": 0.7,
      "text-anchor": "left",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-max-width": 9,
      "text-offset": [0.9, 0],
      "text-size": 12
    },
    "paint": {
      "text-color": "#2e5a80",
      "text-halo-blur": 0.5,
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    }
  }, {
    "id": "highway-name-path",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation_name",
    "minzoom": 15.5,
    "filter": ["==", ["get", "class"], "path"],
    "layout": {
      "symbol-placement": "line",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Regular"],
      "text-rotation-alignment": "map",
      "text-size": ["interpolate", ["linear"], ["zoom"], 13, 12, 14, 13]
    },
    "paint": {
      "text-color": "hsl(30,23%,62%)",
      "text-halo-color": "#f8f4f0",
      "text-halo-width": 0.5
    }
  }, {
    "id": "highway-name-minor",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation_name",
    "minzoom": 15,
    "filter": ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "class"], ["minor", "service", "track"], true, false]],
    "layout": {
      "symbol-placement": "line",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Regular"],
      "text-rotation-alignment": "map",
      "text-size": ["interpolate", ["linear"], ["zoom"], 13, 12, 14, 13]
    },
    "paint": {
      "text-color": "#666",
      "text-halo-blur": 0.5,
      "text-halo-width": 1
    }
  }, {
    "id": "highway-name-major",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation_name",
    "minzoom": 12.2,
    "filter": ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk"], true, false],
    "layout": {
      "symbol-placement": "line",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Regular"],
      "text-rotation-alignment": "map",
      "text-size": ["interpolate", ["linear"], ["zoom"], 13, 12, 14, 13]
    },
    "paint": {
      "text-color": "#666",
      "text-halo-blur": 0.5,
      "text-halo-width": 1
    }
  }, {
    "id": "highway-shield-non-us",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation_name",
    "minzoom": 8,
    "filter": ["all", ["<=", ["get", "ref_length"], 6], ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "network"], ["us-highway", "us-interstate", "us-state"], false, true]],
    "layout": {
      "icon-image": ["concat", "road_", ["get", "ref_length"]],
      "icon-rotation-alignment": "viewport",
      "icon-size": 1,
      "symbol-placement": ["step", ["zoom"], "point", 11, "line"],
      "symbol-spacing": 200,
      "text-field": ["to-string", ["get", "ref"]],
      "text-font": ["Noto Sans Regular"],
      "text-rotation-alignment": "viewport",
      "text-size": 10
    }
  }, {
    "id": "highway-shield-us-interstate",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation_name",
    "minzoom": 7,
    "filter": ["all", ["<=", ["get", "ref_length"], 6], ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "network"], ["us-interstate"], true, false]],
    "layout": {
      "icon-image": ["concat", ["get", "network"], "_", ["get", "ref_length"]],
      "icon-rotation-alignment": "viewport",
      "icon-size": 1,
      "symbol-placement": ["step", ["zoom"], "point", 7, "line", 8, "line"],
      "symbol-spacing": 200,
      "text-field": ["to-string", ["get", "ref"]],
      "text-font": ["Noto Sans Regular"],
      "text-rotation-alignment": "viewport",
      "text-size": 10
    }
  }, {
    "id": "road_shield_us",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "transportation_name",
    "minzoom": 9,
    "filter": ["all", ["<=", ["get", "ref_length"], 6], ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "network"], ["us-highway", "us-state"], true, false]],
    "layout": {
      "icon-image": ["concat", ["get", "network"], "_", ["get", "ref_length"]],
      "icon-rotation-alignment": "viewport",
      "icon-size": 1,
      "symbol-placement": ["step", ["zoom"], "point", 11, "line"],
      "symbol-spacing": 200,
      "text-field": ["to-string", ["get", "ref"]],
      "text-font": ["Noto Sans Regular"],
      "text-rotation-alignment": "viewport",
      "text-size": 10
    }
  }, {
    "id": "airport",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "aerodrome_label",
    "minzoom": 10,
    "filter": ["all", ["has", "iata"]],
    "layout": {
      "icon-image": "airport_11",
      "icon-size": 1,
      "text-anchor": "top",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 9,
      "text-offset": [0, 0.6],
      "text-optional": true,
      "text-padding": 2,
      "text-size": 12
    },
    "paint": {
      "text-color": "#666",
      "text-halo-blur": 0.5,
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_other",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "minzoom": 8,
    "filter": ["match", ["get", "class"], ["city", "continent", "country", "state", "town", "village"], false, true],
    "layout": {
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-letter-spacing": 0.1,
      "text-max-width": 9,
      "text-size": ["interpolate", ["linear"], ["zoom"], 8, 9, 12, 10],
      "text-transform": "uppercase"
    },
    "paint": {
      "text-color": "#333",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_village",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "minzoom": 9,
    "filter": ["==", ["get", "class"], "village"],
    "layout": {
      "icon-allow-overlap": true,
      "icon-image": ["step", ["zoom"], "circle_11_black", 10, ""],
      "icon-optional": false,
      "icon-size": 0.2,
      "text-anchor": "bottom",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 8,
      "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 7, 10, 11, 12]
    },
    "paint": {
      "text-color": "#000",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_town",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "minzoom": 6,
    "filter": ["==", ["get", "class"], "town"],
    "layout": {
      "icon-allow-overlap": true,
      "icon-image": ["step", ["zoom"], "circle_11_black", 10, ""],
      "icon-optional": false,
      "icon-size": 0.2,
      "text-anchor": "bottom",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 8,
      "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 7, 12, 11, 14]
    },
    "paint": {
      "text-color": "#000",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_state",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "minzoom": 5,
    "maxzoom": 8,
    "filter": ["==", ["get", "class"], "state"],
    "layout": {
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Italic"],
      "text-letter-spacing": 0.2,
      "text-max-width": 9,
      "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 8, 14],
      "text-transform": "uppercase"
    },
    "paint": {
      "text-color": "#333",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_city",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "minzoom": 3,
    "filter": ["all", ["==", ["get", "class"], "city"], ["!=", ["get", "capital"], 2]],
    "layout": {
      "icon-allow-overlap": true,
      "icon-image": ["step", ["zoom"], "circle_11_black", 9, ""],
      "icon-optional": false,
      "icon-size": 0.4,
      "text-anchor": "bottom",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 8,
      "text-offset": [0, -0.1],
      "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 4, 11, 7, 13, 11, 18]
    },
    "paint": {
      "text-color": "#000",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_city_capital",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "minzoom": 3,
    "filter": ["all", ["==", ["get", "class"], "city"], ["==", ["get", "capital"], 2]],
    "layout": {
      "icon-allow-overlap": true,
      "icon-image": ["step", ["zoom"], "circle_11_black", 9, ""],
      "icon-optional": false,
      "icon-size": 0.5,
      "text-anchor": "bottom",
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Bold"],
      "text-max-width": 8,
      "text-offset": [0, -0.2],
      "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 4, 12, 7, 14, 11, 20]
    },
    "paint": {
      "text-color": "#000",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_country_3",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "minzoom": 2,
    "maxzoom": 9,
    "filter": ["all", ["==", ["get", "class"], "country"], [">=", ["get", "rank"], 3]],
    "layout": {
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Bold"],
      "text-max-width": 6.25,
      "text-size": ["interpolate", ["linear"], ["zoom"], 3, 9, 7, 17]
    },
    "paint": {
      "text-color": "#000",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_country_2",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "maxzoom": 9,
    "filter": ["all", ["==", ["get", "class"], "country"], ["==", ["get", "rank"], 2]],
    "layout": {
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Bold"],
      "text-max-width": 6.25,
      "text-size": ["interpolate", ["linear"], ["zoom"], 2, 9, 5, 17]
    },
    "paint": {
      "text-color": "#000",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }, {
    "id": "label_country_1",
    "type": "symbol",
    "source": "openmaptiles",
    "source-layer": "place",
    "maxzoom": 9,
    "filter": ["all", ["==", ["get", "class"], "country"], ["==", ["get", "rank"], 1]],
    "layout": {
      "text-field": ["case", ["has", "name:nonlatin"], ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]], ["coalesce", ["get", "name_en"], ["get", "name"]]],
      "text-font": ["Noto Sans Bold"],
      "text-max-width": 6.25,
      "text-size": ["interpolate", ["linear"], ["zoom"], 1, 9, 4, 17]
    },
    "paint": {
      "text-color": "#000",
      "text-halo-blur": 1,
      "text-halo-color": "#fff",
      "text-halo-width": 1
    }
  }]
};

const defaultMapOptions = {
  refreshRecenter: false,
  initialRecenter: true,
  locate: false,
  navigation: true,
  injectCss: true,
  cssNonce: null,
  resolveMissingImages: true,
  style: style,
  options: {
    zoom: 2,
    maxZoom: 18,
    // Pas de plancher de zoom. `minZoom: 2`, héritée de la v2, écrasait
    // silencieusement le recentrage initial : sur un jeu de données
    // multi-continental, `fitBounds` calculait un zoom de 1,48 qui était
    // ramené à 2, laissant un tiers des magasins hors écran. Un plancher est
    // légitime pour un locator régional — c'est alors à l'appelant de le poser.
    minZoom: 0,
    center: [0, 0],
    cooperativeGestures: true
    // Pas d'`attributionControl` ici : l'objet fourni *remplace* les défauts de
    // MapLibre au lieu de les compléter, et ferait donc disparaître son
    // `customAttribution`. `compact: true` est déjà le défaut ; le repli au
    // chargement se joue ailleurs — voir `map/attribution.ts`.
  },
  markers: {
    icon: null,
    popup: null
  },
  clusters: {
    enabled: true,
    radius: 50,
    // Zoom au-delà duquel les points ne sont plus regroupés. Mesuré sur Paris :
    // à 14, un cluster de deux ou trois magasins ne s'ouvrait qu'à z15, soit le
    // niveau de la rue. À 11, il s'ouvre à z12, niveau du quartier.
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
    // Sans plafond, une collection réduite à un seul point donne une emprise
    // dégénérée et `fitBounds` retombe sur le `maxZoom` de la carte, soit 18.
    // Filtrer jusqu'à un unique magasin projetterait donc au niveau du bâtiment,
    // sur des tuiles surzoomées. 16 montre le magasin dans sa rue.
    maxZoom: 16
  }
};
const defaultSelectors = {
  wrapper: '.store-locator',
  map: 'store-locator-map',
  filters: '.store-locator-filters'
};
const defaultOptions = {
  stores: null,
  map: defaultMapOptions,
  selectors: defaultSelectors,
  elements: {
    wrapper: null,
    map: null,
    filters: null
  }
};

const normalizeFilterValues = value => {
  return (Array.isArray(value) ? value : [value]).filter(item => item !== '' && item !== null && item !== undefined).map(item => `${item}`);
};
const isEmptyFilterValue = value => {
  return !normalizeFilterValues(value).length;
};
const matchesStoreProperty = (property, filter) => {
  if (property === null || property === undefined) {
    return false;
  }
  const values = normalizeFilterValues(filter);
  if (!values.length) {
    return true;
  }
  const properties = (Array.isArray(property) ? property : [property]).map(item => `${item}`);
  return values.some(value => properties.includes(value));
};
/**
 * Retourne une nouvelle `FeatureCollection` ne contenant que les features
 * satisfaisant tous les filtres. Les filtres vides sont ignorés.
 */
const filterFeatures = (collection, filters) => {
  if (!filters) {
    return _extends({}, collection, {
      features: [...collection.features]
    });
  }
  return _extends({}, collection, {
    features: collection.features.filter(feature => {
      return Object.entries(filters).every(([filter, value]) => {
        var _feature$properties;
        if (isEmptyFilterValue(value)) {
          return true;
        }
        return matchesStoreProperty((_feature$properties = feature.properties) == null ? void 0 : _feature$properties[filter], value);
      });
    })
  });
};

const LATITUDE_KEYS = ['lat', 'latitude'];
const LONGITUDE_KEYS = ['lng', 'lon', 'longitude'];
const isPlainObject = value => {
  return Object.prototype.toString.call(value) === '[object Object]';
};
const isDomElement = value => {
  return value !== null && typeof value === 'object' && 'nodeType' in value && value.nodeType === 1;
};
const isFormElement = value => {
  if (!isDomElement(value)) {
    return false;
  }
  return value.tagName === 'FORM';
};
const extend = (deep = false, ...objects) => {
  const extended = {};
  const merge = object => {
    if (!object) {
      return;
    }
    for (const prop in object) {
      if (!Object.prototype.hasOwnProperty.call(object, prop)) {
        continue;
      }
      const value = object[prop];
      if (deep && isPlainObject(value)) {
        extended[prop] = extend(true, extended[prop], value);
        continue;
      }
      extended[prop] = value;
    }
  };
  objects.forEach(merge);
  return extended;
};
const formValues = form => {
  const formData = new FormData(form);
  const values = {};
  formData.forEach((rawValue, key) => {
    const value = `${rawValue}`;
    if (!Reflect.has(values, key)) {
      values[key] = value;
      return;
    }
    if (!Array.isArray(values[key])) {
      values[key] = [values[key]];
    }
    values[key].push(value);
  });
  return values;
};
const resolveElement = (target, root = null, fallbackToId = false) => {
  if (isDomElement(target)) {
    return target;
  }
  if (typeof document === 'undefined' || typeof target !== 'string') {
    return null;
  }
  const lookupRoot = root && 'querySelector' in root ? root : document;
  if (fallbackToId) {
    const byId = document.getElementById(target);
    if (byId) {
      return byId;
    }
  }
  return lookupRoot.querySelector(target);
};
const getNumericValue = (object, keys) => {
  for (const key of keys) {
    const rawValue = object[key];
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      continue;
    }
    const value = Number(rawValue);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return null;
};
const isGeoJsonFeature = store => {
  if (!isPlainObject(store)) {
    return false;
  }
  if (store.type !== 'Feature' || !isPlainObject(store.geometry)) {
    return false;
  }
  return store.geometry.type === 'Point' && Array.isArray(store.geometry.coordinates);
};
/**
 * Met chaque feature en conformité avec les garanties de `StoreLocatorFeature`.
 *
 * Deux normalisations, volontairement réunies ici pour que le contrat ne
 * diverge pas d'une branche d'entrée à l'autre.
 *
 * **`id` séquentiel.** C'est la clé de diff des marqueurs et de déduplication
 * entre tuiles. Elle écrase systématiquement un `id` racine fourni par
 * l'appelant, y compris numérique : conditionner l'assignation exposerait à
 * des collisions entre identifiants métier et index générés. L'identifiant
 * métier reste disponible dans `properties`.
 *
 * Conséquence assumée : l'`id` étant positionnel, réordonner les mêmes stores
 * change tous les identifiants et provoque la reconstruction de tous les
 * marqueurs.
 *
 * **`properties` non nul.** `"properties": null` est du GeoJSON conforme à la
 * norme, mais `StoreLocatorFeature<P>` promet aux factories `icon` et `popup`
 * que `feature.properties` est toujours accessible. On normalise vers `{}`
 * plutôt que de rejeter : refuser casserait des données utilisateur valides.
 *
 * Le cast `{} as P` n'est honnête que si `P` n'a aucune clé requise. Une
 * feature dont les propriétés arrivent nulles perd donc les champs que son
 * type déclare. C'est la contrepartie acceptée d'un assainissement en
 * frontière : l'alternative — élargir le retour en `Partial<P>` — taxerait
 * tous les consommateurs pour un cas marginal.
 */
const normalizeFeatures = features => {
  return features.map((feature, index) => {
    var _feature$properties;
    return _extends({}, feature, {
      id: index,
      properties: (_feature$properties = feature.properties) != null ? _feature$properties : {}
    });
  });
};
/**
 * Normalise les données d'entrée en `FeatureCollection` GeoJSON.
 *
 * Accepte trois formes : une `FeatureCollection`, un tableau de `Feature`
 * GeoJSON, ou un tableau d'objets plats porteurs de coordonnées. Les trois
 * passent par {@link normalizeFeatures}, qui garantit l'`id` de diff et un
 * sac de propriétés lisible. L'entrée n'est jamais mutée.
 */
const normalizeStores = stores => {
  if (stores === null || stores === undefined) {
    return null;
  }
  if (isPlainObject(stores) && stores.type === 'FeatureCollection' && Array.isArray(stores.features)) {
    return _extends({}, stores, {
      features: normalizeFeatures(stores.features)
    });
  }
  if (!Array.isArray(stores)) {
    throw new Error('[store-locator] - Invalid stores format');
  }
  if (stores.every(store => isGeoJsonFeature(store))) {
    return {
      type: 'FeatureCollection',
      features: normalizeFeatures(stores)
    };
  }
  return {
    type: 'FeatureCollection',
    features: normalizeFeatures(stores.map(store => {
      if (!isPlainObject(store)) {
        throw new Error('[store-locator] - Invalid stores format');
      }
      const lat = getNumericValue(store, LATITUDE_KEYS);
      const lng = getNumericValue(store, LONGITUDE_KEYS);
      if (lat === null || lng === null) {
        throw new Error('[store-locator] - Invalid store coordinates');
      }
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: _extends({}, store)
      };
    }))
  };
};

const computeBounds = collection => {
  let west = Number.POSITIVE_INFINITY;
  let south = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;
  let found = false;
  for (const feature of collection.features) {
    const [lng, lat] = feature.geometry.coordinates;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      continue;
    }
    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
    found = true;
  }
  return found ? [[west, south], [east, north]] : null;
};

const ATTRIBUTION = '.maplibregl-ctrl-attrib';
const COMPACT = 'maplibregl-compact';
const COMPACT_SHOW = 'maplibregl-compact-show';
const collapseAttribution = map => {
  const replier = () => {
    const controle = map.getContainer().querySelector(ATTRIBUTION);
    if (!controle) {
      return;
    }
    controle.classList.remove(COMPACT_SHOW);
    // Une fois `maplibregl-compact` posée, la branche d'ajout de
    // `_updateCompact` est gardée par son absence : elle ne repose plus rien.
    // Le repli tient donc seul, et se désabonner évite de refermer dans le dos
    // de qui vient d'ouvrir le panneau.
    if (controle.classList.contains(COMPACT)) {
      subscription.unsubscribe();
    }
  };
  const subscription = map.on('styledata', replier);
  replier();
};

/**
 * Feuille de style de MapLibre GL JS 6.8.0, embarquée.
 *
 * **Données générées — ne pas retoucher à la main.** Après une montée de version
 * de `maplibre-gl` :
 *
 * ```bash
 * node scripts/import-maplibre-css.mjs
 * ```
 *
 * Embarquée pour que la librairie s'installe sans étape de chargement de CSS.
 * L'importer depuis le point d'entrée ne marcherait que pour les applications à
 * bundler : microbundle externalise `maplibre-gl`, sous-chemin CSS compris, et
 * le spécificateur nu survivrait dans le bundle publié, où aucune importmap ne
 * peut le résoudre.
 *
 * @license 3-Clause BSD — MapLibre GL JS, https://github.com/maplibre/maplibre-gl-js/blob/v6.8.0/LICENSE.txt
 */
const css = ".maplibregl-map{font:12px/20px Helvetica Neue,Arial,Helvetica,sans-serif;overflow:hidden;position:relative;-webkit-tap-highlight-color:rgb(0 0 0/0)}.maplibregl-canvas{position:absolute;left:0;top:0}.maplibregl-map:fullscreen{width:100%;height:100%}.maplibregl-ctrl-group button.maplibregl-ctrl-compass{touch-action:none}.maplibregl-canvas-container.maplibregl-interactive,.maplibregl-ctrl-group button.maplibregl-ctrl-compass{cursor:grab;-webkit-user-select:none;-moz-user-select:none;user-select:none}.maplibregl-canvas-container.maplibregl-interactive.maplibregl-track-pointer{cursor:pointer}.maplibregl-canvas-container.maplibregl-interactive:active,.maplibregl-ctrl-group button.maplibregl-ctrl-compass:active{cursor:grabbing}.maplibregl-canvas-container.maplibregl-touch-zoom-rotate,.maplibregl-canvas-container.maplibregl-touch-zoom-rotate .maplibregl-canvas{touch-action:pan-x pan-y}.maplibregl-canvas-container.maplibregl-touch-drag-pan,.maplibregl-canvas-container.maplibregl-touch-drag-pan .maplibregl-canvas{touch-action:pinch-zoom}.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan,.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan .maplibregl-canvas{touch-action:none}.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures,.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures .maplibregl-canvas{touch-action:pan-x pan-y}.maplibregl-ctrl-bottom-left,.maplibregl-ctrl-bottom-right,.maplibregl-ctrl-top-left,.maplibregl-ctrl-top-right{position:absolute;pointer-events:none;z-index:2}.maplibregl-ctrl-top-left{top:0;left:0}.maplibregl-ctrl-top-right{top:0;right:0}.maplibregl-ctrl-bottom-left{bottom:0;left:0}.maplibregl-ctrl-bottom-right{right:0;bottom:0}.maplibregl-ctrl{clear:both;pointer-events:auto;transform:translate(0)}.maplibregl-ctrl-top-left .maplibregl-ctrl{margin:10px 0 0 10px;float:left}.maplibregl-ctrl-top-right .maplibregl-ctrl{margin:10px 10px 0 0;float:right}.maplibregl-ctrl-bottom-left .maplibregl-ctrl{margin:0 0 10px 10px;float:left}.maplibregl-ctrl-bottom-right .maplibregl-ctrl{margin:0 10px 10px 0;float:right}.maplibregl-ctrl-group{border-radius:4px;background:#fff}.maplibregl-ctrl-group:not(:empty){box-shadow:0 0 0 2px rgba(0,0,0,.1)}@media (forced-colors:active){.maplibregl-ctrl-group:not(:empty){box-shadow:0 0 0 2px ButtonText}}.maplibregl-ctrl-group button{width:29px;height:29px;display:block;padding:0;outline:none;border:0;box-sizing:border-box;background-color:transparent;cursor:pointer}.maplibregl-ctrl-group button+button{border-top:1px solid #ddd}.maplibregl-ctrl button .maplibregl-ctrl-icon{display:block;width:100%;height:100%;background-repeat:no-repeat;background-position:50%}@media (forced-colors:active){.maplibregl-ctrl-icon{background-color:transparent}.maplibregl-ctrl-group button+button{border-top:1px solid ButtonText}}.maplibregl-ctrl button::-moz-focus-inner{border:0;padding:0}.maplibregl-ctrl-attrib-button:focus,.maplibregl-ctrl-group button:focus{box-shadow:0 0 2px 2px #0096ff}.maplibregl-ctrl button:disabled{cursor:not-allowed}.maplibregl-ctrl button:disabled .maplibregl-ctrl-icon{opacity:.25}@media (hover:hover){.maplibregl-ctrl button:not(:disabled):hover{background-color:rgba(0,0,0,.05)}}.maplibregl-ctrl button:not(:disabled):active{background-color:rgba(0,0,0,.05)}.maplibregl-ctrl-group button:focus:focus-visible{box-shadow:0 0 2px 2px #0096ff}.maplibregl-ctrl-group button:focus:not(:focus-visible){box-shadow:none}.maplibregl-ctrl-group button:focus:first-child{border-radius:4px 4px 0 0}.maplibregl-ctrl-group button:focus:last-child{border-radius:0 0 4px 4px}.maplibregl-ctrl-group button:focus:only-child{border-radius:inherit}.maplibregl-ctrl button.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23333%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M10%2013c-.75%200-1.5.75-1.5%201.5S9.25%2016%2010%2016h9c.75%200%201.5-.75%201.5-1.5S19.75%2013%2019%2013z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23333%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M14.5%208.5c-.75%200-1.5.75-1.5%201.5v3h-3c-.75%200-1.5.75-1.5%201.5S9.25%2016%2010%2016h3v3c0%20.75.75%201.5%201.5%201.5S16%2019.75%2016%2019v-3h3c.75%200%201.5-.75%201.5-1.5S19.75%2013%2019%2013h-3v-3c0-.75-.75-1.5-1.5-1.5%22%2F%3E%3C%2Fsvg%3E\")}@media (forced-colors:active){.maplibregl-ctrl button.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23fff%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M10%2013c-.75%200-1.5.75-1.5%201.5S9.25%2016%2010%2016h9c.75%200%201.5-.75%201.5-1.5S19.75%2013%2019%2013z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23fff%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M14.5%208.5c-.75%200-1.5.75-1.5%201.5v3h-3c-.75%200-1.5.75-1.5%201.5S9.25%2016%2010%2016h3v3c0%20.75.75%201.5%201.5%201.5S16%2019.75%2016%2019v-3h3c.75%200%201.5-.75%201.5-1.5S19.75%2013%2019%2013h-3v-3c0-.75-.75-1.5-1.5-1.5%22%2F%3E%3C%2Fsvg%3E\")}}@media (forced-colors:active) and (prefers-color-scheme:light){.maplibregl-ctrl button.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M10%2013c-.75%200-1.5.75-1.5%201.5S9.25%2016%2010%2016h9c.75%200%201.5-.75%201.5-1.5S19.75%2013%2019%2013z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M14.5%208.5c-.75%200-1.5.75-1.5%201.5v3h-3c-.75%200-1.5.75-1.5%201.5S9.25%2016%2010%2016h3v3c0%20.75.75%201.5%201.5%201.5S16%2019.75%2016%2019v-3h3c.75%200%201.5-.75%201.5-1.5S19.75%2013%2019%2013h-3v-3c0-.75-.75-1.5-1.5-1.5%22%2F%3E%3C%2Fsvg%3E\")}}.maplibregl-ctrl button.maplibregl-ctrl-fullscreen .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23333%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M24%2016v5.5c0%201.75-.75%202.5-2.5%202.5H16v-1l3-1.5-4-5.5%201-1%205.5%204%201.5-3zM6%2016l1.5%203%205.5-4%201%201-4%205.5%203%201.5v1H7.5C5.75%2024%205%2023.25%205%2021.5V16zm7-11v1l-3%201.5%204%205.5-1%201-5.5-4L6%2013H5V7.5C5%205.75%205.75%205%207.5%205zm11%202.5c0-1.75-.75-2.5-2.5-2.5H16v1l3%201.5-4%205.5%201%201%205.5-4%201.5%203h1z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-shrink .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M18.5%2016c-1.75%200-2.5.75-2.5%202.5V24h1l1.5-3%205.5%204%201-1-4-5.5%203-1.5v-1zM13%2018.5c0-1.75-.75-2.5-2.5-2.5H5v1l3%201.5L4%2024l1%201%205.5-4%201.5%203h1zm3-8c0%201.75.75%202.5%202.5%202.5H24v-1l-3-1.5L25%205l-1-1-5.5%204L17%205h-1zM10.5%2013c1.75%200%202.5-.75%202.5-2.5V5h-1l-1.5%203L5%204%204%205l4%205.5L5%2012v1z%22%2F%3E%3C%2Fsvg%3E\")}@media (forced-colors:active){.maplibregl-ctrl button.maplibregl-ctrl-fullscreen .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23fff%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M24%2016v5.5c0%201.75-.75%202.5-2.5%202.5H16v-1l3-1.5-4-5.5%201-1%205.5%204%201.5-3zM6%2016l1.5%203%205.5-4%201%201-4%205.5%203%201.5v1H7.5C5.75%2024%205%2023.25%205%2021.5V16zm7-11v1l-3%201.5%204%205.5-1%201-5.5-4L6%2013H5V7.5C5%205.75%205.75%205%207.5%205zm11%202.5c0-1.75-.75-2.5-2.5-2.5H16v1l3%201.5-4%205.5%201%201%205.5-4%201.5%203h1z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-shrink .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23fff%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M18.5%2016c-1.75%200-2.5.75-2.5%202.5V24h1l1.5-3%205.5%204%201-1-4-5.5%203-1.5v-1zM13%2018.5c0-1.75-.75-2.5-2.5-2.5H5v1l3%201.5L4%2024l1%201%205.5-4%201.5%203h1zm3-8c0%201.75.75%202.5%202.5%202.5H24v-1l-3-1.5L25%205l-1-1-5.5%204L17%205h-1zM10.5%2013c1.75%200%202.5-.75%202.5-2.5V5h-1l-1.5%203L5%204%204%205l4%205.5L5%2012v1z%22%2F%3E%3C%2Fsvg%3E\")}}@media (forced-colors:active) and (prefers-color-scheme:light){.maplibregl-ctrl button.maplibregl-ctrl-fullscreen .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M24%2016v5.5c0%201.75-.75%202.5-2.5%202.5H16v-1l3-1.5-4-5.5%201-1%205.5%204%201.5-3zM6%2016l1.5%203%205.5-4%201%201-4%205.5%203%201.5v1H7.5C5.75%2024%205%2023.25%205%2021.5V16zm7-11v1l-3%201.5%204%205.5-1%201-5.5-4L6%2013H5V7.5C5%205.75%205.75%205%207.5%205zm11%202.5c0-1.75-.75-2.5-2.5-2.5H16v1l3%201.5-4%205.5%201%201%205.5-4%201.5%203h1z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-shrink .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22M18.5%2016c-1.75%200-2.5.75-2.5%202.5V24h1l1.5-3%205.5%204%201-1-4-5.5%203-1.5v-1zM13%2018.5c0-1.75-.75-2.5-2.5-2.5H5v1l3%201.5L4%2024l1%201%205.5-4%201.5%203h1zm3-8c0%201.75.75%202.5%202.5%202.5H24v-1l-3-1.5L25%205l-1-1-5.5%204L17%205h-1zM10.5%2013c1.75%200%202.5-.75%202.5-2.5V5h-1l-1.5%203L5%204%204%205l4%205.5L5%2012v1z%22%2F%3E%3C%2Fsvg%3E\")}}.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23333%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22m10.5%2014%204-8%204%208z%22%2F%3E%3Cpath%20fill%3D%22%23ccc%22%20d%3D%22m10.5%2016%204%208%204-8z%22%2F%3E%3C%2Fsvg%3E\")}@media (forced-colors:active){.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23fff%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22m10.5%2014%204-8%204%208z%22%2F%3E%3Cpath%20fill%3D%22%23ccc%22%20d%3D%22m10.5%2016%204%208%204-8z%22%2F%3E%3C%2Fsvg%3E\")}}@media (forced-colors:active) and (prefers-color-scheme:light){.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2029%2029%22%3E%3Cpath%20d%3D%22m10.5%2014%204-8%204%208z%22%2F%3E%3Cpath%20fill%3D%22%23ccc%22%20d%3D%22m10.5%2016%204%208%204-8z%22%2F%3E%3C%2Fsvg%3E\")}}.maplibregl-ctrl button.maplibregl-ctrl-globe .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20fill%3D%22none%22%20stroke%3D%22%23333%22%20viewBox%3D%220%200%2022%2022%22%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%2211%22%20r%3D%228.5%22%2F%3E%3Cpath%20d%3D%22M17.5%2011c0%204.819-3.02%208.5-6.5%208.5S4.5%2015.819%204.5%2011%207.52%202.5%2011%202.5s6.5%203.681%206.5%208.5Z%22%2F%3E%3Cpath%20d%3D%22M13.5%2011c0%202.447-.331%204.64-.853%206.206-.262.785-.562%201.384-.872%201.777-.314.399-.58.517-.775.517s-.461-.118-.775-.517c-.31-.393-.61-.992-.872-1.777C8.831%2015.64%208.5%2013.446%208.5%2011s.331-4.64.853-6.206c.262-.785.562-1.384.872-1.777.314-.399.58-.517.775-.517s.461.118.775.517c.31.393.61.992.872%201.777.522%201.565.853%203.76.853%206.206Z%22%2F%3E%3Cpath%20d%3D%22M11%207.5c-1.909%200-3.622-.166-4.845-.428-.616-.132-1.08-.283-1.379-.434a1.3%201.3%200%200%201-.224-.138q.07-.058.224-.138c.299-.151.763-.302%201.379-.434C7.378%205.666%209.091%205.5%2011%205.5s3.622.166%204.845.428c.616.132%201.08.283%201.379.434.105.053.177.1.224.138q-.07.058-.224.138c-.299.151-.763.302-1.379.434-1.223.262-2.936.428-4.845.428Zm0%209c-1.909%200-3.622-.166-4.845-.428-.616-.132-1.08-.283-1.379-.434a1.3%201.3%200%200%201-.224-.138%201.3%201.3%200%200%201%20.224-.138c.299-.151.763-.302%201.379-.434C7.378%2014.666%209.091%2014.5%2011%2014.5s3.622.166%204.845.428c.616.132%201.08.283%201.379.434.105.053.177.1.224.138a1.3%201.3%200%200%201-.224.138c-.299.151-.763.302-1.379.434-1.223.262-2.936.428-4.845.428Zm0-4c-2.46%200-4.672-.222-6.255-.574-.796-.177-1.406-.38-1.805-.59a1.5%201.5%200%200%201-.39-.272.3.3%200%200%201-.047-.064.3.3%200%200%201%20.048-.064c.066-.073.189-.167.389-.272.399-.21%201.009-.413%201.805-.59C6.328%209.722%208.54%209.5%2011%209.5s4.672.222%206.256.574c.795.177%201.405.38%201.804.59.2.105.323.2.39.272a.3.3%200%200%201%20.047.064.3.3%200%200%201-.048.064%201.4%201.4%200%200%201-.389.272c-.399.21-1.009.413-1.804.59-1.584.352-3.796.574-6.256.574Zm-8.501-1.51v.002zm0%20.018v.002zm17.002.002v-.002zm0-.018v-.002z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-globe-enabled .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20fill%3D%22none%22%20stroke%3D%22%2333b5e5%22%20viewBox%3D%220%200%2022%2022%22%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%2211%22%20r%3D%228.5%22%2F%3E%3Cpath%20d%3D%22M17.5%2011c0%204.819-3.02%208.5-6.5%208.5S4.5%2015.819%204.5%2011%207.52%202.5%2011%202.5s6.5%203.681%206.5%208.5Z%22%2F%3E%3Cpath%20d%3D%22M13.5%2011c0%202.447-.331%204.64-.853%206.206-.262.785-.562%201.384-.872%201.777-.314.399-.58.517-.775.517s-.461-.118-.775-.517c-.31-.393-.61-.992-.872-1.777C8.831%2015.64%208.5%2013.446%208.5%2011s.331-4.64.853-6.206c.262-.785.562-1.384.872-1.777.314-.399.58-.517.775-.517s.461.118.775.517c.31.393.61.992.872%201.777.522%201.565.853%203.76.853%206.206Z%22%2F%3E%3Cpath%20d%3D%22M11%207.5c-1.909%200-3.622-.166-4.845-.428-.616-.132-1.08-.283-1.379-.434a1.3%201.3%200%200%201-.224-.138q.07-.058.224-.138c.299-.151.763-.302%201.379-.434C7.378%205.666%209.091%205.5%2011%205.5s3.622.166%204.845.428c.616.132%201.08.283%201.379.434.105.053.177.1.224.138q-.07.058-.224.138c-.299.151-.763.302-1.379.434-1.223.262-2.936.428-4.845.428Zm0%209c-1.909%200-3.622-.166-4.845-.428-.616-.132-1.08-.283-1.379-.434a1.3%201.3%200%200%201-.224-.138%201.3%201.3%200%200%201%20.224-.138c.299-.151.763-.302%201.379-.434C7.378%2014.666%209.091%2014.5%2011%2014.5s3.622.166%204.845.428c.616.132%201.08.283%201.379.434.105.053.177.1.224.138a1.3%201.3%200%200%201-.224.138c-.299.151-.763.302-1.379.434-1.223.262-2.936.428-4.845.428Zm0-4c-2.46%200-4.672-.222-6.255-.574-.796-.177-1.406-.38-1.805-.59a1.5%201.5%200%200%201-.39-.272.3.3%200%200%201-.047-.064.3.3%200%200%201%20.048-.064c.066-.073.189-.167.389-.272.399-.21%201.009-.413%201.805-.59C6.328%209.722%208.54%209.5%2011%209.5s4.672.222%206.256.574c.795.177%201.405.38%201.804.59.2.105.323.2.39.272a.3.3%200%200%201%20.047.064.3.3%200%200%201-.048.064%201.4%201.4%200%200%201-.389.272c-.399.21-1.009.413-1.804.59-1.584.352-3.796.574-6.256.574Zm-8.501-1.51v.002zm0%20.018v.002zm17.002.002v-.002zm0-.018v-.002z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-terrain .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20fill%3D%22%23333%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20d%3D%22m1.754%2013.406%204.453-4.851%203.09%203.09%203.281%203.277.969-.969-3.309-3.312%203.844-4.121%206.148%206.886h1.082v-.855l-7.207-8.07-4.84%205.187L6.169%206.57l-5.48%205.965v.871ZM.688%2016.844h20.625v1.375H.688Zm0%200%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-terrain-enabled .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20fill%3D%22%2333b5e5%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cpath%20d%3D%22m1.754%2013.406%204.453-4.851%203.09%203.09%203.281%203.277.969-.969-3.309-3.312%203.844-4.121%206.148%206.886h1.082v-.855l-7.207-8.07-4.84%205.187L6.169%206.57l-5.48%205.965v.871ZM.688%2016.844h20.625v1.375H.688Zm0%200%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23333%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate:disabled .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23aaa%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3Cpath%20fill%3D%22red%22%20d%3D%22m14%205%201%201-9%209-1-1z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%2333b5e5%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active-error .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23e58978%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%2333b5e5%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background-error .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23e54e33%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-waiting .maplibregl-ctrl-icon{animation:maplibregl-spin 2s linear infinite}@media (forced-colors:active){.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23fff%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate:disabled .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23999%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3Cpath%20fill%3D%22red%22%20d%3D%22m14%205%201%201-9%209-1-1z%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%2333b5e5%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active-error .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23e58978%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%2333b5e5%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background-error .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23e54e33%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3C%2Fsvg%3E\")}}@media (forced-colors:active) and (prefers-color-scheme:light){.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E\")}.maplibregl-ctrl button.maplibregl-ctrl-geolocate:disabled .maplibregl-ctrl-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2229%22%20height%3D%2229%22%20fill%3D%22%23666%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M10%204C9%204%209%205%209%205v.1A5%205%200%200%200%205.1%209H5s-1%200-1%201%201%201%201%201h.1A5%205%200%200%200%209%2014.9v.1s0%201%201%201%201-1%201-1v-.1a5%205%200%200%200%203.9-3.9h.1s1%200%201-1-1-1-1-1h-.1A5%205%200%200%200%2011%205.1V5s0-1-1-1m0%202.5a3.5%203.5%200%201%201%200%207%203.5%203.5%200%201%201%200-7%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%222%22%2F%3E%3Cpath%20fill%3D%22red%22%20d%3D%22m14%205%201%201-9%209-1-1z%22%2F%3E%3C%2Fsvg%3E\")}}@keyframes maplibregl-spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}a.maplibregl-ctrl-logo{width:88px;height:23px;margin:0 0 -4px -4px;display:block;background-repeat:no-repeat;cursor:pointer;overflow:hidden;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2288%22%20height%3D%2223%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22%23000%22%20fill-opacity%3D%22.4%22%20fill-rule%3D%22evenodd%22%20d%3D%22M17.408%2016.796h-1.827l2.501-12.095h.198l3.324%206.533.988%202.19.988-2.19%203.258-6.533h.181l2.6%2012.095h-1.81l-1.218-5.644-.362-1.71-.658%201.71-2.929%205.644h-.098l-2.914-5.644-.757-1.71-.345%201.71zm1.958-3.42-.726%203.663a1.255%201.255%200%200%201-1.232%201.011h-1.827a1.255%201.255%200%200%201-1.229-1.509l2.501-12.095a1.255%201.255%200%200%201%201.23-1.001h.197a1.25%201.25%200%200%201%201.12.685l3.19%206.273%203.125-6.263a1.25%201.25%200%200%201%201.123-.695h.181a1.255%201.255%200%200%201%201.227.991l1.443%206.71a5%205%200%200%201%20.314-.787l.009-.016a4.6%204.6%200%200%201%201.777-1.887c.782-.46%201.668-.667%202.611-.667a4.6%204.6%200%200%201%201.7.32l.306.134c.21-.16.474-.256.759-.256h1.694a1.255%201.255%200%200%201%201.212.925%201.255%201.255%200%200%201%201.212-.925h1.711c.284%200%20.545.094.755.252.613-.3%201.312-.45%202.075-.45%201.356%200%202.557.445%203.482%201.4q.47.48.763%201.064V4.701a1.255%201.255%200%200%201%201.255-1.255h1.86A1.255%201.255%200%200%201%2054.44%204.7v9.194h2.217c.19%200%20.37.043.532.118v-4.77c0-.356.147-.678.385-.906a2.42%202.42%200%200%201-.682-1.71c0-.665.267-1.253.735-1.7a2.45%202.45%200%200%201%201.722-.674%202.43%202.43%200%200%201%201.705.675q.318.302.504.683V4.7a1.255%201.255%200%200%201%201.255-1.255h1.744A1.255%201.255%200%200%201%2065.812%204.7v3.335a4.8%204.8%200%200%201%201.526-.246c.938%200%201.817.214%202.59.69a4.47%204.47%200%200%201%201.67%201.743v-.98a1.255%201.255%200%200%201%201.256-1.256h1.777c.233%200%20.451.064.639.174a3.4%203.4%200%200%201%201.567-.372c.346%200%20.861.02%201.285.232a1.25%201.25%200%200%201%20.689%201.004%204.7%204.7%200%200%201%20.853-.588c.795-.44%201.675-.647%202.61-.647%201.385%200%202.65.39%203.525%201.396.836.938%201.168%202.173%201.168%203.528q-.001.515-.056%201.051a1.255%201.255%200%200%201-.947%201.09l.408.952a1.255%201.255%200%200%201-.477%201.552c-.418.268-.92.463-1.458.612-.613.171-1.304.244-2.049.244-1.06%200-2.043-.207-2.886-.698l-.015-.008c-.798-.48-1.419-1.135-1.818-1.963l-.004-.008a5.8%205.8%200%200%201-.548-2.512q0-.429.053-.843a1.3%201.3%200%200%201-.333-.086l-.166-.004c-.223%200-.426.062-.643.228-.03.024-.142.139-.142.59v3.883a1.255%201.255%200%200%201-1.256%201.256h-1.777a1.255%201.255%200%200%201-1.256-1.256V15.69l-.032.057a4.8%204.8%200%200%201-1.86%201.833%205.04%205.04%200%200%201-2.484.634%204.5%204.5%200%200%201-1.935-.424%201.25%201.25%200%200%201-.764.258h-1.71a1.255%201.255%200%200%201-1.256-1.255V7.687a2.4%202.4%200%200%201-.428.625c.253.23.412.561.412.93v7.553a1.255%201.255%200%200%201-1.256%201.255h-1.843a1.25%201.25%200%200%201-.894-.373c-.228.23-.544.373-.894.373H51.32a1.255%201.255%200%200%201-1.256-1.255v-1.251l-.061.117a4.7%204.7%200%200%201-1.782%201.884%204.77%204.77%200%200%201-2.485.67%205.6%205.6%200%200%201-1.485-.188l.009%202.764a1.255%201.255%200%200%201-1.255%201.259h-1.729a1.255%201.255%200%200%201-1.255-1.255v-3.537a1.255%201.255%200%200%201-1.167.793h-1.679a1.25%201.25%200%200%201-.77-.263%204.5%204.5%200%200%201-1.945.429c-.885%200-1.724-.21-2.495-.632l-.017-.01a5%205%200%200%201-1.081-.836%201.255%201.255%200%200%201-1.254%201.312h-1.81a1.255%201.255%200%200%201-1.228-.99l-.782-3.625-2.044%203.939a1.25%201.25%200%200%201-1.115.676h-.098a1.25%201.25%200%200%201-1.116-.68l-2.061-3.994zM35.92%2016.63l.207-.114.223-.15q.493-.356.735-.785l.061-.118.033%201.332h1.678V9.242h-1.694l-.033%201.267q-.133-.329-.526-.658l-.032-.028a3.2%203.2%200%200%200-.668-.428l-.27-.12a3.3%203.3%200%200%200-1.235-.23q-1.136-.001-1.974.493a3.36%203.36%200%200%200-1.3%201.382q-.445.89-.444%202.074%200%201.2.51%202.107a3.8%203.8%200%200%200%201.382%201.381%203.9%203.9%200%200%200%201.893.477q.795%200%201.455-.33zm-2.789-5.38q-.576.675-.575%201.762%200%201.102.559%201.794.576.675%201.645.675a2.25%202.25%200%200%200%20.934-.19%202.2%202.2%200%200%200%20.468-.29l.178-.161a2.2%202.2%200%200%200%20.397-.561q.244-.5.244-1.15v-.115q0-.708-.296-1.267l-.043-.077a2.2%202.2%200%200%200-.633-.709l-.13-.086-.047-.028a2.1%202.1%200%200%200-1.073-.285q-1.052%200-1.629.692zm2.316%202.706c.163-.17.28-.407.28-.83v-.114c0-.292-.06-.508-.15-.68a.96.96%200%200%200-.353-.389.85.85%200%200%200-.464-.127c-.4%200-.56.114-.664.239l-.01.012c-.148.174-.275.45-.275.945%200%20.506.122.801.27.99.097.11.266.224.68.224.303%200%20.504-.09.687-.269zm7.545%201.705a2.6%202.6%200%200%200%20.331.423q.319.33.755.548l.173.074q.65.255%201.49.255%201.02%200%201.844-.493a3.45%203.45%200%200%200%201.316-1.4q.493-.904.493-2.089%200-1.909-.988-2.913-.988-1.02-2.584-1.02-.898%200-1.575.347a3%203%200%200%200-.415.262l-.199.166a3.4%203.4%200%200%200-.64.82V9.242h-1.712v11.553h1.729l-.017-5.134zm.53-1.138q.206.29.48.5l.155.11.053.034q.51.296%201.119.297%201.07%200%201.645-.675.577-.69.576-1.762%200-1.119-.576-1.777-.558-.675-1.645-.675-.435%200-.835.16a2%202%200%200%200-.284.136%202%202%200%200%200-.363.254%202.2%202.2%200%200%200-.46.569l-.082.162a2.6%202.6%200%200%200-.213%201.072v.115q0%20.707.296%201.267l.135.211zm.964-.818a1.1%201.1%200%200%200%20.367.385.94.94%200%200%200%20.476.118c.423%200%20.59-.117.687-.23.159-.194.28-.478.28-.95%200-.53-.133-.8-.266-.952l-.021-.025c-.078-.094-.231-.221-.68-.221a1%201%200%200%200-.503.135l-.012.007a.86.86%200%200%200-.335.343c-.073.133-.132.324-.132.614v.115a1.4%201.4%200%200%200%20.14.66zm15.7-6.222q.347-.346.346-.856a1.05%201.05%200%200%200-.345-.79%201.18%201.18%200%200%200-.84-.329q-.51%200-.855.33a1.05%201.05%200%200%200-.346.79q0%20.51.346.855.345.346.856.346.51%200%20.839-.346zm4.337%209.314.033-1.332q.191.403.59.747l.098.081a4%204%200%200%200%20.316.224l.223.122a3.2%203.2%200%200%200%201.44.322%203.8%203.8%200%200%200%201.875-.477%203.5%203.5%200%200%200%201.382-1.366q.527-.89.526-2.09%200-1.184-.444-2.073a3.24%203.24%200%200%200-1.283-1.399q-.823-.51-1.942-.51a3.5%203.5%200%200%200-1.527.344l-.086.043-.165.09a3%203%200%200%200-.33.214q-.432.315-.656.707a2%202%200%200%200-.099.198l.082-1.283V4.701h-1.744v12.095zm.473-2.509a2.5%202.5%200%200%200%20.566.7q.117.098.245.18l.144.08a2.1%202.1%200%200%200%20.975.232q1.07%200%201.645-.675.576-.69.576-1.778%200-1.102-.576-1.777-.56-.691-1.645-.692a2.2%202.2%200%200%200-1.015.235q-.22.113-.415.282l-.15.142a2.1%202.1%200%200%200-.42.594q-.223.479-.223%201.1v.115q0%20.705.293%201.26zm2.616-.293c.157-.191.28-.479.28-.967%200-.51-.13-.79-.276-.961l-.021-.026c-.082-.1-.232-.225-.67-.225a.87.87%200%200%200-.681.279l-.012.011c-.154.155-.274.38-.274.807v.115c0%20.285.057.499.144.669a1.1%201.1%200%200%200%20.367.405c.137.082.28.123.455.123.423%200%20.59-.118.686-.23zm8.266-3.013q.345-.13.724-.14l.069-.002q.493%200%20.642.099l.247-1.794q-.196-.099-.717-.099a2.3%202.3%200%200%200-.545.063%202%202%200%200%200-.411.148%202.2%202.2%200%200%200-.4.249%202.5%202.5%200%200%200-.485.499%202.7%202.7%200%200%200-.32.581l-.05.137v-1.48h-1.778v7.553h1.777v-3.884q0-.546.159-.943a1.5%201.5%200%200%201%20.466-.636%202.5%202.5%200%200%201%20.399-.253%202%202%200%200%201%20.224-.099zm9.784%202.656.05-.922q0-1.743-.856-2.698-.838-.97-2.584-.97-1.119-.001-2.007.493a3.46%203.46%200%200%200-1.4%201.382q-.493.906-.493%202.106%200%201.07.428%201.975.428.89%201.332%201.432.906.526%202.255.526.973%200%201.668-.185l.044-.012.135-.04q.613-.184.984-.421l-.542-1.267q-.3.162-.642.274l-.297.087q-.51.131-1.3.131-.954%200-1.497-.444a1.6%201.6%200%200%201-.192-.193q-.366-.44-.512-1.234l-.004-.021zm-5.427-1.256-.003.022h3.752v-.138q-.011-.727-.288-1.118a1%201%200%200%200-.156-.176q-.46-.428-1.316-.428-.986%200-1.494.604-.379.45-.494%201.234zm-27.053%202.77V4.7h-1.86v12.095h5.333V15.15zm7.103-5.908v7.553h-1.843V9.242h1.843z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m19.63%2011.151-.757-1.71-.345%201.71-1.12%205.644h-1.827L18.083%204.7h.197l3.325%206.533.988%202.19.988-2.19L26.839%204.7h.181l2.6%2012.095h-1.81l-1.218-5.644-.362-1.71-.658%201.71-2.93%205.644h-.098l-2.913-5.644zm14.836%205.81q-1.02%200-1.893-.478a3.8%203.8%200%200%201-1.381-1.382q-.51-.906-.51-2.106%200-1.185.444-2.074a3.36%203.36%200%200%201%201.3-1.382q.839-.494%201.974-.494a3.3%203.3%200%200%201%201.234.231%203.3%203.3%200%200%201%20.97.575q.396.33.527.659l.033-1.267h1.694v7.553H37.18l-.033-1.332q-.279.593-1.02%201.053a3.17%203.17%200%200%201-1.662.444zm.296-1.482q.938%200%201.58-.642.642-.66.642-1.711v-.115q0-.708-.296-1.267a2.2%202.2%200%200%200-.807-.872%202.1%202.1%200%200%200-1.119-.313q-1.053%200-1.629.692-.575.675-.575%201.76%200%201.103.559%201.795.577.675%201.645.675zm6.521-6.237h1.711v1.4q.906-1.597%202.83-1.597%201.596%200%202.584%201.02.988%201.005.988%202.914%200%201.185-.493%202.09a3.46%203.46%200%200%201-1.316%201.399%203.5%203.5%200%200%201-1.844.493q-.954%200-1.662-.329a2.67%202.67%200%200%201-1.086-.97l.017%205.134h-1.728zm4.048%206.22q1.07%200%201.645-.674.577-.69.576-1.762%200-1.119-.576-1.777-.558-.675-1.645-.675-.592%200-1.12.296-.51.28-.822.823-.296.527-.296%201.234v.115q0%20.708.296%201.267.313.543.823.855.51.296%201.119.297z%22%2F%3E%3Cpath%20fill%3D%22%23e1e3e9%22%20d%3D%22M51.325%204.7h1.86v10.45h3.473v1.646h-5.333zm7.12%204.542h1.843v7.553h-1.843zm.905-1.415a1.16%201.16%200%200%201-.856-.346%201.17%201.17%200%200%201-.346-.856%201.05%201.05%200%200%201%20.346-.79q.346-.329.856-.329.494%200%20.839.33a1.05%201.05%200%200%201%20.345.79%201.16%201.16%200%200%201-.345.855q-.33.346-.84.346zm7.875%209.133a3.17%203.17%200%200%201-1.662-.444q-.723-.46-1.004-1.053l-.033%201.332h-1.71V4.701h1.743v4.657l-.082%201.283q.279-.658%201.086-1.119a3.5%203.5%200%200%201%201.778-.477q1.119%200%201.942.51a3.24%203.24%200%200%201%201.283%201.4q.445.888.444%202.072%200%201.201-.526%202.09a3.5%203.5%200%200%201-1.382%201.366%203.8%203.8%200%200%201-1.876.477zm-.296-1.481q1.069%200%201.645-.675.577-.69.577-1.778%200-1.102-.577-1.776-.56-.691-1.645-.692a2.12%202.12%200%200%200-1.58.659q-.642.641-.642%201.694v.115q0%20.71.296%201.267a2.4%202.4%200%200%200%20.807.872%202.1%202.1%200%200%200%201.119.313zm5.927-6.237h1.777v1.481q.263-.757.856-1.217a2.14%202.14%200%200%201%201.349-.46q.527%200%20.724.098l-.247%201.794q-.149-.099-.642-.099-.774%200-1.416.494-.626.493-.626%201.58v3.883h-1.777V9.242zm9.534%207.718q-1.35%200-2.255-.526-.904-.543-1.332-1.432a4.6%204.6%200%200%201-.428-1.975q0-1.2.493-2.106a3.46%203.46%200%200%201%201.4-1.382q.889-.495%202.007-.494%201.744%200%202.584.97.855.956.856%202.7%200%20.444-.05.92h-5.43q.18%201.005.708%201.45.542.443%201.497.443.79%200%201.3-.131a4%204%200%200%200%20.938-.362l.542%201.267q-.411.263-1.119.46-.708.198-1.711.197zm1.596-4.558q.016-1.02-.444-1.432-.46-.428-1.316-.428-1.728%200-1.991%201.86z%22%2F%3E%3Cpath%20d%3D%22M5.074%2015.948a.484.657%200%200%200-.486.659v1.84a.484.657%200%200%200%20.486.659h4.101a.484.657%200%200%200%20.486-.659v-1.84a.484.657%200%200%200-.486-.659zm3.56%201.16H5.617v.838h3.017z%22%20style%3D%22fill%3A%23fff%3Bfill-rule%3Aevenodd%3Bstroke-width%3A1.03600001%22%2F%3E%3Cg%20style%3D%22stroke-width%3A1.12603545%22%3E%3Cpath%20d%3D%22M-9.408-1.416c-3.833-.025-7.056%202.912-7.08%206.615-.02%203.08%201.653%204.832%203.107%206.268.903.892%201.721%201.74%202.32%202.902l-.525-.004c-.543-.003-.992.304-1.24.639a1.87%201.87%200%200%200-.362%201.121l-.011%201.877c-.003.402.104.787.347%201.125.244.338.688.653%201.23.656l4.142.028c.542.003.99-.306%201.238-.641a1.87%201.87%200%200%200%20.363-1.121l.012-1.875a1.87%201.87%200%200%200-.348-1.127c-.243-.338-.688-.653-1.23-.656l-.518-.004c.597-1.145%201.425-1.983%202.348-2.87%201.473-1.414%203.18-3.149%203.2-6.226-.016-3.59-2.923-6.684-6.993-6.707m-.006%201.1v.002c3.274.02%205.92%202.532%205.9%205.6-.017%202.706-1.39%204.026-2.863%205.44-1.034.994-2.118%202.033-2.814%203.633-.018.041-.052.055-.075.065q-.013.004-.02.01a.34.34%200%200%201-.226.084.34.34%200%200%201-.224-.086l-.092-.077c-.699-1.615-1.768-2.669-2.781-3.67-1.454-1.435-2.797-2.762-2.78-5.478.02-3.067%202.7-5.545%205.975-5.523m-.02%202.826c-1.62-.01-2.944%201.315-2.955%202.96-.01%201.646%201.295%202.988%202.916%202.999h.002c1.621.01%202.943-1.316%202.953-2.961.011-1.646-1.294-2.988-2.916-2.998m-.005%201.1c1.017.006%201.829.83%201.822%201.89s-.83%201.874-1.848%201.867c-1.018-.006-1.829-.83-1.822-1.89s.83-1.874%201.848-1.868m-2.155%2011.857%204.14.025c.271.002.49.305.487.676l-.013%201.875c-.003.37-.224.67-.495.668l-4.14-.025c-.27-.002-.487-.306-.485-.676l.012-1.875c.003-.37.224-.67.494-.668%22%20style%3D%22color%3A%23000%3Bfont-style%3Anormal%3Bfont-variant%3Anormal%3Bfont-weight%3A400%3Bfont-stretch%3Anormal%3Bfont-size%3Amedium%3Bline-height%3Anormal%3Bfont-family%3Asans-serif%3Bfont-variant-ligatures%3Anormal%3Bfont-variant-position%3Anormal%3Bfont-variant-caps%3Anormal%3Bfont-variant-numeric%3Anormal%3Bfont-variant-alternates%3Anormal%3Bfont-feature-settings%3Anormal%3Btext-indent%3A0%3Btext-align%3Astart%3Btext-decoration%3Anone%3Btext-decoration-line%3Anone%3Btext-decoration-style%3Asolid%3Btext-decoration-color%3A%23000%3Bletter-spacing%3Anormal%3Bword-spacing%3Anormal%3Btext-transform%3Anone%3Bwriting-mode%3Alr-tb%3Bdirection%3Altr%3Btext-orientation%3Amixed%3Bdominant-baseline%3Aauto%3Bbaseline-shift%3Abaseline%3Btext-anchor%3Astart%3Bwhite-space%3Anormal%3Bshape-padding%3A0%3Bclip-rule%3Aevenodd%3Bdisplay%3Ainline%3Boverflow%3Avisible%3Bvisibility%3Avisible%3Bopacity%3A1%3Bisolation%3Aauto%3Bmix-blend-mode%3Anormal%3Bcolor-interpolation%3AsRGB%3Bcolor-interpolation-filters%3AlinearRGB%3Bsolid-color%3A%23000%3Bsolid-opacity%3A1%3Bvector-effect%3Anone%3Bfill%3A%23000%3Bfill-opacity%3A.4%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-linecap%3Abutt%3Bstroke-linejoin%3Amiter%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-dashoffset%3A0%3Bstroke-opacity%3A1%3Bcolor-rendering%3Aauto%3Bimage-rendering%3Aauto%3Bshape-rendering%3Aauto%3Btext-rendering%3Aauto%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3Cpath%20d%3D%22M-9.415-.316C-12.69-.338-15.37%202.14-15.39%205.207c-.017%202.716%201.326%204.041%202.78%205.477%201.013%201%202.081%202.055%202.78%203.67l.092.076a.34.34%200%200%200%20.225.086.34.34%200%200%200%20.227-.083l.019-.01c.022-.009.057-.024.074-.064.697-1.6%201.78-2.64%202.814-3.634%201.473-1.414%202.847-2.733%202.864-5.44.02-3.067-2.627-5.58-5.901-5.601m-.057%208.784c1.621.011%202.944-1.315%202.955-2.96.01-1.646-1.295-2.988-2.916-2.999-1.622-.01-2.945%201.315-2.955%202.96s1.295%202.989%202.916%203%22%20style%3D%22clip-rule%3Aevenodd%3Bfill%3A%23e1e3e9%3Bfill-opacity%3A1%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A.4%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3Cpath%20d%3D%22M-11.594%2015.465c-.27-.002-.492.297-.494.668l-.012%201.876c-.003.371.214.673.485.675l4.14.027c.271.002.492-.298.495-.668l.012-1.877c.003-.37-.215-.672-.485-.674z%22%20style%3D%22clip-rule%3Aevenodd%3Bfill%3A%23fff%3Bfill-opacity%3A1%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A.4%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E\")}a.maplibregl-ctrl-logo.maplibregl-compact{width:14px}@media (forced-colors:active){a.maplibregl-ctrl-logo{background-color:transparent;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2288%22%20height%3D%2223%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22%23000%22%20fill-opacity%3D%22.4%22%20fill-rule%3D%22evenodd%22%20d%3D%22M17.408%2016.796h-1.827l2.501-12.095h.198l3.324%206.533.988%202.19.988-2.19%203.258-6.533h.181l2.6%2012.095h-1.81l-1.218-5.644-.362-1.71-.658%201.71-2.929%205.644h-.098l-2.914-5.644-.757-1.71-.345%201.71zm1.958-3.42-.726%203.663a1.255%201.255%200%200%201-1.232%201.011h-1.827a1.255%201.255%200%200%201-1.229-1.509l2.501-12.095a1.255%201.255%200%200%201%201.23-1.001h.197a1.25%201.25%200%200%201%201.12.685l3.19%206.273%203.125-6.263a1.25%201.25%200%200%201%201.123-.695h.181a1.255%201.255%200%200%201%201.227.991l1.443%206.71a5%205%200%200%201%20.314-.787l.009-.016a4.6%204.6%200%200%201%201.777-1.887c.782-.46%201.668-.667%202.611-.667a4.6%204.6%200%200%201%201.7.32l.306.134c.21-.16.474-.256.759-.256h1.694a1.255%201.255%200%200%201%201.212.925%201.255%201.255%200%200%201%201.212-.925h1.711c.284%200%20.545.094.755.252.613-.3%201.312-.45%202.075-.45%201.356%200%202.557.445%203.482%201.4q.47.48.763%201.064V4.701a1.255%201.255%200%200%201%201.255-1.255h1.86A1.255%201.255%200%200%201%2054.44%204.7v9.194h2.217c.19%200%20.37.043.532.118v-4.77c0-.356.147-.678.385-.906a2.42%202.42%200%200%201-.682-1.71c0-.665.267-1.253.735-1.7a2.45%202.45%200%200%201%201.722-.674%202.43%202.43%200%200%201%201.705.675q.318.302.504.683V4.7a1.255%201.255%200%200%201%201.255-1.255h1.744A1.255%201.255%200%200%201%2065.812%204.7v3.335a4.8%204.8%200%200%201%201.526-.246c.938%200%201.817.214%202.59.69a4.47%204.47%200%200%201%201.67%201.743v-.98a1.255%201.255%200%200%201%201.256-1.256h1.777c.233%200%20.451.064.639.174a3.4%203.4%200%200%201%201.567-.372c.346%200%20.861.02%201.285.232a1.25%201.25%200%200%201%20.689%201.004%204.7%204.7%200%200%201%20.853-.588c.795-.44%201.675-.647%202.61-.647%201.385%200%202.65.39%203.525%201.396.836.938%201.168%202.173%201.168%203.528q-.001.515-.056%201.051a1.255%201.255%200%200%201-.947%201.09l.408.952a1.255%201.255%200%200%201-.477%201.552c-.418.268-.92.463-1.458.612-.613.171-1.304.244-2.049.244-1.06%200-2.043-.207-2.886-.698l-.015-.008c-.798-.48-1.419-1.135-1.818-1.963l-.004-.008a5.8%205.8%200%200%201-.548-2.512q0-.429.053-.843a1.3%201.3%200%200%201-.333-.086l-.166-.004c-.223%200-.426.062-.643.228-.03.024-.142.139-.142.59v3.883a1.255%201.255%200%200%201-1.256%201.256h-1.777a1.255%201.255%200%200%201-1.256-1.256V15.69l-.032.057a4.8%204.8%200%200%201-1.86%201.833%205.04%205.04%200%200%201-2.484.634%204.5%204.5%200%200%201-1.935-.424%201.25%201.25%200%200%201-.764.258h-1.71a1.255%201.255%200%200%201-1.256-1.255V7.687a2.4%202.4%200%200%201-.428.625c.253.23.412.561.412.93v7.553a1.255%201.255%200%200%201-1.256%201.255h-1.843a1.25%201.25%200%200%201-.894-.373c-.228.23-.544.373-.894.373H51.32a1.255%201.255%200%200%201-1.256-1.255v-1.251l-.061.117a4.7%204.7%200%200%201-1.782%201.884%204.77%204.77%200%200%201-2.485.67%205.6%205.6%200%200%201-1.485-.188l.009%202.764a1.255%201.255%200%200%201-1.255%201.259h-1.729a1.255%201.255%200%200%201-1.255-1.255v-3.537a1.255%201.255%200%200%201-1.167.793h-1.679a1.25%201.25%200%200%201-.77-.263%204.5%204.5%200%200%201-1.945.429c-.885%200-1.724-.21-2.495-.632l-.017-.01a5%205%200%200%201-1.081-.836%201.255%201.255%200%200%201-1.254%201.312h-1.81a1.255%201.255%200%200%201-1.228-.99l-.782-3.625-2.044%203.939a1.25%201.25%200%200%201-1.115.676h-.098a1.25%201.25%200%200%201-1.116-.68l-2.061-3.994zM35.92%2016.63l.207-.114.223-.15q.493-.356.735-.785l.061-.118.033%201.332h1.678V9.242h-1.694l-.033%201.267q-.133-.329-.526-.658l-.032-.028a3.2%203.2%200%200%200-.668-.428l-.27-.12a3.3%203.3%200%200%200-1.235-.23q-1.136-.001-1.974.493a3.36%203.36%200%200%200-1.3%201.382q-.445.89-.444%202.074%200%201.2.51%202.107a3.8%203.8%200%200%200%201.382%201.381%203.9%203.9%200%200%200%201.893.477q.795%200%201.455-.33zm-2.789-5.38q-.576.675-.575%201.762%200%201.102.559%201.794.576.675%201.645.675a2.25%202.25%200%200%200%20.934-.19%202.2%202.2%200%200%200%20.468-.29l.178-.161a2.2%202.2%200%200%200%20.397-.561q.244-.5.244-1.15v-.115q0-.708-.296-1.267l-.043-.077a2.2%202.2%200%200%200-.633-.709l-.13-.086-.047-.028a2.1%202.1%200%200%200-1.073-.285q-1.052%200-1.629.692zm2.316%202.706c.163-.17.28-.407.28-.83v-.114c0-.292-.06-.508-.15-.68a.96.96%200%200%200-.353-.389.85.85%200%200%200-.464-.127c-.4%200-.56.114-.664.239l-.01.012c-.148.174-.275.45-.275.945%200%20.506.122.801.27.99.097.11.266.224.68.224.303%200%20.504-.09.687-.269zm7.545%201.705a2.6%202.6%200%200%200%20.331.423q.319.33.755.548l.173.074q.65.255%201.49.255%201.02%200%201.844-.493a3.45%203.45%200%200%200%201.316-1.4q.493-.904.493-2.089%200-1.909-.988-2.913-.988-1.02-2.584-1.02-.898%200-1.575.347a3%203%200%200%200-.415.262l-.199.166a3.4%203.4%200%200%200-.64.82V9.242h-1.712v11.553h1.729l-.017-5.134zm.53-1.138q.206.29.48.5l.155.11.053.034q.51.296%201.119.297%201.07%200%201.645-.675.577-.69.576-1.762%200-1.119-.576-1.777-.558-.675-1.645-.675-.435%200-.835.16a2%202%200%200%200-.284.136%202%202%200%200%200-.363.254%202.2%202.2%200%200%200-.46.569l-.082.162a2.6%202.6%200%200%200-.213%201.072v.115q0%20.707.296%201.267l.135.211zm.964-.818a1.1%201.1%200%200%200%20.367.385.94.94%200%200%200%20.476.118c.423%200%20.59-.117.687-.23.159-.194.28-.478.28-.95%200-.53-.133-.8-.266-.952l-.021-.025c-.078-.094-.231-.221-.68-.221a1%201%200%200%200-.503.135l-.012.007a.86.86%200%200%200-.335.343c-.073.133-.132.324-.132.614v.115a1.4%201.4%200%200%200%20.14.66zm15.7-6.222q.347-.346.346-.856a1.05%201.05%200%200%200-.345-.79%201.18%201.18%200%200%200-.84-.329q-.51%200-.855.33a1.05%201.05%200%200%200-.346.79q0%20.51.346.855.345.346.856.346.51%200%20.839-.346zm4.337%209.314.033-1.332q.191.403.59.747l.098.081a4%204%200%200%200%20.316.224l.223.122a3.2%203.2%200%200%200%201.44.322%203.8%203.8%200%200%200%201.875-.477%203.5%203.5%200%200%200%201.382-1.366q.527-.89.526-2.09%200-1.184-.444-2.073a3.24%203.24%200%200%200-1.283-1.399q-.823-.51-1.942-.51a3.5%203.5%200%200%200-1.527.344l-.086.043-.165.09a3%203%200%200%200-.33.214q-.432.315-.656.707a2%202%200%200%200-.099.198l.082-1.283V4.701h-1.744v12.095zm.473-2.509a2.5%202.5%200%200%200%20.566.7q.117.098.245.18l.144.08a2.1%202.1%200%200%200%20.975.232q1.07%200%201.645-.675.576-.69.576-1.778%200-1.102-.576-1.777-.56-.691-1.645-.692a2.2%202.2%200%200%200-1.015.235q-.22.113-.415.282l-.15.142a2.1%202.1%200%200%200-.42.594q-.223.479-.223%201.1v.115q0%20.705.293%201.26zm2.616-.293c.157-.191.28-.479.28-.967%200-.51-.13-.79-.276-.961l-.021-.026c-.082-.1-.232-.225-.67-.225a.87.87%200%200%200-.681.279l-.012.011c-.154.155-.274.38-.274.807v.115c0%20.285.057.499.144.669a1.1%201.1%200%200%200%20.367.405c.137.082.28.123.455.123.423%200%20.59-.118.686-.23zm8.266-3.013q.345-.13.724-.14l.069-.002q.493%200%20.642.099l.247-1.794q-.196-.099-.717-.099a2.3%202.3%200%200%200-.545.063%202%202%200%200%200-.411.148%202.2%202.2%200%200%200-.4.249%202.5%202.5%200%200%200-.485.499%202.7%202.7%200%200%200-.32.581l-.05.137v-1.48h-1.778v7.553h1.777v-3.884q0-.546.159-.943a1.5%201.5%200%200%201%20.466-.636%202.5%202.5%200%200%201%20.399-.253%202%202%200%200%201%20.224-.099zm9.784%202.656.05-.922q0-1.743-.856-2.698-.838-.97-2.584-.97-1.119-.001-2.007.493a3.46%203.46%200%200%200-1.4%201.382q-.493.906-.493%202.106%200%201.07.428%201.975.428.89%201.332%201.432.906.526%202.255.526.973%200%201.668-.185l.044-.012.135-.04q.613-.184.984-.421l-.542-1.267q-.3.162-.642.274l-.297.087q-.51.131-1.3.131-.954%200-1.497-.444a1.6%201.6%200%200%201-.192-.193q-.366-.44-.512-1.234l-.004-.021zm-5.427-1.256-.003.022h3.752v-.138q-.011-.727-.288-1.118a1%201%200%200%200-.156-.176q-.46-.428-1.316-.428-.986%200-1.494.604-.379.45-.494%201.234zm-27.053%202.77V4.7h-1.86v12.095h5.333V15.15zm7.103-5.908v7.553h-1.843V9.242h1.843z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m19.63%2011.151-.757-1.71-.345%201.71-1.12%205.644h-1.827L18.083%204.7h.197l3.325%206.533.988%202.19.988-2.19L26.839%204.7h.181l2.6%2012.095h-1.81l-1.218-5.644-.362-1.71-.658%201.71-2.93%205.644h-.098l-2.913-5.644zm14.836%205.81q-1.02%200-1.893-.478a3.8%203.8%200%200%201-1.381-1.382q-.51-.906-.51-2.106%200-1.185.444-2.074a3.36%203.36%200%200%201%201.3-1.382q.839-.494%201.974-.494a3.3%203.3%200%200%201%201.234.231%203.3%203.3%200%200%201%20.97.575q.396.33.527.659l.033-1.267h1.694v7.553H37.18l-.033-1.332q-.279.593-1.02%201.053a3.17%203.17%200%200%201-1.662.444zm.296-1.482q.938%200%201.58-.642.642-.66.642-1.711v-.115q0-.708-.296-1.267a2.2%202.2%200%200%200-.807-.872%202.1%202.1%200%200%200-1.119-.313q-1.053%200-1.629.692-.575.675-.575%201.76%200%201.103.559%201.795.577.675%201.645.675zm6.521-6.237h1.711v1.4q.906-1.597%202.83-1.597%201.596%200%202.584%201.02.988%201.005.988%202.914%200%201.185-.493%202.09a3.46%203.46%200%200%201-1.316%201.399%203.5%203.5%200%200%201-1.844.493q-.954%200-1.662-.329a2.67%202.67%200%200%201-1.086-.97l.017%205.134h-1.728zm4.048%206.22q1.07%200%201.645-.674.577-.69.576-1.762%200-1.119-.576-1.777-.558-.675-1.645-.675-.592%200-1.12.296-.51.28-.822.823-.296.527-.296%201.234v.115q0%20.708.296%201.267.313.543.823.855.51.296%201.119.297z%22%2F%3E%3Cpath%20fill%3D%22%23e1e3e9%22%20d%3D%22M51.325%204.7h1.86v10.45h3.473v1.646h-5.333zm7.12%204.542h1.843v7.553h-1.843zm.905-1.415a1.16%201.16%200%200%201-.856-.346%201.17%201.17%200%200%201-.346-.856%201.05%201.05%200%200%201%20.346-.79q.346-.329.856-.329.494%200%20.839.33a1.05%201.05%200%200%201%20.345.79%201.16%201.16%200%200%201-.345.855q-.33.346-.84.346zm7.875%209.133a3.17%203.17%200%200%201-1.662-.444q-.723-.46-1.004-1.053l-.033%201.332h-1.71V4.701h1.743v4.657l-.082%201.283q.279-.658%201.086-1.119a3.5%203.5%200%200%201%201.778-.477q1.119%200%201.942.51a3.24%203.24%200%200%201%201.283%201.4q.445.888.444%202.072%200%201.201-.526%202.09a3.5%203.5%200%200%201-1.382%201.366%203.8%203.8%200%200%201-1.876.477zm-.296-1.481q1.069%200%201.645-.675.577-.69.577-1.778%200-1.102-.577-1.776-.56-.691-1.645-.692a2.12%202.12%200%200%200-1.58.659q-.642.641-.642%201.694v.115q0%20.71.296%201.267a2.4%202.4%200%200%200%20.807.872%202.1%202.1%200%200%200%201.119.313zm5.927-6.237h1.777v1.481q.263-.757.856-1.217a2.14%202.14%200%200%201%201.349-.46q.527%200%20.724.098l-.247%201.794q-.149-.099-.642-.099-.774%200-1.416.494-.626.493-.626%201.58v3.883h-1.777V9.242zm9.534%207.718q-1.35%200-2.255-.526-.904-.543-1.332-1.432a4.6%204.6%200%200%201-.428-1.975q0-1.2.493-2.106a3.46%203.46%200%200%201%201.4-1.382q.889-.495%202.007-.494%201.744%200%202.584.97.855.956.856%202.7%200%20.444-.05.92h-5.43q.18%201.005.708%201.45.542.443%201.497.443.79%200%201.3-.131a4%204%200%200%200%20.938-.362l.542%201.267q-.411.263-1.119.46-.708.198-1.711.197zm1.596-4.558q.016-1.02-.444-1.432-.46-.428-1.316-.428-1.728%200-1.991%201.86z%22%2F%3E%3Cpath%20d%3D%22M5.074%2015.948a.484.657%200%200%200-.486.659v1.84a.484.657%200%200%200%20.486.659h4.101a.484.657%200%200%200%20.486-.659v-1.84a.484.657%200%200%200-.486-.659zm3.56%201.16H5.617v.838h3.017z%22%20style%3D%22fill%3A%23fff%3Bfill-rule%3Aevenodd%3Bstroke-width%3A1.03600001%22%2F%3E%3Cg%20style%3D%22stroke-width%3A1.12603545%22%3E%3Cpath%20d%3D%22M-9.408-1.416c-3.833-.025-7.056%202.912-7.08%206.615-.02%203.08%201.653%204.832%203.107%206.268.903.892%201.721%201.74%202.32%202.902l-.525-.004c-.543-.003-.992.304-1.24.639a1.87%201.87%200%200%200-.362%201.121l-.011%201.877c-.003.402.104.787.347%201.125.244.338.688.653%201.23.656l4.142.028c.542.003.99-.306%201.238-.641a1.87%201.87%200%200%200%20.363-1.121l.012-1.875a1.87%201.87%200%200%200-.348-1.127c-.243-.338-.688-.653-1.23-.656l-.518-.004c.597-1.145%201.425-1.983%202.348-2.87%201.473-1.414%203.18-3.149%203.2-6.226-.016-3.59-2.923-6.684-6.993-6.707m-.006%201.1v.002c3.274.02%205.92%202.532%205.9%205.6-.017%202.706-1.39%204.026-2.863%205.44-1.034.994-2.118%202.033-2.814%203.633-.018.041-.052.055-.075.065q-.013.004-.02.01a.34.34%200%200%201-.226.084.34.34%200%200%201-.224-.086l-.092-.077c-.699-1.615-1.768-2.669-2.781-3.67-1.454-1.435-2.797-2.762-2.78-5.478.02-3.067%202.7-5.545%205.975-5.523m-.02%202.826c-1.62-.01-2.944%201.315-2.955%202.96-.01%201.646%201.295%202.988%202.916%202.999h.002c1.621.01%202.943-1.316%202.953-2.961.011-1.646-1.294-2.988-2.916-2.998m-.005%201.1c1.017.006%201.829.83%201.822%201.89s-.83%201.874-1.848%201.867c-1.018-.006-1.829-.83-1.822-1.89s.83-1.874%201.848-1.868m-2.155%2011.857%204.14.025c.271.002.49.305.487.676l-.013%201.875c-.003.37-.224.67-.495.668l-4.14-.025c-.27-.002-.487-.306-.485-.676l.012-1.875c.003-.37.224-.67.494-.668%22%20style%3D%22color%3A%23000%3Bfont-style%3Anormal%3Bfont-variant%3Anormal%3Bfont-weight%3A400%3Bfont-stretch%3Anormal%3Bfont-size%3Amedium%3Bline-height%3Anormal%3Bfont-family%3Asans-serif%3Bfont-variant-ligatures%3Anormal%3Bfont-variant-position%3Anormal%3Bfont-variant-caps%3Anormal%3Bfont-variant-numeric%3Anormal%3Bfont-variant-alternates%3Anormal%3Bfont-feature-settings%3Anormal%3Btext-indent%3A0%3Btext-align%3Astart%3Btext-decoration%3Anone%3Btext-decoration-line%3Anone%3Btext-decoration-style%3Asolid%3Btext-decoration-color%3A%23000%3Bletter-spacing%3Anormal%3Bword-spacing%3Anormal%3Btext-transform%3Anone%3Bwriting-mode%3Alr-tb%3Bdirection%3Altr%3Btext-orientation%3Amixed%3Bdominant-baseline%3Aauto%3Bbaseline-shift%3Abaseline%3Btext-anchor%3Astart%3Bwhite-space%3Anormal%3Bshape-padding%3A0%3Bclip-rule%3Aevenodd%3Bdisplay%3Ainline%3Boverflow%3Avisible%3Bvisibility%3Avisible%3Bopacity%3A1%3Bisolation%3Aauto%3Bmix-blend-mode%3Anormal%3Bcolor-interpolation%3AsRGB%3Bcolor-interpolation-filters%3AlinearRGB%3Bsolid-color%3A%23000%3Bsolid-opacity%3A1%3Bvector-effect%3Anone%3Bfill%3A%23000%3Bfill-opacity%3A.4%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-linecap%3Abutt%3Bstroke-linejoin%3Amiter%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-dashoffset%3A0%3Bstroke-opacity%3A1%3Bcolor-rendering%3Aauto%3Bimage-rendering%3Aauto%3Bshape-rendering%3Aauto%3Btext-rendering%3Aauto%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3Cpath%20d%3D%22M-9.415-.316C-12.69-.338-15.37%202.14-15.39%205.207c-.017%202.716%201.326%204.041%202.78%205.477%201.013%201%202.081%202.055%202.78%203.67l.092.076a.34.34%200%200%200%20.225.086.34.34%200%200%200%20.227-.083l.019-.01c.022-.009.057-.024.074-.064.697-1.6%201.78-2.64%202.814-3.634%201.473-1.414%202.847-2.733%202.864-5.44.02-3.067-2.627-5.58-5.901-5.601m-.057%208.784c1.621.011%202.944-1.315%202.955-2.96.01-1.646-1.295-2.988-2.916-2.999-1.622-.01-2.945%201.315-2.955%202.96s1.295%202.989%202.916%203%22%20style%3D%22clip-rule%3Aevenodd%3Bfill%3A%23e1e3e9%3Bfill-opacity%3A1%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A.4%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3Cpath%20d%3D%22M-11.594%2015.465c-.27-.002-.492.297-.494.668l-.012%201.876c-.003.371.214.673.485.675l4.14.027c.271.002.492-.298.495-.668l.012-1.877c.003-.37-.215-.672-.485-.674z%22%20style%3D%22clip-rule%3Aevenodd%3Bfill%3A%23fff%3Bfill-opacity%3A1%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A.4%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E\")}}@media (forced-colors:active) and (prefers-color-scheme:light){a.maplibregl-ctrl-logo{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2288%22%20height%3D%2223%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22%23000%22%20fill-opacity%3D%22.4%22%20fill-rule%3D%22evenodd%22%20d%3D%22M17.408%2016.796h-1.827l2.501-12.095h.198l3.324%206.533.988%202.19.988-2.19%203.258-6.533h.181l2.6%2012.095h-1.81l-1.218-5.644-.362-1.71-.658%201.71-2.929%205.644h-.098l-2.914-5.644-.757-1.71-.345%201.71zm1.958-3.42-.726%203.663a1.255%201.255%200%200%201-1.232%201.011h-1.827a1.255%201.255%200%200%201-1.229-1.509l2.501-12.095a1.255%201.255%200%200%201%201.23-1.001h.197a1.25%201.25%200%200%201%201.12.685l3.19%206.273%203.125-6.263a1.25%201.25%200%200%201%201.123-.695h.181a1.255%201.255%200%200%201%201.227.991l1.443%206.71a5%205%200%200%201%20.314-.787l.009-.016a4.6%204.6%200%200%201%201.777-1.887c.782-.46%201.668-.667%202.611-.667a4.6%204.6%200%200%201%201.7.32l.306.134c.21-.16.474-.256.759-.256h1.694a1.255%201.255%200%200%201%201.212.925%201.255%201.255%200%200%201%201.212-.925h1.711c.284%200%20.545.094.755.252.613-.3%201.312-.45%202.075-.45%201.356%200%202.557.445%203.482%201.4q.47.48.763%201.064V4.701a1.255%201.255%200%200%201%201.255-1.255h1.86A1.255%201.255%200%200%201%2054.44%204.7v9.194h2.217c.19%200%20.37.043.532.118v-4.77c0-.356.147-.678.385-.906a2.42%202.42%200%200%201-.682-1.71c0-.665.267-1.253.735-1.7a2.45%202.45%200%200%201%201.722-.674%202.43%202.43%200%200%201%201.705.675q.318.302.504.683V4.7a1.255%201.255%200%200%201%201.255-1.255h1.744A1.255%201.255%200%200%201%2065.812%204.7v3.335a4.8%204.8%200%200%201%201.526-.246c.938%200%201.817.214%202.59.69a4.47%204.47%200%200%201%201.67%201.743v-.98a1.255%201.255%200%200%201%201.256-1.256h1.777c.233%200%20.451.064.639.174a3.4%203.4%200%200%201%201.567-.372c.346%200%20.861.02%201.285.232a1.25%201.25%200%200%201%20.689%201.004%204.7%204.7%200%200%201%20.853-.588c.795-.44%201.675-.647%202.61-.647%201.385%200%202.65.39%203.525%201.396.836.938%201.168%202.173%201.168%203.528q-.001.515-.056%201.051a1.255%201.255%200%200%201-.947%201.09l.408.952a1.255%201.255%200%200%201-.477%201.552c-.418.268-.92.463-1.458.612-.613.171-1.304.244-2.049.244-1.06%200-2.043-.207-2.886-.698l-.015-.008c-.798-.48-1.419-1.135-1.818-1.963l-.004-.008a5.8%205.8%200%200%201-.548-2.512q0-.429.053-.843a1.3%201.3%200%200%201-.333-.086l-.166-.004c-.223%200-.426.062-.643.228-.03.024-.142.139-.142.59v3.883a1.255%201.255%200%200%201-1.256%201.256h-1.777a1.255%201.255%200%200%201-1.256-1.256V15.69l-.032.057a4.8%204.8%200%200%201-1.86%201.833%205.04%205.04%200%200%201-2.484.634%204.5%204.5%200%200%201-1.935-.424%201.25%201.25%200%200%201-.764.258h-1.71a1.255%201.255%200%200%201-1.256-1.255V7.687a2.4%202.4%200%200%201-.428.625c.253.23.412.561.412.93v7.553a1.255%201.255%200%200%201-1.256%201.255h-1.843a1.25%201.25%200%200%201-.894-.373c-.228.23-.544.373-.894.373H51.32a1.255%201.255%200%200%201-1.256-1.255v-1.251l-.061.117a4.7%204.7%200%200%201-1.782%201.884%204.77%204.77%200%200%201-2.485.67%205.6%205.6%200%200%201-1.485-.188l.009%202.764a1.255%201.255%200%200%201-1.255%201.259h-1.729a1.255%201.255%200%200%201-1.255-1.255v-3.537a1.255%201.255%200%200%201-1.167.793h-1.679a1.25%201.25%200%200%201-.77-.263%204.5%204.5%200%200%201-1.945.429c-.885%200-1.724-.21-2.495-.632l-.017-.01a5%205%200%200%201-1.081-.836%201.255%201.255%200%200%201-1.254%201.312h-1.81a1.255%201.255%200%200%201-1.228-.99l-.782-3.625-2.044%203.939a1.25%201.25%200%200%201-1.115.676h-.098a1.25%201.25%200%200%201-1.116-.68l-2.061-3.994zM35.92%2016.63l.207-.114.223-.15q.493-.356.735-.785l.061-.118.033%201.332h1.678V9.242h-1.694l-.033%201.267q-.133-.329-.526-.658l-.032-.028a3.2%203.2%200%200%200-.668-.428l-.27-.12a3.3%203.3%200%200%200-1.235-.23q-1.136-.001-1.974.493a3.36%203.36%200%200%200-1.3%201.382q-.445.89-.444%202.074%200%201.2.51%202.107a3.8%203.8%200%200%200%201.382%201.381%203.9%203.9%200%200%200%201.893.477q.795%200%201.455-.33zm-2.789-5.38q-.576.675-.575%201.762%200%201.102.559%201.794.576.675%201.645.675a2.25%202.25%200%200%200%20.934-.19%202.2%202.2%200%200%200%20.468-.29l.178-.161a2.2%202.2%200%200%200%20.397-.561q.244-.5.244-1.15v-.115q0-.708-.296-1.267l-.043-.077a2.2%202.2%200%200%200-.633-.709l-.13-.086-.047-.028a2.1%202.1%200%200%200-1.073-.285q-1.052%200-1.629.692zm2.316%202.706c.163-.17.28-.407.28-.83v-.114c0-.292-.06-.508-.15-.68a.96.96%200%200%200-.353-.389.85.85%200%200%200-.464-.127c-.4%200-.56.114-.664.239l-.01.012c-.148.174-.275.45-.275.945%200%20.506.122.801.27.99.097.11.266.224.68.224.303%200%20.504-.09.687-.269zm7.545%201.705a2.6%202.6%200%200%200%20.331.423q.319.33.755.548l.173.074q.65.255%201.49.255%201.02%200%201.844-.493a3.45%203.45%200%200%200%201.316-1.4q.493-.904.493-2.089%200-1.909-.988-2.913-.988-1.02-2.584-1.02-.898%200-1.575.347a3%203%200%200%200-.415.262l-.199.166a3.4%203.4%200%200%200-.64.82V9.242h-1.712v11.553h1.729l-.017-5.134zm.53-1.138q.206.29.48.5l.155.11.053.034q.51.296%201.119.297%201.07%200%201.645-.675.577-.69.576-1.762%200-1.119-.576-1.777-.558-.675-1.645-.675-.435%200-.835.16a2%202%200%200%200-.284.136%202%202%200%200%200-.363.254%202.2%202.2%200%200%200-.46.569l-.082.162a2.6%202.6%200%200%200-.213%201.072v.115q0%20.707.296%201.267l.135.211zm.964-.818a1.1%201.1%200%200%200%20.367.385.94.94%200%200%200%20.476.118c.423%200%20.59-.117.687-.23.159-.194.28-.478.28-.95%200-.53-.133-.8-.266-.952l-.021-.025c-.078-.094-.231-.221-.68-.221a1%201%200%200%200-.503.135l-.012.007a.86.86%200%200%200-.335.343c-.073.133-.132.324-.132.614v.115a1.4%201.4%200%200%200%20.14.66zm15.7-6.222q.347-.346.346-.856a1.05%201.05%200%200%200-.345-.79%201.18%201.18%200%200%200-.84-.329q-.51%200-.855.33a1.05%201.05%200%200%200-.346.79q0%20.51.346.855.345.346.856.346.51%200%20.839-.346zm4.337%209.314.033-1.332q.191.403.59.747l.098.081a4%204%200%200%200%20.316.224l.223.122a3.2%203.2%200%200%200%201.44.322%203.8%203.8%200%200%200%201.875-.477%203.5%203.5%200%200%200%201.382-1.366q.527-.89.526-2.09%200-1.184-.444-2.073a3.24%203.24%200%200%200-1.283-1.399q-.823-.51-1.942-.51a3.5%203.5%200%200%200-1.527.344l-.086.043-.165.09a3%203%200%200%200-.33.214q-.432.315-.656.707a2%202%200%200%200-.099.198l.082-1.283V4.701h-1.744v12.095zm.473-2.509a2.5%202.5%200%200%200%20.566.7q.117.098.245.18l.144.08a2.1%202.1%200%200%200%20.975.232q1.07%200%201.645-.675.576-.69.576-1.778%200-1.102-.576-1.777-.56-.691-1.645-.692a2.2%202.2%200%200%200-1.015.235q-.22.113-.415.282l-.15.142a2.1%202.1%200%200%200-.42.594q-.223.479-.223%201.1v.115q0%20.705.293%201.26zm2.616-.293c.157-.191.28-.479.28-.967%200-.51-.13-.79-.276-.961l-.021-.026c-.082-.1-.232-.225-.67-.225a.87.87%200%200%200-.681.279l-.012.011c-.154.155-.274.38-.274.807v.115c0%20.285.057.499.144.669a1.1%201.1%200%200%200%20.367.405c.137.082.28.123.455.123.423%200%20.59-.118.686-.23zm8.266-3.013q.345-.13.724-.14l.069-.002q.493%200%20.642.099l.247-1.794q-.196-.099-.717-.099a2.3%202.3%200%200%200-.545.063%202%202%200%200%200-.411.148%202.2%202.2%200%200%200-.4.249%202.5%202.5%200%200%200-.485.499%202.7%202.7%200%200%200-.32.581l-.05.137v-1.48h-1.778v7.553h1.777v-3.884q0-.546.159-.943a1.5%201.5%200%200%201%20.466-.636%202.5%202.5%200%200%201%20.399-.253%202%202%200%200%201%20.224-.099zm9.784%202.656.05-.922q0-1.743-.856-2.698-.838-.97-2.584-.97-1.119-.001-2.007.493a3.46%203.46%200%200%200-1.4%201.382q-.493.906-.493%202.106%200%201.07.428%201.975.428.89%201.332%201.432.906.526%202.255.526.973%200%201.668-.185l.044-.012.135-.04q.613-.184.984-.421l-.542-1.267q-.3.162-.642.274l-.297.087q-.51.131-1.3.131-.954%200-1.497-.444a1.6%201.6%200%200%201-.192-.193q-.366-.44-.512-1.234l-.004-.021zm-5.427-1.256-.003.022h3.752v-.138q-.011-.727-.288-1.118a1%201%200%200%200-.156-.176q-.46-.428-1.316-.428-.986%200-1.494.604-.379.45-.494%201.234zm-27.053%202.77V4.7h-1.86v12.095h5.333V15.15zm7.103-5.908v7.553h-1.843V9.242h1.843z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m19.63%2011.151-.757-1.71-.345%201.71-1.12%205.644h-1.827L18.083%204.7h.197l3.325%206.533.988%202.19.988-2.19L26.839%204.7h.181l2.6%2012.095h-1.81l-1.218-5.644-.362-1.71-.658%201.71-2.93%205.644h-.098l-2.913-5.644zm14.836%205.81q-1.02%200-1.893-.478a3.8%203.8%200%200%201-1.381-1.382q-.51-.906-.51-2.106%200-1.185.444-2.074a3.36%203.36%200%200%201%201.3-1.382q.839-.494%201.974-.494a3.3%203.3%200%200%201%201.234.231%203.3%203.3%200%200%201%20.97.575q.396.33.527.659l.033-1.267h1.694v7.553H37.18l-.033-1.332q-.279.593-1.02%201.053a3.17%203.17%200%200%201-1.662.444zm.296-1.482q.938%200%201.58-.642.642-.66.642-1.711v-.115q0-.708-.296-1.267a2.2%202.2%200%200%200-.807-.872%202.1%202.1%200%200%200-1.119-.313q-1.053%200-1.629.692-.575.675-.575%201.76%200%201.103.559%201.795.577.675%201.645.675zm6.521-6.237h1.711v1.4q.906-1.597%202.83-1.597%201.596%200%202.584%201.02.988%201.005.988%202.914%200%201.185-.493%202.09a3.46%203.46%200%200%201-1.316%201.399%203.5%203.5%200%200%201-1.844.493q-.954%200-1.662-.329a2.67%202.67%200%200%201-1.086-.97l.017%205.134h-1.728zm4.048%206.22q1.07%200%201.645-.674.577-.69.576-1.762%200-1.119-.576-1.777-.558-.675-1.645-.675-.592%200-1.12.296-.51.28-.822.823-.296.527-.296%201.234v.115q0%20.708.296%201.267.313.543.823.855.51.296%201.119.297z%22%2F%3E%3Cpath%20fill%3D%22%23e1e3e9%22%20d%3D%22M51.325%204.7h1.86v10.45h3.473v1.646h-5.333zm7.12%204.542h1.843v7.553h-1.843zm.905-1.415a1.16%201.16%200%200%201-.856-.346%201.17%201.17%200%200%201-.346-.856%201.05%201.05%200%200%201%20.346-.79q.346-.329.856-.329.494%200%20.839.33a1.05%201.05%200%200%201%20.345.79%201.16%201.16%200%200%201-.345.855q-.33.346-.84.346zm7.875%209.133a3.17%203.17%200%200%201-1.662-.444q-.723-.46-1.004-1.053l-.033%201.332h-1.71V4.701h1.743v4.657l-.082%201.283q.279-.658%201.086-1.119a3.5%203.5%200%200%201%201.778-.477q1.119%200%201.942.51a3.24%203.24%200%200%201%201.283%201.4q.445.888.444%202.072%200%201.201-.526%202.09a3.5%203.5%200%200%201-1.382%201.366%203.8%203.8%200%200%201-1.876.477zm-.296-1.481q1.069%200%201.645-.675.577-.69.577-1.778%200-1.102-.577-1.776-.56-.691-1.645-.692a2.12%202.12%200%200%200-1.58.659q-.642.641-.642%201.694v.115q0%20.71.296%201.267a2.4%202.4%200%200%200%20.807.872%202.1%202.1%200%200%200%201.119.313zm5.927-6.237h1.777v1.481q.263-.757.856-1.217a2.14%202.14%200%200%201%201.349-.46q.527%200%20.724.098l-.247%201.794q-.149-.099-.642-.099-.774%200-1.416.494-.626.493-.626%201.58v3.883h-1.777V9.242zm9.534%207.718q-1.35%200-2.255-.526-.904-.543-1.332-1.432a4.6%204.6%200%200%201-.428-1.975q0-1.2.493-2.106a3.46%203.46%200%200%201%201.4-1.382q.889-.495%202.007-.494%201.744%200%202.584.97.855.956.856%202.7%200%20.444-.05.92h-5.43q.18%201.005.708%201.45.542.443%201.497.443.79%200%201.3-.131a4%204%200%200%200%20.938-.362l.542%201.267q-.411.263-1.119.46-.708.198-1.711.197zm1.596-4.558q.016-1.02-.444-1.432-.46-.428-1.316-.428-1.728%200-1.991%201.86z%22%2F%3E%3Cpath%20d%3D%22M5.074%2015.948a.484.657%200%200%200-.486.659v1.84a.484.657%200%200%200%20.486.659h4.101a.484.657%200%200%200%20.486-.659v-1.84a.484.657%200%200%200-.486-.659zm3.56%201.16H5.617v.838h3.017z%22%20style%3D%22fill%3A%23fff%3Bfill-rule%3Aevenodd%3Bstroke-width%3A1.03600001%22%2F%3E%3Cg%20style%3D%22stroke-width%3A1.12603545%22%3E%3Cpath%20d%3D%22M-9.408-1.416c-3.833-.025-7.056%202.912-7.08%206.615-.02%203.08%201.653%204.832%203.107%206.268.903.892%201.721%201.74%202.32%202.902l-.525-.004c-.543-.003-.992.304-1.24.639a1.87%201.87%200%200%200-.362%201.121l-.011%201.877c-.003.402.104.787.347%201.125.244.338.688.653%201.23.656l4.142.028c.542.003.99-.306%201.238-.641a1.87%201.87%200%200%200%20.363-1.121l.012-1.875a1.87%201.87%200%200%200-.348-1.127c-.243-.338-.688-.653-1.23-.656l-.518-.004c.597-1.145%201.425-1.983%202.348-2.87%201.473-1.414%203.18-3.149%203.2-6.226-.016-3.59-2.923-6.684-6.993-6.707m-.006%201.1v.002c3.274.02%205.92%202.532%205.9%205.6-.017%202.706-1.39%204.026-2.863%205.44-1.034.994-2.118%202.033-2.814%203.633-.018.041-.052.055-.075.065q-.013.004-.02.01a.34.34%200%200%201-.226.084.34.34%200%200%201-.224-.086l-.092-.077c-.699-1.615-1.768-2.669-2.781-3.67-1.454-1.435-2.797-2.762-2.78-5.478.02-3.067%202.7-5.545%205.975-5.523m-.02%202.826c-1.62-.01-2.944%201.315-2.955%202.96-.01%201.646%201.295%202.988%202.916%202.999h.002c1.621.01%202.943-1.316%202.953-2.961.011-1.646-1.294-2.988-2.916-2.998m-.005%201.1c1.017.006%201.829.83%201.822%201.89s-.83%201.874-1.848%201.867c-1.018-.006-1.829-.83-1.822-1.89s.83-1.874%201.848-1.868m-2.155%2011.857%204.14.025c.271.002.49.305.487.676l-.013%201.875c-.003.37-.224.67-.495.668l-4.14-.025c-.27-.002-.487-.306-.485-.676l.012-1.875c.003-.37.224-.67.494-.668%22%20style%3D%22color%3A%23000%3Bfont-style%3Anormal%3Bfont-variant%3Anormal%3Bfont-weight%3A400%3Bfont-stretch%3Anormal%3Bfont-size%3Amedium%3Bline-height%3Anormal%3Bfont-family%3Asans-serif%3Bfont-variant-ligatures%3Anormal%3Bfont-variant-position%3Anormal%3Bfont-variant-caps%3Anormal%3Bfont-variant-numeric%3Anormal%3Bfont-variant-alternates%3Anormal%3Bfont-feature-settings%3Anormal%3Btext-indent%3A0%3Btext-align%3Astart%3Btext-decoration%3Anone%3Btext-decoration-line%3Anone%3Btext-decoration-style%3Asolid%3Btext-decoration-color%3A%23000%3Bletter-spacing%3Anormal%3Bword-spacing%3Anormal%3Btext-transform%3Anone%3Bwriting-mode%3Alr-tb%3Bdirection%3Altr%3Btext-orientation%3Amixed%3Bdominant-baseline%3Aauto%3Bbaseline-shift%3Abaseline%3Btext-anchor%3Astart%3Bwhite-space%3Anormal%3Bshape-padding%3A0%3Bclip-rule%3Aevenodd%3Bdisplay%3Ainline%3Boverflow%3Avisible%3Bvisibility%3Avisible%3Bopacity%3A1%3Bisolation%3Aauto%3Bmix-blend-mode%3Anormal%3Bcolor-interpolation%3AsRGB%3Bcolor-interpolation-filters%3AlinearRGB%3Bsolid-color%3A%23000%3Bsolid-opacity%3A1%3Bvector-effect%3Anone%3Bfill%3A%23000%3Bfill-opacity%3A.4%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-linecap%3Abutt%3Bstroke-linejoin%3Amiter%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-dashoffset%3A0%3Bstroke-opacity%3A1%3Bcolor-rendering%3Aauto%3Bimage-rendering%3Aauto%3Bshape-rendering%3Aauto%3Btext-rendering%3Aauto%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3Cpath%20d%3D%22M-9.415-.316C-12.69-.338-15.37%202.14-15.39%205.207c-.017%202.716%201.326%204.041%202.78%205.477%201.013%201%202.081%202.055%202.78%203.67l.092.076a.34.34%200%200%200%20.225.086.34.34%200%200%200%20.227-.083l.019-.01c.022-.009.057-.024.074-.064.697-1.6%201.78-2.64%202.814-3.634%201.473-1.414%202.847-2.733%202.864-5.44.02-3.067-2.627-5.58-5.901-5.601m-.057%208.784c1.621.011%202.944-1.315%202.955-2.96.01-1.646-1.295-2.988-2.916-2.999-1.622-.01-2.945%201.315-2.955%202.96s1.295%202.989%202.916%203%22%20style%3D%22clip-rule%3Aevenodd%3Bfill%3A%23e1e3e9%3Bfill-opacity%3A1%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A.4%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3Cpath%20d%3D%22M-11.594%2015.465c-.27-.002-.492.297-.494.668l-.012%201.876c-.003.371.214.673.485.675l4.14.027c.271.002.492-.298.495-.668l.012-1.877c.003-.37-.215-.672-.485-.674z%22%20style%3D%22clip-rule%3Aevenodd%3Bfill%3A%23fff%3Bfill-opacity%3A1%3Bfill-rule%3Aevenodd%3Bstroke%3Anone%3Bstroke-width%3A2.47727823%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A.4%22%20transform%3D%22translate(15.553%202.85)scale(.88807)%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E\")}}.maplibregl-ctrl.maplibregl-ctrl-attrib{padding:0 5px;background-color:hsla(0,0%,100%,.5);margin:0}@media screen{.maplibregl-ctrl-attrib.maplibregl-compact{min-height:20px;padding:2px 24px 2px 0;margin:10px;position:relative;background-color:#fff;color:#000;border-radius:12px;box-sizing:content-box}.maplibregl-ctrl-attrib.maplibregl-compact-show{padding:2px 28px 2px 8px;visibility:visible}.maplibregl-ctrl-bottom-left>.maplibregl-ctrl-attrib.maplibregl-compact-show,.maplibregl-ctrl-top-left>.maplibregl-ctrl-attrib.maplibregl-compact-show{padding:2px 8px 2px 28px;border-radius:12px}.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner{display:none}.maplibregl-ctrl-attrib-button{display:none;cursor:pointer;position:absolute;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20fill-rule%3D%22evenodd%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M4%2010a6%206%200%201%200%2012%200%206%206%200%201%200-12%200m5-3a1%201%200%201%200%202%200%201%201%200%201%200-2%200m0%203a1%201%200%201%201%202%200v3a1%201%200%201%201-2%200%22%2F%3E%3C%2Fsvg%3E\");background-color:hsla(0,0%,100%,.5);width:24px;height:24px;box-sizing:border-box;border-radius:12px;outline:none;top:0;right:0;border:0}.maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button{-webkit-appearance:none;-moz-appearance:none;appearance:none;list-style:none}.maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button::-webkit-details-marker{display:none}.maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib-button,.maplibregl-ctrl-top-left .maplibregl-ctrl-attrib-button{left:0}.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-button,.maplibregl-ctrl-attrib.maplibregl-compact-show .maplibregl-ctrl-attrib-inner{display:block}.maplibregl-ctrl-attrib.maplibregl-compact-show .maplibregl-ctrl-attrib-button{background-color:rgba(0,0,0,.05)}.maplibregl-ctrl-bottom-right>.maplibregl-ctrl-attrib.maplibregl-compact:after{bottom:0;right:0}.maplibregl-ctrl-top-right>.maplibregl-ctrl-attrib.maplibregl-compact:after{top:0;right:0}.maplibregl-ctrl-top-left>.maplibregl-ctrl-attrib.maplibregl-compact:after{top:0;left:0}.maplibregl-ctrl-bottom-left>.maplibregl-ctrl-attrib.maplibregl-compact:after{bottom:0;left:0}}@media screen and (forced-colors:active){.maplibregl-ctrl-attrib.maplibregl-compact:after{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M4%2010a6%206%200%201%200%2012%200%206%206%200%201%200-12%200m5-3a1%201%200%201%200%202%200%201%201%200%201%200-2%200m0%203a1%201%200%201%201%202%200v3a1%201%200%201%201-2%200%22%2F%3E%3C%2Fsvg%3E\")}}@media screen and (forced-colors:active) and (prefers-color-scheme:light){.maplibregl-ctrl-attrib.maplibregl-compact:after{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20fill-rule%3D%22evenodd%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M4%2010a6%206%200%201%200%2012%200%206%206%200%201%200-12%200m5-3a1%201%200%201%200%202%200%201%201%200%201%200-2%200m0%203a1%201%200%201%201%202%200v3a1%201%200%201%201-2%200%22%2F%3E%3C%2Fsvg%3E\")}}.maplibregl-ctrl-attrib a{color:rgba(0,0,0,.75);text-decoration:none}.maplibregl-ctrl-attrib a:hover{color:inherit;text-decoration:underline}.maplibregl-attrib-empty{display:none}.maplibregl-ctrl-scale{background-color:hsla(0,0%,100%,.75);font-size:10px;white-space:nowrap;border-color:#333;border-style:none solid solid;border-width:medium 2px 2px;padding:0 5px;color:#333;box-sizing:border-box}.maplibregl-popup{position:absolute;top:0;left:0;display:flex;will-change:transform;pointer-events:none}.maplibregl-popup-anchor-top,.maplibregl-popup-anchor-top-left,.maplibregl-popup-anchor-top-right{flex-direction:column}.maplibregl-popup-anchor-bottom,.maplibregl-popup-anchor-bottom-left,.maplibregl-popup-anchor-bottom-right{flex-direction:column-reverse}.maplibregl-popup-anchor-left{flex-direction:row}.maplibregl-popup-anchor-right{flex-direction:row-reverse}.maplibregl-popup-tip{width:0;height:0;border:10px solid transparent;z-index:1}.maplibregl-popup-anchor-top .maplibregl-popup-tip{align-self:center;border-top:none;border-bottom-color:#fff}.maplibregl-popup-anchor-top-left .maplibregl-popup-tip{align-self:flex-start;border-top:none;border-left:none;border-bottom-color:#fff}.maplibregl-popup-anchor-top-right .maplibregl-popup-tip{align-self:flex-end;border-top:none;border-right:none;border-bottom-color:#fff}.maplibregl-popup-anchor-bottom .maplibregl-popup-tip{align-self:center;border-bottom:none;border-top-color:#fff}.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip{align-self:flex-start;border-bottom:none;border-left:none;border-top-color:#fff}.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip{align-self:flex-end;border-bottom:none;border-right:none;border-top-color:#fff}.maplibregl-popup-anchor-left .maplibregl-popup-tip{align-self:center;border-left:none;border-right-color:#fff}.maplibregl-popup-anchor-right .maplibregl-popup-tip{align-self:center;border-right:none;border-left-color:#fff}[dir=rtl] .maplibregl-popup-anchor-left{flex-direction:row-reverse}[dir=rtl] .maplibregl-popup-anchor-right{flex-direction:row}[dir=rtl] .maplibregl-popup-anchor-top-left .maplibregl-popup-tip{align-self:flex-end}[dir=rtl] .maplibregl-popup-anchor-top-right .maplibregl-popup-tip{align-self:flex-start}[dir=rtl] .maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip{align-self:flex-end}[dir=rtl] .maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip{align-self:flex-start}.maplibregl-popup-close-button{position:absolute;right:0;top:0;border:0;border-radius:0 3px 0 0;cursor:pointer;background-color:transparent}.maplibregl-popup-close-button:hover{background-color:rgba(0,0,0,.05)}.maplibregl-popup-content{position:relative;background:#fff;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,.1);padding:15px 10px;pointer-events:auto}.maplibregl-popup-anchor-top-left .maplibregl-popup-content{border-top-left-radius:0}.maplibregl-popup-anchor-top-right .maplibregl-popup-content{border-top-right-radius:0}.maplibregl-popup-anchor-bottom-left .maplibregl-popup-content{border-bottom-left-radius:0}.maplibregl-popup-anchor-bottom-right .maplibregl-popup-content{border-bottom-right-radius:0}.maplibregl-popup-track-pointer{display:none}.maplibregl-popup-track-pointer *{pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.maplibregl-map:hover .maplibregl-popup-track-pointer{display:flex}.maplibregl-map:active .maplibregl-popup-track-pointer{display:none}.maplibregl-marker{position:absolute;top:0;left:0;will-change:transform;transition:opacity .2s}.maplibregl-marker-draggable{cursor:grab}.maplibregl-user-location-dot,.maplibregl-user-location-dot:before{background-color:#1da1f2;width:15px;height:15px;border-radius:50%}.maplibregl-user-location-dot:before{content:\"\";position:absolute;animation:maplibregl-user-location-dot-pulse 2s infinite}.maplibregl-user-location-dot:after{border-radius:50%;border:2px solid #fff;content:\"\";height:19px;left:-2px;position:absolute;top:-2px;width:19px;box-sizing:border-box;box-shadow:0 0 3px rgba(0,0,0,.35)}@media (prefers-reduced-motion:reduce){.maplibregl-user-location-dot:before{animation:none}}@keyframes maplibregl-user-location-dot-pulse{0%{transform:scale(1);opacity:1}70%{transform:scale(3);opacity:0}to{transform:scale(1);opacity:0}}.maplibregl-user-location-dot-stale{background-color:#aaa}.maplibregl-user-location-dot-stale:after{display:none}.maplibregl-user-location-accuracy-circle{background-color:#1da1f233;width:1px;height:1px;border-radius:100%}.maplibregl-crosshair,.maplibregl-crosshair .maplibregl-interactive,.maplibregl-crosshair .maplibregl-interactive:active{cursor:crosshair}.maplibregl-boxzoom{position:absolute;top:0;left:0;width:0;height:0;background:#fff;border:2px dotted #202020;opacity:.5}.maplibregl-cooperative-gesture-screen{background:rgba(0,0,0,.4);position:absolute;inset:0;display:flex;justify-content:center;align-items:center;color:#fff;padding:1rem;font-size:1.4em;line-height:1.2;opacity:0;pointer-events:none;transition:opacity 1s ease 1s;z-index:99999}.maplibregl-cooperative-gesture-screen.maplibregl-show{opacity:1;transition:opacity .05s}.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message{display:none}@media (hover:none),(pointer:coarse){.maplibregl-cooperative-gesture-screen .maplibregl-desktop-message{display:none}.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message{display:block}}.maplibregl-pseudo-fullscreen{position:fixed!important;width:100%!important;height:100%!important;top:0!important;left:0!important;z-index:99999}";

/**
 * Injection de la feuille de style de MapLibre.
 *
 * Sans elle, la carte s'affiche mais les contrôles de zoom sont empilés sans
 * mise en forme, les popups sont mal positionnées et l'attribution est
 * illisible. C'était jusqu'ici à l'application de la charger, ce qui faisait
 * perdre le plus de temps à l'installation.
 *
 * Insérée **en tête** de `<head>`, et non à la fin : à spécificité égale, la
 * dernière règle déclarée gagne. En fin de `<head>`, la librairie écraserait
 * donc les personnalisations de l'application ; en tête, c'est l'inverse.
 *
 * Une balise `<style>` plutôt qu'un `<link>` : il n'y a pas d'URL à pointer.
 * Une CSP sans `style-src 'unsafe-inline'` exige alors un nonce — d'où
 * `cssNonce`. Sinon, `injectCss: false` rend la main à l'application.
 */
const MARQUEUR = 'data-store-locator-css';
const injectMapLibreCss = nonce => {
  // Rendu côté serveur : rien à injecter, et la carte ne s'y construit pas.
  if (typeof document === 'undefined') {
    return;
  }
  // Idempotent : plusieurs cartes sur une même page partagent la feuille.
  if (document.head.querySelector(`style[${MARQUEUR}]`)) {
    return;
  }
  const balise = document.createElement('style');
  balise.setAttribute(MARQUEUR, '');
  if (nonce) {
    balise.nonce = nonce;
  }
  balise.textContent = css;
  document.head.prepend(balise);
};

/** Pixel entièrement transparent, en RGBA. */
const PIXEL_TRANSPARENT = {
  width: 1,
  height: 1,
  data: new Uint8Array(4)
};
const resolveMissingImages = (map, collecte) => {
  map.setMissingStyleImageResolver(id => {
    collecte.add(id);
    map.addImage(id, PIXEL_TRANSPARENT);
  });
};

/**
 * Conteneurs portant déjà une carte vivante. Remplace la sonde `_leaflet_id`
 * de la v2 sans écrire dans le DOM.
 */
const initializedContainers = new WeakSet();
const releaseContainer = container => {
  initializedContainers.delete(container);
};
const createMap = (container, config, unresolvedImages) => {
  if (initializedContainers.has(container)) {
    throw new Error('[store-locator] - Map container is already initialized. ' + 'Call destroy() on the previous instance before creating a new one on the same element.');
  }
  // Avant la construction : MapLibre bâtit aussitôt le DOM de ses contrôles, et
  // une feuille arrivée après laisserait paraître un instant leur version non
  // mise en forme.
  if (config.injectCss) {
    var _config$cssNonce;
    injectMapLibreCss((_config$cssNonce = config.cssNonce) != null ? _config$cssNonce : undefined);
  }
  const map = new Map$1(_extends({}, config.options, {
    container,
    style: config.style
  }));
  // Marqué dès que la carte existe, et avant l'ajout des contrôles : ceux-ci
  // construisent du DOM et peuvent donc échouer. Une carte vivante sur un
  // conteneur non enregistré laisserait le garde-fou en autoriser une seconde.
  initializedContainers.add(container);
  // Après la construction : c'est elle qui ajoute l'`AttributionControl`, et
  // c'est son DOM que le repli va chercher.
  collapseAttribution(map);
  if (config.resolveMissingImages) {
    resolveMissingImages(map, unresolvedImages);
  }
  if (config.navigation) {
    map.addControl(new NavigationControl());
  }
  if (config.locate) {
    map.addControl(new GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true
    }));
  }
  return map;
};

const SOURCE_ID = 'store-locator';
const CLUSTER_LAYER_ID = 'store-locator-clusters';
const CLUSTER_COUNT_LAYER_ID = 'store-locator-cluster-count';
const POINT_LAYER_ID = 'store-locator-points';
const UNCLUSTERED_FILTER = ['!', ['has', 'point_count']];
const CLUSTERED_FILTER = ['has', 'point_count'];
const addClusterSource = (map, collection, clusters) => {
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: collection,
    cluster: clusters.enabled,
    clusterRadius: clusters.radius,
    clusterMaxZoom: clusters.maxZoom,
    clusterMinPoints: clusters.minPoints
  });
  map.addLayer({
    id: POINT_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: UNCLUSTERED_FILTER,
    paint: {
      'circle-radius': 0,
      'circle-opacity': 0
    }
  });
  if (!clusters.enabled) {
    return;
  }
  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: CLUSTERED_FILTER,
    paint: {
      'circle-color': clusters.color,
      'circle-radius': clusters.size,
      'circle-stroke-color': clusters.strokeColor,
      'circle-stroke-width': clusters.strokeWidth
    }
  });
  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: CLUSTERED_FILTER,
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': clusters.textFont,
      'text-size': clusters.textSize,
      'text-allow-overlap': true
    },
    paint: {
      'text-color': clusters.textColor
    }
  });
};
const setClusterData = (map, collection) => {
  const source = map.getSource(SOURCE_ID);
  // MapLibre v6 : setData ne retourne plus `this` et n'accepte plus de second argument.
  source == null || source.setData(collection);
};

const isHtmlElement$1 = value => {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
};
const isIconOptions = value => {
  return typeof value === 'object' && value !== null && !isHtmlElement$1(value);
};
const createImageElement = (url, size) => {
  if (typeof document === 'undefined') {
    return null;
  }
  const image = document.createElement('img');
  image.src = url;
  image.alt = '';
  image.style.display = 'block';
  if (size) {
    image.width = size[0];
    image.height = size[1];
    image.style.width = `${size[0]}px`;
    image.style.height = `${size[1]}px`;
  }
  return image;
};
const withMarkerOptions = (element, options) => {
  const markerOptions = {
    element
  };
  if (options.anchor !== undefined) {
    markerOptions.anchor = options.anchor;
  }
  if (options.offset !== undefined) {
    markerOptions.offset = options.offset;
  }
  if (options.className !== undefined) {
    markerOptions.className = options.className;
  }
  if (options.rotation !== undefined) {
    markerOptions.rotation = options.rotation;
  }
  return markerOptions;
};
/**
 * Dimensions déclarées de l'icône, quand elles le sont.
 *
 * Exposé parce que le placement de la popup en dérive : sans taille, aucune
 * géométrie à partir de laquelle décaler. Une icône fournie sous forme
 * d'élément DOM brut n'en a pas — ses dimensions ne sont pas mesurables avant
 * insertion dans le document.
 */
const iconSize = value => {
  if (value === null || value === undefined || typeof value === 'string' || isHtmlElement$1(value)) {
    return undefined;
  }
  return isIconOptions(value) ? value.size : undefined;
};
const normalizeIcon = value => {
  var _value$element;
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    const _element = createImageElement(value);
    return _element ? {
      element: _element
    } : null;
  }
  if (isHtmlElement$1(value)) {
    return {
      element: value
    };
  }
  if (!isIconOptions(value)) {
    return null;
  }
  const element = (_value$element = value.element) != null ? _value$element : value.url ? createImageElement(value.url, value.size) : null;
  return element ? withMarkerOptions(element, value) : null;
};

const _excluded = ["content"];
const isHtmlElement = value => {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
};
const isPopupOptions = value => {
  return typeof value === 'object' && value !== null && !isHtmlElement(value);
};
const normalizePopup = value => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' || isHtmlElement(value)) {
    return {
      content: value,
      options: {}
    };
  }
  if (!isPopupOptions(value)) {
    return null;
  }
  const {
      content
    } = value,
    options = _objectWithoutPropertiesLoose(value, _excluded);
  if (content === null || content === undefined) {
    return null;
  }
  return {
    content,
    options
  };
};

/** Espace laissé entre le bord de l'icône et celui de la popup, en pixels. */
const POPUP_GAP = 8;
/**
 * Position du point d'ancrage à l'intérieur de l'élément, mesurée depuis son
 * coin haut-gauche. MapLibre place ce point sur la coordonnée géographique.
 */
const anchorPoint = ([width, height], anchor) => {
  const x = anchor.includes('left') ? 0 : anchor.includes('right') ? width : width / 2;
  const y = anchor.includes('top') ? 0 : anchor.includes('bottom') ? height : height / 2;
  return [x, y];
};
/**
 * Construit la table de décalages pour une icône de taille et d'ancrage donnés.
 *
 * Retourne `null` quand la taille est inconnue — une icône fournie sous forme
 * d'élément DOM brut, par exemple, dont les dimensions ne sont pas mesurables
 * avant insertion dans le document. MapLibre garde alors la main.
 */
const popupOffsetForIcon = (size, anchor) => {
  if (!size) {
    return null;
  }
  const [width, height] = size;
  const [ax, ay] = anchorPoint(size, anchor != null ? anchor : 'center');
  // Boîte de l'icône, relative à la coordonnée géographique.
  const left = -ax;
  const right = width - ax;
  const top = -ay;
  const bottom = height - ay;
  const midX = (left + right) / 2;
  const midY = (top + bottom) / 2;
  // L'ancrage nomme la partie de la popup posée sur le point : `bottom`
  // signifie donc que la popup s'étend vers le haut, et doit partir du bord
  // supérieur de l'icône.
  return {
    'center': [midX, midY],
    'bottom': [midX, top - POPUP_GAP],
    'bottom-left': [right, top - POPUP_GAP],
    'bottom-right': [left, top - POPUP_GAP],
    'top': [midX, bottom + POPUP_GAP],
    'top-left': [right, bottom + POPUP_GAP],
    'top-right': [left, bottom + POPUP_GAP],
    'left': [right + POPUP_GAP, midY],
    'right': [left - POPUP_GAP, midY]
  };
};

/**
 * Le handler ignore volontairement la charge utile de l'événement. MapLibre v6
 * a supprimé `MapDataEvent` au profit de `MapSourceDataEvent`, et `sourcedata`
 * se déclenche pour chaque tuile : la seule question utile est « resynchroniser
 * maintenant ? », pas « qu'est-ce qui a changé ? ».
 */
/**
 * `move` est volontairement absent : `Marker` lie déjà son propre `_update` sur
 * cet événement, donc les positions suivent la carte sans nous. La seule chose
 * que `sync()` observe est *quelles tuiles sont chargées*, ce qui ne change que
 * sur `sourcedata`, `moveend` et `idle`. L'y ajouter coûterait un balayage
 * complet des tuiles à chaque frame de chaque déplacement, sans rien apporter.
 */
const SYNC_EVENTS = ['moveend', 'sourcedata', 'idle'];
class MarkerSync {
  constructor(options) {
    this.map = void 0;
    this.resolveIcon = void 0;
    this.resolvePopup = void 0;
    this.onMarkerClick = void 0;
    this.markers = new Map();
    this.features = new Map();
    this.handler = () => this.sync();
    this.started = false;
    this.map = options.map;
    this.resolveIcon = options.resolveIcon;
    this.resolvePopup = options.resolvePopup;
    this.onMarkerClick = options.onMarkerClick;
  }
  start() {
    if (this.started) {
      return;
    }
    for (const event of SYNC_EVENTS) {
      this.map.on(event, this.handler);
    }
    this.started = true;
  }
  /**
   * Remplace la collection de référence et retire les marqueurs périmés.
   *
   * Élaguer sur la seule absence de l'`id` ne suffit pas. Les `id` sont
   * positionnels : `setStores` réattribue `0..n-1`, donc un `id` peut survivre
   * en désignant un tout autre magasin. Le marqueur construit depuis l'ancienne
   * feature resterait alors en place — anciennes coordonnées, ancienne popup —
   * et `sync()` ne le réparerait jamais, puisqu'il passe son tour dès que
   * `markers.has(id)` est vrai.
   *
   * La comparaison porte donc sur l'identité de la feature. `filterFeatures`
   * préserve les références d'origine, un simple filtrage ne provoque donc
   * aucune reconstruction ; `normalizeStores` crée des objets neufs, un
   * `setStores` en provoque bien une.
   */
  setFeatures(collection) {
    this.features.clear();
    for (const feature of collection.features) {
      if (feature.id !== undefined) {
        this.features.set(feature.id, feature);
      }
    }
    for (const [id, tracked] of this.markers) {
      if (this.features.get(id) !== tracked.feature) {
        this.removeMarker(id);
      }
    }
  }
  sync() {
    if (!this.map.getSource(SOURCE_ID) || !this.map.isSourceLoaded(SOURCE_ID)) {
      return;
    }
    // `validate: false` : la validation par défaut sérialise tout le style à
    // chaque appel — une centaine de couches pour le fond OpenFreeMap Bright.
    // `UNCLUSTERED_FILTER` est une constante de module, donc déjà validée.
    const rendered = this.map.querySourceFeatures(SOURCE_ID, {
      filter: UNCLUSTERED_FILTER,
      validate: false
    });
    const visible = new Set();
    for (const tileFeature of rendered) {
      const id = tileFeature.id;
      if (id === undefined || visible.has(id)) {
        continue;
      }
      visible.add(id);
      if (this.markers.has(id)) {
        continue;
      }
      const feature = this.features.get(id);
      if (!feature) {
        continue;
      }
      this.markers.set(id, this.createMarker(feature));
    }
    for (const id of [...this.markers.keys()]) {
      if (!visible.has(id)) {
        this.removeMarker(id);
      }
    }
  }
  destroy() {
    this.clear();
    this.features.clear();
    if (this.started) {
      for (const event of SYNC_EVENTS) {
        this.map.off(event, this.handler);
      }
      this.started = false;
    }
  }
  clear() {
    for (const id of [...this.markers.keys()]) {
      this.removeMarker(id);
    }
  }
  /**
   * Retire un marqueur et détache son écouteur.
   *
   * `Marker.remove()` ne détache que ses propres écouteurs. Le nôtre survivrait
   * sur un élément fourni par l'appelant et réutilisé d'un rendu à l'autre,
   * s'y empilant à chaque cycle et retenant l'instance au passage.
   */
  removeMarker(id) {
    const tracked = this.markers.get(id);
    if (!tracked) {
      return;
    }
    tracked.marker.getElement().removeEventListener('click', tracked.onClick);
    tracked.marker.remove();
    this.markers.delete(id);
  }
  createMarker(feature) {
    const iconValue = this.resolveIcon(feature);
    const iconOptions = normalizeIcon(iconValue);
    const marker = new Marker(iconOptions != null ? iconOptions : undefined);
    marker.setLngLat(feature.geometry.coordinates);
    const popup = normalizePopup(this.resolvePopup(feature));
    if (popup) {
      // MapLibre ne dérive un décalage de popup que pour son marqueur par
      // défaut ; avec un élément fourni, la popup s'ancrerait sur la coordonnée
      // elle-même, donc par-dessus l'icône. Un `offset` explicite de l'appelant
      // reste prioritaire.
      const offset = 'offset' in popup.options ? undefined : popupOffsetForIcon(iconSize(iconValue), iconOptions == null ? void 0 : iconOptions.anchor);
      const instance = new Popup(offset ? _extends({}, popup.options, {
        offset
      }) : popup.options);
      if (typeof popup.content === 'string') {
        instance.setHTML(popup.content);
      } else {
        instance.setDOMContent(popup.content);
      }
      marker.setPopup(instance);
    }
    const onClick = () => this.onMarkerClick(feature);
    marker.getElement().addEventListener('click', onClick);
    marker.addTo(this.map);
    return {
      marker,
      feature,
      onClick
    };
  }
}

/**
 * Store Locator
 *
 * Le CSS de MapLibre est embarqué en chaîne et injecté à la création de la
 * carte — voir `map/inject-css.ts`. Ce module ne l'**importe** pas pour autant :
 * microbundle externalise `maplibre-gl`, spécificateur CSS compris, qui
 * survivrait donc tel quel dans le bundle publié ; une importmap ne peut pas le
 * résoudre, un `.css` ne pouvant pas être servi comme module script. Or c'est
 * exactement le chemin d'installation que le README annonce, depuis GitHub et
 * sans étape de build.
 *
 * @module StoreLocator
 */
class StoreLocator {
  /**
   * Icônes réclamées par le style et absentes de son sprite, dans l'ordre où
   * MapLibre les a demandées.
   *
   * `map.resolveMissingImages` fait taire les avertissements de MapLibre — dont
   * ceux, nombreux, que produisent les couches POI d'OpenFreeMap Bright. Cette
   * liste est là pour qu'un `addImage` oublié dans l'application reste
   * trouvable, plutôt que noyé dans ce silence.
   */
  get unresolvedImages() {
    return [...this.missingImages];
  }
  /**
   * `true` dès que `destroy()` a été appelé.
   *
   * `destroy()` résout délibérément `whenReady()` pour ne laisser aucun
   * appelant en attente. Sans ce drapeau, un consommateur qui attend la
   * promesse ne pourrait pas distinguer « la carte est prête » de
   * « l'instance a été détruite » — les deux résolvent avec la même valeur.
   */
  get destroyed() {
    return this.isDestroyed;
  }
  /**
   * Instancie le store locator et démarre la carte.
   * @param options Options du store locator
   */
  constructor(options) {
    this.options = void 0;
    this.map = null;
    this.filters = null;
    this.markerSync = null;
    this.container = null;
    this.styleLoaded = false;
    this.isDestroyed = false;
    this.pending = null;
    this.readyPromise = void 0;
    this.resolveReady = void 0;
    this.filterFields = [];
    this.filterChangeHandler = null;
    this.missingImages = new Set();
    this.options = this.createOptions(options);
    if (this.options.stores === null) {
      throw new Error('[store-locator] - No stores available');
    }
    this.readyPromise = new Promise(resolve => {
      this.resolveReady = resolve;
    });
    this.pending = {
      filters: null,
      recenter: true,
      maxZoom: this.options.map.initialRecenter ? null : this.options.map.options.zoom
    };
    this.initMap();
    this.setFilters();
  }
  /**
   * Résout quand le style MapLibre est chargé et que les couches sont en place.
   * Résout également, avec l'instance détruite, si `destroy()` est appelé avant.
   */
  whenReady() {
    return this.readyPromise;
  }
  /** Remplace les données affichées et rafraîchit la carte. */
  setStores(stores, filters = null, recenter = this.options.map.refreshRecenter, maxZoom = null) {
    this.options.stores = normalizeStores(stores);
    this.refresh(filters, recenter, maxZoom);
  }
  /** Associe ou réassocie le formulaire de filtres. */
  setFilters(filters = (_this$options$element => (_this$options$element = this.options.elements.filters) != null ? _this$options$element : this.options.selectors.filters)(), wrapper = (_this$options$element2 => (_this$options$element2 = this.options.elements.wrapper) != null ? _this$options$element2 : this.options.selectors.wrapper)()) {
    var _this$options$element3;
    this.detachFilters();
    if (typeof filters === 'string') {
      this.options.selectors.filters = filters;
      this.options.elements.filters = null;
    } else {
      this.options.elements.filters = isFormElement(filters) ? filters : null;
    }
    if (typeof wrapper === 'string') {
      this.options.selectors.wrapper = wrapper;
      this.options.elements.wrapper = null;
    } else {
      this.options.elements.wrapper = wrapper;
    }
    const wrapperElement = this.resolveWrapperElement();
    const filtersElement = (_this$options$element3 = this.options.elements.filters) != null ? _this$options$element3 : resolveElement(this.options.selectors.filters, wrapperElement);
    if (!filtersElement || !filtersElement.elements.length) {
      this.filters = null;
      return;
    }
    this.filters = filtersElement;
    this.filterFields = Array.from(this.filters.elements);
    this.filterChangeHandler = () => this.refresh(formValues(this.filters));
    for (const field of this.filterFields) {
      field.addEventListener('change', this.filterChangeHandler);
    }
    this.refresh(formValues(this.filters));
  }
  /** Réapplique les filtres à la source et resynchronise les marqueurs. */
  refresh(filters = null, recenter = this.options.map.refreshRecenter, maxZoom = null) {
    var _this$markerSync, _this$markerSync2;
    if (!this.map || !this.options.stores) {
      return;
    }
    if (!this.styleLoaded) {
      var _ref, _this$pending, _this$pending$recente, _this$pending2, _ref2, _this$pending3;
      this.pending = {
        // `null` ne porte aucune information de filtrage : `setStores` le passe
        // par défaut, sans rien savoir des filtres. L'écraser rendrait la mise
        // en file dépendante de l'ordre d'appel — un `setStores` après un
        // `setFilters` effacerait silencieusement les filtres du formulaire.
        filters: (_ref = filters != null ? filters : (_this$pending = this.pending) == null ? void 0 : _this$pending.filters) != null ? _ref : null,
        recenter: recenter || ((_this$pending$recente = (_this$pending2 = this.pending) == null ? void 0 : _this$pending2.recenter) != null ? _this$pending$recente : false),
        maxZoom: (_ref2 = maxZoom != null ? maxZoom : (_this$pending3 = this.pending) == null ? void 0 : _this$pending3.maxZoom) != null ? _ref2 : null
      };
      return;
    }
    const collection = filterFeatures(this.options.stores, filters);
    setClusterData(this.map, collection);
    (_this$markerSync = this.markerSync) == null || _this$markerSync.setFeatures(collection);
    (_this$markerSync2 = this.markerSync) == null || _this$markerSync2.sync();
    if (recenter) {
      this.fitToCollection(collection, maxZoom);
    }
  }
  /** Relance le calcul de taille de la carte. Utile après un affichage différé. */
  resize() {
    var _this$map;
    (_this$map = this.map) == null || _this$map.resize();
  }
  /** Détruit la carte et libère tous les écouteurs. */
  destroy() {
    var _this$markerSync3, _this$map2;
    this.detachFilters();
    (_this$markerSync3 = this.markerSync) == null || _this$markerSync3.destroy();
    this.markerSync = null;
    (_this$map2 = this.map) == null || _this$map2.remove();
    if (this.container) {
      releaseContainer(this.container);
    }
    this.container = null;
    this.map = null;
    this.filters = null;
    this.styleLoaded = false;
    this.isDestroyed = true;
    this.resolveReady(this);
  }
  createOptions(options) {
    const mergedOptions = extend(true, defaultOptions, options);
    return _extends({}, mergedOptions, {
      stores: normalizeStores(options.stores)
    });
  }
  initMap() {
    const container = this.resolveMapElement();
    if (!container) {
      throw new Error('[store-locator] - Map container not found');
    }
    this.container = container;
    this.map = createMap(container, this.options.map, this.missingImages);
    this.markerSync = new MarkerSync({
      map: this.map,
      resolveIcon: feature => this.resolveIcon(feature),
      resolvePopup: feature => this.resolvePopup(feature),
      onMarkerClick: feature => {
        var _this$map3;
        (_this$map3 = this.map) == null || _this$map3.easeTo({
          center: feature.geometry.coordinates
        });
      }
    });
    // Pas de ResizeObserver de notre côté : MapLibre observe déjà le
    // conteneur depuis son constructeur, en throttlant à 50 ms.
    this.map.on('load', () => this.handleStyleLoad());
  }
  handleStyleLoad() {
    var _this$pending4, _this$markerSync4, _this$markerSync5, _this$markerSync6;
    if (!this.map || !this.options.stores) {
      return;
    }
    const pending = (_this$pending4 = this.pending) != null ? _this$pending4 : {
      filters: null,
      recenter: true,
      maxZoom: null
    };
    this.pending = null;
    const collection = filterFeatures(this.options.stores, pending.filters);
    addClusterSource(this.map, collection, this.options.map.clusters);
    this.bindClusterInteractions();
    (_this$markerSync4 = this.markerSync) == null || _this$markerSync4.setFeatures(collection);
    (_this$markerSync5 = this.markerSync) == null || _this$markerSync5.start();
    (_this$markerSync6 = this.markerSync) == null || _this$markerSync6.sync();
    this.styleLoaded = true;
    if (pending.recenter) {
      this.fitToCollection(collection, pending.maxZoom);
    }
    this.resolveReady(this);
  }
  bindClusterInteractions() {
    if (!this.map || !this.options.map.clusters.enabled) {
      return;
    }
    const map = this.map;
    map.on('click', CLUSTER_LAYER_ID, event => {
      var _event$features, _feature$properties;
      const feature = (_event$features = event.features) == null ? void 0 : _event$features[0];
      const clusterId = feature == null || (_feature$properties = feature.properties) == null ? void 0 : _feature$properties.cluster_id;
      // `feature` est redondant à l'exécution — sans feature, pas de
      // `clusterId` — mais le cast ci-dessus coupe le lien d'inférence, et
      // `feature` resterait `possibly undefined` dans le `.then()`.
      if (!feature || clusterId === undefined) {
        return;
      }
      const source = map.getSource(SOURCE_ID);
      if (!(source != null && source.getClusterExpansionZoom)) {
        return;
      }
      void source.getClusterExpansionZoom(clusterId).then(zoom => {
        map.easeTo({
          center: feature.geometry.coordinates,
          zoom
        });
      });
    });
    map.on('mouseenter', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });
  }
  fitToCollection(collection, maxZoom) {
    const bounds = computeBounds(collection);
    if (!bounds || !this.map) {
      return;
    }
    this.map.fitBounds(bounds, _extends({}, this.options.map.fitBoundsOptions, maxZoom !== null ? {
      maxZoom
    } : {}));
  }
  resolveMapElement() {
    var _this$options$element4;
    return (_this$options$element4 = this.options.elements.map) != null ? _this$options$element4 : resolveElement(this.options.selectors.map, null, true);
  }
  resolveWrapperElement() {
    var _this$options$element5;
    return (_this$options$element5 = this.options.elements.wrapper) != null ? _this$options$element5 : resolveElement(this.options.selectors.wrapper);
  }
  resolvePopup(feature) {
    const popup = this.options.map.markers.popup;
    return typeof popup === 'function' ? popup(feature) : popup;
  }
  resolveIcon(feature) {
    const icon = this.options.map.markers.icon;
    return typeof icon === 'function' ? icon(feature) : icon;
  }
  detachFilters() {
    if (this.filterFields.length && this.filterChangeHandler) {
      for (const field of this.filterFields) {
        field.removeEventListener('change', this.filterChangeHandler);
      }
    }
    this.filterFields = [];
    this.filterChangeHandler = null;
  }
}

const toError = error => {
  return error instanceof Error ? error : new Error('[store-locator/react] - Failed to initialize StoreLocator');
};
const useStoreLocator = ({
  stores,
  options,
  mapRef,
  wrapperRef,
  filtersRef,
  disabled: _disabled = false,
  onReady
}) => {
  var _wrapperRef$current, _filtersRef$current;
  const [instance, setInstance] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const storesRef = useRef(stores);
  const optionsRef = useRef(options);
  const onReadyRef = useRef(onReady);
  storesRef.current = stores;
  optionsRef.current = options;
  onReadyRef.current = onReady;
  const currentWrapper = (_wrapperRef$current = wrapperRef == null ? void 0 : wrapperRef.current) != null ? _wrapperRef$current : null;
  const currentFilters = (_filtersRef$current = filtersRef == null ? void 0 : filtersRef.current) != null ? _filtersRef$current : null;
  useEffect(() => {
    if (_disabled || !mapRef.current) {
      setInstance(null);
      setError(null);
      setReady(false);
      return;
    }
    let locator = null;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!mapRef.current) {
        return;
      }
      try {
        var _optionsRef$current, _wrapperRef$current2, _filtersRef$current2;
        locator = new StoreLocator(_extends({}, (_optionsRef$current = optionsRef.current) != null ? _optionsRef$current : {}, {
          stores: storesRef.current,
          elements: {
            map: mapRef.current,
            wrapper: (_wrapperRef$current2 = wrapperRef == null ? void 0 : wrapperRef.current) != null ? _wrapperRef$current2 : null,
            filters: (_filtersRef$current2 = filtersRef == null ? void 0 : filtersRef.current) != null ? _filtersRef$current2 : null
          }
        }));
        setInstance(locator);
        setError(null);
        setReady(false);
        // whenReady() attend le chargement du style : avant lui, la source et
        // les couches n'existent pas encore.
        //
        // Deux gardes, pour deux causes distinctes. `value.destroyed` couvre un
        // `destroy()` déclenché par l'appelant sur l'instance qu'il détient
        // alors que le composant reste monté : le nettoyage de l'effet ne passe
        // pas, donc `cancelled` reste faux, et `destroy()` résolvant
        // délibérément la promesse, `onReady` partirait pour une instance morte.
        //
        // `cancelled` couvre le démontage. Il est de fait redondant, puisque le
        // nettoyage appelle `destroy()` et pose donc `destroyed` — vérifié par
        // mutation. On le conserve néanmoins : c'est le garde idiomatique lié au
        // cycle de vie de l'effet, et s'en passer coupleraient la sûreté du hook
        // à un détail interne de `StoreLocator`.
        void locator.whenReady().then(value => {
          if (cancelled || value.destroyed) {
            return;
          }
          setReady(true);
          onReadyRef.current == null || onReadyRef.current(value);
        });
      } catch (nextError) {
        setError(toError(nextError));
        setInstance(null);
        setReady(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (locator) {
        locator.destroy();
        setInstance(currentInstance => currentInstance === locator ? null : currentInstance);
        setReady(false);
      }
    };
  }, [_disabled, filtersRef, mapRef, wrapperRef]);
  useEffect(() => {
    if (!instance) {
      return;
    }
    instance.setStores(stores);
  }, [instance, stores]);
  useEffect(() => {
    if (!instance) {
      return;
    }
    instance.setFilters(currentFilters, currentWrapper);
  }, [currentFilters, currentWrapper, instance]);
  return {
    instance,
    error,
    ready
  };
};
const StoreLocatorMap = ({
  stores,
  options,
  filtersRef,
  disabled,
  onReady,
  className,
  style,
  mapClassName,
  mapStyle,
  children
}) => {
  const wrapperRef = useRef(null);
  const mapRef = useRef(null);
  useStoreLocator({
    stores,
    options,
    filtersRef,
    mapRef,
    wrapperRef,
    disabled,
    onReady
  });
  return createElement('div', {
    ref: wrapperRef,
    className,
    style
  }, children, createElement('div', {
    ref: mapRef,
    className: mapClassName,
    style: mapStyle != null ? mapStyle : {
      minHeight: 400
    }
  }));
};

export { StoreLocatorMap, useStoreLocator };
