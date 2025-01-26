# PhotonExplorer: Scopri l'Invisibile con la Luce

**PhotonExplorer** è una Progressive Web App (PWA) didattica progettata per spiegare in modo interattivo il funzionamento del rilevamento ambientale basato su fotoni e per simulare la pianificazione di traiettorie per droni. Questa applicazione unisce tecnologia, scienza e visualizzazioni intuitive per educare e ispirare.

---

## Funzionalità

### 1. **Simulazione dei Fotoni**
- Rappresentazione visiva del comportamento dei fotoni con effetti più realistici.
- Simulazione arricchita con onde luminose, rifrazioni e particelle per un'esperienza più immersiva.
- Calcolo e visualizzazione dei tempi di volo (ToF) per ogni fotone.
- Rappresentazione visiva del comportamento dei fotoni.
- Simulazione del movimento e del rimbalzo dei fotoni su superfici.
- Calcolo e visualizzazione dei tempi di volo (ToF) per ogni fotone.

### 2. **Pianificazione della Traiettoria dei Droni**
- Aggiunta la possibilità di inserire coordinate personalizzabili per creare rotte specifiche.
- Simulazione visiva del viaggio del drone lungo il percorso impostato.
- Opzioni per configurare la velocità del drone e la velocità del vento, con influenze dinamiche sulla traiettoria.
- Introduzione di ostacoli dinamici che il drone deve evitare durante la simulazione.
- Animazione fluida del drone che segue la rotta impostata, con aggiornamenti in tempo reale.
- Simulazione della traiettoria ottimale per un drone in un ambiente virtuale.
- Generazione di percorsi rettilinei e animazione del volo.
- Utilizzo di modelli 2D per rappresentare il movimento del drone.

### 3. **Animazione Ottica**
- Effetti visivi per simulare il movimento dei fotoni attorno a un drone.
- Animazione CSS per un'illusione ottica dinamica e accattivante.

---

## Struttura del Progetto

La PWA è organizzata in:

```
PhotonExplorer/
|-- index.html         # Interfaccia principale
|-- style.css          # Stile e layout
|-- app.js             # Logica e simulazioni
|-- manifest.json      # Manifest PWA
|-- service-worker.js  # Caching e offline support
|-- /icons             # Icone per la PWA
    |-- icon-192x192.png
    |-- icon-512x512.png
```

---

## Installazione

1. **Clona il repository:**
   ```bash
   git clone https://github.com/username/PhotonExplorer.git
   cd PhotonExplorer
   ```

2. **Avvia un server locale:**
   Puoi utilizzare un server HTTP semplice per testare la PWA localmente.
   ```bash
   npx serve .
   ```

3. **Accedi all'app:**
   Apri il browser e naviga su `http://localhost:5000`.

4. **Installa la PWA:**
   - Su desktop o mobile, clicca sull'icona di installazione nel browser per aggiungere PhotonExplorer al tuo dispositivo.

---

## Come Usare

1. **Seleziona una modalità:**
   - **Simulazione Fotoni:** Visualizza il comportamento dei fotoni e calcola i tempi di volo.
   - **Pianificazione Drone:** Simula il movimento del drone e pianifica percorsi.

2. **Avvia la simulazione:**
   Premi il pulsante "Avvia Simulazione" per vedere i fotoni o il drone in azione. Puoi configurare variabili come la velocità del drone, la velocità del vento e aggiungere ostacoli per arricchire l'esperienza simulativa.

3. **Resetta:**
   Utilizza il pulsante "Reset" per ripristinare lo stato iniziale.

---

## Tecnologie Utilizzate

- **HTML5**: Struttura e interfaccia dell'applicazione.
- **CSS3**: Stile e animazioni ottiche.
- **JavaScript**: Logica delle simulazioni e interazioni.
- **Service Worker**: Supporto offline per la PWA.
- **Manifest PWA**: Per rendere l'app installabile.

---

## Contributi

Contributi e miglioramenti sono sempre benvenuti! Per contribuire:

1. Fai un fork del repository.
2. Crea un branch per le tue modifiche.
3. Invia una pull request con una descrizione chiara delle modifiche apportate.

---

## Licenza

PhotonExplorer è distribuito sotto la licenza MIT. Consulta il file `LICENSE` per ulteriori dettagli.

---

## Contatti

Per domande o suggerimenti, contattaci:
- **Email:** pezzalialessandro@gmail.com
- **Sito Web:** [www.pezzaliapp.com](http://www.pezzaliapp.com)

