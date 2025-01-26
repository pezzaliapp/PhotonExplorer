// Aggiorna i dati della tabella e in tempo reale
function updateRealTimeData(index, distance) {
    const currentSpeed = (10 + windSpeed).toFixed(2); // Velocità base + effetto vento
    document.getElementById('realTimeData').textContent = `Velocità Attuale: ${currentSpeed} m/s | Distanza dal Prossimo Punto: ${distance.toFixed(2)} m`;

    // Aggiungi riga alla tabella se non presente
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
        alert("Errore: Devi selezionare almeno due punti sulla mappa.");
        return;
    }

    let index = 0;
    const droneIcon = L.icon({ iconUrl: 'icons/icon-drone.png', iconSize: [30, 30] });
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

        const stepLat = (dx / distance) * 0.0001; // Movimento incrementale
        const stepLng = (dy / distance) * 0.0001;

        current.lat += stepLat;
        current.lng += stepLng;

        droneMarker.setLatLng([current.lat, current.lng]);

        updateRealTimeData(index, distance);

        if (distance < 1) index++;
    }, 100);
}

// Funzione per calcolare la distanza tra due punti
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

// Inizializza la mappa quando la pagina è pronta
document.addEventListener('DOMContentLoaded', initializeMap);
