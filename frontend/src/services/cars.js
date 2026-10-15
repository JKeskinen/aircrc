/**
 * PALVELU: Autojen käsittely (cars)
 *
 * Tarkoitus:
 * Keskittää autojen hakeminen, lisääminen ja poistaminen frontendin ja
 * Express-backendin välillä. Käyttää Fetch APIa osoitteessa
 * http://localhost:3001/api/cars.
 *
 * Tiedonsiirto:
 * carService -> GET /api/cars
 *   Hakee kaikki autot ja palauttaa JSON-muotoiset tiedot.
 * carService -> POST /api/cars
 *   Lähettää uuden auton tiedot JSON-muodossa palvelimelle.
 * carService -> DELETE /api/cars/{id}
 *   Lähettää auton poistopyynnön auton tunnisteella.
 * Palvelin -> carService -> kutsuva komponentti
 *   Palauttaa vastauksen JSON-tiedot. Jos HTTP-vastaus ei ole onnistunut,
 *   toiminto hylätään virheellä.
 *
 * Parametrit:
 * newCar = lisättävän auton tiedot, id = poistettavan auton tunniste.
 * Palvelin vastaa tietojen pysyvästä tallennuksesta ja käsittelystä.
 */

const baseUrl = "http://localhost:3001/api/cars";

// Lisää auton backendille.
const create = (newCar) =>
  fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCar),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Auton lisääminen epäonnistui");
    }

    return response.json();
  });

// Hakee kaikki autot backendiltä.
const getAll = () => {
  return fetch(baseUrl).then((response) => {
    if (!response.ok) {
      throw new Error("Autojen haku epäonnistui");
    }

    return response.json();
  });
};

const remove = (id) =>
  fetch(`${baseUrl}/${id}`, { method: "DELETE" }).then((response) => {
    if (!response.ok) {
      throw new Error("Auton poistaminen epäonnistui");
    }

    return response.json();
  });

export default { getAll, create, remove };
