# WatchTower

**WatchTower Server Room** è un sistema di monitoraggio fisico per la **sala server** situata al quarto piano della **CPT di Trevano**. Il sistema utilizza una serie di sensori per monitorare vari parametri ambientali, tra cui **umidità**, **temperatura**, **gas** e **accessi**, i cui dati vengono visualizzati in tempo reale su una **dashboard** dedicata per **sistemisti/docenti** e in modo limitato per **allievi**.

Il sistema è progettato per fornire un monitoraggio continuo e consentire l'impostazione di notifiche e allerte per eventi specifici, come valori anomali di temperatura, fumo o accessi non autorizzati.

## Funzionalità

- **Monitoraggio in tempo reale** dei parametri ambientali:
  - Temperatura
  - Umidità
  - Gas
  - Accessi
  
- **Dashboard interattiva** per la visualizzazione dei dati raccolti dai sensori.
- **Notifiche e allerte** via e-mail per eventi

## Architettura del Sistema

1. **M5Stack**: Piattaforma hardware principale, utilizzata per raccogliere i dati dai sensori e inviarli al server.
2. **Sensori**:
   - 
3. **Server Backend**:
   - Node JS
4. **Database**:
   - MySQL con integrazione Prisma con Node JS
5. **Frontend Dashboard**:
   - Vue.JS 3 con Tailwind CSS e Shadcn for Vue
   
## Setup del Progetto

### Requisiti

- **Hardware**:
  - M5Stack
  - Sensori di temperatura, umidità, gas e accesso
- **Software**:
  - 

### Installazione
