# React + Vite + BOOTSTRAP-selainohjelmointityö

Päätin tehdä Airbnb-tyylisen autonvuokraus-sivuston

# AirCrc – Autonvuokrauspalvelu

## 1. Projektin kuvaus

AirCrc (Air CustomerRentCar) on verkkopohjainen autonvuokrauspalvelu, jossa käyttäjät voivat selata vuokra-autoja ja tehdä varauksia. Palvelu on yhden autovuokraamon ylläpitämä, ja käyttöliittymän suunnittelussa hyödynnetään Airbnb-tyylistä selkeää rakennetta.

Projektin tavoitteena on toteuttaa helppokäyttöinen ja responsiivinen verkkosovellus.

## 2. Teknologiat

- **Frontend:** React, JSX ja Vite
- **Tyylit:** Bootstrap 5 ja CSS
- **Reititys:** React Router
- **Backend:** Node.js ja Express (myöhempi vaihe)
- **Tiedon tallennus:** JSON-tiedostot (myöhempi vaihe)

## 3. Projektin rakenne

```text
AirCrc/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Cars.jsx
│   │   ├── CarDetails.jsx
│   │   ├── Booking.jsx
│   │   ├── MyBookings.jsx
│   │   └── Admin.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
```

Rakenne kuvaa tavoiteltua kokonaisuutta. Kaikkia tiedostoja ja toiminnallisuuksia ei ole vielä toteutettu.

## 4. Suunnitellut ominaisuudet

- Vuokra-autojen selaaminen
- Autokohtaiset tiedot
- Auton varaaminen
- Omien varausten tarkastelu
- Ylläpitäjän hallintanäkymä
- Asiakkaiden ja ylläpitäjän kirjautuminen
- Autojen ja varausten hallinta

## 5. Käynnistäminen

Asenna riippuvuudet projektin juuressa:

```bash
npm install
```

Käynnistä kehityspalvelin:

```bash
npm run dev
```

Avaa terminaalissa ilmoitettu paikallinen osoite selaimessa.

## 6. Kehitysvaihe

Projekti on alkuvaiheessa. Tällä hetkellä keskitytään React-käyttöliittymän rakentamiseen, reitityksen määrittelyyn ja sivurakenteeseen. Backend, tietojen tallennus ja varsinainen varauslogiikka toteutetaan myöhemmissä vaiheissa.

## 7. Dokumentointi

Projektin kehitystä ja teknisiä ratkaisuja dokumentoidaan jatkuvasti `docs/`-kansioon. Dokumentaatiota päivitetään sitä mukaa, kun uusia ominaisuuksia ja rakenteita toteutetaan.
