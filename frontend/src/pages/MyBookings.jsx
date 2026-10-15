/**
 * SIVU: Omat varaukset / Kaikki varaukset
 *
 * Tarkoitus:
 * Näyttää käyttäjän omat varaukset tai ylläpitäjälle kaikki varaukset.
 * Taulukossa esitetään auto, varaaja, vuokra-aika ja kokonaishinta.
 * Käyttäjä voi poistaa yksittäisiä varauksia tai kaikki näkyvissä olevat varaukset.
 *
 * Tiedonsiirto:
 * MyBookings -> bookingsService.getByUserId(currentUser.id)
 *   Lähettää käyttäjätunnuksen ja vastaanottaa käyttäjän varaukset.
 * MyBookings -> bookingsService.getAll()
 *   Pyytää ja vastaanottaa kaikki varaukset ylläpitäjän näkymässä.
 * MyBookings -> carService.getAll()
 *   Pyytää ja vastaanottaa autotiedot auton nimien näyttämistä varten.
 * MyBookings -> bookingsService.remove(booking.id)
 *   Lähettää poistopyynnön varauksen tunnisteella.
 * Palvelin -> MyBookings
 *   Palauttaa pyyntöjen tulokset; käyttöliittymä päivittää varauslistan
 *   ja näyttää onnistumis- tai virheilmoituksen.
 *
 * Parametrit: currentUser = nykyinen käyttäjä, isAdmin = ylläpitäjänäkymä,
 * bookings = varaukset, cars = autot.
 */

import { useCallback, useEffect, useState } from "react";
import carService from "../services/cars";
import bookingsService from "../services/booking";
import "../styles/myBookings.css";

// Muotoilee päivämäärän suomalaiseen esitysmuotoon.
const formatDate = (dateString) => {
  if (!dateString) return "Ei päivämäärää";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "Ei päivämäärää";

  return date.toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

// Järjestää varaukset uusimman alkamispäivän mukaan.
const sortBookings = (bookings) =>
  [...bookings].sort((a, b) =>
    String(b.startDate || "").localeCompare(String(a.startDate || "")),
  );

const MyBookings = ({ currentUser, isAdmin }) => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [deletingAllBookings, setDeletingAllBookings] = useState(false);

  // Hakee vain nykyisen käyttäjän varaukset (admin näkee kaikki)
  const loadBookings = useCallback(async () => {
    if (!currentUser?.id && !isAdmin) {
      setError("Käyttäjää ei ole valittu.");
      setBookingsLoading(false);
      return;
    }

    setError("");
    setNotice("");
    setBookingsLoading(true);

    try {
      const [bookingData, carData] = await Promise.all([
        isAdmin
          ? bookingsService.getAll()
          : bookingsService.getByUserId(currentUser.id),
        carService.getAll(),
      ]);

      setCars(carData);
      setBookings(sortBookings(bookingData));
    } catch {
      setError("Varausten tai autojen hakeminen epäonnistui.");
    } finally {
      setBookingsLoading(false);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const carNames = new Map(
    cars.map((car) => [
      String(car.id),
      `${car.brand || car.make || ""} ${car.model || ""}`.trim(),
    ]),
  );

  const getCarName = (booking) => {
    const bookingName =
      `${booking.carBrand || ""} ${booking.carModel || ""}`.trim();

    return (
      bookingName ||
      carNames.get(String(booking.carId)) ||
      `Auto ${booking.carId ?? ""}`
    );
  };

  const handleDeleteBooking = async (booking) => {
    // Asiakas voi poistaa vain omat varauksensa
    if (!isAdmin && Number(booking.userId) !== Number(currentUser?.id)) {
      setError("Voit poistaa vain omia varauksiasi.");
      return;
    }

    const carName = getCarName(booking);

    const confirmed = window.confirm(
      `Haluatko varmasti poistaa tämän varauksen?\n\n` +
        `Auto: ${carName}\n` +
        `Ajankohta: ${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}\n` +
        `Hinta: ${Number(booking.totalPrice || 0).toFixed(2)} €`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingBookingId(booking.id);

    try {
      await bookingsService.remove(booking.id);

      setBookings((previous) =>
        previous.filter((item) => item.id !== booking.id),
      );

      setNotice("Varaus poistettu onnistuneesti.");
    } catch {
      setError("Varauksen poistaminen epäonnistui.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleDeleteAllBookings = async () => {
    if (bookings.length === 0) {
      setNotice("Poistettavia varauksia ei ole.");
      return;
    }

    const confirmed = window.confirm(
      `VAROITUS: Haluatko varmasti poistaa KAIKKI ${bookings.length} varausta?\n\n` +
        "Toimintoa ei voi peruuttaa.",
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingAllBookings(true);

    try {
      for (const booking of bookings) {
        await bookingsService.remove(booking.id);
      }

      setBookings([]);
      setNotice("Kaikki varaukset poistettiin.");
    } catch {
      setError(
        "Kaikkien varausten poistaminen ei onnistunut. Päivitetään varauslista.",
      );

      try {
        await loadBookings();
      } catch {
        setError(
          "Varausten poistaminen tai varauslistan päivittäminen epäonnistui.",
        );
      }
    } finally {
      setDeletingAllBookings(false);
    }
  };

  const deletionInProgress = deletingAllBookings || deletingBookingId !== null;

  return (
    <main className="my-bookins-page container-fluid py-4">
      <header className="mb-4">
        <p>Käyttäjätunnus otetaan varauksesta: bookings[0]?.userName</p>
        <h1 className="h2 mb-1">
          {isAdmin ? "Kaikki varaukset" : "Omat varaukset"}
        </h1>
        <p className="text-secondary mb-0">
          Varauksia yhteensä: {bookings.length}
          {!isAdmin && currentUser && <> · {currentUser.name}</>}
        </p>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={loadBookings}
          disabled={bookingsLoading || deletionInProgress}
        >
          Päivitä lista
        </button>

        <button
          className="btn btn-danger"
          type="button"
          onClick={handleDeleteAllBookings}
          disabled={
            bookings.length === 0 || bookingsLoading || deletionInProgress
          }
        >
          {deletingAllBookings
            ? "Poistetaan varauksia..."
            : isAdmin
              ? "Poista kaikki varaukset"
              : "Poista omat varaukset"}
        </button>
      </div>

      {bookingsLoading ? (
        <p role="status">Ladataan varauksia...</p>
      ) : bookings.length === 0 ? (
        <div className="alert alert-info">Varauksia ei löytynyt.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th scope="col">Auto</th>
                <th scope="col">Käyttäjä</th>
                <th scope="col">Alkamispäivä</th>
                <th scope="col">Palautuspäivä</th>
                <th scope="col">Vuokra-aika</th>
                <th scope="col">Kokonaishinta</th>
                <th scope="col">Toiminnot</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{getCarName(booking)}</strong>
                    <div className="small text-secondary">
                      Varaus #{booking.id}
                    </div>
                  </td>
                  <td>
                    <strong>{booking.userName}</strong>
                    <div className="small text-secondary">
                      Id: {booking.userId}{" "}
                    </div>
                  </td>

                  <td>{formatDate(booking.startDate)}</td>
                  <td>{formatDate(booking.endDate)}</td>

                  <td>
                    {booking.totalDays ?? "—"}{" "}
                    {booking.totalDays === 1 ? "päivä" : "päivää"}
                  </td>

                  <td>{Number(booking.totalPrice || 0).toFixed(2)} €</td>

                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      onClick={() => handleDeleteBooking(booking)}
                      disabled={deletionInProgress || bookingsLoading}
                    >
                      {deletingBookingId === booking.id
                        ? "Poistetaan..."
                        : "Poista varaus"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default MyBookings;
