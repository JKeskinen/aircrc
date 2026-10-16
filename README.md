# Autojen varausohjelma

Päätin tehdä Airbnb-tyylisen autonvuokraus-sivuston.

Alunperin ajatuksena oli vain että teen yksinkertaisen varastohallinnan, jolla autoja lisätään/poistetaan, asetetaan huoltotilaus/annetaan aika. Mutta se muuttui sitten tässä useiden eri kokeiluerien jälkeen tähän muotoon.
Aircrc (aircustomer-rent-car). Näin youtubessa Bootstrap-kirjastolla tehtyä reactia, jolloin sain idean lähteä niiden perusteella tekemään jotain.
https://getbootstrap.com/docs/6.0/getting-started/install/
Lopputuloksena Web-pohjainen autojen varausjärjestelmä, jossa käyttäjät voivat tarkastella vuokrattavia autoja ja tehdä varauksia. Ylläpitäjä hallitsee autovalikoimaa ja varauksia hallintanäkymän kautta.

## Ominaisuudet

- **Autojen selaus:** Tarkastele vuokrattavia autoja ja niiden teknisiä tietoja.
- **Varausten tekeminen:** Valitse auto sekä vuokrauksen alkamis- ja päättymispäivä.
- **Varausten tarkistus:** Järjestelmä tarkistaa varausten päällekkäisyydet ja laskee vuokrauksen kokonaishinnan.
- **Hallintapaneeli:** Ylläpitäjä voi lisätä ja poistaa autoja sekä poistaa varauksia.
- **Ajoneuvotietokanta:** `all.json` sisältää automerkit, mallit, sukupolvet ja saatavilla olevat tekniset vaihtoehdot.
- **Tietojen tallennus:** Autojen ja varausten tiedot tallennetaan JSON-tiedostoihin.

## Teknologiat

| Teknologia | Käyttötarkoitus |
|---|---|
| React | Käyttöliittymä |
| Vite | Kehitysympäristö ja sovelluksen build |
| Axios | HTTP-pyynnöt frontendistä backendiin |
| Node.js | Backendin suoritusympäristö |
| Express | REST API |
| CORS | Frontendin ja backendin välisten pyyntöjen salliminen |
| JSON | Ajoneuvotiedot sekä autojen ja varausten tallennus |

## Toimintaperiaate

```mermaid

flowchart TD
    A[Asiakas avaa sovelluksen] --> B[Selaa autoja]
    B --> C[Valitsee auton ja vuokra-ajan]
    C --> D[Frontend: React ja Axios]
    D --> E[Backend: Express REST API]
    E --> F{Tietojen validointi}
    F -->|Virhe| G[Palautetaan virheilmoitus]
    F -->|Kelvollinen pyyntö| H[Lasketaan vuokrauspäivät ja hinta]
    H --> I[Tallennetaan varaus bookings.json-tiedostoon]
    I --> J[Palautetaan vastaus frontendille]
    J --> K[Näytetään varauksen tulos asiakkaalle]

    A --> L[Omat varaukset ja käyttäjätiedot]
    L --> D

    M[Ylläpitäjä] --> N[Hallintapaneeli]
    N --> O[Lisää tai poistaa autoja]
    N --> P[Poistaa varauksia]
    O --> E
    P --> E
    E --> Q[cars.json]
    E --> R[bookings.json]

    S[all.json] --> T[Automerkkien ja mallien tietolähde]
    T --> N

    E --> U[JSON-tiedostot backendissä]
    U --> Q
    U --> R

```

## Käynnistäminen paikallisesti

1. Kloonaa repositorio.
2. Asenna riippuvuudet.
3. Käynnistä backend ja frontend projektin määritetyillä npm-skripteillä.

```bash
git clone https://github.com/JKeskinen/aircrc/tree/main
```

## Tietojen tallennus

- `data/all.json` – ajoneuvojen valmistajat, mallit ja tekniset vaihtoehdot.
- `data/cars.json` – lisätyt vuokra-autot.
- `data/bookings.json` – tehdyt varaukset.
- `data/users.json` – käyttäjätiedot.

