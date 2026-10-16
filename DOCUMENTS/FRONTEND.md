# Frontend-dokumentaatio – AirCrc

> Dokumentti kuvaa React-frontendin rakenteen, reitityksen, sivukomponentit, palvelut ja Bootstrap-luokkien käytön.  
> Päivitetty: 2026-10-16

---

## Sisällysluettelo

1. [Yleiskatsaus](#yleiskatsaus)
2. [main.jsx – Sovelluksen käynnistys](#mainjsx--sovelluksen-käynnistys)
3. [App.jsx – Pääkomponentti ja reititys](#appjsx--pääkomponentti-ja-reititys)
4. [Sivukomponentit (pages/)](#sivukomponentit-pages)
   - [Home.jsx](#homejsx)
   - [Cars.jsx](#carsjsx)
   - [CarDetails.jsx](#cardetailsjsx)
   - [Booking.jsx](#bookingjsx)
   - [MyPage.jsx](#mypagejsx)
   - [MyBookings.jsx](#mybookingsjsx)
   - [Admin.jsx](#adminjsx)
5. [Komponentit (components/)](#komponentit-components)
   - [Navbar.jsx](#navbarjsx)
6. [Bootstrap-luokat ja niiden käyttö](#bootstrap-luokat-ja-niiden-käyttö)
7. [Palvelut (services/)](#palvelut-services)
   - [booking.js](#bookingjs)
   - [cars.js](#carsjs)
   - [users.js](#usersjs)
8. [Yhteenveto reiteistä](#yhteenveto-reiteistä)

---

## Yleiskatsaus

Frontend on rakennettu Reactilla (Vite) ja käyttää React Routeria sivujen välillä navigointiin. Bootstrap tarjoaa perustyylit.  

Käyttäjä valitaan aluksi listasta (ei erillistä kirjautumista tässä versiossa). Valittu käyttäjä (`currentUser`) välitetään niille sivuille, jotka tarvitsevat käyttäjätietoja. Ylläpitäjän oikeudet (`isAdmin`) määräytyvät `currentUser.auth === "admin"` -ehdon perusteella.

**Tiedonsiirto pääpiirteissään:**
- `App` hakee käyttäjät `userService.getAll()`-kutsulla.
- `Navbar` saa `isAdmin`-tiedon.
- Sivut saavat tarvittaessa `currentUser`- ja/tai `isAdmin`-propin.

[↑ Palaa ylös](#sisällysluettelo)

---

## main.jsx – Sovelluksen käynnistys

Tiedosto vastaa React-sovelluksen renderöinnistä DOM:iin ja reitittimen kytkemisestä.

### Keskeiset osat

| Osa                  | Tarkoitus                                      |
|----------------------|------------------------------------------------|
| `React.StrictMode`   | Kehitysympäristön tarkistukset                 |
| `BrowserRouter`      | Mahdollistaa URL-pohjaisen reitityksen         |
| Bootstrap CSS + JS   | Ulkoasu ja komponentit                         |
| `App`                | Sovelluksen pääkomponentti                     |

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

[↑ Palaa ylös](#sisällysluettelo)

---

## App.jsx – Pääkomponentti ja reititys

`App` hallitsee käyttäjän valinnan, lataustilan ja koko sovelluksen reitityksen.

### Keskeiset tilamuuttujat

| Muuttuja       | Tarkoitus                                      |
|----------------|------------------------------------------------|
| `users`        | Backendiltä haetut käyttäjät                   |
| `currentUser`  | Valittu käyttäjä (null = valintanäkymä)       |
| `usersLoading` | Käyttäjien latauksen tila                      |
| `usersError`   | Virheviesti latauksen epäonnistuessa           |
| `isAdmin`      | `currentUser?.auth === "admin"`                |

### Tärkeimmät toiminnot

| Toiminto                     | Kuvaus                                                                 |
|------------------------------|------------------------------------------------------------------------|
| `useEffect` (mount)          | Hakee käyttäjät `userService.getAll()`                                 |
| Käyttäjän valinta            | Asettaa `currentUser` valitun käyttäjän perusteella                    |
| "Vaihda käyttäjää" -painike  | Nollaa `currentUser` → palaa valintanäkymään                           |
| Reititys                     | Määrittää sivujen URL:t ja välittää propeja                            |

### Reitit

| Polku              | Komponentti     | Propit                          | Huomio                                      |
|--------------------|-----------------|---------------------------------|---------------------------------------------|
| `/`                | `Home`          | –                               | Etusivu                                     |
| `/cars`            | `Cars`          | –                               | Autolista                                   |
| `/cars/:id`        | `CarDetails`    | `currentUser`                   | Auton tiedot                                |
| `/mypage`          | `MyPage`        | `currentUser`                   | Omat tiedot                                 |
| `/booking/:id`     | `Booking`       | `currentUser`                   | Varauslomake                                |
| `/my-bookings`     | `MyBookings`    | `currentUser`, `isAdmin`        | Omat varaukset                              |
| `/admin`           | `Admin`         | –                               | Vain admin; muuten ohjaus etusivulle        |
| `*`                | `NotFound`      | –                               | Tuntematon reitti                           |

Jos käyttäjää ei ole valittu, näytetään käyttäjänvalintakortti. Valinnan jälkeen näytetään `Navbar` + reititetyt sivut.

[↑ Palaa ylös](#sisällysluettelo)

---

## Sivukomponentit (pages/)

Alla dokumentoidaan jokainen sivukomponentti.  
*(Sivujen yksityiskohtainen sisältö täydennetään, kun lähdekoodit on saatu.)*

### Home.jsx

**Tarkoitus:**  
Etusivu, joka näyttää vuokrauspalvelun esittelyn ja linkin kaikkien autojen listaukseen. Hakee autot ja esittää ne automaattisesti vaihtuvassa Bootstrap-karusellissa, josta voi siirtyä valitun auton tietoihin.

**Propit:** Ei vastaanota propeja.

**Reitti:** `/`

#### Keskeiset tilamuuttujat

| Muuttuja | Tarkoitus                          |
|----------|------------------------------------|
| `cars`   | Palvelimelta haettujen autojen lista |

#### Tiedonsiirto / API-kutsut

| Kutsu                     | Tarkoitus                                      |
|---------------------------|------------------------------------------------|
| `carService.getAll()`     | Hakee autot karusellia varten                  |
| `Link` → `/cars`          | Siirtyy kaikkien autojen listaukseen           |
| `Link` → `/cars/:id`      | Siirtyy valitun auton tietosivulle             |

Virhetilanteessa virhe kirjataan konsoliin. Karuselli näytetään vain, jos autoja löytyy. Käyttää `carPlaceholder`-kuvaa, jos auton kuva puuttuu.

[↑ Palaa ylös](#sisällysluettelo)

### Cars.jsx

**Tarkoitus:**  
Näyttää kaikki vuokrattavat autot korttinäkymässä. Korteissa esitetään auton kuva, merkki, malli, vuosimalli, henkilömäärä, vaihteisto, polttoaine ja päivähinta. Linkistä siirrytään auton tarkempiin tietoihin.

**Propit:** Ei vastaanota propeja.

**Reitti:** `/cars`

#### Keskeiset tilamuuttujat

| Muuttuja | Tarkoitus                          |
|----------|------------------------------------|
| `cars`   | Palvelimelta haettujen autojen lista |
| `error`  | Autojen lataamisen virheilmoitus   |

#### Tiedonsiirto / API-kutsut

| Kutsu                     | Tarkoitus                                      |
|---------------------------|------------------------------------------------|
| `carService.getAll()`     | Hakee kaikki autot                             |
| `Link` → `/cars/:id`      | Siirtyy valitun auton tietosivulle             |

Virhetilanteessa näytetään virheilmoitus. Muuten renderöidään Bootstrap-kortit autoista.

[↑ Palaa ylös](#sisällysluettelo)

### CarDetails.jsx

**Tarkoitus:**  
Näyttää valitun auton kuvan, tekniset tiedot, vuokraushinnan ja interaktiivisen varauskalenterin. Käyttäjä valitsee vapaan alkamis- ja palautuspäivän, näkee vuokra-ajan ja kokonaishinnan sekä tallentaa varauksen.

**Propit:** `currentUser`

**Reitti:** `/cars/:id`

#### Keskeiset tilamuuttujat

| Muuttuja          | Tarkoitus                                              |
|-------------------|--------------------------------------------------------|
| `cars`            | Kaikki autot                                           |
| `bookings`        | Valitun auton varaukset (kalenteria varten)            |
| `loading`         | Autojen lataustila                                     |
| `error`           | Autojen latausvirhe                                    |
| `calendarError`   | Varausten latausvirhe                                  |
| `startDate`       | Valittu alkamispäivä                                   |
| `endDate`         | Valittu palautuspäivä                                  |
| `bookingLoading`  | Varauksen tallennustila                                |
| `bookingMessage`  | Onnistumis- tai virheviesti                            |
| `calendarMonth`   | Kalenterissa näytettävä kuukausi                       |
| `car`             | Löydetty auto                                          |
| `totalDays`       | Laskettu vuokrauspäivien määrä                         |
| `totalPrice`      | Kokonaishinta (`car.price * totalDays`)                |

#### Apufunktiot

| Funktio              | Toiminta                                                                 |
|----------------------|--------------------------------------------------------------------------|
| `toDateString`       | Muuttaa Date-olion muotoon `YYYY-MM-DD`                                  |
| `formatDate`         | Muotoilee päivämäärän suomalaiseen muotoon (`DD.MM.YYYY`)                |
| `getDaysBetween`     | Laskee vuokrauspäivien määrän (palautuspäivää ei lasketa mukaan)         |
| `isBooked`           | Tarkistaa, onko päivä varattu                                            |
| `overlapsBooking`    | Tarkistaa päällekkäisyyden olemassa olevien varausten kanssa             |
| `isSelectedDate`     | Tarkistaa, onko päivä valittu alku- tai loppupäiväksi                    |
| `isInSelectedRange`  | Tarkistaa, onko päivä valitun jakson sisällä                             |
| `selectCalendarDate` | Käsittelee kalenteripäivän valinnan (estää menneet/varatut)              |
| `changeMonth`        | Siirtää kalenteria edelliseen/seuraavaan kuukauteen                      |
| `loadBookings`       | Hakee auton varaukset                                                    |
| `handleBooking`      | Validoi ja tallentaa varauksen (`bookingsService.create`)                |

#### Tiedonsiirto / API-kutsut

| Kutsu                               | Tarkoitus                                      |
|-------------------------------------|------------------------------------------------|
| `carService.getAll()`               | Hakee autot ja etsii valitun auton             |
| `bookingsService.getByCarId(id)`    | Hakee auton varaukset kalenteria varten        |
| `bookingsService.create({...})`     | Tallentaa varauksen (sisältää myös laskettuja arvoja) |

Kalenteri estää menneiden ja varattujen päivien valinnan sekä tarkistaa päällekkäisyydet. Frontend laskee `totalDays` ja `totalPrice`; backend vastaa lopullisesta tallennuksesta.

**Frontend lähettää (`bookingsService.create` → `POST /api/bookings`):**
```js
{
  carId: car.id,
  carBrand: car.brand,
  carModel: car.model,
  userId: currentUser.id,
  userName: currentUser.name,
  startDate,
  endDate,
  totalDays,
  totalPrice
}
```

**Backend tekee:**
- Validoi päivämäärät, auton ja käyttäjän
- Tarkistaa päällekkäisyydet
- Laskee itse `totalDays` ja `totalPrice` (ei luota frontendin arvoihin)
- Tallentaa varauksen ja palauttaa sen

[↑ Palaa ylös](#sisällysluettelo)

### Booking.jsx

**Tarkoitus:**  
Näyttää valitun auton tiedot ja mahdollistaa vuokra-ajan (alku- ja palautuspäivä) valinnan sekä varauksen tallentamisen.

**Propit:** `currentUser` (valittu käyttäjä, jonka `id` liitetään varaukseen)

**Reitti:** `/booking/:id` (`id` = auton tunniste URL-parametrista)

#### Keskeiset tilamuuttujat

| Muuttuja     | Tarkoitus                                      |
|--------------|------------------------------------------------|
| `cars`       | Kaikki autot (haetaan `carService.getAll()`)   |
| `error`      | Virheilmoitus                                  |
| `notice`     | Onnistumisilmoitus                             |
| `saving`     | Estää uuden tallennuspyynnön kesken tallennuksen |
| `startDate`  | Valittu alkamispäivä                           |
| `endDate`    | Valittu palautuspäivä                          |
| `car`        | Löydetty auto (`cars.find` id:n perusteella)   |
| `totalDays`  | Laskettu vuokrauspäivien määrä                 |

#### Apufunktiot

| Funktio               | Toiminta                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| `calculateTotalDays`  | Laskee päivien määrän (palautuspäivää ei lasketa mukaan)                 |
| `handleBooking`       | Validoi tiedot ja lähettää varauksen (`bookingService.create`)           |

#### Tiedonsiirto / API-kutsut

| Kutsu                          | Tarkoitus                                      |
|--------------------------------|------------------------------------------------|
| `carService.getAll()`          | Hakee autot ja etsii varattavan auton          |
| `bookingService.create({...})` | Lähettää varauspyynnön (carId, userId, startDate, endDate) |

Frontend laskee ja näyttää `totalDays` ja arvioidun hinnan (`car.price * totalDays`). Backend laskee ja tallentaa lopulliset arvot.

**Frontend lähettää (`bookingService.create` → `POST /api/bookings`):**
```js
{
  carId: 123,
  userId: 5,
  startDate: "2026-10-20",
  endDate: "2026-10-23"
}
```
(CarDetails lähettää lisäksi `carBrand`, `carModel`, `userName`, `totalDays` ja `totalPrice`, mutta backend ei luota niihin.)

**Backend tekee:**
- Validoi päivämäärät ja auton/käyttäjän olemassaolon
- Tarkistaa päällekkäiset varaukset (`hasOverlappingBooking`)
- Laskee `totalDays` ja `totalPrice` auton päivähinnan perusteella
- Tallentaa varauksen `bookings.json`-tiedostoon
- Palauttaa tallennetun varauksen (status 201) tai virheen (400/409/404)

[↑ Palaa ylös](#sisällysluettelo)

### MyPage.jsx

**Tarkoitus:**  
Näyttää valitun käyttäjän asiakastiedot (nimi, rooli, osoite) ja linkin omien varausten hallintaan. Sivulla ei haeta eikä tallenneta tietoja suoraan palvelimelle.

**Propit:** `currentUser`

**Reitti:** `/mypage`

#### Keskeiset tiedot (propista)

| Kenttä          | Tarkoitus                          |
|-----------------|------------------------------------|
| `name`          | Käyttäjän nimi                     |
| `auth`          | Rooli (`"admin"` tai muu)          |
| `address` / `streetAddress` | Osoite                    |
| `postalCode`    | Postinumero                        |
| `city`          | Paikkakunta                        |

#### Toiminta

- Jos `currentUser` puuttuu, näytetään ilmoitus ja linkki etusivulle.
- Näyttää kortissa asiakastiedot.
- Linkki `/my-bookings`-sivulle omien varausten tarkasteluun ja hallintaan.

Ei omia tilamuuttujia eikä API-kutsuja.

[↑ Palaa ylös](#sisällysluettelo)

### MyBookings.jsx

**Tarkoitus:**  
Näyttää käyttäjän omat varaukset tai ylläpitäjälle kaikki varaukset. Taulukossa esitetään auto, varaaja, vuokra-aika ja kokonaishinta. Käyttäjä voi poistaa yksittäisiä varauksia tai kaikki näkyvissä olevat varaukset.

**Propit:** `currentUser`, `isAdmin`

**Reitti:** `/my-bookings`

#### Keskeiset tilamuuttujat

| Muuttuja              | Tarkoitus                                              |
|-----------------------|--------------------------------------------------------|
| `cars`                | Autolista (auton nimen näyttöön)                       |
| `bookings`            | Varauslista (omat tai kaikki)                          |
| `error`               | Virheilmoitus                                          |
| `notice`              | Onnistumisilmoitus                                     |
| `bookingsLoading`     | Varausten lataustila                                   |
| `deletingBookingId`   | Yksittäisen poiston tila                               |
| `deletingAllBookings` | Kaikkien poistojen tila                                |

#### Apufunktiot

| Funktio              | Toiminta                                                                 |
|----------------------|--------------------------------------------------------------------------|
| `formatDate`         | Muotoilee päivämäärän suomalaiseen muotoon                               |
| `sortBookings`       | Järjestää varaukset uusimman alkamispäivän mukaan                        |
| `loadBookings`       | Hakee varaukset (admin: kaikki, muuten käyttäjän omat) + autot           |
| `getCarName`         | Muodostaa auton nimen varauksesta tai autolistasta                       |
| `handleDeleteBooking`| Poistaa yksittäisen varauksen (tarkistaa oikeuden)                       |
| `handleDeleteAllBookings` | Poistaa kaikki näkyvät varaukset                                    |

#### Tiedonsiirto / API-kutsut

| Kutsu                               | Tarkoitus                                      |
|-------------------------------------|------------------------------------------------|
| `bookingsService.getByUserId(id)`   | Hakee käyttäjän omat varaukset                 |
| `bookingsService.getAll()`          | Hakee kaikki varaukset (admin)                 |
| `carService.getAll()`               | Hakee autot nimen näyttöä varten               |
| `bookingsService.remove(id)`        | Poistaa varauksen                              |

Tavallinen käyttäjä voi poistaa vain omat varauksensa. Admin näkee ja voi poistaa kaikki.

[↑ Palaa ylös](#sisällysluettelo)

### Admin.jsx

**Tarkoitus:**  
Ylläpitäjän hallintapaneeli. Mahdollistaa uusien autojen lisäämisen (tekniset tiedot haetaan automaattisesti all.json-pohjaisesta API:sta), olemassa olevien autojen poistamisen sekä varausten tarkastelun ja poistamisen.

**Propit:** Ei vastaanota propeja (suojattu App-tasolla: vain `isAdmin` näkee reitin).

**Reitti:** `/admin`

#### Keskeiset tilamuuttujat

| Muuttuja              | Tarkoitus                                              |
|-----------------------|--------------------------------------------------------|
| `newCar`              | Lomakkeen tiedot uudelle autolle (`emptyCar`-oletus)   |
| `makes`               | Valmistajalista (API)                                  |
| `models`              | Valitun valmistajan mallit                             |
| `generations`         | Valitun mallin sukupolvet                              |
| `selectedGeneration`  | Valittu sukupolvi                                      |
| `selectedEngine`      | Valittu moottori                                       |
| `action`              | Näytettävä osio: `"add"` / `"delete"` / `"bookings"`   |
| `cars`                | Autolista (poistoa / varauksia varten)                 |
| `bookings`            | Varauslista                                            |
| `users`               | Käyttäjälista (varaajan nimen näyttöön)                |
| `error` / `notice`    | Virhe- ja onnistumisviestit                            |
| `loadingMakes` jne.   | Lataustilat (valmistajat, mallit, tallennus, poistot)  |

#### Apufunktiot ja vakiot

| Nimi                    | Toiminta                                                                 |
|-------------------------|--------------------------------------------------------------------------|
| `emptyCar`              | Tyhjä auton lomaketieto                                                  |
| `formatDate`            | Muotoilee päivämäärän suomalaiseen muotoon (`fi-FI`)                     |
| `displayValue`          | Näyttää arvon tai "Ei ilmoitettu"                                        |
| `getEngineDetails`      | Muodostaa moottorin teknisistä tiedoista näytettävät kentät              |
| `getUserName`           | Hakee käyttäjän nimen `userId`:n perusteella                             |
| `years` (IIFE)          | Muodostaa vuosimallivaihtoehdot sukupolven vuosirajoista                 |

#### Keskeiset tapahtumankäsittelijät

| Funktio                     | Toiminta                                                                 |
|-----------------------------|--------------------------------------------------------------------------|
| `handleChange`              | Päivittää lomaketta; nollaa riippuvat valinnat valmistaja-/malli-vaihdossa |
| `handleModelSelect`         | Hakee mallin sukupolvet API:sta                                          |
| `handleSubmit`              | Validoi ja tallentaa uuden auton (`carService.create`)                   |
| `handleShowDelete`          | Hakee autot ja näyttää poistettavat                                      |
| `handleDelete`              | Poistaa yksittäisen auton (`carService.remove`)                          |
| `handleShowBookings`        | Hakee varaukset, autot ja käyttäjät                                      |
| `handleDeleteBooking`       | Poistaa yksittäisen varauksen (`bookingsService.remove`)                 |
| `handleDeleteAllBookings`   | Poistaa kaikki varaukset yksi kerrallaan                                 |

#### Tiedonsiirto / API-kutsut

| Kutsu                                      | Tarkoitus                                      |
|--------------------------------------------|------------------------------------------------|
| `GET /api/vehicle-makes`                   | Valmistajat                                    |
| `GET /api/vehicle-makes/:make/models`      | Mallit                                         |
| `GET /api/vehicle-makes/:make/models/:model` | Sukupolvet + moottorit                       |
| `carService.getAll()` / `create()` / `remove()` | Autojen hallinta                            |
| `bookingsService.getAll()` / `remove()`    | Varausten hallinta                             |
| `userService.getAll()`                     | Käyttäjät (varaajan nimi)                      |

Auton lisäyksessä frontend lähettää vain valinnat ja vuokraustiedot. Backend hakee tekniset tiedot uudelleen `all.json`-tiedostosta ja tallentaa auton.

**Frontend lähettää (`carService.create` → `POST /api/cars`):**
```js
{
  brand: "Toyota",
  model: "Corolla",
  generation: "E210",
  year: 2022,
  engineLabel: "1.8 Hybrid",
  price: 45,
  seats: 5,
  image: "https://...",
  description: "..."
}
```

**Backend tekee:**
- Tarkistaa merkin, mallin, sukupolven, vuosimallin ja moottorin `all.json`:sta
- Laskee ja lisää tekniset tiedot (moottori, polttoaine, teho, kulutus jne.)
- Tallentaa auton `cars.json`-tiedostoon
- Palauttaa valmiin auton (status 201)

[↑ Palaa ylös](#sisällysluettelo)

---

## Komponentit (components/)

### Navbar.jsx

**Tarkoitus:**  
Näyttää sovelluksen yläreunassa navigaatiolinkit etusivulle, omiin tietoihin ja varauksiin. Ylläpitäjälle näytetään lisäksi linkki hallintapaneeliin. Aktiivinen sivu korostetaan, ja mobiilinäkymässä navigaatio voidaan avata ja sulkea.

**Propit:** `isAdmin` (määrittää, näytetäänkö ylläpidon linkki ja käytetäänkö varauslinkissä tekstiä "Varaukset" vai "Varaukseni")

**Toiminta:**
- Käyttää React Routerin `NavLink`-komponentteja.
- `navLinkClass` lisää aktiiviselle linkille luokat `active` ja `fw-semibold`.
- Ei hae eikä tallenna tietoja palvelimelle.

**Linkit:**
- `/` → Etusivu
- `/mypage` → Omat tiedot
- `/my-bookings` → Varaukset / Varaukseni
- `/admin` → Ylläpito (vain jos `isAdmin`)

[↑ Palaa ylös](#sisällysluettelo)

---

## Bootstrap-luokat ja niiden käyttö

Projektissa käytetään **Bootstrap 5** -luokkia (`className`) ulkoasun rakentamiseen. Bootstrap on CSS-kehys, joka tarjoaa valmiita tyylejä ja responsiivisuutta ilman että kirjoitetaan paljon omaa CSS:ää.

### Mitä `className` tarkoittaa?
Reactissa HTML:n `class`-attribuutin tilalla käytetään `className`a, koska `class` on JavaScriptin varattu sana.  
Esimerkki:
```jsx
<div className="container py-5">
```
vastaa HTML:ää `<div class="container py-5">`.

### Yleisimmät lyhenteet ja niiden merkitys

| Luokka / lyhenne | Merkitys | Esimerkki käytöstä |
|------------------|----------|--------------------|
| `container` | Keskittää sisällön ja rajoittaa leveyttä | Pääsisältöalue |
| `row` | Bootstrap-gridin rivi | Autokorttien asettelu |
| `col-12`, `col-md-6`, `col-lg-4` | Sarakkeet (12 = täysi leveys, md = medium, lg = large) | Responsiiviset kortit |
| `g-4` | Gap (väli) gridissä | Korttien välinen tila |
| `py-5`, `py-4`, `mb-3`, `mt-2` | Padding/Margin (p = padding, m = margin, y = pystysuunta, x = vaakasuunta, numero = koko) | Välit elementtien välillä |
| `d-flex` | Display: flex | Keskitys ja rivit |
| `justify-content-between`, `align-items-center` | Flex-asettelu | Napit ja tekstit samalla rivillä |
| `btn`, `btn-primary`, `btn-danger`, `btn-outline-secondary` | Painikkeet (btn = button, primary = sininen, danger = punainen) | Varaa-nappi, Poista-nappi |
| `card`, `card-body`, `card-title` | Korttikomponentti | Autokortit |
| `table`, `table-striped`, `table-hover` | Taulukot | Varauslistat |
| `navbar`, `navbar-expand-lg`, `navbar-toggler` | Navigaatiopalkki + mobiilivalikko | Yläpalkki |
| `alert`, `alert-danger`, `alert-success` | Ilmoitukset | Virhe- ja onnistumisviestit |
| `text-secondary`, `fw-bold`, `fs-5` | Tekstityylit (fw = font-weight, fs = font-size) | Hinnat ja otsikot |
| `w-100` | Width: 100% | Täysleveät napit |
| `img-fluid` | Responsiivinen kuva | Autokuvat |

### Grid-järjestelmä lyhyesti
Bootstrapin grid perustuu **12-sarakkeiseen** järjestelmään:
- `row` = rivi
- `col-*` = sarake
- `col-12` = 100 % leveys (mobiili)
- `col-md-6` = 50 % leveys medium-näytöillä ja isommilla
- `col-lg-4` = 33 % leveys large-näytöillä

Esimerkki autokorteista:
```jsx
<div className="row g-4">
  <div className="col-12 col-md-6 col-lg-4">
    {/* kortti */}
  </div>
</div>
```

### Painikkeet
Painikkeet tehdään yleensä näin:
```jsx
<button className="btn btn-primary w-100" type="button">
  VARAA AUTO
</button>
```
- `btn` = peruspainiketyyli
- `btn-primary` = sininen väri
- `btn-danger` = punainen
- `btn-outline-*` = reunallinen versio
- `btn-sm` / `btn-lg` = pieni / iso

Tämä dokumentaatio keskittyy eniten käytettyihin luokkiin. Tarkemmat tiedot löytyvät Bootstrap 5:n dokumentaatiosta.

[↑ Palaa ylös](#sisällysluettelo)

---

## Palvelut (services/)

Palvelut keskittävät HTTP-kutsut backendin API:hin. Käytetään joko Axiosia tai Fetch API:a.

### booking.js

**Tarkoitus:**  
Keskittää varausten hakeminen, luominen ja poistaminen. Käyttää Axiosia osoitteessa `http://localhost:3001/api/bookings`.

#### Funktiot

| Funktio          | HTTP-metodi | Reitti                          | Toiminta                          |
|------------------|-------------|---------------------------------|-----------------------------------|
| `getAll()`       | GET         | `/api/bookings`                 | Hakee kaikki varaukset            |
| `getByCarId(carId)` | GET      | `/api/bookings?carId={carId}`   | Hakee tietyn auton varaukset      |
| `getByUserId(userId)` | GET    | `/api/bookings?userId={userId}` | Hakee tietyn käyttäjän varaukset  |
| `create(newBooking)` | POST   | `/api/bookings`                 | Luo uuden varauksen               |
| `remove(id)`     | DELETE      | `/api/bookings/{id}`            | Poistaa varauksen                 |

Palauttaa `response.data`. Virheet välittyvät kutsujalle.  
Katso tarkempi payload ja backendin käsittely **Booking.jsx**- ja **CarDetails.jsx**-osioista.

[↑ Palaa ylös](#sisällysluettelo)

### cars.js

**Tarkoitus:**  
Keskittää autojen hakeminen, lisääminen ja poistaminen. Käyttää Fetch API:a osoitteessa `http://localhost:3001/api/cars`.

#### Funktiot

| Funktio          | HTTP-metodi | Reitti                | Toiminta                          |
|------------------|-------------|-----------------------|-----------------------------------|
| `getAll()`       | GET         | `/api/cars`           | Hakee kaikki autot                |
| `create(newCar)` | POST        | `/api/cars`           | Lisää uuden auton                 |
| `remove(id)`     | DELETE      | `/api/cars/{id}`      | Poistaa auton                     |

Tarkistaa `response.ok` ja heittää virheen, jos pyyntö epäonnistuu. Palauttaa JSON-datan.  
Katso tarkempi payload ja backendin käsittely **Admin.jsx**-osiosta.

[↑ Palaa ylös](#sisällysluettelo)

### users.js

**Tarkoitus:**  
Hakee kaikki käyttäjät. Käyttää Axiosia osoitteessa `http://localhost:3001/api/users`.

#### Funktiot

| Funktio     | HTTP-metodi | Reitti           | Toiminta                     |
|-------------|-------------|------------------|------------------------------|
| `getAll()`  | GET         | `/api/users`     | Hakee kaikki käyttäjät       |

Palauttaa `response.data`. Sisältää tällä hetkellä vain hakutoiminnon.

[↑ Palaa ylös](#sisällysluettelo)

---

## Yhteenveto reiteistä

| Polku              | Sivu          | Suojaus / proppit                     |
|--------------------|---------------|---------------------------------------|
| `/`                | Home          | Julkinen                              |
| `/cars`            | Cars          | Julkinen                              |
| `/cars/:id`        | CarDetails    | `currentUser`                         |
| `/booking/:id`     | Booking       | `currentUser`                         |
| `/mypage`          | MyPage        | `currentUser`                         |
| `/my-bookings`     | MyBookings    | `currentUser` + `isAdmin`             |
| `/admin`           | Admin         | Vain admin                            |
| `*`                | NotFound      | –                                     |

---

*Dokumentti on valmis. Se perustuu App.jsx:ään, main.jsx:ään, Navbar.jsx:ään, kaikkiin pages-kansion sivukomponentteihin, services-kansion palveluihin sekä Bootstrap-luokkien käyttöön.*
