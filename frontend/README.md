# Autojen varausohjelma

Päätin tehdä Airbnb-tyylisen autonvuokraussivuston.

Alun perin ajatuksena oli vain tehdä yksinkertainen varastohallinta, jolla autoja lisätään ja poistetaan sekä asetetaan huoltotilauksia ja annetaan niille aikoja. Se muuttui kuitenkin useiden eri kokeiluerien jälkeen tähän muotoon.

AirCrc (_Air Customer Rent Car_). Näin YouTubessa Bootstrap-kirjastolla tehtyä React-sovellusta, jolloin sain idean lähteä tekemään jotain niiden perusteella.

[Bootstrap – Getting Started](https://getbootstrap.com/docs/6.0/getting-started/install/)

Lopputuloksena on web-pohjainen autojen varausjärjestelmä, jossa käyttäjät voivat tarkastella vuokrattavia autoja ja tehdä varauksia. Ylläpitäjä hallitsee autovalikoimaa ja varauksia hallintanäkymän kautta.

## Ominaisuudet

- **Autojen selaus:** Tarkastele vuokrattavia autoja ja niiden teknisiä tietoja.
- **Varausten tekeminen:** Valitse auto sekä vuokrauksen alkamis- ja päättymispäivä.
- **Varausten tarkistus:** Järjestelmä tarkistaa varausten päällekkäisyydet ja laskee vuokrauksen kokonaishinnan.
- **Hallintapaneeli:** Ylläpitäjä voi lisätä ja poistaa autoja sekä poistaa varauksia.
- **Ajoneuvotietokanta:** `all.json` sisältää automerkit, mallit, sukupolvet ja saatavilla olevat tekniset vaihtoehdot.
- **Tietojen tallennus:** Autojen ja varausten tiedot tallennetaan JSON-tiedostoihin.

## Mitä projekti sisältää?

```text
AirCrc/
├── backend/
│   ├── data/
│   │   ├── all.json           # Ajoneuvomerkkien ja -mallien lähdedatasetti
│   │   ├── cars.json          # Vuokrattavien autojen tiedot
│   │   ├── bookings.json      # Asiakkaiden tekemät varaukset
│   │   ├── users.json         # Käyttäjätiedot
│   │   └── rentedCars.js      # Vuokrattuihin autoihin liittyvä toiminnallisuus
│   ├── server.js              # Express-palvelin ja REST API
│   └── package.json           # Backendin riippuvuudet ja käynnistyskomennot
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx     # Sivuston alatunniste
│   │   │   └── Navbar.jsx     # Navigointipalkki ja sivujen välinen navigointi
│   │   │
│   │   ├── pages/
│   │   │   ├── Admin.jsx      # Autojen ja varausten ylläpito
│   │   │   ├── Booking.jsx    # Auton varaaminen ja vuokrahinnan laskenta
│   │   │   ├── CarDetails.jsx # Yksittäisen auton tiedot
│   │   │   ├── Cars.jsx       # Autojen listaus ja selaaminen
│   │   │   ├── Home.jsx       # Etusivu
│   │   │   ├── MyBookings.jsx # Asiakkaan omat varaukset
│   │   │   └── MyPage.jsx     # Asiakkaan oma sivu ja käyttäjätiedot
│   │   │
│   │   ├── services/
│   │   │   ├── booking.js     # Varausten API-pyynnöt
│   │   │   ├── cars.js        # Autojen API-pyynnöt
│   │   │   ├── getAll.rest    # REST API -pyyntöjen testaus
│   │   │   └── users.js       # Käyttäjien API-pyynnöt
│   │   │
│   │   ├── styles/
│   │   │   ├── Admin.css      # Ylläpitonäkymän tyylit
│   │   │   ├── App.css        # Sovelluksen yleiset tyylit
│   │   │   ├── Booking.css    # Varaussivun tyylit
│   │   │   ├── CarDetails.css # Auton tietosivun tyylit
│   │   │   └── MyBookings.css # Varausten listauksen tyylit
│   │   │
│   │   ├── assets/            # Käyttöliittymän staattiset resurssit
│   │   ├── images/            # Kuvamateriaalit, kuten auton oletuskuva
│   │   ├── App.jsx            # Sovelluksen pääkomponentti
│   │   └── main.jsx           # React-sovelluksen käynnistyspiste
│   │
│   └── package.json           # Frontendin riippuvuudet ja Vite-komennot
│
└── README.md                  # Projektin dokumentaatio
```

## Tietomalli ja skeema

### Autojen JSON-rakenne

Autojen tiedot tallennetaan `cars.json`-tiedostoon. Tiedot sisältävät auton perustiedot, vuokraushinnan, ominaisuudet ja kuvan. Ulkoisesta ajoneuvodatasetistä tuoduissa autoissa voi olla lisäksi tarkempia teknisiä tietoja, kuten moottorin teho, vääntömomentti, vetotapa ja mitat.

Esimerkki auton tietueesta:

```json
{
  "id": 1,
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "price": 45,
  "seats": 5,
  "transmission": "Automaatti",
  "fuel": "Hybridi",
  "availability": "Saatavilla",
  "engine": "1.8 l hybridi",
  "horsepower": 140,
  "displacement": "1798 cm³",
  "consumption": "4.5 l/100 km"
}
```

Datasetistä tuotujen autojen tekniset tiedot voivat sisältää myös seuraavia kenttiä:

```json
{
  "generation": "Huracan (2022)",
  "bodyType": null,
  "engineLabel": "5.2L V10 7AT RWD (610 HP)",
  "fuelType": "Gasoline",
  "powerHp": 610,
  "displacementCc": 5204,
  "cylinders": 10,
  "torqueNm": 565,
  "drivetrain": "Rear Wheel Drive",
  "zeroToHundredKmhS": 3.4,
  "topSpeedKmh": 261,
  "lengthMm": 4524,
  "widthMm": 1956,
  "heightMm": 1247,
  "wheelbaseMm": 2629,
  "curbWeightKg": 1470
}
```

Kaikki tekniset kentät eivät ole käytettävissä jokaiselle autolle. Puuttuva tieto esitetään tarvittaessa `null`-arvona.

### Varausten JSON-rakenne

Varaukset tallennetaan `bookings.json`-tiedostoon `bookings`-taulukon sisään. Varaus yhdistetään autoon `carId`-kentällä ja asiakkaaseen `userId`-kentällä.

```json
{
  "bookings": [
    {
      "id": "1792065904992",
      "carId": 5,
      "userId": 2,
      "userName": "Asiakas Pertti",
      "startDate": "2026-10-15",
      "endDate": "2026-10-31",
      "totalDays": 16,
      "totalPrice": 12000,
      "status": "confirmed"
    }
  ]
}
```

Varauksen kentät:

| Kenttä       | Kuvaus                                  |
| ------------ | --------------------------------------- |
| `id`         | Varauksen yksilöivä tunniste            |
| `carId`      | Varattavan auton tunniste               |
| `userId`     | Varaavan asiakkaan tunniste             |
| `userName`   | Asiakkaan nimi                          |
| `startDate`  | Vuokrauksen alkamispäivä                |
| `endDate`    | Vuokrauksen päättymispäivä              |
| `totalDays`  | Vuokrauksen kesto päivinä               |
| `totalPrice` | Varauksen kokonaishinta                 |
| `status`     | Varauksen tila, esimerkiksi `confirmed` |

### Tietojen käsittely

Frontend lähettää HTTP-pyynnöt Axiosilla Express-backendille. Backend käsittelee pyynnöt ja lukee tai päivittää JSON-tiedostoihin tallennettuja tietoja.

```text
React-frontend
      │
      │ Axios / HTTP
      ▼
Express REST API
      │
      ├── cars.json
      ├── bookings.json
      └── users.json

all.json
      │
      ▼
Automerkkien ja -mallien valinta
ylläpitonäkymässä
```

JSON-tiedostot toimivat projektin tietojen tallennusmuotona. Projekti ei käytä näiden tietojen perusteella erillistä relaatiotietokantaa.

## Teknologiat

| Teknologia | Käyttötarkoitus                                       |
| ---------- | ----------------------------------------------------- |
| React      | Käyttöliittymän toteutus                              |
| Vite       | Kehitysympäristö ja sovelluksen build                 |
| Bootstrap  | Käyttöliittymän tyylittely ja asettelu                |
| Axios      | HTTP-pyynnöt frontendistä backendiin                  |
| Node.js    | Backendin suoritusympäristö                           |
| Express    | REST API ja pyyntöjen käsittely                       |
| CORS       | Frontendin ja backendin välisten pyyntöjen salliminen |
| JSON       | Autojen, varausten ja käyttäjien tietojen tallennus   |

## Toimintaperiaate

```mermaid
flowchart TD
    A[Asiakas] --> B[React-käyttöliittymä]
    B --> C[Autojen selaus ja auton valinta]
    C --> D[Varaus ja vuokra-ajan valinta]
    D --> E[Axios / HTTP]
    E --> F[Express REST API]
    F --> G{Tietojen validointi}
    G -->|Virhe| H[Virheilmoitus]
    G -->|Kelvollinen pyyntö| I[Vuokra-ajan ja hinnan käsittely]
    I --> J[bookings.json]
    J --> K[Vastaus frontendille]
    K --> L[Varauksen tulos asiakkaalle]

    A --> M[Omat varaukset ja käyttäjätiedot]
    M --> E

    N[Ylläpitäjä] --> O[Hallintapaneeli]
    O --> P[Autojen hallinta]
    O --> Q[Varausten hallinta]
    P --> F
    Q --> F

    F --> R[cars.json]
    F --> S[bookings.json]
    F --> T[users.json]

    U[all.json] --> V[Automerkkien ja mallien tietolähde]
    V --> O
```

## Käynnistäminen paikallisesti

1. Kloonaa repositorio.
2. Asenna backendin ja frontendin riippuvuudet.
3. Käynnistä backend ja frontend projektin määritetyillä npm-skripteillä.

```bash
git clone https://github.com/JKeskinen/aircrc.git
```

Tarkista käynnistyskomennot kummankin hakemiston `package.json`-tiedostosta.

## Tietojen tallennus

- `data/all.json` – ajoneuvojen valmistajat, mallit ja tekniset vaihtoehdot.
- `data/cars.json` – lisätyt vuokra-autot.
- `data/bookings.json` – tehdyt varaukset.
- `data/users.json` – käyttäjätiedot.
