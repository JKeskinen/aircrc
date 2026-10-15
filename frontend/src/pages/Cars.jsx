/**
 * SIVU: Vuokra-autojen listaus (Cars)
 *
 * Tarkoitus:
 * Näyttää kaikki vuokrattavat autot korttinäkymässä. Korteissa esitetään
 * auton kuva, merkki, malli, vuosimalli, henkilömäärä, vaihteisto,
 * polttoaine ja päivähinta. Linkistä siirrytään auton tarkempiin tietoihin.
 *
 * Tiedonsiirto:
 * Cars -> carService.getAll()
 *   Pyytää palvelimelta kaikki autot ja tallentaa vastauksen cars-tilaan.
 * Palvelin -> Cars
 *   Palauttaa autojen tiedot tai virheen, joka näytetään käyttäjälle.
 * Cars -> CarDetails (/cars/:id)
 *   Siirtyy valitun auton tietosivulle auton id-tunnisteen perusteella.
 *
 * Keskeiset tiedot:
 * cars = palvelimelta haettujen autojen lista, error = autojen lataamisen
 * virheilmoitus. Autokorttien sisältö muodostetaan cars-listan tiedoista.
 */

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import carService from "../services/cars";

function Cars() {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    carService
      .getAll()
      .then((cars) => setCars(cars))
      .catch(() => setError("Autojen lataaminen epäonnistui"));
  }, []);

  if (error) {
    return (
      <main className="container py-5">
        <p className="text-danger">{error}</p>
      </main>
    );
  }
  return (
    <main className="container py-5">
      <main className="container py-5">
        <Link to="/" className="text-decoration-none">
          ← Takaisin etusivulle
        </Link>
      </main>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Vuokra-autot</h1>
          <p className="text-secondary mb-0">Löydä sopiva auto matkallesi.</p>
        </div>
        <span className="badge text-bg-secondary">{cars.length} autoa</span>
      </div>

      <div className="row g-4">
        {cars.map((car) => (
          <div className="col-12 col-md-6 col-lg-4" key={car.id}>
            <div className="card h-100">
              <img
                src={car.image}
                className="card-img-top"
                alt={`${car.brand} ${car.model}`}
              />
              {/* Kuvan alle tuleva tietokortti */}
              <div className="card-body">
                <div className="row g-2">
                  {/* VASEN PUOLI */}
                  <div className="col-6">
                    <h5 className="card-title">
                      {car.brand} {car.model}
                    </h5>
                    <p className="text-secondary mb-0">Vuosimalli {car.year}</p>
                  </div>

                  {/* OIKEA PUOLI */}
                  <div className="col-6">
                    <ul className="list-unstyled mb-0">
                      <li>Henkilömäärä: {car.seats}</li>
                      <li>Vaihteisto: {car.transmission}</li>
                      <li>Polttoaine: {car.fuel}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <p className="fs-5 fw-bold mb-3">
                  {car.price} €{" "}
                  <small className="text-secondary fs-6">/ päivä</small>
                </p>

                <div>
                  <Link
                    to={`/cars/${car.id}`}
                    className="btn btn-primary w-100"
                  >
                    Katso lisätiedot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Cars;
