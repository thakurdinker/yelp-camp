// const myLines = [
//   campgrounds.map(function (campground) {
//     return campground.geometry.coordinates;
//   }),
// ];

const myLines = campgrounds.map(function (campground) {
  return {title: campground.title, coordinates: campground.geometry.coordinates};
});

const map = L.map("map").setView([myLines[0].coordinates[1], myLines[0].coordinates[0]], 3);

L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const markers = L.markerClusterGroup();

for (let i = 0; i < myLines.length; i++) {
  const loc = myLines[i];
  const title = `<b>${loc.title}<br/> Lat: ${loc.coordinates[1]} Long: ${loc.coordinates[0]}<b>`;
  const marker = L.marker(new L.LatLng(loc.coordinates[1], loc.coordinates[0]), {
    title: title,
  });
  marker.bindPopup(title);
  markers.addLayer(marker);
}

map.addLayer(markers);
