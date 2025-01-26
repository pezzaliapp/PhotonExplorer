let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let windSpeed = 0;
let windDirection = 0;

// Inizializza la mappa
function initializeMap() {
    map = L.map('map', {
        crs: L.CRS.EPSG3857,
        zoomControl: true,
    }).setView([45.4642, 9.1900], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        const marker = L.marker([lat, lng]).addTo(map);
        waypointMarkers.push(marker);
        dronePath.push({ lat, lng });

        marker.bindPopup(`Latitudine: ${lat.toFixed(5)}, Longitudine: ${lng.toFixed(5)}`).openPopup();
    });
}

// Calcola la distanza tra due punti
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Aggiorna i dati in tempo reale
function updateRealTimeData(index, distance) {
    const currentSpeed = (10 + windSpeed).toFixed(2);
    document.getElementById('realTimeData').textContent = `Velocità Attuale: ${currentSpeed} m/s | Distanza dal Prossimo Punto: ${distance.toFixed(2)} m`;

    const dataRows = document.getElementById('dataRows');
    const rowExists = dataRows.querySelector(`tr[data-index="${index}"]`);
    if (!rowExists) {
        const current = dronePath[index];
        const next = dronePath[index + 1];
        const time = (distance / currentSpeed).toFixed(2);

        const row = `
            <tr data-index="${index}">
                <td>${index + 1}</td>
                <td>${current.lat.toFixed(5)}</td>
                <td>${current.lng.toFixed(5)}</td>
                <td>${time}</td>
                <td>${distance.toFixed(2)}</td>
            </tr>`;
        dataRows.insertAdjacentHTML('beforeend', row);
    }
}

// Simula il volo del drone
function simulateDroneFlight() {
    if (dronePath.length < 2) {
        alert("Errore: Devi selezionare almeno due punti.");
        return;
    }

    let index = 0;
    const droneIcon = L.icon({
        iconUrl: 'icons/icon-drone.png',
        iconSize: [30, 30],
    });
    droneMarker = L.marker([dronePath[0].lat, dronePath[0].lng], { icon: droneIcon }).addTo(map);

    const interval = setInterval(() => {
        if (index >= dronePath.length - 1) {
            clearInterval(interval);
            alert("Simulazione completata!");
            return;
        }

        const current = dronePath[index];
        const next = dronePath[index + 1];
        const dx = next.lat - current.lat;
        const dy = next.lng - current.lng;
        const distance = calculateDistance(current.lat, current.lng, next.lat, next.lng);

        const stepLat = (dx / distance) * 0.0001;
        const stepLng = (dy / distance) * 0.0001;

        current.lat += stepLat;
        current.lng += stepLng;

        droneMarker.setLatLng([current.lat, current.lng]);

        updateRealTimeData(index, distance);

        if (distance < 1) index++;
    }, 100);
}

// Reset della simulazione
function resetSimulation() {
    dronePath = [];
    waypointMarkers.forEach(marker => map.removeLayer(marker));
    waypointMarkers = [];
    if (droneMarker) map.removeLayer(droneMarker);
    document.getElementById('dataRows').innerHTML = '';
    document.getElementById('realTimeData').textContent = '';
}

// Esportazione e importazione della rotta
function exportRoute() { /* ... */ }
function importRoute(event) { /* ... */ }

// Eventi
document.getElementById('startButton').addEventListener('click', simulateDroneFlight);
document.getElementById('resetButton').addEventListener('click', resetSimulation);
document.addEventListener('DOMContentLoaded', initializeMap);
