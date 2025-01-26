const photonCanvas = document.getElementById('photonCanvas');
const droneCanvas = document.getElementById('droneCanvas');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const controlPanel = document.getElementById('controlPanel');
const droneControls = document.getElementById('droneControls');
const ctxPhoton = photonCanvas.getContext('2d');
const ctxDrone = droneCanvas.getContext('2d');

// Modalità attuale
let currentMode = null;

// Pulsanti per cambiare modalità
document.getElementById('photonMode').addEventListener('click', () => {
    currentMode = 'photon';
    controlPanel.style.display = 'block';
    droneControls.style.display = 'none';
    photonCanvas.style.display = 'block';
    droneCanvas.style.display = 'none';
    resetSimulation();
});

document.getElementById('droneMode').addEventListener('click', () => {
    currentMode = 'drone';
    controlPanel.style.display = 'block';
    droneControls.style.display = 'block';
    photonCanvas.style.display = 'none';
    droneCanvas.style.display = 'block';
    resetSimulation();
});

// Gestione simulazioni
let photons = [];
let dronePath = [];
let droneSpeed = 10;
let windSpeed = 2;
let isSimulating = false;

// Funzioni per i fotoni
function createPhoton(x, y, angle) {
    return { x, y, angle, speed: 2, time: 0 };
}

function updatePhotons() {
    ctxPhoton.clearRect(0, 0, photonCanvas.width, photonCanvas.height);
    photons.forEach(photon => {
        photon.x += photon.speed * Math.cos(photon.angle);
        photon.y += photon.speed * Math.sin(photon.angle);

        if (photon.x <= 0 || photon.x >= photonCanvas.width) {
            photon.angle = Math.PI - photon.angle;
        }
        if (photon.y <= 0 || photon.y >= photonCanvas.height) {
            photon.angle = -photon.angle;
        }

        ctxPhoton.beginPath();
        ctxPhoton.arc(photon.x, photon.y, 2, 0, Math.PI * 2);
        ctxPhoton.fillStyle = `rgba(255, 0, 0, ${Math.random()})`;
        ctxPhoton.fill();
    });

    if (isSimulating && currentMode === 'photon') {
        requestAnimationFrame(updatePhotons);
    }
}

// Funzioni per il drone
function parseCoordinates(input) {
    return input.split(' ').map(coord => {
        const [x, y] = coord.split(',');
        return { x: parseInt(x), y: parseInt(y) };
    });
}

function drawDronePath(path) {
    ctxDrone.clearRect(0, 0, droneCanvas.width, droneCanvas.height);
    ctxDrone.beginPath();
    ctxDrone.moveTo(path[0].x, path[0].y);
    path.forEach(point => ctxDrone.lineTo(point.x, point.y));
    ctxDrone.strokeStyle = 'blue';
    ctxDrone.lineWidth = 2;
    ctxDrone.stroke();
}

function simulateDrone(path, speed, wind) {
    let index = 0;
    const interval = setInterval(() => {
        if (index >= path.length - 1) {
            clearInterval(interval);
            return;
        }
        const current = path[index];
        const next = path[index + 1];
        const dx = next.x - current.x + wind;
        const dy = next.y - current.y;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const step = Math.min(speed, distance);

        current.x += step * Math.cos(angle);
        current.y += step * Math.sin(angle);

        drawDronePath(path);
        index += step >= distance ? 1 : 0;
    }, 100);
}

// Reset simulazione
function resetSimulation() {
    isSimulating = false;
    photons = [];
    dronePath = [];
    ctxPhoton.clearRect(0, 0, photonCanvas.width, photonCanvas.height);
    ctxDrone.clearRect(0, 0, droneCanvas.width, droneCanvas.height);
}

// Avvio simulazione
startButton.addEventListener('click', () => {
    if (currentMode === 'photon') {
        isSimulating = true;
        for (let i = 0; i < 50; i++) {
            photons.push(createPhoton(400, 250, Math.random() * Math.PI * 2));
        }
        updatePhotons();
    } else if (currentMode === 'drone') {
        const coordinatesInput = document.getElementById('coordinates').value;
        droneSpeed = parseInt(document.getElementById('speed').value);
        windSpeed = parseInt(document.getElementById('windSpeed').value);
        dronePath = parseCoordinates(coordinatesInput);
        simulateDrone(dronePath, droneSpeed, windSpeed);
    }
});

// Reset
resetButton.addEventListener('click', resetSimulation);
