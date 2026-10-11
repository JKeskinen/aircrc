# React + Vite + BOOTSTRAP-selainohjelmointityö

Päätin tehdä Airbnb-tyylisen autonvuokraus-sivuston

# AirCrc – Autonvuokrauspalvelu

## 1. Projektin kuvaus

AirCrc (Air CustomerRentCar) on verkkopohjainen autonvuokrauspalvelu, jossa käyttäjät voivat selata vuokra-autoja ja tutustua niiden tietoihin. Palvelu on yhden autovuokraamon ylläpitämä, ja käyttöliittymään on haettu vaikutteita muilta varaussivustoilta.

Projektin tavoitteena on toteuttaa helppokäyttöinen ja responsiivinen verkkosovellus, jota voidaan kehittää vaiheittain.

## 2. Teknologiat

- **Frontend:** React, JSX ja Vite
- **Tyylit:** Bootstrap 5 ja CSS
- **Reititys:** React Router
- **Backend:** Node.js ja Express
- **Rajapinta:** REST API
- **Kehitystyökalut:** Nodemon ja Prettier
- **Datan lähde:** Backendin JavaScript-tiedostossa määritelty autojen data

## 3. Projektin rakenne

```text
aircrc/
├── backend/
│   ├── data/
│   │   └── cars.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Cars.jsx
│   │   │   └── CarDetails.jsx
│   │   ├── services/
│   │   │   └── cars.js
|   |   ├──styles/
|   |   |   └─ App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
└── README.md
```

Rakenne kuvaa projektin tämänhetkistä toteutusta. Uusia komponentteja ja sivuja lisätään tarpeen mukaan.

## 4. Toteutetut ominaisuudet

- Etusivu ja navigointi
- Vuokra-autojen listaus
- Autokohtainen tietosivu
- Autojen esittely etusivun karusellissa
- React Router -reititys
- Express-backend
- Autojen hakeminen backendin REST-rajapinnasta
- Virheenkäsittely autojen latauksessa
- Responsiivinen käyttöliittymä Bootstrapilla

## 5. Backendin rajapinta

Backend toimii oletuksena portissa `3001`.

| HTTP-pyyntö | Osoite          | Kuvaus                                                |
| ----------- | --------------- | ----------------------------------------------------- |
| GET         | `/`             | Backendin testireitti                                 |
| GET         | `/api/cars`     | Palauttaa kaikki autot                                |
| GET         | `/api/cars/:id` | Palauttaa yksittäisen auton, jos reitti on toteutettu |

Autojen tiedot määritellään tiedostossa `backend/data/cars.js`. Frontend hakee tiedot palvelutiedoston `frontend/src/services/cars.js` kautta.

## 6. Käynnistäminen

### Backend

Avaa terminaali `backend`-kansiossa ja suorita:

```bash
npm install
npm run dev
```

Backend käynnistyy osoitteeseen `http://localhost:3001`.

### Frontend

Avaa toinen terminaali frontendin `package.json`-tiedoston sisältävään kansioon ja suorita:

```bash
npm install
npm run dev
```

Avaa terminaalin ilmoittama paikallinen osoite selaimessa.

### Rajapinnan testaaminen

Autojen tiedot voi tarkistaa selaimessa osoitteesta:

`http://localhost:3001/api/cars`

REST-pyyntöjä voidaan testata myös VS Coden REST Client -laajennuksella ja `.rest`-tiedostoilla.

## 7. Kehitysvaihe

Projektissa on siirrytty pelkästä käyttöliittymärakenteesta frontendin ja backendin yhdistämiseen. Autojen listaus, yksittäisen auton tietosivu ja etusivun karuselli hyödyntävät backendistä haettavia autojen tietoja.

Tiedot ovat tällä hetkellä JavaScript-tiedostossa. Erillistä tietokantaa, pysyvää tallennusta ja varsinaista varauslogiikkaa ei ole vielä toteutettu.

## 8. Suunnitellut ominaisuudet

- Auton varaaminen ja varaustietojen tallentaminen
- Omien varausten tarkastelu
- Ylläpitäjän hallintanäkymä
- Asiakkaiden ja ylläpitäjän kirjautuminen
- Autojen ja varausten hallinta
- Tietojen tallentaminen tietokantaan

## 9. Dokumentointi

Päivitellään README.md tiedostoa
