/**
 * SIVU: Oma sivu (MyPage)
 *
 * Tarkoitus:
 * Näyttää valitun käyttäjän asiakastiedot, osoitteen ja käyttäjäroolin.
 * Sivulta pääsee tarkastelemaan ja hallitsemaan omia autovarauksia.
 *
 * Tiedonsiirto:
 * App -> MyPage(currentUser)
 *   Välittää nykyisen käyttäjän tiedot komponentille props-parametrina.
 * MyPage -> MyBookings (/my-bookings)
 *   Siirtyy omien varausten näkymään.
 *
 * Keskeiset tiedot:
 * currentUser = käyttäjän tiedot, name = nimi, auth = käyttäjärooli,
 * streetAddress / address = osoite, postalCode = postinumero ja
 * city = paikkakunta.
 *
 * Jos käyttäjää ei ole valittu, näytetään ilmoitus ja linkki etusivulle.
 * Sivulla ei haeta eikä tallenneta tietoja suoraan palvelimelle.
 */

import { Link } from "react-router-dom";

function MyPage({ currentUser }) {
  // Jos currentUser puuttuu (ei pitäisi tapahtua), näytetään varaviesti
  if (!currentUser) {
    return (
      <main className="container py-5">
        <p>Käyttäjää ei ole valittu.</p>
        <Link to="/">Takaisin etusivulle</Link>
      </main>
    );
  }

  const { name, auth, address, streetAddress, postalCode, city } = currentUser;

  // Tukee sekä address- että streetAddress-kenttää
  const osoite = address || "";

  return (
    <main className="container py-4 py-md-5">
      <header className="mb-4">
        <Link to="/" className="text-decoration-none">
          ← Takaisin etusivulle
        </Link>
        <h1 className="h2 fw-bold mt-3 mb-0">Oma sivu</h1>
      </header>

      <div className="row g-4">
        {/* Asiakkaan yhteystiedot */}
        <section className="col-12 col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 fw-semibold mb-3">Asiakastietosi</h2>

              <address className="mb-0">
                <strong className="d-block mb-1">{name}</strong>
                <span className="d-block text-secondary mb-2">
                  {auth === "admin" ? "Ylläpitäjä" : "Asiakas"}
                </span>
                {osoite && <span className="d-block">Osoite: {osoite}</span>}
                <span className="d-block">
                  {postalCode} {city}
                </span>
              </address>
            </div>
          </div>
        </section>

        {/* Asiakkaan varaukset */}
        <section className="col-12 col-lg-8">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 fw-semibold mb-3">Varaukseni</h2>

              <p className="text-secondary mb-3">
                Tarkastele ja hallitse omia autovarauksiasi.
              </p>

              <Link to="/my-bookings" className="btn btn-primary">
                Siirry varauksiin
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MyPage;
