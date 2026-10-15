/**
 * SIVU: Etusivu (Home)
 *
 * Tarkoitus:
 * Näyttää vuokrauspalvelun esittelyn ja linkin kaikkien autojen listaukseen.
 * Hakee autot ja esittää ne automaattisesti vaihtuvassa karusellissa,
 * josta voi siirtyä valitun auton tietoihin.
 *
 * Tiedonsiirto:
 * Home -> carService.getAll()
 *   Pyytää palvelimelta autojen tiedot ja tallentaa ne cars-tilaan.
 * Palvelin -> Home
 *   Palauttaa autolistan; virhetilanteessa virhe kirjataan konsoliin.
 * Home -> Cars (/cars)
 *   Siirtyy kaikkien vuokra-autojen listaukseen.
 * Home -> CarDetails (/cars/:id)
 *   Siirtyy valitun auton tietosivulle auton tunnisteen perusteella.
 *
 * Keskeiset tiedot:
 * cars = palvelimelta haettujen autojen lista. car.image = auton kuva,
 * carPlaceholder = varakuva puuttuvan kuvan tilalle, car.id = auton tunniste
 * ja car.price = vuorokausihinta. Karuselli näytetään vain, jos autoja löytyy.
 */

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import carService from "../services/cars";
import carPlaceholder from "../images/car-placeholder.png";

function Home() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    carService
      .getAll()
      .then((cars) => setCars(cars))
      .catch((error) => console.error("Autojen haku epäonnistui:", error));
  }, []);

  return (
    <main className="container py-4 py-md-5">
      {/* Pääsisältö */}
      <section className="bg-light rounded-4 p-4 p-md-5 mb-4">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-8">
            <h1 className="display-5 fw-bold mb-3">Vuokraa auto helposti</h1>

            <p className="fs-5 text-secondary mb-0">
              Kauppakassit ja muut pirssit löydät täältä.
            </p>
          </div>

          <div className="col-12 col-lg-4 d-flex justify-content-lg-end">
            <Link to="/cars" className="btn btn-primary btn-lg px-4 py-3">
              Selaa autoja
              <span className="ms-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Autot visuaalisena lisänä */}
      {cars.length > 0 && (
        <section className="mx-auto" style={{ maxWidth: "850px" }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 fw-semibold mb-0">Tutustu vuokra-autoihin</h2>

            <Link to="/cars" className="small text-decoration-none">
              Kaikki autot →
            </Link>
          </div>

          <div
            id="carCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="3500"
          >
            <div className="carousel-inner rounded-3">
              {cars.map((car, index) => (
                <div
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                  key={car.id}
                >
                  <Link
                    to={`/cars/${car.id}`}
                    className="d-block"
                    aria-label={`Tutustu autoon ${car.brand} ${car.model}`}
                  >
                    <img
                      src={car.image || carPlaceholder}
                      className="d-block w-100"
                      alt={`${car.brand} ${car.model}`}
                      style={{
                        height: "clamp(150px, 25vw, 220px)",
                        objectFit: "cover",
                      }}
                    />
                  </Link>

                  <div className="bg-white border border-top-0 rounded-bottom-3 px-3 py-3">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div className="min-w-0">
                        <h3 className="h6 fw-bold mb-1">
                          {car.brand} {car.model}
                        </h3>

                        <p className="small text-secondary mb-0">
                          {car.price} € / päivä
                        </p>
                      </div>

                      <Link
                        to={`/cars/${car.id}`}
                        className="btn btn-outline-primary btn-sm flex-shrink-0"
                      >
                        Tutustu
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cars.length > 1 && (
              <>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carCarousel"
                  data-bs-slide="prev"
                  aria-label="Edellinen auto"
                >
                  <span className="carousel-control-prev-icon" />
                </button>

                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carCarousel"
                  data-bs-slide="next"
                  aria-label="Seuraava auto"
                >
                  <span className="carousel-control-next-icon" />
                </button>
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;
