PhotonExplorer

PhotonExplorer è un semplice progetto web per pianificare e simulare il volo di un drone tra più waypoint, con la possibilità di tenere conto di una velocità e di una direzione del vento.

Funzionalità Principali

	•	Aggiunta dei waypoint: cliccando sulla mappa, viene posizionato un marker e salvata la latitudine/longitudine del punto.
	•	Calcolo delle distanze tra i waypoint e del tempo stimato di percorrenza (basato su una velocità di crociera di 10 m/s, a cui si somma la velocità del vento convertita in m/s).
	•	Simulazione di volo del drone: un marker dedicato si muove gradualmente (step-by-step) dal primo all’ultimo waypoint, visualizzando in tempo reale la velocità attuale e la distanza dal punto successivo.
	•	Tabella previsionale: elenca i waypoint e mostra, per ogni tratto, la distanza e il tempo di volo stimato.
	•	Esportazione/Importazione della rotta: si può salvare e caricare la lista dei waypoint in formato JSON.
	•	Reset: per cancellare i waypoint disegnati, svuotare la tabella e fermare la simulazione in corso.

Struttura del Progetto

	•	index.html
Contiene la struttura HTML principale, i riferimenti a Leaflet, ai fogli di stile e allo script JavaScript (app.js).
	•	style.css
Gestisce lo stile grafico di base per la pagina, i pulsanti, la tabella e la disposizione degli elementi.
	•	app.js
Contiene la logica di:
	•	Inizializzazione della mappa (Leaflet).
	•	Gestione degli eventi di click per aggiungere waypoint.
	•	Calcolo delle distanze e dei tempi fra i waypoint (formula di Haversine).
	•	Avvio, aggiornamento e reset della simulazione di volo.
	•	Gestione delle funzionalità di import/export della rotta in JSON.

Requisiti
	•	Nessun requisito specifico di back-end: è un’applicazione puramente client-side.
	•	Per la mappa utilizziamo Leaflet con le OpenStreetMap Tiles.

Come Usare PhotonExplorer

1.	Clona il repository o scaricalo come .zip ed estrailo.
2.	Apri index.html in un browser (ad esempio Chrome, Firefox o Edge).
3.	Interagisci con la mappa:
	•	Clicca sui punti d’interesse per aggiungere waypoint (almeno 2).
	•	Imposta la velocità del vento (in nodi) e la direzione (in gradi).
4.	Avvia la simulazione cliccando su Avvia Simulazione.
	•	Il drone comparirà sul primo waypoint e inizierà a muoversi verso i successivi.
	•	La tabella verrà popolata con i dati stimati (distanza e tempo) prima della partenza.
	•	Nella sezione “Dati della Simulazione” potrai vedere in tempo reale la velocità e la distanza rimanente.
5.	Reset: per interrompere e ripulire tutto, clicca su Reset.
6.	Esporta Rotta: salva la lista dei waypoint in un file .json.
7.	Importa Rotta: carica una rotta precedentemente salvata e riprendi la simulazione.

Personalizzazioni

	•	Icona drone: di default si utilizza l’icona di base di Leaflet. Per usare un’icona personalizzata (ad esempio icons/icon-drone.png), modifica app.js (opzione iconUrl) inserendo il path corretto.
	•	Effetto del vento: di default il vento aumenta solo la velocità lineare. Per farlo deviare la rotta, è necessario un calcolo vettoriale (bearing, lat/long, ecc.).

Licenza

Questo progetto è rilasciato sotto Licenza MIT da Alessandro Pezzali.
Consulta il file LICENSE per maggiori dettagli.

Speriamo che PhotonExplorer ti sia utile per simulare e pianificare i tuoi voli con drone! Se hai suggerimenti o segnalazioni, non esitare ad aprire una Issue o a contribuire con un Pull Request. Buon volo!
