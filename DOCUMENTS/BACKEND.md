# Backend-dokumentaatio – AirCrc

> Dokumentti kuvaa Express-palvelimen rakenteen, REST API -reitit, apufunktiot ja tiedonkäsittelyn.  
> Päivitetty: 2026-10-16

---

## Sisällysluettelo

1. [Yleiskatsaus](#yleiskatsaus)
2. [Käynnistys ja keskeiset muuttujat](#käynnistys-ja-keskeiset-muuttujat)
3. [Apufunktiot](#apufunktiot)
4. [REST API -reitit](#rest-api-reitit)
   - [Autovalmistajat ja mallit](#autovalmistajat-ja-mallit)
   - [Käyttäjät](#käyttäjät)
   - [Varaukset](#varaukset)
   - [Autot](#autot)
5. [Virhekäsittely ja muut](#virhekäsittely-ja-muut)

---

## Yleiskatsaus

Backend on Express-palvelin, joka tarjoaa frontendille REST API -rajapinnan. Se lataa lähtötiedot JSON-tiedostoista käynnistyessään ja tallentaa autojen sekä varausten muutokset takaisin tiedostoihin. Palvelin kuuntelee porttia **3001**.

**Keskeiset ominaisuudet:**
- CORS sallii rajat ylittävät selainpyynnöt
- `express.json()` käsittelee JSON-pyynnöt
- Tiedot säilyvät JSON-tiedostoissa palvelimen uudelleenkäynnistysten yli (ei tietokantaa)
- Tuntemattomat endpointit palauttavat 404-virheen

[↑ Palaa ylös](#sisällysluettelo)

---

## Käynnistys ja keskeiset muuttujat

| Muuttuja / tiedosto | Tarkoitus |
|---------------------|-----------|
| `app` | Express-sovelluksen instanssi |
| `PORT` | Palvelimen portti (3001) |
| `cars` | Muistissa käsiteltävä autolista |
| `bookings` | Muistissa käsiteltävä varauslista |
| `users` | Muistissa käsiteltävä käyttäjälista |
| `makes` | `all.json`-tiedostosta muodostettu valmistajalista |
| `carsFile` | Autojen tallennustiedoston polku (`./data/cars.json`) |
| `bookingsFile` | Varausten tallennustiedoston polku (`./data/bookings.json`) |
| `all.json` | Autonvalmistajien, mallien, sukupolvien ja moottorien lähdetiedot |
| `users.json` | Käyttäjien lähtötiedot |

`cars`, `bookings` ja `users` ovat palvelimen muistissa olevia taulukoita. Autojen ja varausten muutokset kirjoitetaan JSON-tiedostoihin. Käyttäjätiedosto ladataan käynnistyessä, mutta palvelimessa ei ole käyttäjätietojen muokkaus- tai tallennusreittejä.

[↑ Palaa ylös](#sisällysluettelo)

---

## Apufunktiot

| Funktio | Toiminta |
|---------|----------|
| `writeJson(filePath, data)` | Tallentaa annetun datan JSON-muodossa tiedostoon |
| `generateId()` | Luo tunnisteen käyttämällä `Date.now()`-arvoa |
| `getMake(name)` | Hakee valmistajan nimen perusteella (kirjainkoosta riippumatta) |
| `getModel(makeName, modelName)` | Hakee automallin valmistajan ja mallin nimen perusteella |
| `getDaysBetween(startDate, endDate)` | Laskee vuokra-ajan päivinä |
| `hasOverlappingBooking(carId, startDate, endDate)` | Tarkistaa, onko samalla autolla päällekkäinen varaus |
| `translateFuel(fuel)` | Muuntaa lähdedatan käyttövoimat suomenkielisiksi nimityksiksi |
| `translateTransmission(transmission)` | Muodostaa vaihteistosta käyttöliittymässä näytettävän tekstin |

**Päällekkäisyyden tarkistus** (`hasOverlappingBooking`):
```js
const hasOverlappingBooking = (carId, startDate, endDate) =>
  bookings.some(
    (booking) =>
      Number(booking.carId) === Number(carId) &&
      startDate < booking.endDate &&
      endDate > booking.startDate,
  );
```
Päällekkäisyys tarkistetaan ennen uuden varauksen tallentamista. Jos auto on jo varattu kyseiselle ajanjaksolle, API palauttaa HTTP **409 Conflict**.

[↑ Palaa ylös](#sisällysluettelo)

---

## REST API -reitit

### Autovalmistajat ja mallit

| HTTP-metodi ja reitti | Toiminta |
|-----------------------|----------|
| `GET /api/vehicle-makes` | Palauttaa kaikki valmistajat |
| `GET /api/vehicle-makes/:make/models` | Palauttaa valitun valmistajan mallit |
| `GET /api/vehicle-makes/:make/models/:model` | Palauttaa mallin vuosirajat, sukupolvet ja moottorit |

Jos valmistajaa tai mallia ei löydy, palautetaan **404 Not Found**.

[↑ Palaa ylös](#sisällysluettelo)

### Käyttäjät

| HTTP-metodi ja reitti | Toiminta |
|-----------------------|----------|
| `GET /api/users` | Palauttaa kaikki käyttäjät |
| `GET /api/users/:id` | Palauttaa yksittäisen käyttäjän tunnisteen perusteella |

Jos käyttäjää ei löydy, palautetaan **404 Not Found**.

[↑ Palaa ylös](#sisällysluettelo)

### Varaukset

| HTTP-metodi ja reitti | Toiminta |
|-----------------------|----------|
| `GET /api/bookings` | Palauttaa kaikki varaukset (tai suodatettuna `?carId=` / `?userId=`) |
| `POST /api/bookings` | Tarkistaa ja tallentaa uuden varauksen |
| `DELETE /api/bookings/:id` | Poistaa varauksen ja tallentaa päivitetyn listan |

**POST /api/bookings -käsittely:**
1. Validoi `carId`, `startDate`, `endDate` ja `userId`
2. Tarkistaa auton ja käyttäjän olemassaolon
3. Tarkistaa päällekkäiset varaukset (`hasOverlappingBooking`)
4. Laskee `totalDays` ja `totalPrice` auton päivähinnan perusteella
5. Tallentaa varauksen `bookings.json`-tiedostoon
6. Palauttaa tallennetun varauksen (status **201**) tai virheen (**400** / **404** / **409** / **500**)

[↑ Palaa ylös](#sisällysluettelo)

### Autot

| HTTP-metodi ja reitti | Toiminta |
|-----------------------|----------|
| `GET /api/cars` | Palauttaa kaikki autot |
| `GET /api/cars/:id` | Palauttaa yksittäisen auton |
| `POST /api/cars` | Tarkistaa ja tallentaa uuden auton |
| `DELETE /api/cars/:id` | Poistaa auton ja tallentaa päivitetyn listan |

**POST /api/cars -käsittely:**
1. Tarkistaa merkin ja mallin
2. Hakee tekniset tiedot `all.json`-tiedostosta (sukupolvi, vuosimalli, moottori)
3. Validoi vuosimallin, päivähinnan ja paikkamäärän
4. Muodostaa auton täyden tietueen (mukaan lukien käännetyt polttoaine- ja vaihteistotiedot)
5. Tallentaa auton `cars.json`-tiedostoon
6. Palauttaa tallennetun auton (status **201**) tai virheen (**400** / **500**)

Frontend lähettää vain valinnat ja vuokraustiedot; backend hakee ja täydentää tekniset tiedot lähdetiedostosta.

[↑ Palaa ylös](#sisällysluettelo)

---

## Virhekäsittely ja muut

| Tilanteet | HTTP-status | Kuvaus |
|-----------|-------------|--------|
| Tuntematon reitti | 404 | `{ error: "Tuntematon endpoint." }` |
| Validointivirhe | 400 | Tarkista tiedot |
| Resurssia ei löydy | 404 | Auto / käyttäjä / varaus puuttuu |
| Päällekkäinen varaus | 409 | Auto on jo varattu |
| Tallennusvirhe | 500 | JSON-tiedoston kirjoitus epäonnistui |

**Muuta:**
- Palvelin validoi varauspyynnön ja laskee lopullisen hinnan itse
- Tiedot säilyvät JSON-tiedostoissa palvelimen uudelleenkäynnistysten yli
- Ei käyttäjätietojen muokkaus- tai tallennusreittejä

[↑ Palaa ylös](#sisällysluettelo)

---

*Dokumentti perustuu `server.js`-tiedostoon.*
