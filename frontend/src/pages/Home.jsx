import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import carService from "../services/cars";

function Home() {
  const [cars, setCars] = useState([]);

  // Haetaan autot backendistä etusivun karusellia varten.
  useEffect(() => {
    carService
      .getAll()
      .then((cars) => setCars(cars))
      .catch((error) => console.error("Autojen haku epäonnistui:", error));
  }, []);

  // Haetaan autot backendistä ja näytetään ne karusellissa.
  // Käyttäjä voi siirtyä auton tietoihin kuvaa tai painiketta klikkaamalla.

  return (
    <main className="container py-5">
      <div className="p-5 mb-4 bg-light rounded-3">
        <h1 className="display-5 fw-bold">Vuokraa auto helposti</h1>
        <p className="col-md-8 fs-5">
          Kauppakassit ja muut pirssit löydät täältä.
        </p>
        <Link to="/cars" className="btn btn-primary btn-lg">
          Selaa autoja
        </Link>
      </div>

      {cars.length > 0 && (
        <section>
          <h2 className="mb-4">Tutustu vuokra-autoihin</h2>

          {/* Bootstrapin Carousel-komponentti esittelee vuokra-autot vaihtuvina kuvina. */}
          <div
            id="carCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="4000"
          >
            <div className="carousel-inner">
              {cars.map((car, index) => (
                <div
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                  key={car.id}
                >
                  <Link to={`/cars/${car.id}`}>
                    <img
                      src={car.image}
                      className="d-block w-100 rounded-4"
                      alt={`${car.brand} ${car.model}`}
                      style={{ height: "400px", objectFit: "cover" }}
                    />
                  </Link>

                  <div className="carousel-caption">
                    <h3>
                      {car.brand} {car.model}
                    </h3>
                    <p>{car.price} € / päivä</p>
                    <Link to={`/cars/${car.id}`} className="btn btn-primary">
                      Tutustu autoon
                    </Link>
                  </div>
                </div>
              ))}
            </div>

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
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;
