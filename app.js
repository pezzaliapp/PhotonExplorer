let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let speed = 10;
let windSpeed = 2;

// Inizializza la mappa
function initializeMap() {
    map = L.map('map').setView([45.4642, 9.1900], 13); // Milano come posizione predefinita
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
}

// Aggiungi waypoint
function addWaypoints(input) {
    // Rimuove i waypoint precedenti dalla mappa
    waypointMarkers.forEach(marker => map.removeLayer(marker));
    waypointMarkers = [];
    dronePath = [];

    // Analizza l'input e aggiunge i waypoint
    const lines = input.split('\n').map(line => line.trim());
    lines.forEach(line => {
        const [lat, lng, alt] = line.split(',').map(Number);
        if (!lat || !lng || !alt) {
            alert("Errore: Assicurati che tutte le coordinate siano nel formato 'latitudine,longitudine,altitudine'.");
            return;
        }
        const marker = L.marker([lat, lng]).addTo(map).bindPopup(`Altitudine: ${alt}m`);
        waypointMarkers.push(marker);
        dronePath.push({ lat, lng, alt });
    });

    // Centra la mappa sul primo waypoint
    if (dronePath.length > 0) {
        map.setView([dronePath[0].lat, dronePath[0].lng], 13);
    }
}

// Simula il volo del drone
function simulateDroneFlight() {
    if (dronePath.length < 2) {
        alert("Errore: Devi specificare almeno due waypoint per la simulazione.");
        return;
    }

    let index = 0;
    const droneIcon = L.icon({
        iconUrl: 'icons/icon-drone.png',
        iconSize: [30, 30],
    });

    // Posiziona il drone sul primo waypoint
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
        const step = speed / 1000; // Velocità in m/s
        const stepLat = step * dx / distance;
        const stepLng = step * dy / distance;

        // Simula l'influenza del vento
        const windEffectLat = windSpeed / 10000 * (Math.random() - 0.5);
        const windEffectLng = windSpeed / 10000 * (Math.random() - 0.5);

        current.lat += stepLat + windEffectLat;
        current.lng += stepLng + windEffectLng;

        // Aggiorna la posizione del drone
        droneMarker.setLatLng([current.lat, current.lng]);

        // Passa al prossimo waypoint se è abbastanza vicino
        if (Math.abs(current.lat - next.lat) < stepLat && Math.abs(current.lng - next.lng) < stepLng) {
            index++;
        }
    }, 100); // Intervallo di aggiornamento: 100 ms
}

// Eventi per i pulsanti
document.getElementById('startButton').addEventListener('click', () => {
    const waypoints = document.getElementById('waypoints').value.trim();
    if (!waypoints) {
        alert("Errore: Inserisci almeno due waypoint nel formato 'latitudine,longitudine,altitudine'.");
        return;
    }
    speed = parseInt(document.getElementById('speed').value);
    windSpeed = parseInt(document.getElementById('windSpeed').value);
    addWaypoints(waypoints);
    simulateDroneFlight();
});

document.getElementById('resetButton').addEventListener('click', () => {
    // Reset delle variabili e della mappa
    dronePath = [];
    waypointMarkers.forEach(marker => map.removeLayer(marker));
    waypointMarkers = [];
    if (droneMarker) map.removeLayer(droneMarker);
});

// Inizializza mappa quando la modalità drone è selezionata
document.getElementById('droneMode').addEventListener('click', () => {
    initializeMap();
    document.getElementById('map').style.display = 'block';
    document.getElementById('controlPanel').style.display = 'block';
    document.getElementById('droneControls').style.display = 'block';
});

// Modalità fotoni (placeholder)
document.getElementById('photonMode').addEventListener('click', () => {
    document.getElementById('map').style.display = 'none';
    document.getElementById('controlPanel').style.display = 'none';
    alert("Simulazione dei fotoni in arrivo!");
});
