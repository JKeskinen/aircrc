import { Link } from "react-router-dom";
import carService from "../services/cars";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import * as bootstrap from "bootstrap"; // Import bootstrap if using npm
import "bootstrap/dist/css/bootstrap.min.css";

function Booking() {
  const { id } = useParams();
  const buttonRef = useRef(null);
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);
  const car = cars.find((car) => car.id === Number(id));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const totalDays =
    startDate && endDate
      ? (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      : 0;

  useEffect(() => {
    if (buttonRef.current) {
      new bootstrap.Datepicker(buttonRef.current, {
        selectionMode: "multiple-ranged",
        displayElement: "#date-display",
      });
    }

    carService
      .getAll()
      .then((cars) => setCars(cars))
      .catch(() => setError("Autojen lataaminen epäonnistui"));
  }, []);

  return (
    <main className="container py-5">
      {error && <p className="text-danger">{error}</p>}
      <Link to="/cars" className="text-decoration-none">
        ← Takaisin autoihin
      </Link>

      {car ? (
        <div>
          <h1>
            Varaa {car.brand} {car.model}
          </h1>
          <p>{car.price} € / päivä</p>
          <table>
            <div className="mb-3">
              <label htmlFor="startDate" className="form-label">
                Vuokrauksen alkupäivä
              </label>
              <input
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                id="startDate"
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="endDate" className="form-label">
                Palautuspäivä
              </label>
              <input
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                id="endDate"
                className="form-control"
              />
            </div>
          </table>
          <table>
            <div>Yhteensä: {car.price * totalDays}€</div>
          </table>
        </div>
      ) : (
        !error && <p>Ladataan auton tietoja...</p>
      )}
    </main>
  );
}
export default Booking;
