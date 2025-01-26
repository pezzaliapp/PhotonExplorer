let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let windSpeed = 0;
let windDirection = 0;

// Inizializza la mappa
function initializeMap() {
    map = L.map('map').setView([45.4642, 9.1900], 13); // Milano come posizione predefinita

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

// Calcola la distanza tra due punti in metri
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Raggio terrestre in metri
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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

        if (distance < 1) index++;
    }, 100);
}

// Esporta la rotta in formato JSON
function exportRoute() {
    if (dronePath.length === 0) {
        alert("Errore: Nessuna rotta da esportare.");
        return;
    }

    const routeData = {
        waypoints: dronePath,
        windSpeed,
        windDirection,
    };

    const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "drone_route.json";
    link.click();

    URL.revokeObjectURL(url);
}

// Importa una rotta da un file JSON
function importRoute(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Errore: Nessun file selezionato.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            resetSimulation();
            data.waypoints.forEach(point => {
                const marker = L.marker([point.lat, point.lng]).addTo(map);
                waypointMarkers.push(marker);
                dronePath.push(point);
                marker.bindPopup(`Latitudine: ${point.lat.toFixed(5)}, Longitudine: ${point.lng.toFixed(5)}`).openPopup();
            });

            windSpeed = data.windSpeed || 0;
            windDirection = data.windDirection || 0;

            document.getElementById('windSpeed').value = windSpeed;
            document.getElementById('windDirection').value = windDirection;

            alert("Rotta importata con successo!");
        } catch (error) {
            alert("Errore: File JSON non valido.");
        }
    };

    reader.readAsText(file);
}

// Resetta la simulazione
function resetSimulation() {
    dronePath = [];
    waypointMarkers.forEach(marker => map.removeLayer(marker));
    waypointMarkers = [];
    if (droneMarker) map.removeLayer(droneMarker);
}

// Eventi
document.getElementById('startButton').addEventListener('click', simulateDroneFlight);
document.getElementById('resetButton').addEventListener('click', resetSimulation);
document.getElementById('exportRoute').addEventListener('click', exportRoute);
document.getElementById('importFile').addEventListener('change', importRoute);

document.addEventListener('DOMContentLoaded', initializeMap);
