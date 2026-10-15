/**
 * KOMPONENTTI: Navigaatiopalkki (Navbar)
 *
 * Tarkoitus:
 * Näyttää sovelluksen yläreunassa navigaatiolinkit etusivulle, omiin tietoihin
 * ja varauksiin. Ylläpitäjälle näytetään lisäksi linkki hallintapaneeliin.
 * Aktiivinen sivu korostetaan, ja mobiilinäkymässä navigaatio voidaan avata
 * ja sulkea.
 *
 * Tiedonsiirto:
 * App -> Navbar({ isAdmin })
 *   Saa isAdmin-arvon props-parametrina sovelluksen pääkomponentilta.
 * Navbar -> React Router
 *   NavLink-komponentit ohjaavat käyttäjän valitulle sivulle:
 *   /, /mypage, /my-bookings tai ylläpitäjälle /admin.
 *
 * Keskeiset tiedot:
 * isAdmin = määrittää, näytetäänkö ylläpidon linkki ja käytetäänkö
 * varauslinkissä tekstiä "Varaukset" vai "Varaukseni".
 * navLinkClass() lisää aktiiviselle linkille active- ja fw-semibold-luokat.
 *
 * Komponentti ei hae eikä tallenna tietoja palvelimelle.
 */

import { NavLink } from "react-router-dom";
function Navbar({ isAdmin }) {
  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active fw-semibold" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container py-2">
        <NavLink to="/" className="navbar-brand fw-bold fs-3 text-danger">
          AirCrc
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Avaa navigaatio"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto text-end">
            <NavLink to="/" end className={navLinkClass}>
              Etusivu
            </NavLink>

            <NavLink to="/mypage" className={navLinkClass}>
              Omat tiedot
            </NavLink>

            <NavLink to="/my-bookings" className={navLinkClass}>
              {isAdmin ? "Varaukset" : "Varaukseni"}
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                Ylläpito
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
