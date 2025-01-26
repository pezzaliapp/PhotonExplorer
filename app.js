let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let simulationInterval = null;

let windSpeed = 0;      // in nodi, inserito dall'utente
let windDirection = 0;  // in gradi, inserito dall'utente

function initializeMap() {
  // Crea la mappa centrata su Milano
  map = L.map('map').setView([45.4642, 9.1900], 13);

  // Aggiunge il layer OSM
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Evento click: aggiunge un waypoint (marker) e lo memorizza in dronePath
  map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    const marker = L.marker([lat, lng]).addTo(map);

    waypointMarkers.push(marker);
    dronePath.push({ lat, lng });

    // Popup con lat/long
    marker.bindPopup(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`).openPopup();
  });
}

// Funzione di utilità: calcolo distanza (m) con formula di Haversine
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // raggio medio della Terra in metri
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

// Avvia la simulazione di volo del drone
function simulateDroneFlight() {
  if (dronePath.length < 2) {
    alert("Errore: seleziona almeno due waypoint sulla mappa prima di avviare la simulazione.");
    return;
  }

  // Se esiste già una simulazione in corso, la fermiamo
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }

  // Creiamo l'icona del drone
  // (usiamo un'icona di default da Leaflet per evitare problemi di path)
  const droneIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  // Posizioniamo il drone sul primo waypoint
  const startPoint = dronePath[0];
  droneMarker = L.marker([startPoint.lat, startPoint.lng], { icon: droneIcon }).addTo(map);

  // Aggiorniamo la tabella con i dati PREVISTI (statici) prima di partire
  buildDataTable();

  // Inizializziamo gli indici e le coordinate
  let currentIndex = 0;
  let currentLat = startPoint.lat;
  let currentLng = startPoint.lng;

  // Impostazioni di simulazione
  const REFRESH_RATE = 100; // in ms (aggiorna posizione ogni 0.1 secondi)
  const baseSpeed = 10;     // velocità base in m/s
  // 1 nodo = 0.51444 m/s
  const windSpeedMs = windSpeed * 0.51444;
  // Velocità effettiva
  const droneSpeed = baseSpeed + windSpeedMs; // m/s

  // Avviamo un intervallo che sposta il drone step-by-step
  simulationInterval = setInterval(() => {
    // Se siamo all'ultimo waypoint, stop
    if (currentIndex >= dronePath.length - 1) {
      clearInterval(simulationInterval);
      simulationInterval = null;
      alert("Simulazione completata!");
      return;
    }

    const nextPoint = dronePath[currentIndex + 1];
    const distToNext = calculateDistance(currentLat, currentLng, nextPoint.lat, nextPoint.lng);

    // Se la distanza è < 1m, passiamo al successivo
    if (distToNext < 1) {
      currentIndex++;
      return;
    }

    // Distanza percorsa in questo step
    const distanceThisStep = droneSpeed * (REFRESH_RATE / 1000); // in metri (v * t)

    // Frazione di avanzamento verso il waypoint successivo
    let fraction = distanceThisStep / distToNext;
    if (fraction > 1) fraction = 1;

    // Calcolo interpolazione lineare
    currentLat = currentLat + (nextPoint.lat - currentLat) * fraction;
    currentLng = currentLng + (nextPoint.lng - currentLng) * fraction;

    // Aggiorniamo la posizione del marker (drone)
    droneMarker.setLatLng([currentLat, currentLng]);

    // Aggiorniamo i dati in tempo reale
    const realTimeData = document.getElementById('realTimeData');
    realTimeData.textContent = `Velocità Attuale: ${droneSpeed.toFixed(2)} m/s | Distanza dal Prossimo Punto: ${distToNext.toFixed(2)} m`;
  }, REFRESH_RATE);
}

// Popola la tabella con le distanze/tempi PREVISTI (stima) per ogni tratto
function buildDataTable() {
  const dataRows = document.getElementById('dataRows');
  dataRows.innerHTML = '';

  // Calcolo velocità effettiva (m/s) = 10 + windSpeed_in_m/s
  const baseSpeed = 10;
  const windSpeedMs = windSpeed * 0.51444;
  const droneSpeed = baseSpeed + windSpeedMs;

  for (let i = 0; i < dronePath.length - 1; i++) {
    const current = dronePath[i];
    const next = dronePath[i + 1];
    const distance = calculateDistance(current.lat, current.lng, next.lat, next.lng);
    const time = distance / droneSpeed; // secondi

    const row = `
      <tr>
        <td>${i + 1}</td>
        <td>${current.lat.toFixed(5)}</td>
        <td>${current.lng.toFixed(5)}</td>
        <td>${time.toFixed(2)}</td>
        <td>${distance.toFixed(2)}</td>
      </tr>
    `;
    dataRows.insertAdjacentHTML('beforeend', row);
  }

  // Ultimo waypoint (senza "next", quindi --)
  const lastIndex = dronePath.length - 1;
  const last = dronePath[lastIndex];
  const lastRow = `
    <tr>
      <td>${lastIndex + 1}</td>
      <td>${last.lat.toFixed(5)}</td>
      <td>${last.lng.toFixed(5)}</td>
      <td>--</td>
      <td>--</td>
    </tr>
  `;
  dataRows.insertAdjacentHTML('beforeend', lastRow);
}

// Reset: interrompe la simulazione, rimuove marker e azzera la tabella
function resetSimulation() {
  // Svuota i waypoint
  dronePath = [];

  // Rimuove i marker dei waypoint
  waypointMarkers.forEach(marker => map.removeLayer(marker));
  waypointMarkers = [];

  // Rimuove il marker del drone (se presente)
  if (droneMarker) {
    map.removeLayer(droneMarker);
    droneMarker = null;
  }

  // Svuota la tabella
  document.getElementById('dataRows').innerHTML = '';

  // Azzeriamo i dati in tempo reale
  document.getElementById('realTimeData').textContent = 'Velocità Attuale: 0 m/s | Distanza dal Prossimo Punto: 0 m';

  // Interrompe la simulazione (se era in corso)
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

// Esporta la rotta in JSON
function exportRoute() {
  if (dronePath.length === 0) {
    alert("Nessuna rotta da esportare.");
    return;
  }
  const dataStr = JSON.stringify(dronePath, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'route.json';
  link.click();

  URL.revokeObjectURL(url);
}

// Importa la rotta (file JSON)
function importRoute(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedPath = JSON.parse(e.target.result);
      // Reset prima di importare
      resetSimulation();

      importedPath.forEach((p) => {
        dronePath.push(p);
        const marker = L.marker([p.lat, p.lng]).addTo(map);
        waypointMarkers.push(marker);
      });
    } catch (err) {
      alert("Errore durante l'importazione del file.");
    }
  };
  reader.readAsText(file);
}

// Al caricamento iniziale, inizializza la mappa
document.addEventListener('DOMContentLoaded', initializeMap);

// Gestione pulsanti
document.getElementById('startButton').addEventListener('click', () => {
  windSpeed = parseFloat(document.getElementById('windSpeed').value);
  windDirection = parseFloat(document.getElementById('windDirection').value);
  simulateDroneFlight();
});

document.getElementById('resetButton').addEventListener('click', resetSimulation);
document.getElementById('exportRoute').addEventListener('click', exportRoute);
document.getElementById('importFile').addEventListener('change', importRoute);
