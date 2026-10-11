import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import carService from "../services/cars";

function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carService
      .getAll()
      .then((cars) => {
        const foundCar = cars.find((car) => car.id === Number(id));
        setCar(foundCar || null);
      })
      .catch(() => setError("Auton tietojen lataaminen epäonnistui."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="container py-5">
        <p>Ladataan auton tietoja...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-5">
        <p className="text-danger">{error}</p>
        <Link to="/cars" className="btn btn-primary">
          Takaisin autoihin
        </Link>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="container py-5">
        <h1>Autoa ei löytynyt</h1>
        <Link to="/cars" className="btn btn-primary">
          Takaisin autoihin
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <Link to="/cars" className="text-decoration-none">
        ← Takaisin autoihin
      </Link>

      <div className="row g-4 mt-2">
        <div className="col-12 col-lg-7">
          {car.image && (
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              className="img-fluid rounded w-100"
            />
          )}
        </div>

        <div className="col-12 col-lg-5">
          <h1>
            {car.brand} {car.model}
          </h1>

          <p className="text-secondary">Vuosimalli {car.year}</p>
          <p>{car.description}</p>

          <hr />

          <p>Henkilömäärä: {car.seats}</p>
          <p>Vaihteisto: {car.transmission}</p>
          <p>Polttoaine: {car.fuel}</p>

          <p className="fs-4 fw-bold">
            {car.price} € <small className="fs-6 text-secondary">/ päivä</small>
          </p>

          <Link
            to={`/booking/${car.id}`}
            className="btn btn-primary btn-lg w-100"
          >
            Varaa auto
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CarDetails;
