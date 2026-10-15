/**
 * SOVELLUKSEN PÄÄKOMPONENTTI (App)
 *
 * Käynnistetään npm run dev
 *
 * Tarkoitus:
 * Hallitsee käyttäjän valintaa, käyttäjätietojen lataamista ja sovelluksen
 * sivureititystä. Näyttää käyttäjän valintanäkymän ennen varsinaista
 * sovellusta ja välittää valitun käyttäjän tiedot niitä tarvitseville
 * sivuille. Ylläpitäjän oikeudet määräytyvät käyttäjän auth-kentän perusteella.
 *
 * Tiedonsiirto:
 * App -> userService.getAll()
 *   Pyytää backendiltä kaikki käyttäjät.
 * Palvelin -> App
 *   Palauttaa käyttäjälistan tai virheen, joka näytetään käyttäjälle.
 * App -> Navbar
 *   Välittää isAdmin-tiedon navigoinnin näyttämistä varten.
 * App -> CarDetails / Booking / MyPage / MyBookings
 *   Välittää currentUser-tiedon sivuille, jotka tarvitsevat käyttäjän tietoja.
 * App -> Admin
 *   Sallii hallintanäkymän vain ylläpitäjälle; muut ohjataan etusivulle.
 *
 * Keskeiset tiedot:
 * users = backendiltä haetut käyttäjät, currentUser = valittu käyttäjä,
 * usersLoading = latauksen tila, usersError = latausvirhe ja
 * isAdmin = tieto siitä, onko valittu käyttäjä ylläpitäjä.
 * Routes määrittää sivujen URL-osoitteet ja NotFound näyttää tuntemattoman
 * reitin virhesivun. Käyttäjän vaihtaminen palauttaa valintanäkymään.
 */

import { useEffect, useState } from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import CarDetails from "./pages/CarDetails";
import Cars from "./pages/Cars";
import Home from "./pages/Home";
import MyPage from "./pages/MyPage";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import MyBookings from "./pages/MyBookings";
import userService from "./services/users";
import "./styles/App.css";

function NotFound() {
  return (
    <main className="container py-5">
      <h1>Sivua ei löytynyt</h1>
      <Link to="/" className="btn btn-outline-primary">
        Etusivulle
      </Link>
    </main>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    userService
      .getAll()
      .then((users) => setUsers(users))
      .catch(() => setUsersError("Käyttäjien lataaminen epäonnistui."))
      .finally(() => setUsersLoading(false));
  }, []);

  const isAdmin = currentUser?.auth === "admin";

  if (!currentUser) {
    return (
      <main className="container min-vh-100 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-sm p-4"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <h1 className="h4 mb-3">Valitse käyttäjä</h1>

          <label htmlFor="userSelect" className="form-label">
            Käyttäjä
          </label>

          {usersLoading ? (
            <p className="mb-0">Ladataan käyttäjiä...</p>
          ) : usersError ? (
            <div className="text-danger" role="alert">
              {usersError}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-block mt-2"
                onClick={() => window.location.reload()}
              >
                Yritä uudelleen
              </button>
            </div>
          ) : (
            <select
              id="userSelect"
              className="form-select mb-3"
              value=""
              onChange={(event) => {
                const selectedUser = users.find(
                  (user) => String(user.id) === event.target.value,
                );
                setCurrentUser(selectedUser ?? null);
              }}
            >
              <option value="">Valitse käyttäjä...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar isAdmin={isAdmin} />

      <div className="container py-2 d-flex align-items-center gap-2">
        <span className="text-secondary small">
          Käyttäjä: {currentUser.name}
        </span>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm ms-auto"
          onClick={() => setCurrentUser(null)}
        >
          Vaihda käyttäjää
        </button>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route
          path="/cars/:id"
          element={<CarDetails currentUser={currentUser} />}
        />

        {/* currentUser välitetään MyPage-komponentille */}
        <Route path="/mypage" element={<MyPage currentUser={currentUser} />} />

        <Route
          path="/booking/:id"
          element={<Booking currentUser={currentUser} />}
        />
        <Route
          path="/my-bookings"
          element={<MyBookings currentUser={currentUser} isAdmin={isAdmin} />}
        />
        <Route
          path="/admin"
          element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
