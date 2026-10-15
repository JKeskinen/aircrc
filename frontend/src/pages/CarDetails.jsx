/**
 * SIVU: Auton tiedot ja varaaminen (CarDetails)
 *
 * Tarkoitus:
 * Näyttää valitun auton kuvan, tekniset tiedot, vuokraushinnan ja
 * varauskalenterin. Käyttäjä valitsee vapaan alkamis- ja palautuspäivän,
 * näkee vuokra-ajan ja kokonaishinnan sekä tallentaa varauksen.
 *
 * Tiedonsiirto:
 * CarDetails -> carService.getAll()
 *   Hakee autot ja etsii URL-parametrin id perusteella valitun auton.
 * CarDetails -> bookingsService.getByCarId(id)
 *   Hakee auton olemassa olevat varaukset kalenteria varten.
 * CarDetails -> bookingsService.create({...})
 *   Lähettää varattavan auton, käyttäjän, vuokra-ajan, päivien määrän
 *   ja hinnan palvelimelle varauksen tallentamista varten.
 * Palvelin -> CarDetails
 *   Palauttaa hakujen ja varauksen tallennuksen tulokset. Käyttöliittymä
 *   päivittää kalenterin ja näyttää onnistumis- tai virheilmoituksen.
 *
 * Keskeiset tiedot:
 * id = URL-osoitteesta saatava auton tunniste, currentUser = kirjautunut
 * tai valittu käyttäjä, car = auton tiedot, bookings = auton varaukset,
 * startDate / endDate = valitut vuokrauspäivät, totalDays = vuokrauspäivien
 * määrä (palautuspäivää ei lasketa mukaan), totalPrice = kokonaishinta,
 * calendarMonth = kalenterissa näytettävä kuukausi.
 *
 * Kalenteri estää menneiden ja varattujen päivien valinnan sekä tarkistaa
 * varausten päällekkäisyydet.
 */

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

// Palvelut autojen ja varausten hakemiseen sekä tallentamiseen.
import carService from "../services/cars";
import bookingsService from "../services/booking";

// Sivun ulkoasun tyylit.
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/CarDetails.css";

// Muuttaa Date-olion muotoon YYYY-MM-DD.
// Tätä muotoa käytetään kalenterissa ja varauksen tallennuksessa.
const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Muuttaa päivämäärän suomalaiseen muotoon DD.MM.YYYY.
// Käytetään päivämäärän näyttämiseen käyttäjälle.
const formatDate = (dateString) => {
  if (!dateString) return "";

  return new Date(`${dateString}T12:00:00`).toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

// Laskee vuokrauspäivien määrän.
// Palautuspäivää ei lasketa vuokrauspäiväksi.
// Esimerkiksi 12.10.–14.10. = 2 päivää.
const getDaysBetween = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);

  return (endDate - startDate) / (1000 * 60 * 60 * 24);
};

function CarDetails({ currentUser }) {
  // Haetaan auton tunniste URL-osoitteesta.
  const { id } = useParams();

  // Autojen ja varausten tiedot sekä sivun tilamuuttujat.
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarError, setCalendarError] = useState(null);

  // Käyttäjän valitsema vuokrauksen alku- ja palautuspäivä.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Varauksen tallentamisen tila ja käyttäjälle näytettävä viesti.
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  // Kalenterissa näytettävä kuukausi.
  // Oletuksena näytetään kuluva kuukausi.
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Etsitään valittu auto auton tunnisteen perusteella.
  const car = cars.find((item) => Number(item.id) === Number(id));

  // Tämän päivän päivämäärä ja vuokrauksen hinta.
  const today = toDateString(new Date());
  const totalDays = getDaysBetween(startDate, endDate);
  const totalPrice = car ? Number(car.price) * totalDays : 0;

  // Haetaan autot, kun sivu avataan.
  useEffect(() => {
    carService
      .getAll()
      .then((data) => setCars(data))
      .catch(() => setError("Autojen lataaminen epäonnistui."))
      .finally(() => setLoading(false));
  }, []);

  // Haetaan valitun auton varaukset.
  // Päivitetään myös kalenterin mahdolliset virheilmoitukset.
  const loadBookings = async () => {
    try {
      const data = await bookingsService.getByCarId(id);
      setBookings(Array.isArray(data) ? data : []);
      setCalendarError(null);
    } catch {
      setCalendarError("Varausten lataaminen epäonnistui.");
    }
  };

  // Ladataan varaukset, kun auton tunniste muuttuu.
  useEffect(() => {
    loadBookings();
  }, [id]);

  // Tarkistaa, osuuko päivämäärä olemassa olevan varauksen
  // alku- ja palautuspäivän välille, palautuspäivä mukaan lukien.
  const isBooked = (date) =>
    bookings.some(
      (booking) => date >= booking.startDate && date <= booking.endDate,
    );

  // Tarkistaa, meneekö uusi vuokraus päällekkäin olemassa olevan
  // varauksen kanssa. Palautuspäivä ei kuulu vuokrausaikaan.
  const overlapsBooking = (start, end) =>
    bookings.some(
      (booking) => start < booking.endDate && end > booking.startDate,
    );

  // Tarkistaa, onko päivä valittu vuokrauksen alku- tai loppupäiväksi.
  const isSelectedDate = (date) =>
    (startDate && date === startDate) || (endDate && date === endDate);

  // Tarkistaa, onko päivä valitun vuokrausjakson sisällä.
  const isInSelectedRange = (date) =>
    startDate && endDate && date > startDate && date < endDate;

  // Käsittelee kalenterista valitun päivän.
  const selectCalendarDate = (date) => {
    // Menneitä tai varattuja päiviä ei voi valita.
    if (date < today || isBooked(date)) return;

    setBookingMessage(null);

    // Jos alkupäivää ei ole valittu tai molemmat päivät on valittu,
    // aloitetaan uuden vuokrausjakson valinta.
    // Aiempi loppupäivä poistetaan.
    if (!startDate || endDate || date <= startDate) {
      setStartDate(date);
      setEndDate("");
      return;
    }

    // Estetään ajanjakso, joka sisältää jo varattuja päiviä.
    if (overlapsBooking(startDate, date)) {
      setBookingMessage({
        type: "danger",
        text: "Valittu ajanjakso sisältää jo varattuja päiviä.",
      });

      // Aloitetaan valinta uudelleen valitusta päivästä.
      setStartDate(date);
      setEndDate("");
      return;
    }

    // Toinen valinta muodostaa palautuspäivän.
    setEndDate(date);
  };

  // Siirtää kalenteria edelliseen tai seuraavaan kuukauteen.
  const changeMonth = (amount) => {
    setCalendarMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  // Selvitetään kuukauden ensimmäisen päivän viikonpäivä.
  // JavaScriptissä sunnuntai on 0, joten muutetaan viikon alku maanantaiksi.
  const firstWeekday =
    (new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    ).getDay() +
      6) %
    7;

  // Selvitetään kuukauden päivien määrä.
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();

  // Luodaan kalenterin päivät ja lisätään alkuun tyhjät solut,
  // jotta kuukauden ensimmäinen päivä osuu oikealle viikonpäivälle.
  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  // Lisätään loppuun tyhjät solut, jotta kalenterin viimeinen
  // viikko täyttää seitsemän saraketta.
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  // Kuukauden nimi ja vuosi suomeksi.
  const monthLabel = calendarMonth.toLocaleDateString("fi-FI", {
    month: "long",
    year: "numeric",
  });

  // Kuukauden alku, jolla estetään siirtyminen menneisiin kuukausiin.
  const firstOfCurrentMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  // Tallentaa uuden varauksen backendin kautta.
  const handleBooking = async () => {
    // Tarkistetaan, että molemmat päivät on valittu
    // ja vuokrauksen kesto on positiivinen.
    if (!startDate || !endDate || totalDays <= 0) {
      setBookingMessage({
        type: "danger",
        text: "Valitse kalenterista alkamis- ja palautuspäivä.",
      });
      return;
    }

    // Tarkistetaan vielä, ettei ajanjakso ole varattu.
    if (overlapsBooking(startDate, endDate)) {
      setBookingMessage({
        type: "danger",
        text: "Auto on jo varattu valitulle ajanjaksolle.",
      });

      await loadBookings();
      return;
    }

    setBookingLoading(true);
    setBookingMessage(null);

    try {
      // Lähetetään varauksen tiedot backendille.

      await bookingsService.create({
        carId: car.id,
        carBrand: car.brand,
        carModel: car.model,
        userId: currentUser.id,
        userName: currentUser.name,
        startDate,
        endDate,
        totalDays,
        totalPrice,
      });

      // Näytetään onnistumisviesti suomalaisessa päivämäärämuodossa.
      setBookingMessage({
        type: "success",
        text: `Varaus onnistui! ${car.brand} ${car.model}, ${formatDate(startDate)} – ${formatDate(endDate)}. Kokonaishinta ${totalPrice.toFixed(2)} €.`,
      });

      // Tyhjennetään päivämäärävalinnat.
      setStartDate("");
      setEndDate("");

      // Päivitetään kalenteri tallennuksen jälkeen.
      await loadBookings();
    } catch (error) {
      // Näytetään backendin virheilmoitus, jos se on saatavilla.
      setBookingMessage({
        type: "danger",
        text:
          error.response?.data?.error ||
          "Varauksen tallentaminen epäonnistui. Tarkista, että backend on käynnissä, ja yritä uudelleen.",
      });

      await loadBookings();
    } finally {
      // Vapautetaan tallennuspainike onnistumisesta riippumatta.
      setBookingLoading(false);
    }
  };

  // Näytetään latausviesti autojen lataamisen aikana.
  if (loading) {
    return <main className="container py-3">Ladataan auton tietoja...</main>;
  }

  // Näytetään virheilmoitus, jos autojen lataaminen epäonnistuu.
  if (error) {
    return (
      <main className="container py-3 text-danger">
        {error}
        <div>
          <Link to="/cars">Takaisin autoihin</Link>
        </div>
      </main>
    );
  }

  // Näytetään ilmoitus, jos pyydettyä autoa ei löydy.
  if (!car) {
    return (
      <main className="container py-3">
        <h1 className="h4">Autoa ei löytynyt</h1>
        <Link to="/cars" className="text-decoration-none">
          ← Takaisin autoihin
        </Link>
      </main>
    );
  }

  // Auton varsinainen näkymä.

  // Auton varsinainen näkymä.
  return (
    <main className="container-fluid p-2" style={{ minHeight: "100dvh" }}>
      <div className="mb-2">
        <Link to="/cars" className="text-decoration-none">
          ← Takaisin autoihin
        </Link>
      </div>

      <div className="row g-3">
        {/* VASEN SARAKKE: AUTON KUVA JA TIEDOT */}
        <div className="col-12 col-lg-7">
          <div className="d-flex align-items-start justify-content-center mb-3">
            {car.image && (
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                className="img-fluid rounded"
                style={{
                  maxHeight: "40dvh",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            )}
          </div>

          <h1 className="h4 mb-0">
            {car.brand} {car.model}
          </h1>

          <div className="text-secondary small mb-2">Vuosimalli {car.year}</div>

          <p className="mb-2">{car.description}</p>

          <h2 className="h6 mt-3 mb-2">Auton tarkat tiedot</h2>

          <table className="table table-sm table-borderless mb-2">
            <tbody>
              <tr>
                <th className="ps-0">Moottori</th>
                <td>{car.engine}</td>
              </tr>
              <tr>
                <th className="ps-0">Teho</th>
                <td>{car.horsepower} hv</td>
              </tr>
              <tr>
                <th className="ps-0">Iskutilavuus</th>
                <td>{car.displacement}</td>
              </tr>
              <tr>
                <th className="ps-0">
                  {car.fuel === "Sähkö" ? "Sähkönkulutus" : "Kulutus"}
                </th>
                <td>{car.consumption}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* OIKEA SARAKKE: VARAUSKALENTERI */}
        <div className="col-12 col-lg-5">
          <h2 className="h5 mb-3">Varauskalenteri</h2>

          <div className="d-flex align-items-center justify-content-between mb-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => changeMonth(-1)}
              disabled={
                calendarMonth.getFullYear() ===
                  firstOfCurrentMonth.getFullYear() &&
                calendarMonth.getMonth() === firstOfCurrentMonth.getMonth()
              }
              aria-label="Edellinen kuukausi"
            >
              ←
            </button>

            <strong className="text-capitalize">{monthLabel}</strong>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => changeMonth(1)}
              aria-label="Seuraava kuukausi"
            >
              →
            </button>
          </div>

          <div className="calendar-legend">
            <span>
              <span className="legend-color legend-free" />
              Vapaa
            </span>
            <span>
              <span className="legend-color legend-booked" />
              Varattu
            </span>
            <span>
              <span className="legend-color legend-selected" />
              Valittu
            </span>
          </div>

          <div className="calendar-container">
            <div className="calendar-weekdays">
              {["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarCells.map((day, index) => {
                if (day === null) {
                  return (
                    <div
                      className="calendar-empty"
                      key={`empty-${index}`}
                      aria-hidden="true"
                    />
                  );
                }

                const date = toDateString(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth(),
                    day,
                  ),
                );

                const booked =
                  isBooked(date) ||
                  bookings.some((booking) => date === booking.endDate);

                const past = date < today;
                const selected = isSelectedDate(date);
                const inRange = isInSelectedRange(date);
                const disabled = past || isBooked(date);

                let background = "#198754";
                let color = "#ffffff";

                if (booked) background = "#dc3545";

                if (past) {
                  background = "#e9ecef";
                  color = "#6c757d";
                }

                if (inRange) {
                  background = "#cfe2ff";
                  color = "#084298";
                }

                if (selected) {
                  background = "#0d6efd";
                  color = "#ffffff";
                }

                return (
                  <div className="calendar-day" key={date}>
                    <button
                      type="button"
                      className="calendar-day-button"
                      style={{
                        background,
                        color,
                        outline: selected ? "2px solid #084298" : "none",
                        outlineOffset: "-2px",
                        fontWeight: selected ? "700" : "400",
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                      disabled={disabled}
                      title={
                        past
                          ? "Mennyt päivä"
                          : booked
                            ? "Auto on varattu"
                            : "Auto on vapaa"
                      }
                      aria-label={`${day}. ${monthLabel}${
                        booked
                          ? ", varattu"
                          : past
                            ? ", mennyt päivä"
                            : ", vapaa"
                      }`}
                      aria-pressed={Boolean(selected)}
                      onClick={() => selectCalendarDate(date)}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {calendarError && (
            <div className="alert alert-danger py-2 mt-2 mb-0 small">
              {calendarError}
              <button
                type="button"
                className="btn btn-link btn-sm p-0 ms-2"
                onClick={loadBookings}
              >
                Yritä uudelleen
              </button>
            </div>
          )}

          <div className="small text-secondary mt-2">
            Valitse aloituspäivä ja lopetuspäivä. Auton palautus klo 17.00
            mennessä.
          </div>

          <hr className="my-2" />

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <div className="text-secondary small">Vuokra-aika</div>
              <strong>
                {totalDays > 0 ? `${totalDays} päivää` : "Ei valittu"}
              </strong>
            </div>

            <div className="text-end">
              <div className="text-secondary small">Yhteensä</div>
              <strong className="fs-5">
                {totalDays > 0 ? `${totalPrice.toFixed(2)} €` : "0 €"}
              </strong>
            </div>
          </div>

          {bookingMessage && (
            <div
              className={`alert alert-${bookingMessage.type} py-2 px-3 mt-2 mb-0`}
              role="status"
            >
              {bookingMessage.text}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary w-100 mt-2"
            disabled={
              totalDays <= 0 ||
              bookingLoading ||
              overlapsBooking(startDate, endDate)
            }
            onClick={handleBooking}
          >
            {bookingLoading ? "TALLENNETAAN..." : "VARAA AUTO"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default CarDetails;
