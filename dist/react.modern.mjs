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

/**
 * Conteneurs portant déjà une carte vivante. Remplace la sonde `_leaflet_id`
 * de la v2 sans écrire dans le DOM.
 */
const initializedContainers = new WeakSet();
const releaseContainer = container => {
  initializedContainers.delete(container);
};
const createMap = (container, config) => {
  if (initializedContainers.has(container)) {
    throw new Error('[store-locator] - Map container is already initialized. ' + 'Call destroy() on the previous instance before creating a new one on the same element.');
  }
  const map = new Map$1(_extends({}, config.options, {
    container,
    style: config.style
  }));
  // Marqué dès que la carte existe, et avant l'ajout des contrôles : ceux-ci
  // construisent du DOM et peuvent donc échouer. Une carte vivante sur un
  // conteneur non enregistré laisserait le garde-fou en autoriser une seconde.
  initializedContainers.add(container);
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
 * **Le CSS de MapLibre n'est pas importé par ce module** : c'est à l'application
 * de le charger, soit `import 'maplibre-gl/dist/maplibre-gl.css'` avec un
 * bundler, soit une balise `<link>` sans bundler.
 *
 * L'importer ici casserait le chemin sans bundler. microbundle externalise
 * `maplibre-gl`, spécificateur CSS compris, qui survit donc tel quel dans le
 * bundle publié ; une importmap ne peut pas le résoudre, un `.css` ne pouvant
 * pas être servi comme module script. Or c'est exactement le chemin
 * d'installation que le README annonce, depuis GitHub et sans étape de build.
 *
 * @module StoreLocator
 */
class StoreLocator {
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
    this.map = createMap(container, this.options.map);
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
