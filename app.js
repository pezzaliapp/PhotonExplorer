let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let simulationInterval = null;

let windSpeed = 0;
let windDirection = 0;

function initializeMap() {
  map = L.map('map').setView([45.4642, 9.1900], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const marker = L.marker([lat, lng]).addTo(map);
    waypointMarkers.push(marker);
    dronePath.push({ lat, lng });
    marker.bindPopup(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`).openPopup();
  });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function simulateDroneFlight() {
  if (dronePath.length < 2) {
    alert("Errore: seleziona almeno due waypoint.");
    return;
  }

  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }

  const droneIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const startPoint = dronePath[0];
  droneMarker = L.marker([startPoint.lat, startPoint.lng], { icon: droneIcon }).addTo(map);
  buildDataTable();

  let currentIndex = 0;
  let currentLat = startPoint.lat;
  let currentLng = startPoint.lng;

  const REFRESH_RATE = 100;
  const baseSpeed = 10;
  const windSpeedMs = windSpeed * 0.51444;
  const droneSpeed = baseSpeed + windSpeedMs;

  simulationInterval = setInterval(() => {
    if (currentIndex >= dronePath.length - 1) {
      clearInterval(simulationInterval);
      simulationInterval = null;
      alert("Simulazione completata!");
      return;
    }

    const nextPoint = dronePath[currentIndex + 1];
    const distToNext = calculateDistance(currentLat, currentLng, nextPoint.lat, nextPoint.lng);

    if (distToNext < 1) {
      currentIndex++;
      return;
    }

    const distanceThisStep = droneSpeed * (REFRESH_RATE / 1000);
    let fraction = distanceThisStep / distToNext;
    if (fraction > 1) fraction = 1;

    currentLat += (nextPoint.lat - currentLat) * fraction;
    currentLng += (nextPoint.lng - currentLng) * fraction;

    droneMarker.setLatLng([currentLat, currentLng]);

    const realTimeData = document.getElementById('realTimeData');
    realTimeData.textContent = `Velocità Attuale: ${droneSpeed.toFixed(2)} m/s | Distanza dal Prossimo Punto: ${distToNext.toFixed(2)} m`;
  }, REFRESH_RATE);
}

function buildDataTable() {
  const dataRows = document.getElementById('dataRows');
  dataRows.innerHTML = '';
  const baseSpeed = 10;
  const windSpeedMs = windSpeed * 0.51444;
  const droneSpeed = baseSpeed + windSpeedMs;

  dronePath.forEach((point, i) => {
    if (i < dronePath.length - 1) {
      const nextPoint = dronePath[i + 1];
      const distance = calculateDistance(point.lat, point.lng, nextPoint.lat, nextPoint.lng);
      const time = distance / droneSpeed;

      const row = `
        <tr>
          <td>${i + 1}</td>
          <td>${point.lat.toFixed(5)}</td>
          <td>${point.lng.toFixed(5)}</td>
          <td>${time.toFixed(2)}</td>
          <td>${distance.toFixed(2)}</td>
        </tr>`;
      dataRows.insertAdjacentHTML('beforeend', row);
    }
  });
}

function resetSimulation() {
  dronePath = [];
  waypointMarkers.forEach((marker) => map.removeLayer(marker));
  waypointMarkers = [];
  if (droneMarker) map.removeLayer(droneMarker);
  document.getElementById('dataRows').innerHTML = '';
  document.getElementById('realTimeData').textContent = 'Velocità Attuale: 0 m/s | Distanza dal Prossimo Punto: 0 m';
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', initializeMap);
document.getElementById('startButton').addEventListener('click', () => {
  windSpeed = parseFloat(document.getElementById('windSpeed').value);
  simulateDroneFlight();
});

document.getElementById('resetButton').addEventListener('click', resetSimulation);
