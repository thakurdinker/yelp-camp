const map = L.map("map").setView([latitude, longitutde], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 17,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const marker = L.marker([latitude, longitutde]).addTo(map);
marker.bindPopup(`<b>${campgroundTitle}<br/> Lat: ${latitude}<br> Long: ${longitutde}</b>.`).openPopup();