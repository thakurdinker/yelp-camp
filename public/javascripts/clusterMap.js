const map = L.map("map").setView(
  [data[0].coordinates[1], data[0].coordinates[0]],
  3
);

L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a title href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// L.tileLayer(
//   `https://api.maptiler.com/maps/bright-v2/{z}/{x}/{y}.png?key=${MAP_TILER_KEY}`,
//   {
//     attribution:
//       '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
//   }
// ).addTo(map);

const markers = L.markerClusterGroup();

for (let i = 0; i < data.length; i++) {
  const campground = data[i];
  const title = `<a title="" href="/campgrounds/${campground.id}"><h6>${campground.title}</h6></a>`;
  const marker = L.marker(
    new L.LatLng(campground.coordinates[1], campground.coordinates[0])
  );
  marker.bindPopup(title);
  markers.addLayer(marker);
}

map.addLayer(markers);
