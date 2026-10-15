/**
 * SIVU: Auton varaaminen (Booking)
 *
 * Tarkoitus:
 * Näyttää valitun auton tiedot ja mahdollistaa vuokra-ajan valinnan
 * sekä varauksen tallentamisen.
 *
 * Tiedonsiirto:
 * Booking -> carService.getAll()
 *   Hakee autot ja etsii URL-parametrin id perusteella varattavan auton.
 * Booking -> bookingService.create({ carId, userId, startDate, endDate })
 *   Lähettää varauspyynnön palvelimelle.
 * Palvelin -> Booking
 *   Palauttaa varauksen tallennuksen tuloksen. Onnistumisesta tai
 *   epäonnistumisesta näytetään ilmoitus käyttöliittymässä.
 *
 * Parametrit ja tiedot:
 * id = URL-osoitteesta saatava auton tunniste.
 * currentUser = valittu käyttäjä, jonka id liitetään varaukseen.
 * car = varattavan auton tiedot.
 * startDate / endDate = valittu alkamis- ja palautuspäivä.
 * totalDays = vuokrauspäivien määrä; palautuspäivää ei lasketa mukaan.
 * saving = estää uuden varauspyynnön tallennuksen ollessa käynnissä.
 * error / notice = virhe- ja onnistumisilmoitukset.
 *
 * Hinta ja vuokra-aika näytetään valittujen päivien ja auton päivähinnan
 * perusteella. Palvelin laskee ja tallentaa lopullisen vuokra-ajan sekä
 * kokonaishinnan ja vastaa varauksen tallennuksesta.
 */

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import carService from "../services/cars";
import bookingService from "../services/booking";
import "bootstrap/dist/css/bootstrap.min.css";

function Booking({ currentUser }) {
  // Auton ID URL-parametrista
  const { id } = useParams();

  // Tila
  const [cars, setCars] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Etsitään varattava auto
  const car = cars.find((c) => String(c.id) === String(id));

  // Vuokrauspäivien määrä (palautuspäivä ei kuulu mukaan)
  const calculateTotalDays = (start, end) => {
    if (!start || !end || end <= start) return 0;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    return (endTime - startTime) / millisecondsPerDay;
  };

  const totalDays = calculateTotalDays(startDate, endDate);

  // Haetaan autot komponentin avautuessa
  useEffect(() => {
    carService
      .getAll()
      .then(setCars)
      .catch(() => setError("Autojen lataaminen epäonnistui."));
  }, []);

  // Tallenna varaus
  const handleBooking = async () => {
    if (!currentUser) {
      setError("Valitse käyttäjä ennen varaamista.");
      return;
    }

    if (!startDate || !endDate || totalDays <= 0) {
      setError("Valitse kelvollinen alkamis- ja palautuspäivä.");
      return;
    }

    setError("");
    setNotice("");
    setSaving(true);

    try {
      // Backend laskee totalDays ja totalPrice itse
      await bookingService.create({
        carId: car.id,
        userId: currentUser.id,
        startDate,
        endDate,
      });

      setNotice("Auton varaus onnistui.");
      setStartDate("");
      setEndDate("");
    } catch {
      setError("Varauksen tallentaminen epäonnistui.");
    } finally {
      setSaving(false);
    }
  };

  // Virhe autojen latauksessa
  if (error && !car && cars.length === 0) {
    return <main className="container py-3 text-danger">{error}</main>;
  }

  // Ladataan vielä
  if (!car) {
    return <main className="container py-3">Ladataan auton tietoja...</main>;
  }

  return (
    <main className="container-fluid p-2" style={{ minHeight: "100dvh" }}>
      {/* Takaisin autoihin */}
      <div className="mb-2">
        <Link to="/cars" className="text-decoration-none">
          ← Takaisin autoihin
        </Link>
      </div>

      <div className="row g-3">
        {/* Auton kuva */}
        <div className="col-12 col-lg-7 d-flex justify-content-center">
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="img-fluid rounded"
            style={{
              maxHeight: "75dvh",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Auton tiedot ja varauslomake */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-2">
          <h1 className="h4 mb-0">
            {car.brand} {car.model}
          </h1>

          <div className="text-secondary small">Vuosimalli {car.year}</div>

          <p className="mb-1">{car.description}</p>

          {/* Ominaisuudet */}
          <table className="table table-sm table-borderless mb-0">
            <tbody>
              <tr>
                <th>Henkilömäärä</th>
                <td>{car.seats}</td>
                <th>Vaihteisto</th>
                <td>{car.transmission}</td>
              </tr>
              <tr>
                <th>Polttoaine</th>
                <td>{car.fuel}</td>
                <th>Hinta</th>
                <td>{car.price} € / päivä</td>
              </tr>
            </tbody>
          </table>

          <hr className="my-1" />

          {/* Päivämäärävalinta */}
          <h2 className="h6 mb-1">Vuokra-aika</h2>

          <div className="row g-2">
            <div className="col-6">
              <label htmlFor="startDate" className="form-label small">
                Alkupäivä
              </label>
              <input
                id="startDate"
                type="date"
                className="form-control form-control-sm"
                min={new Date().toLocaleDateString("sv-SE")}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="col-6">
              <label htmlFor="endDate" className="form-label small">
                Palautuspäivä
              </label>
              <input
                id="endDate"
                type="date"
                className="form-control form-control-sm"
                min={startDate || new Date().toLocaleDateString("sv-SE")}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <hr className="my-1" />

          {/* Yhteenveto */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="text-secondary small">Vuokra-aika</div>
              <strong>
                {totalDays > 0 ? `${totalDays} päivää` : "Ei valittu"}
              </strong>
            </div>

            <div className="text-end">
              <div className="text-secondary small">Yhteensä</div>
              <strong className="fs-5">
                {totalDays > 0 ? `${car.price * totalDays} €` : "—"}
              </strong>
            </div>
          </div>

          {/* Ilmoitukset */}
          {error && (
            <div className="alert alert-danger py-2 mb-0" role="alert">
              {error}
            </div>
          )}

          {notice && (
            <div className="alert alert-success py-2 mb-0" role="status">
              {notice}
            </div>
          )}

          {/* Varaa-painike */}
          <button
            className="btn btn-primary w-100"
            type="button"
            onClick={handleBooking}
            disabled={saving || totalDays <= 0}
          >
            {saving ? "Tallennetaan..." : "VARAA AUTO"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Booking;
