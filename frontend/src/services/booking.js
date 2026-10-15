/**
 * PALVELU: Varausten käsittely (booking)
 *
 * Tarkoitus:
 * Keskittää varausten hakeminen, luominen ja poistaminen yhteen palveluun.
 * Käyttää Axios-kirjastoa HTTP-pyyntöihin Express-backendin API-osoitteessa
 * http://localhost:3001/api/bookings.
 *
 * Tiedonsiirto:
 * bookingService -> GET /api/bookings
 *   Hakee kaikki varaukset.
 * bookingService -> GET /api/bookings?carId={carId}
 *   Hakee tietyn auton varaukset auton tunnisteella.
 * bookingService -> GET /api/bookings?userId={userId}
 *   Hakee tietyn käyttäjän varaukset käyttäjätunnisteella.
 * bookingService -> POST /api/bookings
 *   Lähettää uuden varauksen tiedot palvelimelle.
 * bookingService -> DELETE /api/bookings/{id}
 *   Lähettää varauksen poistopyynnön tunnisteella.
 * Palvelin -> bookingService -> kutsuva komponentti
 *   Palauttaa vastauksen data-kentän; virheet välittyvät kutsujalle.
 *
 * Parametrit:
 * carId = auton tunniste, userId = käyttäjän tunniste,
 * newBooking = uuden varauksen tiedot, id = poistettavan varauksen tunniste.
 */

import axios from "axios";

const baseUrl = "http://localhost:3001/api/bookings";

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const getByCarId = (carId) => {
  const request = axios.get(`${baseUrl}?carId=${carId}`);
  return request.then((response) => response.data);
};

const getByUserId = (userId) => {
  const request = axios.get(`${baseUrl}?userId=${userId}`);
  return request.then((response) => response.data);
};

const create = (newBooking) => {
  const request = axios.post(baseUrl, newBooking);
  return request.then((response) => response.data);
};

const remove = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

export default {
  getAll,
  getByCarId,
  getByUserId,
  create,
  remove,
};
