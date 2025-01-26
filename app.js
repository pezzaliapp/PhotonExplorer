let map;
let droneMarker;
let waypointMarkers = [];
let dronePath = [];
let speed = 10;
let windSpeed = 2;
let photons = [];
let isPhotonSimulating = false;

// Inizializza la mappa
function initializeMap() {
    map = L.map('map').setView([45.4642, 9.1900], 13); // Milano come posizione predefinita
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
}

// Simulazione dei Fotoni
function initializePhotonSimulation() {
    const canvas = document.createElement('canvas');
    canvas.id = 'photonCanvas';
    canvas.width = 800;
    canvas.height = 500;
    document.getElementById('simulationArea').appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Genera fotoni casuali
    for (let i = 0; i < 100; i++) {
        photons.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            angle: Math.random() * 2 * Math.PI,
            speed: 2 + Math.random() * 2,
            color: `rgba(${Math.floor(200 + Math.random() * 55)}, 0, ${Math.floor(200 + Math.random() * 55)}, 0.7)`
        });
    }

    function drawPhotons() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        photons.forEach(photon => {
            // Aggiorna posizione
            photon.x += photon.speed * Math.cos(photon.angle);
            photon.y += photon.speed * Math.sin(photon.angle);

            // Rimbalzo sui bordi
            if (photon.x <= 0 || photon.x >= canvas.width) photon.angle = Math.PI - photon.angle;
            if (photon.y <= 0 || photon.y >= canvas.height) photon.angle = -photon.angle;

            // Disegna fotone
            ctx.beginPath();
            ctx.arc(photon.x, photon.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = photon.color;
            ctx.fill();
        });

        if (isPhotonSimulating) {
            requestAnimationFrame(drawPhotons);
        }
    }

    isPhotonSimulating = true;
    drawPhotons();
}

// Arresta la simulazione dei fotoni
function stopPhotonSimulation() {
    const canvas = document.getElementById('photonCanvas');
    if (canvas) {
        canvas.remove();
    }
    photons = [];
    isPhotonSimulating = false;
}

// Simula il volo del drone (come prima)
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
        const step = speed / 1000;
        const stepLat = step * dx / distance;
        const stepLng = step * dy / distance;

        const windEffectLat = windSpeed / 10000 * (Math.random() - 0.5);
        const windEffectLng = windSpeed / 10000 * (Math.random() - 0.5);

        current.lat += stepLat + windEffectLat;
        current.lng += stepLng + windEffectLng;

        droneMarker.setLatLng([current.lat, current.lng]);

        if (Math.abs(current.lat - next.lat) < stepLat && Math.abs(current.lng - next.lng) < stepLng) {
            index++;
        }
    }, 100);
}

// Eventi per i pulsanti
document.getElementById('startButton').addEventListener('click', () => {
    if (currentMode === 'photon') {
        stopPhotonSimulation();
        initializePhotonSimulation();
    } else if (currentMode === 'drone') {
        const waypoints = document.getElementById('waypoints').value.trim();
        if (!waypoints) {
            alert("Errore: Inserisci almeno due waypoint nel formato 'latitudine,longitudine,altitudine'.");
            return;
        }
        speed = parseInt(document.getElementById('speed').value);
        windSpeed = parseInt(document.getElementById('windSpeed').value);
        addWaypoints(waypoints);
        simulateDroneFlight();
    }
});

document.getElementById('resetButton').addEventListener('click', () => {
    if (currentMode === 'photon') {
        stopPhotonSimulation();
    } else if (currentMode === 'drone') {
        dronePath = [];
        waypointMarkers.forEach(marker => map.removeLayer(marker));
        waypointMarkers = [];
        if (droneMarker) map.removeLayer(droneMarker);
    }
});

document.getElementById('photonMode').addEventListener('click', () => {
    currentMode = 'photon';
    document.getElementById('map').style.display = 'none';
    document.getElementById('controlPanel').style.display = 'block';
    stopPhotonSimulation();
    initializePhotonSimulation();
});

document.getElementById('droneMode').addEventListener('click', () => {
    currentMode = 'drone';
    initializeMap();
    document.getElementById('map').style.display = 'block';
    document.getElementById('controlPanel').style.display = 'block';
});
