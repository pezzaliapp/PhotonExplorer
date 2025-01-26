let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let isSimulating = false;

// Inizializza la mappa
function initializeMap() {
    map = L.map('map', {
        crs: L.CRS.EPSG3857,
        zoomControl: true,
    }).setView([45.4642, 9.1900], 13); // Milano come posizione predefinita

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    addGridToMap();
    addClickEventForWaypoints();
}

// Aggiungi una griglia alla mappa
function addGridToMap() {
    const bounds = map.getBounds();
    const step = 0.005; // Spaziatura della griglia

    for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += step) {
        L.polyline([[lat, bounds.getWest()], [lat, bounds.getEast()]], {
            color: '#cccccc',
            weight: 0.5,
            opacity: 0.5,
        }).addTo(map);
    }

    for (let lng = bounds.getWest(); lng < bounds.getEast(); lng += step) {
        L.polyline([[bounds.getSouth(), lng], [bounds.getNorth(), lng]], {
            color: '#cccccc',
            weight: 0.5,
            opacity: 0.5,
        }).addTo(map);
    }
}

// Aggiungi un evento di clic per impostare i waypoint
function addClickEventForWaypoints() {
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;

        // Aggiunge un marker al punto selezionato
        const marker = L.marker([lat, lng]).addTo(map);
        waypointMarkers.push(marker);

        // Aggiunge il punto alla lista dei waypoint
        dronePath.push({ lat, lng });

        // Mostra le coordinate al clic
        marker.bindPopup(`Latitudine: ${lat.toFixed(5)}, Longitudine: ${lng.toFixed(5)}`).openPopup();
    });
}

// Simula il volo del drone
function simulateDroneFlight() {
    if (dronePath.length < 2) {
        alert("Errore: Devi selezionare almeno due punti sulla mappa.");
        return;
    }

    let index = 0;
    const droneIcon = L.icon({
        iconUrl: 'icons/icon-drone.png',
        iconSize: [30, 30],
    });

    droneMarker = L.marker([dronePath[0].lat, dronePath[0].lng], { icon: droneIcon }).addTo(map).bindPopup('Drone').openPopup();

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
        const distance = Math.sqrt(dx * dx + dy * dy);
        const step = 0.001; // Passo di movimento del drone
        const stepLat = step * dx / distance;
        const stepLng = step * dy / distance;

        current.lat += stepLat;
        current.lng += stepLng;

        droneMarker.setLatLng([current.lat, current.lng]);

        if (Math.abs(current.lat - next.lat) < stepLat && Math.abs(current.lng - next.lng) < stepLng) {
            index++;
        }
    }, 100);
}

// Reset della simulazione
function resetSimulation() {
    dronePath = [];
    waypointMarkers.forEach(marker => map.removeLayer(marker));
    waypointMarkers = [];
    if (droneMarker) map.removeLayer(droneMarker);
}

// Eventi
document.getElementById('startButton').addEventListener('click', simulateDroneFlight);
document.getElementById('resetButton').addEventListener('click', resetSimulation);

// Inizializza la mappa quando la pagina è pronta
document.addEventListener('DOMContentLoaded', initializeMap);
