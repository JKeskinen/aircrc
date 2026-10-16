/**
 * BACKEND: Express-palvelin (server.js)
 *
 * Käynnistetään: npm run dev
 *
 * Tarkoitus:
 * Tarjoaa frontendille REST API -rajapinnan käyttäjien, autojen, varausten
 * sekä autonvalmistajien ja -mallien käsittelyyn. Lataa lähtötiedot JSON-
 * tiedostoista palvelimen käynnistyessä ja tallentaa autojen sekä varausten
 * muutokset takaisin tiedostoihin. Palvelin kuuntelee porttia 3001.
 */

import express from "express";
import cors from "cors";
import { writeFile } from "node:fs/promises";
import vehicleData from "./data/all.json" with { type: "json" };
import carsData from "./data/cars.json" with { type: "json" };
import bookingsData from "./data/bookings.json" with { type: "json" };
import usersData from "./data/users.json" with { type: "json" };

// ============================================================
// OSIO: Palvelimen perusasetukset
// ============================================================

const app = express();
const PORT = 3001;

// Middleware: CORS (sallii frontendin kutsut) ja JSON-parsinta
app.use(cors());
app.use(express.json());

// ============================================================
// OSIO: JSON-tiedon lukeminen ja tallennus
// ============================================================

const carsFile = "./data/cars.json";
const bookingsFile = "./data/bookings.json";

// Lataa data muistiin käynnistyessä
let cars = Array.isArray(carsData.cars) ? [...carsData.cars] : [...carsData];
let bookings = Array.isArray(bookingsData.bookings)
  ? [...bookingsData.bookings]
  : [];
let users = Array.isArray(usersData.users)
  ? [...usersData.users]
  : [...usersData];

// Muodosta valmistajalista all.json-tiedostosta
const makes = vehicleData.flatMap((group) => group.makes);

/**
 * Tallentaa datan JSON-muodossa annettuun tiedostoon.
 */
const writeJson = async (filePath, data) => {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};

/**
 * Luo uniikin tunnisteen aikaleiman perusteella.
 */
const generateId = () => String(Date.now());

// ============================================================
// OSIO: Apufunktiot (all.json-haku, päivämäärät, käännökset)
// ============================================================

/**
 * Hakee valmistajan nimen perusteella (kirjainkoosta riippumatta).
 */
const getMake = (name) =>
  makes.find((item) => item.name.toLowerCase() === String(name).toLowerCase());

/**
 * Hakee automallin valmistajan ja mallin nimen perusteella.
 */
const getModel = (makeName, modelName) => {
  const make = getMake(makeName);
  return make?.models.find(
    (item) => item.name.toLowerCase() === String(modelName).toLowerCase(),
  );
};

/**
 * Laskee päivien määrän kahden päivämäärän välillä.
 * Palautuspäivää ei lasketa mukaan.
 */
const getDaysBetween = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return (end - start) / 86400000;
};

/**
 * Tarkistaa, onko samalla autolla päällekkäinen varaus.
 */
const hasOverlappingBooking = (carId, startDate, endDate) =>
  bookings.some(
    (booking) =>
      Number(booking.carId) === Number(carId) &&
      startDate < booking.endDate &&
      endDate > booking.startDate,
  );

/**
 * Muuntaa käyttövoiman suomenkieliseksi nimitykseksi.
 */
const translateFuel = (fuel) => {
  const value = String(fuel || "").toLowerCase();

  if (value.includes("electric")) return "Sähkö";
  if (value.includes("diesel")) return "Diesel";
  if (value.includes("hybrid")) return "Hybridi";
  if (value.includes("gasoline") || value.includes("petrol")) return "Bensiini";
  if (value.includes("hydrogen")) return "Vety";
  if (value.includes("lpg") || value.includes("cng")) return "Kaasu";

  return fuel || "Ei ilmoitettu";
};

/**
 * Muodostaa vaihteistosta käyttöliittymässä näytettävän tekstin.
 */
const translateTransmission = (transmission) => {
  const value = String(transmission || "");

  if (/automatic|auto/i.test(value)) return `Automaatti (${value})`;
  if (/manual/i.test(value)) return `Manuaali (${value})`;

  return value || "Ei ilmoitettu";
};

// ============================================================
// OSIO: Perusreitit (tervetuloa + käyttäjät)
// ============================================================

// Tervetuloa-viesti
app.get("/", (req, res) => {
  res.json({ message: "AirCrc API toimii!" });
});

/**
 * GET /api/users
 * Palauttaa kaikki käyttäjät.
 */
app.get("/api/users", (req, res) => {
  res.json(users);
});

/**
 * GET /api/users/:id
 * Palauttaa yksittäisen käyttäjän.
 * 404 jos käyttäjää ei löydy.
 */
app.get("/api/users/:id", (req, res) => {
  const user = users.find((item) => String(item.id) === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "Käyttäjää ei löytynyt." });
  }

  res.json(user);
});

// ============================================================
// OSIO: Autovalmistajat ja mallit (all.json-haku)
// ============================================================

/**
 * GET /api/vehicle-makes
 * Palauttaa kaikki valmistajat.
 */
app.get("/api/vehicle-makes", (req, res) => {
  res.json(makes.map((make) => make.name));
});

/**
 * GET /api/vehicle-makes/:make/models
 * Palauttaa valitun valmistajan mallit.
 * 404 jos valmistajaa ei löydy.
 */
app.get("/api/vehicle-makes/:make/models", (req, res) => {
  const make = getMake(req.params.make);

  if (!make) {
    return res.status(404).json({ error: "Valmistajaa ei löytynyt." });
  }

  res.json(make.models.map((model) => model.name));
});

/**
 * GET /api/vehicle-makes/:make/models/:model
 * Palauttaa mallin vuosirajat, sukupolvet ja moottorit.
 * 404 jos mallia ei löydy.
 */
app.get("/api/vehicle-makes/:make/models/:model", (req, res) => {
  const model = getModel(req.params.make, req.params.model);

  if (!model) {
    return res.status(404).json({ error: "Automallia ei löytynyt." });
  }

  res.json(model);
});

// ============================================================
// OSIO: Varaukset (perushaku + laajennettu validointi)
// ============================================================

/**
 * GET /api/bookings
 * Palauttaa varaukset. Suodattaa tarvittaessa carId- tai userId-parametrilla.
 */
app.get("/api/bookings", (req, res) => {
  let result = bookings;

  if (req.query.carId !== undefined) {
    result = result.filter(
      (item) => Number(item.carId) === Number(req.query.carId),
    );
  }

  if (req.query.userId !== undefined) {
    result = result.filter(
      (item) => Number(item.userId) === Number(req.query.userId),
    );
  }

  res.json(result);
});

/**
 * POST /api/bookings
 * Luo uuden varauksen.
 * Validoi tiedot, tarkistaa päällekkäisyydet ja laskee hinnan.
 * 201 onnistuessa, muuten 400/404/409/500.
 */
app.post("/api/bookings", async (req, res) => {
  const { carId, startDate, endDate, userId } = req.body;
  const numericCarId = Number(carId);

  // Perusvalidointi
  if (
    !Number.isInteger(numericCarId) ||
    numericCarId <= 0 ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
    startDate >= endDate
  ) {
    return res.status(400).json({
      error: "Tarkista auton tiedot ja vuokrauksen päivämäärät.",
    });
  }

  // Tarkista päivämäärien kelvollisuus
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== startDate ||
    end.toISOString().slice(0, 10) !== endDate
  ) {
    return res.status(400).json({ error: "Virheellinen päivämäärä." });
  }

  // Tarkista auton olemassaolo
  const car = cars.find((item) => Number(item.id) === numericCarId);

  if (!car) {
    return res.status(404).json({ error: "Autoa ei löytynyt." });
  }

  // Tarkista käyttäjän olemassaolo
  const user = users.find(
    (item) =>
      String(item.id) === String(userId) ||
      String(item.auth) === String(userId),
  );

  if (!user) {
    return res.status(400).json({ error: "Varauksen käyttäjää ei löytynyt." });
  }

  // Tarkista päällekkäisyydet
  if (hasOverlappingBooking(numericCarId, startDate, endDate)) {
    return res.status(409).json({
      error: "Auto on jo varattu valitulle ajanjaksolle.",
    });
  }

  // Laske hinta
  const pricePerDay = Number(car.price);

  if (!Number.isFinite(pricePerDay) || pricePerDay < 0) {
    return res
      .status(500)
      .json({ error: "Auton hintatieto ei ole kelvollinen." });
  }

  const totalDays = getDaysBetween(startDate, endDate);

  // Muodosta varaus
  const booking = {
    id: generateId(),
    carId: numericCarId,
    userId: user.id,
    userName: user.name,
    startDate,
    endDate,
    totalDays,
    totalPrice: pricePerDay * totalDays,
    status: "confirmed",
  };

  // Tallenna
  try {
    const updatedBookings = [...bookings, booking];
    await writeJson(bookingsFile, { bookings: updatedBookings });
    bookings = updatedBookings;

    res.status(201).json({ message: "Varaus tallennettu.", booking });
  } catch (error) {
    console.error("Varauksen tallennus epäonnistui:", error);
    res.status(500).json({ error: "Varauksen tallennus epäonnistui." });
  }
});

/**
 * DELETE /api/bookings/:id
 * Poistaa varauksen.
 * 404 jos varausta ei löydy.
 */
app.delete("/api/bookings/:id", async (req, res) => {
  const booking = bookings.find((item) => item.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: "Varausta ei löytynyt." });
  }

  const updatedBookings = bookings.filter((item) => item.id !== req.params.id);

  try {
    await writeJson(bookingsFile, { bookings: updatedBookings });
    bookings = updatedBookings;
    res.json({ message: "Varaus poistettu." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Varauksen poisto epäonnistui." });
  }
});

// ============================================================
// OSIO: Autot (perushaku + laajennettu all.json-pohjainen lisäys)
// ============================================================

/**
 * GET /api/cars
 * Palauttaa kaikki autot.
 */
app.get("/api/cars", (req, res) => {
  res.json(cars);
});

/**
 * GET /api/cars/:id
 * Palauttaa yksittäisen auton.
 * 404 jos autoa ei löydy.
 */
app.get("/api/cars/:id", (req, res) => {
  const car = cars.find((item) => String(item.id) === req.params.id);

  if (!car) {
    return res.status(404).json({ error: "Autoa ei löytynyt." });
  }

  res.json(car);
});

/**
 * POST /api/cars
 * Luo uuden auton.
 * Hakee tekniset tiedot all.json-tiedostosta ja validoi syötteet.
 * 201 onnistuessa, muuten 400/500.
 */
app.post("/api/cars", async (req, res) => {
  const body = req.body;
  const brand = body.brand || body.make;
  const modelName = body.model;

  // Perusvalidointi
  if (!brand || !modelName) {
    return res.status(400).json({ error: "Merkki ja malli ovat pakollisia." });
  }

  // Hae tekniset tiedot lähdetiedostosta
  const sourceModel = getModel(brand, modelName);

  if (!sourceModel) {
    return res
      .status(400)
      .json({ error: "Merkkiä tai mallia ei löydy all.json-tiedostosta." });
  }

  // Tarkista sukupolvi
  const generation = sourceModel.generations?.find(
    (item) => item.name === body.generation,
  );

  if (!generation) {
    return res
      .status(400)
      .json({ error: "Valitse kelvollinen automallin sukupolvi." });
  }

  // Tarkista vuosimalli
  const year = Number(body.year);
  const startYear = Number(generation.yearStart);
  const endYear =
    generation.yearEnd == null || generation.yearEnd === ""
      ? new Date().getFullYear()
      : Math.min(Number(generation.yearEnd), new Date().getFullYear());

  if (!Number.isInteger(year) || year < startYear || year > endYear) {
    return res.status(400).json({
      error: `Vuosimallin pitää olla välillä ${startYear}–${endYear}.`,
    });
  }

  // Tarkista moottori
  const engine = generation.engines?.find(
    (item) => item.label === body.engineLabel,
  );

  if (!engine) {
    return res
      .status(400)
      .json({ error: "Valitse kelvollinen moottorivaihtoehto." });
  }

  // Tarkista hinta ja paikkamäärä
  const price = Number(body.price);
  const seats = Number(body.seats);

  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: "Anna kelvollinen päivähinta." });
  }

  if (!Number.isInteger(seats) || seats < 1) {
    return res.status(400).json({ error: "Anna paikkamäärä." });
  }

  // Muodosta näytettävät arvot
  const displacement =
    engine.displacementCc == null ? null : `${engine.displacementCc} cm³`;

  const consumption =
    engine.fuelEconomyCombinedL100 == null
      ? null
      : `${engine.fuelEconomyCombinedL100} l/100 km`;

  // Muodosta auton tietue
  const newCar = {
    id: generateId(),
    brand: sourceModel ? getMake(brand).name : brand,
    make: getMake(brand).name,
    model: sourceModel.name,
    year,
    generation: generation.name,
    bodyType: generation.bodyType ?? null,

    // Vuokraukseen liittyvät tiedot
    price,
    seats,
    image: String(body.image || "").trim(),
    description: String(body.description || "").trim(),
    availability: body.availability || "Saatavilla",

    // Yhteensopivuus nykyisen käyttöliittymän kanssa
    engine: engine.label,
    engineLabel: engine.label,
    fuel: translateFuel(engine.fuelType),
    fuelType: engine.fuelType ?? null,
    transmission: translateTransmission(engine.transmission),
    sourceTransmission: engine.transmission ?? null,
    horsepower: engine.powerHp ?? null,
    powerHp: engine.powerHp ?? null,
    displacement,
    displacementCc: engine.displacementCc ?? null,
    consumption,
    fuelEconomyCombinedL100: engine.fuelEconomyCombinedL100 ?? null,

    // Muut lähteen tekniset tiedot
    cylinders: engine.cylinders ?? null,
    torqueNm: engine.torqueNm ?? null,
    drivetrain: engine.drivetrain ?? null,
    zeroToHundredKmhS: engine.zeroToHundredKmhS ?? null,
    topSpeedKmh: engine.topSpeedKmh ?? null,
    lengthMm: engine.lengthMm ?? null,
    widthMm: engine.widthMm ?? null,
    heightMm: engine.heightMm ?? null,
    wheelbaseMm: engine.wheelbaseMm ?? null,
    curbWeightKg: engine.curbWeightKg ?? null,
    specs: engine.specs ?? {},
  };

  // Tallenna
  try {
    const updatedCars = [...cars, newCar];
    await writeJson(carsFile, { cars: updatedCars });
    cars = updatedCars;
    res.status(201).json(newCar);
  } catch (error) {
    console.error("Auton tallennus epäonnistui:", error);
    res.status(500).json({ error: "Auton tallennus epäonnistui." });
  }
});

/**
 * DELETE /api/cars/:id
 * Poistaa auton.
 * 404 jos autoa ei löydy, 204 onnistuessa.
 */
app.delete("/api/cars/:id", async (req, res) => {
  const id = req.params.id;
  const car = cars.find((item) => String(item.id) === id);

  if (!car) {
    return res.status(404).json({ error: "Autoa ei löytynyt." });
  }

  const updatedCars = cars.filter((item) => String(item.id) !== id);

  try {
    await writeJson(carsFile, { cars: updatedCars });
    cars = updatedCars;
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Auton poisto epäonnistui." });
  }
});

// ============================================================
// OSIO: Virhekäsittely ja käynnistys
// ============================================================

/**
 * Tuntematon endpoint → 404
 */
app.use((req, res) => {
  res.status(404).json({ error: "Tuntematon endpoint." });
});

// Käynnistä palvelin
app.listen(PORT, () => {
  console.log(`Backend käynnissä: http://localhost:${PORT}`);
});
