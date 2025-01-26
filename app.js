const photonCanvas = document.getElementById('photonCanvas');
const droneCanvas = document.getElementById('droneCanvas');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const ctxPhoton = photonCanvas.getContext('2d');
const ctxDrone = droneCanvas.getContext('2d');

// Modalità attuale
let currentMode = null;

// Pulsanti per cambiare modalità
document.getElementById('photonMode').addEventListener('click', () => {
    currentMode = 'photon';
    startButton.style.display = 'block';
    resetButton.style.display = 'block';
    photonCanvas.style.display = 'block';
    droneCanvas.style.display = 'none';
    resetSimulation();
});

document.getElementById('droneMode').addEventListener('click', () => {
    currentMode = 'drone';
    startButton.style.display = 'block';
    resetButton.style.display = 'block';
    photonCanvas.style.display = 'none';
    droneCanvas.style.display = 'block';
    resetSimulation();
});

// Gestione simulazioni
let photons = [];
let dronePath = [];
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
        ctxPhoton.fillStyle = 'red';
        ctxPhoton.fill();
    });

    if (isSimulating && currentMode === 'photon') {
        requestAnimationFrame(updatePhotons);
    }
}

// Funzioni per il drone
function drawDronePath() {
    ctxDrone.clearRect(0, 0, droneCanvas.width, droneCanvas.height);
    ctxDrone.beginPath();
    ctxDrone.moveTo(dronePath[0].x, dronePath[0].y);
    dronePath.forEach(point => ctxDrone.lineTo(point.x, point.y));
    ctxDrone.strokeStyle = 'blue';
    ctxDrone.lineWidth = 2;
    ctxDrone.stroke();
}

function generateDronePath() {
    dronePath = [];
    const startX = 50;
    const startY = 200;
    const endX = 550;
    const endY = 200;

    // Semplice percorso rettilineo
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        const x = startX + (endX - startX) * (i / steps);
        const y = startY + (endY - startY) * (i / steps);
        dronePath.push({ x, y });
    }

    drawDronePath();
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
            photons.push(createPhoton(300, 200, Math.random() * Math.PI * 2));
        }
        updatePhotons();
    } else if (currentMode === 'drone') {
        generateDronePath();
    }
});

// Reset
resetButton.addEventListener('click', resetSimulation);
