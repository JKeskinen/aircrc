/**
 * SIVU: Hallintapaneeli (Admin)
 *
 * Tarkoitus:
 * Hallintapaneelissa voidaan:
 * - lisätä uusia vuokra-autoja
 * - poistaa olemassa olevia autoja
 * - tarkastella ja poistaa varauksia
 *
 * Auton teknisiä tietoja ei syötetä käsin, vaan ne haetaan
 * all.json-tiedostosta backendin API-rajapinnan kautta.
 *
 * AUTON LISÄYKSEN TIEDONKULKU:
 *
 * 1. GET /api/vehicle-makes
 *    Hakee valmistajat.
 *
 * 2. GET /api/vehicle-makes/:make/models
 *    Hakee valitun valmistajan mallit.
 *
 * 3. GET /api/vehicle-makes/:make/models/:model
 *    Hakee valitun mallin sukupolvet ja moottorivaihtoehdot.
 *
 * 4. Käyttäjä valitsee sukupolven, vuosimallin ja moottorin.
 *    Teknisiä tietoja näytetään automaattisesti.
 *
 * 5. POST /api/cars
 *    Lähettää auton valinnat ja vuokraustiedot backendille.
 *    Backend hakee tekniset tiedot uudelleen all.json-tiedostosta
 *    ja tallentaa auton cars.json-tiedostoon.
 *
 * KÄYTTÄJÄN TÄYTTÄMÄT TIEDOT:
 * - Päivähinta
 * - Paikkamäärä
 * - Kuvan URL
 * - Kuvaus
 *
 * AUTOMAATTISESTI HAETTAVAT TIEDOT:
 * - Valmistaja ja malli
 * - Sukupolvi ja vuosimalli
 * - Moottori ja käyttövoima
 * - Vaihteisto, teho ja iskutilavuus
 * - Kulutus, vääntö, vetotapa ja muut saatavilla olevat tekniset tiedot
 *
 * MUUT TOIMINNOT:
 * Autojen poistaminen ja varausten hallinta käyttävät nykyisiä
 * carService-, bookingsService- ja userService-palveluita.
 */

import { useEffect, useState } from "react";
import carService from "../services/cars";
import bookingsService from "../services/booking";
import userService from "../services/users";
import carPlaceholder from "../images/car-placeholder.png";
import "../styles/Admin.css";

const API_URL = "http://localhost:3001/api";
const VEHICLE_API_URL = `${API_URL}/vehicle-makes`;

/**
 * Tyhjän auton tiedot.
 *
 * generation ja engineLabel ovat all.json-tiedostosta valittavia arvoja.
 * Tekniset tiedot haetaan valitusta moottorista, eikä niitä tarvitse
 * syöttää lomakkeella käsin.
 */
const emptyCar = {
  brand: "",
  model: "",
  generation: "",
  engineLabel: "",
  year: "",
  price: "",
  seats: "5",
  image: "",
  description: "",
};

/**
 * Päivämäärän muotoilu suomalaiseen esitystapaan.
 */
const formatDate = (dateString) => {
  if (!dateString) return "Ei päivämäärää";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "Ei päivämäärää";

  return date.toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

/**
 * Näyttää teknisen arvon luettavasti.
 * Puuttuvia arvoja ei keksitä.
 */
const displayValue = (value, suffix = "") => {
  if (value === null || value === undefined || value === "") {
    return "Ei ilmoitettu";
  }

  return `${value}${suffix}`;
};

/**
 * Muodostaa moottorin teknisistä tiedoista näytettävät kentät.
 * Tiedot ovat peräisin all.json-tiedoston moottoritietueesta.
 */
const getEngineDetails = (engine) => {
  if (!engine) return [];

  return [
    {
      label: "Moottori",
      value: engine.label,
    },
    {
      label: "Käyttövoima",
      value: engine.fuelType,
    },
    {
      label: "Sylinterit",
      value: displayValue(engine.cylinders),
    },
    {
      label: "Iskutilavuus",
      value:
        engine.displacementCc == null
          ? "Ei ilmoitettu"
          : `${engine.displacementCc.toLocaleString("fi-FI")} cm³`,
    },
    {
      label: "Teho",
      value: engine.powerHp == null ? "Ei ilmoitettu" : `${engine.powerHp} hv`,
    },
    {
      label: "Vääntö",
      value:
        engine.torqueNm == null ? "Ei ilmoitettu" : `${engine.torqueNm} Nm`,
    },
    {
      label: "Vaihteisto",
      value: engine.transmission,
    },
    {
      label: "Vetotapa",
      value: engine.drivetrain,
    },
    {
      label: "0–100 km/h",
      value:
        engine.zeroToHundredKmhS == null
          ? "Ei ilmoitettu"
          : `${engine.zeroToHundredKmhS} s`,
    },
    {
      label: "Huippunopeus",
      value:
        engine.topSpeedKmh == null
          ? "Ei ilmoitettu"
          : `${engine.topSpeedKmh} km/h`,
    },
    {
      label: "Yhdistetty kulutus",
      value:
        engine.fuelEconomyCombinedL100 == null
          ? "Ei ilmoitettu"
          : `${engine.fuelEconomyCombinedL100} l/100 km`,
    },
    {
      label: "Pituus",
      value:
        engine.lengthMm == null ? "Ei ilmoitettu" : `${engine.lengthMm} mm`,
    },
    {
      label: "Leveys",
      value: engine.widthMm == null ? "Ei ilmoitettu" : `${engine.widthMm} mm`,
    },
    {
      label: "Korkeus",
      value:
        engine.heightMm == null ? "Ei ilmoitettu" : `${engine.heightMm} mm`,
    },
    {
      label: "Akseliväli",
      value:
        engine.wheelbaseMm == null
          ? "Ei ilmoitettu"
          : `${engine.wheelbaseMm} mm`,
    },
    {
      label: "Omamassa",
      value:
        engine.curbWeightKg == null
          ? "Ei ilmoitettu"
          : `${engine.curbWeightKg} kg`,
    },
  ];
};

const Admin = () => {
  // Autonlisäyslomakkeen tiedot.
  const [newCar, setNewCar] = useState(emptyCar);

  // All.json-tiedostosta haettavat valintalistat.
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [generations, setGenerations] = useState([]);

  // Valittu mallin sukupolvi ja moottori.
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);

  // Hallintapaneelin muut tiedot.
  const [action, setAction] = useState("");
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  // Käyttöliittymän ilmoitukset ja lataustilat.
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingCar, setSavingCar] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [deletingAllBookings, setDeletingAllBookings] = useState(false);

  /**
   * Haetaan valmistajat kerran komponentin avautuessa.
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadMakes = async () => {
      setLoadingMakes(true);

      try {
        const response = await fetch(VEHICLE_API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Valmistajien hakeminen epäonnistui.");
        }

        const data = await response.json();
        setMakes(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Valmistajien hakeminen epäonnistui.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingMakes(false);
        }
      }
    };

    loadMakes();

    return () => controller.abort();
  }, []);

  /**
   * Haetaan valitun valmistajan mallit.
   *
   * Kun valmistaja vaihtuu, vanha malli, sukupolvi ja moottori
   * tyhjennetään, jotta eri valmistajien tiedot eivät sekoitu.
   */
  useEffect(() => {
    if (!newCar.brand) {
      setModels([]);
      return;
    }

    const controller = new AbortController();

    const loadModels = async () => {
      setLoadingModels(true);
      setModels([]);

      try {
        const response = await fetch(
          `${VEHICLE_API_URL}/${encodeURIComponent(newCar.brand)}/models`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Mallien hakeminen epäonnistui.");
        }

        setModels(await response.json());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Mallien hakeminen epäonnistui.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingModels(false);
        }
      }
    };

    loadModels();

    return () => controller.abort();
  }, [newCar.brand]);

  /**
   * Valmistajan tai mallin vaihtaminen nollaa vanhat tekniset valinnat.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setNotice("");

    if (name === "brand") {
      setNewCar({
        ...emptyCar,
        brand: value,
      });

      setModels([]);
      setGenerations([]);
      setSelectedGeneration(null);
      setSelectedEngine(null);
      return;
    }

    if (name === "model") {
      setNewCar((previous) => ({
        ...previous,
        model: value,
        generation: "",
        engineLabel: "",
        year: "",
      }));

      setGenerations([]);
      setSelectedGeneration(null);
      setSelectedEngine(null);
      return;
    }

    if (name === "generation") {
      const generation = generations.find((item) => item.name === value);

      setSelectedGeneration(generation || null);
      setSelectedEngine(null);

      setNewCar((previous) => ({
        ...previous,
        generation: value,
        engineLabel: "",
        year: generation?.yearStart ? String(generation.yearStart) : "",
      }));

      return;
    }

    if (name === "year") {
      setNewCar((previous) => ({
        ...previous,
        year: value,
      }));

      return;
    }

    if (name === "engineLabel") {
      const engine = selectedGeneration?.engines?.find(
        (item) => item.label === value,
      );

      setSelectedEngine(engine || null);

      setNewCar((previous) => ({
        ...previous,
        engineLabel: value,
      }));

      return;
    }

    // Päivähinta, paikkamäärä, kuvan URL ja kuvaus.
    setNewCar((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /**
   * Hakee mallin koko tietueen backendiltä.
   *
   * API palauttaa mallin yearStart-, yearEnd- ja generations-tiedot.
   * Näiden sukupolvien sisällä ovat moottorivaihtoehdot.
   */
  const handleModelSelect = async (event) => {
    const modelName = event.target.value;

    handleChange(event);

    if (!modelName || !newCar.brand) {
      setGenerations([]);
      return;
    }

    setLoadingDetails(true);
    setError("");

    try {
      const response = await fetch(
        `${VEHICLE_API_URL}/${encodeURIComponent(newCar.brand)}/models/${encodeURIComponent(modelName)}`,
      );

      if (!response.ok) {
        throw new Error("Automallin tietojen hakeminen epäonnistui.");
      }

      const modelData = await response.json();

      // Sukupolvet sisältävät vuosirajat ja moottorit.
      const availableGenerations = Array.isArray(modelData.generations)
        ? modelData.generations
        : [];

      setGenerations(availableGenerations);

      if (availableGenerations.length === 0) {
        setError("Tälle mallille ei löytynyt sukupolvi- tai moottoritietoja.");
      }
    } catch (err) {
      setGenerations([]);
      setError(err.message || "Automallin tietojen hakeminen epäonnistui.");
    } finally {
      setLoadingDetails(false);
    }
  };

  /**
   * Muodostaa vuosimallivaihtoehdot valitun sukupolven vuosirajoista.
   * Tulevaisuuden vuosimalleja ei tarjota, jos lähdedata sisältää sellaisia.
   */

  /**
   * Muodostaa vuosimallivaihtoehdot sukupolven vuosirajoista.
   * Jos yearEnd puuttuu tai on null, käytetään kuluvaa vuotta.
   */
  const years = (() => {
    if (!selectedGeneration) {
      return [];
    }

    const startYear = Number(selectedGeneration.yearStart);
    const currentYear = new Date().getFullYear();

    // Jos päättymisvuotta ei ole määritetty, sukupolvi on edelleen tuotannossa.
    const endYear =
      selectedGeneration.yearEnd == null || selectedGeneration.yearEnd === ""
        ? currentYear
        : Math.min(Number(selectedGeneration.yearEnd), currentYear);

    // Varmistetaan, että vuosirajat ovat kelvolliset.
    if (
      !Number.isInteger(startYear) ||
      startYear <= 0 ||
      !Number.isInteger(endYear) ||
      endYear < startYear
    ) {
      return [];
    }

    // Näytetään uusimmat vuosimallit ensin.
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, index) => endYear - index,
    );
  })();

  /**
   * Hakee varaajan nimen userId:n perusteella.
   */
  const getUserName = (userId) => {
    const user = users.find((item) => String(item.id) === String(userId));
    return user?.name || "Tuntematon";
  };

  /**
   * Näyttää autot poistamista varten.
   */
  const handleShowDelete = async () => {
    setAction("delete");
    setError("");
    setNotice("");

    try {
      setCars(await carService.getAll());
    } catch {
      setError("Autojen hakeminen epäonnistui.");
    }
  };

  /**
   * Hakee varaukset, autot ja käyttäjät.
   */
  const handleShowBookings = async () => {
    setAction("bookings");
    setError("");
    setNotice("");
    setBookingsLoading(true);

    try {
      const [bookingData, carData, userData] = await Promise.all([
        bookingsService.getAll(),
        carService.getAll(),
        userService.getAll(),
      ]);

      setCars(carData);
      setUsers(userData);

      const sortedBookings = [...bookingData].sort((a, b) =>
        String(b.startDate || "").localeCompare(String(a.startDate || "")),
      );

      setBookings(sortedBookings);
    } catch {
      setError("Varausten, autojen tai käyttäjien hakeminen epäonnistui.");
    } finally {
      setBookingsLoading(false);
    }
  };

  /**
   * Tallentaa uuden auton.
   *
   * Backend tarkistaa sukupolven, vuosimallin ja moottorin all.jsonista.
   * Lomake ei lähetä itse muodostettuja teknisiä tietoja luotettuina,
   * vaan backend hakee ne lähdetiedostosta uudelleen.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setNotice("");

    if (!selectedGeneration || !selectedEngine) {
      setError("Valitse ensin automallin sukupolvi ja moottori.");
      return;
    }

    if (!years.includes(Number(newCar.year))) {
      setError("Valitse valitun sukupolven sallittu vuosimalli.");
      return;
    }

    if (!newCar.image.trim()) {
      setError("Anna auton kuvan URL-osoite.");
      return;
    }

    const price = Number(newCar.price);
    const seats = Number(newCar.seats);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Anna päivähinnaksi positiivinen luku.");
      return;
    }

    if (!Number.isInteger(seats) || seats < 1) {
      setError("Anna kelvollinen paikkamäärä.");
      return;
    }

    const carToAdd = {
      brand: newCar.brand,
      model: newCar.model,
      generation: newCar.generation,
      year: Number(newCar.year),
      engineLabel: newCar.engineLabel,
      price,
      seats,
      image: newCar.image.trim(),
      description: newCar.description.trim(),
    };

    setSavingCar(true);

    try {
      const addedCar = await carService.create(carToAdd);

      setCars((previous) => [...previous, addedCar]);
      setNewCar(emptyCar);
      setModels([]);
      setGenerations([]);
      setSelectedGeneration(null);
      setSelectedEngine(null);

      setNotice("Auto lisätty onnistuneesti.");
    } catch (err) {
      setError(err.message || "Auton lisääminen epäonnistui.");
    } finally {
      setSavingCar(false);
    }
  };

  /**
   * Poistaa yksittäisen auton.
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän auton?")) return;

    setError("");
    setNotice("");

    try {
      await carService.remove(id);

      setCars((previous) =>
        previous.filter((car) => String(car.id) !== String(id)),
      );

      setNotice("Auto poistettu.");
    } catch (err) {
      setError(err.message || "Auton poistaminen epäonnistui.");
    }
  };

  /**
   * Poistaa yksittäisen varauksen.
   */
  const handleDeleteBooking = async (booking) => {
    const car = cars.find((item) => String(item.id) === String(booking.carId));

    const carName = car
      ? `${car.brand || car.make || ""} ${car.model || ""}`.trim()
      : `Auto ${booking.carId}`;

    const confirmed = window.confirm(
      `Haluatko varmasti poistaa tämän varauksen?\n\n` +
        `Auto: ${carName}\n` +
        `Varaaja: ${getUserName(booking.userId)}\n` +
        `Ajankohta: ${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}\n` +
        `Hinta: ${Number(booking.totalPrice || 0).toFixed(2)} €`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingBookingId(booking.id);

    try {
      await bookingsService.remove(booking.id);

      setBookings((previous) =>
        previous.filter((item) => item.id !== booking.id),
      );

      setNotice("Varaus poistettu onnistuneesti.");
    } catch (err) {
      setError(err.message || "Varauksen poistaminen epäonnistui.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  /**
   * Poistaa kaikki varaukset yksi kerrallaan.
   */
  const handleDeleteAllBookings = async () => {
    if (bookings.length === 0) {
      setNotice("Poistettavia varauksia ei ole.");
      return;
    }

    const confirmed = window.confirm(
      `VAROITUS: Haluatko varmasti poistaa KAIKKI ${bookings.length} varausta?\n\n` +
        "Toimintoa ei voi peruuttaa.",
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingAllBookings(true);

    try {
      for (const booking of bookings) {
        await bookingsService.remove(booking.id);
      }

      setBookings([]);
      setNotice("Kaikki varaukset poistettiin.");
    } catch {
      setError(
        "Kaikkien varausten poistaminen ei onnistunut. Päivitetään varauslista.",
      );

      try {
        setBookings(await bookingsService.getAll());
      } catch {
        setError(
          "Varausten poistaminen tai varauslistan päivittäminen epäonnistui.",
        );
      }
    } finally {
      setDeletingAllBookings(false);
    }
  };

  // Valitun moottorin tekniset tiedot näyttöä varten.
  const engineDetails = getEngineDetails(selectedEngine);

  return (
    <main className="admin-page">
      <h1>Hallintapaneeli</h1>

      <p>Tällä sivulla pystyt:</p>
      <p>
        Lisäämään ja poistamaan ajoneuvoja. Auton tietoja ei voi muuttaa
        lisäämisen jälkeen.
      </p>
      <p>Tarkastelemaan ja poistamaan käyttäjien varauksia.</p>

      {/* Hallintapaneelin toimintopainikkeet */}
      <div className="admin-actions">
        <button
          className="car-form__button"
          type="button"
          onClick={() => {
            setAction("add");
            setError("");
            setNotice("");
          }}
        >
          Lisää auto
        </button>

        <button
          className="car-form__button"
          type="button"
          onClick={handleShowDelete}
        >
          Poista auto
        </button>

        <button
          className="car-form__button"
          type="button"
          onClick={handleShowBookings}
        >
          Poista varaus
        </button>
      </div>

      {/* Yleiset virhe- ja onnistumisviestit */}
      {error && (
        <p className="text-danger" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="text-success" role="status">
          {notice}
        </p>
      )}

      {/* ================================================================
          LISÄÄ AUTO
          ================================================================ */}
      {action === "add" && (
        <form className="car-form" onSubmit={handleSubmit}>
          <h2 className="car-form__title">Lisää auto</h2>

          {/* Valmistaja haetaan all.json-tiedoston valmistajista */}
          <label htmlFor="car-brand">Valmistaja</label>
          <select
            id="car-brand"
            className="car-form__input"
            name="brand"
            value={newCar.brand}
            onChange={handleChange}
            required
          >
            <option value="">
              {loadingMakes ? "Ladataan valmistajia..." : "Valitse valmistaja"}
            </option>

            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>

          {/* Mallilista päivittyy valmistajan valinnan perusteella */}
          <label htmlFor="car-model">Malli</label>
          <select
            id="car-model"
            className="car-form__input"
            name="model"
            value={newCar.model}
            onChange={handleModelSelect}
            required
            disabled={!newCar.brand || loadingModels}
          >
            <option value="">
              {loadingModels ? "Ladataan malleja..." : "Valitse malli"}
            </option>

            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          {/* Sukupolvet haetaan valitun mallin tietueesta */}
          <label htmlFor="car-generation">Sukupolvi</label>
          <select
            id="car-generation"
            className="car-form__input"
            name="generation"
            value={newCar.generation}
            onChange={handleChange}
            required
            disabled={!generations.length || loadingDetails}
          >
            <option value="">
              {loadingDetails
                ? "Ladataan mallin tietoja..."
                : "Valitse sukupolvi"}
            </option>

            {generations.map((generation) => (
              <option key={generation.name} value={generation.name}>
                {generation.name} ({generation.yearStart}–{generation.yearEnd})
              </option>
            ))}
          </select>

          {/* Vuosimallit rajataan valitun sukupolven mukaan */}
          <label htmlFor="car-year">Vuosimalli</label>
          <select
            id="car-year"
            className="car-form__input"
            name="year"
            value={newCar.year}
            onChange={handleChange}
            required
            disabled={!selectedGeneration || years.length === 0}
          >
            <option value="">Valitse vuosimalli</option>

            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Moottorivaihtoehdot kuuluvat valitulle sukupolvelle */}
          <label htmlFor="car-engine">Moottori</label>
          <select
            id="car-engine"
            className="car-form__input"
            name="engineLabel"
            value={newCar.engineLabel}
            onChange={handleChange}
            required
            disabled={!selectedGeneration}
          >
            <option value="">Valitse moottori</option>

            {(selectedGeneration?.engines || []).map((engine) => (
              <option key={engine.label} value={engine.label}>
                {engine.label}
              </option>
            ))}
          </select>

          {/* Automaattisesti täyttyvät tekniset tiedot */}
          {selectedEngine && (
            <section className="car-technical-details">
              <h3>Auton tekniset tiedot</h3>

              <dl>
                {engineDetails.map((detail) => (
                  <div key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{displayValue(detail.value)}</dd>
                  </div>
                ))}
              </dl>

              {/* Mahdolliset lähteen tarkemmat lisätiedot */}
              {selectedEngine.specs &&
                Object.keys(selectedEngine.specs).length > 0 && (
                  <details>
                    <summary>Muut tekniset tiedot</summary>

                    <dl>
                      {Object.entries(selectedEngine.specs).map(
                        ([key, value]) => (
                          <div key={key}>
                            <dt>{key}</dt>
                            <dd>{displayValue(value)}</dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </details>
                )}
            </section>
          )}

          {/* Vuokraustiedot täytetään itse */}
          <label htmlFor="car-price">Päivähinta (€)</label>
          <input
            id="car-price"
            className="car-form__input"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Päivähinta euroina"
            value={newCar.price}
            onChange={handleChange}
            required
          />

          <label htmlFor="car-seats">Paikkamäärä</label>
          <input
            id="car-seats"
            className="car-form__input"
            name="seats"
            type="number"
            min="1"
            step="1"
            placeholder="Paikkoja"
            value={newCar.seats}
            onChange={handleChange}
            required
          />

          <label htmlFor="car-image">Kuvan URL</label>
          <input
            id="car-image"
            className="car-form__input"
            name="image"
            type="url"
            placeholder="https://..."
            value={newCar.image}
            onChange={handleChange}
            required
          />

          <label htmlFor="car-description">Kuvaus</label>
          <textarea
            id="car-description"
            className="car-form__textarea"
            name="description"
            placeholder="Kirjoita auton kuvaus"
            value={newCar.description}
            onChange={handleChange}
          />

          {/* Tallennus estetään pyynnön ajaksi */}
          <button
            className="car-form__button"
            type="submit"
            disabled={savingCar || loadingDetails}
          >
            {savingCar ? "Tallennetaan autoa..." : "Tallenna auto"}
          </button>
        </form>
      )}

      {/* ================================================================
          POISTA AUTO
          ================================================================ */}
      {action === "delete" && (
        <section className="container py-5">
          <h2 className="mb-4">Nykyiset autot</h2>

          {cars.length === 0 ? (
            <p>Autoja ei löytynyt.</p>
          ) : (
            <div className="row g-4">
              {cars.map((car) => (
                <div className="col-12 col-md-6 col-lg-4" key={car.id}>
                  <div className="card h-100">
                    <img
                      src={car.image || carPlaceholder}
                      className="card-img-top"
                      alt={`${car.brand || car.make} ${car.model}`}
                      style={{ height: "220px", objectFit: "cover" }}
                    />

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">
                        {car.brand || car.make} {car.model}
                      </h5>

                      <p className="text-secondary mb-3">
                        Vuosimalli {car.year}
                      </p>

                      <ul className="list-unstyled">
                        <li>Paikkoja: {car.seats ?? "Ei ilmoitettu"}</li>
                        <li>
                          Moottori:{" "}
                          {car.engine || car.engineLabel || "Ei ilmoitettu"}
                        </li>
                        <li>
                          Vaihteisto: {car.transmission || "Ei ilmoitettu"}
                        </li>
                        <li>
                          Käyttövoima:{" "}
                          {car.fuel || car.fuelType || "Ei ilmoitettu"}
                        </li>
                      </ul>

                      <p className="fs-5 fw-bold mt-auto mb-3">
                        {car.price} €{" "}
                        <small className="text-secondary fs-6">/ päivä</small>
                      </p>

                      <button
                        className="btn btn-danger w-100"
                        type="button"
                        onClick={() => handleDelete(car.id)}
                      >
                        Poista auto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================================================================
          VARAUSTEN HALLINTA
          ================================================================ */}
      {action === "bookings" && (
        <section className="container-fluid py-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="h4 mb-1">Varausten hallinta</h2>
              <p className="text-secondary mb-0">
                Varauksia yhteensä: {bookings.length}
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleShowBookings}
                disabled={bookingsLoading || deletingAllBookings}
              >
                Päivitä lista
              </button>

              <button
                className="btn btn-danger"
                type="button"
                onClick={handleDeleteAllBookings}
                disabled={
                  bookings.length === 0 ||
                  bookingsLoading ||
                  deletingAllBookings ||
                  deletingBookingId !== null
                }
              >
                {deletingAllBookings
                  ? "Poistetaan varauksia..."
                  : "Poista kaikki varaukset"}
              </button>
            </div>
          </div>

          {bookingsLoading ? (
            <p>Ladataan varauksia...</p>
          ) : bookings.length === 0 ? (
            <div className="alert alert-info">Varauksia ei löytynyt.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>Auto</th>
                    <th>Varaaja</th>
                    <th>Alkamispäivä</th>
                    <th>Palautuspäivä</th>
                    <th>Vuokra-aika</th>
                    <th>Kokonaishinta</th>
                    <th>Toiminnot</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => {
                    const car = cars.find(
                      (item) => String(item.id) === String(booking.carId),
                    );

                    return (
                      <tr key={booking.id}>
                        <td>
                          <strong>
                            {car
                              ? `${car.brand || car.make || ""} ${car.model || ""}`.trim()
                              : `Auto ${booking.carId}`}
                          </strong>

                          <div className="small text-secondary">
                            Varaus #{booking.id}
                          </div>
                        </td>

                        <td>{getUserName(booking.userId)}</td>
                        <td>{formatDate(booking.startDate)}</td>
                        <td>{formatDate(booking.endDate)}</td>

                        <td>
                          {booking.totalDays ?? "—"}{" "}
                          {booking.totalDays === 1 ? "päivä" : "päivää"}
                        </td>

                        <td>{Number(booking.totalPrice || 0).toFixed(2)} €</td>

                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => handleDeleteBooking(booking)}
                            disabled={
                              deletingAllBookings || deletingBookingId !== null
                            }
                          >
                            {deletingBookingId === booking.id
                              ? "Poistetaan..."
                              : "Poista varaus"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default Admin;
