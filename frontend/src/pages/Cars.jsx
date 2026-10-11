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
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  {car.brand} {car.model}
                </h5>

                <p className="text-secondary mb-3">Vuosimalli {car.year}</p>

                <ul className="list-unstyled">
                  <li>Henkilömäärä: {car.seats}</li>
                  <li>Vaihteisto: {car.transmission}</li>
                  <li>Polttoaine: {car.fuel}</li>
                </ul>

                <div className="mt-auto">
                  <p className="fs-5 fw-bold mb-3">
                    {car.price} €{" "}
                    <small className="text-secondary fs-6">/ päivä</small>
                  </p>

                  <Link
                    to={`/cars/${car.id}`}
                    className="btn btn-primary w-100"
                  >
                    Katso auto
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
