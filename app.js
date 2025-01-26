let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let simulationInterval = null;

let windSpeed = 0;      // in nodi, inserito dall'utente
let windDirection = 0;  // in gradi, inserito dall'utente

// Inizializza la mappa
function initializeMap() {
    map = L.map('map').setView([45.4642, 9.1900], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Clic sulla mappa -> aggiunta di un waypoint
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        const marker = L.marker([lat, lng]).addTo(map);

        waypointMarkers.push(marker);
        dronePath.push({ lat, lng });

        // Popup sul marker
        marker.bindPopup(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`).openPopup();
    });
}

// Calcola la distanza in metri tra due punti (lat/lng) usando la formula di Haversine
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // raggio medio Terra in metri
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

// Simula il volo del drone: sposta il drone step by step
function simulateDroneFlight() {
    if (dronePath.length < 2) {
        alert("Errore: seleziona almeno due punti per iniziare la simulazione.");
        return;
    }

    // Se c'è già una simulazione attiva, la fermiamo prima di iniziarne una nuova
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }

    // Icona del drone
    const droneIcon = L.icon({
        iconUrl: 'icons/icon-drone.png',
        iconSize: [30, 30]
    });

    // Posizioniamo il drone sul primo waypoint
    const startPoint = dronePath[0];
    droneMarker = L.marker([startPoint.lat, startPoint.lng], { icon: droneIcon }).addTo(map);

    // Pulizia tabella e ricostruzione dati previsionali
    buildDataTable();

    // Variabili di stato per la simulazione
    let currentIndex = 0;              // waypoint corrente
    let currentLat = startPoint.lat;   // lat attuale del drone
    let currentLng = startPoint.lng;   // lng attuale del drone

    // Tempo di “refresh” in millisecondi (0.1s)
    const REFRESH_RATE = 100;
    // Converto nodi in m/s (1 nodo = 0.51444 m/s) e sommo la velocità base di 10 m/s
    const baseSpeed = 10; 
    const windSpeedMs = windSpeed * 0.51444; 
    const droneSpeed = baseSpeed + windSpeedMs; // velocità effettiva (m/s)

    // Funzione di aggiornamento periodico
    simulationInterval = setInterval(() => {
        if (currentIndex >= dronePath.length - 1) {
            // Se abbiamo raggiunto o superato l’ultimo waypoint, la simulazione termina
            clearInterval(simulationInterval);
            simulationInterval = null;
            alert("Simulazione completata!");
            return;
        }

        const nextPoint = dronePath[currentIndex + 1];
        // Distanza attuale dal prossimo waypoint
        const distToNext = calculateDistance(currentLat, currentLng, nextPoint.lat, nextPoint.lng);

        // Se siamo molto vicini (ad es. < 1 m), passiamo al prossimo waypoint
        if (distToNext < 1) {
            currentIndex++;
            return;
        }

        // Calcolo della distanza percorsa in questo intervallo (droneSpeed m/s * 0.1 s)
        const distanceThisStep = droneSpeed * (REFRESH_RATE / 1000); // in metri

        // Se la distanza al prossimo waypoint è inferiore allo step, andiamo direttamente sul waypoint
        let fraction = distanceThisStep / distToNext;
        if (fraction > 1) {
            fraction = 1;
        }

        // Calcoliamo la nuova posizione come interpolazione lineare
        currentLat = currentLat + (nextPoint.lat - currentLat) * fraction;
        currentLng = currentLng + (nextPoint.lng - currentLng) * fraction;

        // Aggiorniamo la posizione del drone
        droneMarker.setLatLng([currentLat, currentLng]);

        // Aggiorniamo i dati in tempo reale nel footer
        const realTimeData = document.getElementById('realTimeData');
        realTimeData.textContent = `Velocità Attuale: ${droneSpeed.toFixed(2)} m/s | Distanza dal Prossimo Punto: ${distToNext.toFixed(2)} m`;
    }, REFRESH_RATE);
}

// Costruisce la tabella dei dati previsti (prima della partenza)
function buildDataTable() {
    const dataRows = document.getElementById('dataRows');
    dataRows.innerHTML = '';

    // Converto la velocità del vento in m/s e la sommo alla base speed (10 m/s)
    const baseSpeed = 10;
    const windSpeedMs = windSpeed * 0.51444;
    const droneSpeed = baseSpeed + windSpeedMs; // m/s

    // Popoliamo riga per riga (fino al penultimo punto)
    for (let i = 0; i < dronePath.length - 1; i++) {
        const current = dronePath[i];
        const next = dronePath[i + 1];
        const distance = calculateDistance(current.lat, current.lng, next.lat, next.lng);
        
        // Tempo previsto (s = spazio/velocità)
        const time = distance / droneSpeed;

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

    // Aggiungiamo il waypoint finale solo come riferimento (nessun tempo perché non c'è un "next")
    const last = dronePath[dronePath.length - 1];
    const lastRow = `
        <tr>
            <td>${dronePath.length}</td>
            <td>${last.lat.toFixed(5)}</td>
            <td>${last.lng.toFixed(5)}</td>
            <td>--</td>
            <td>--</td>
        </tr>
    `;
    dataRows.insertAdjacentHTML('beforeend', lastRow);
}

// Reset della simulazione
function resetSimulation() {
    // Svuotiamo l'array dei waypoint e rimuoviamo i marker
    dronePath = [];
    waypointMarkers.forEach(marker => map.removeLayer(marker));
    waypointMarkers = [];

    // Rimuoviamo l'eventuale drone marker
    if (droneMarker) {
        map.removeLayer(droneMarker);
        droneMarker = null;
    }

    // Svuotiamo la tabella
    document.getElementById('dataRows').innerHTML = '';
    document.getElementById('realTimeData').textContent = '';

    // Fermiamo un’eventuale simulazione in corso
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

// Logica di esportazione (qui solo segnaposto)
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

// Logica di importazione (qui solo segnaposto)
function importRoute(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedPath = JSON.parse(e.target.result);
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

// Eventi al caricamento pagina
document.addEventListener('DOMContentLoaded', initializeMap);

// Eventi sui pulsanti
document.getElementById('startButton').addEventListener('click', () => {
    windSpeed = parseFloat(document.getElementById('windSpeed').value);
    windDirection = parseFloat(document.getElementById('windDirection').value);
    simulateDroneFlight();
});

document.getElementById('resetButton').addEventListener('click', resetSimulation);
document.getElementById('exportRoute').addEventListener('click', exportRoute);
document.getElementById('importFile').addEventListener('change', importRoute);
