import { NavLink } from "react-router-dom";

function Navbar() {
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
              Varaukseni
            </NavLink>

            <NavLink to="/admin" className={navLinkClass}>
              Ylläpito
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
