import "ol/ol.css";
import Feature from "ol/Feature";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Map from "ol/Map";
import Overlay from "ol/Overlay";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { Icon, Style } from "ol/style";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";

const villes = require("./data/data.json");
const points = [];
for (let keys in villes) {
  const lngLat = [villes[keys][0].lon, villes[keys][0].lat];

  const ptn = new Feature({
    geometry: new Point(fromLonLat(lngLat)),
    name: villes[keys][0].nom
  });
  ptn.setStyle(
    new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        crossOrigin: "anonymous",
        src: "data/pin.png",
        scale: 0.01
      })
    })
  );
  points.push(ptn);
}

const vectorSource = new VectorSource({
  features: points
});

const vectorLayer = new VectorLayer({
  source: vectorSource
});

const rasterLayer = new TileLayer({
  source: new OSM()
});

const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: document.getElementById("map"),
  view: new View({
    center: fromLonLat([5.5, 43.3333]),
    zoom: 10
  })
});
const element = document.getElementById("popup");

const popup = new Overlay({
  element: element,
  positioning: "bottom-center",
  stopEvent: false
});
map.addOverlay(popup);

// display popup on click
map.on("click", function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  if (feature) {
    popup.setPosition(evt.coordinate);
    $(element).popover({
      placement: "top",
      html: true,
      content: feature.get("name")
    });
    $(element).popover("show");
  } else {
    $(element).popover("dispose");
  }
});

// change mouse cursor when over marker
map.on("pointermove", function (e) {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? "pointer" : "";
});
// Close the popup when the map is moved
map.on("movestart", function () {
  $(element).popover("dispose");
});
