/**
 * BACKEND: Express-palvelin (server.js)
 *
 * Käynnistetään npm run dev
 *
 * Tarkoitus:
 * Tarjoaa frontendille REST API -rajapinnan käyttäjien, autojen, varausten
 * sekä autonvalmistajien ja -mallien käsittelyyn. Lataa lähtötiedot JSON-
 * tiedostoista palvelimen käynnistyessä ja tallentaa autojen sekä varausten
 * muutokset takaisin tiedostoihin. Palvelin kuuntelee porttia 3001.
 *
 * Tiedonsiirto:
 * Frontend -> GET /api/users
 *   Palauttaa käyttäjälistan; GET /api/users/:id hakee yksittäisen käyttäjän.
 * Frontend -> GET /api/cars
 *   Palauttaa kaikki autot; GET /api/cars/:id hakee yksittäisen auton.
 * Frontend -> POST /api/cars
 *   Vastaanottaa uuden auton tiedot ja tallentaa auton cars.json-tiedostoon.
 * Frontend -> DELETE /api/cars/:id
 *   Poistaa auton ja tallentaa päivitetyn listan cars.json-tiedostoon.
 * Frontend -> GET /api/bookings?carId={id}
 *   Palauttaa tietyn auton varaukset.
 * Frontend -> GET /api/bookings?userId={id}
 *   Palauttaa tietyn käyttäjän varaukset; ilman suodattimia palauttaa kaikki.
 * Frontend -> POST /api/bookings
 *   Vastaanottaa varauspyynnön, tarkistaa auton, käyttäjän, päivämäärät
 *   ja päällekkäiset varaukset sekä laskee vuokra-ajan ja kokonaishinnan.
 *   Tallentaa hyväksytyn varauksen bookings.json-tiedostoon.
 * Frontend -> DELETE /api/bookings/:id
 *   Poistaa varauksen ja tallentaa päivitetyn bookings.json-tiedoston.
 * Frontend -> GET /api/vehicle-makes
 *   Palauttaa autonvalmistajat; /api/vehicle-makes/:make/models palauttaa
 *   valitun valmistajan automallit.
 *
 * Keskeiset tiedot:
 * cars, bookings ja users = palvelimen muistissa käsiteltävät listat.
 * cars.json, bookings.json ja users.json = lähtö- ja tallennustiedostot.
 * all.json = autonvalmistajien ja -mallien lähdetiedot.
 * writeJson() tallentaa tiedot JSON-muodossa, generateId() luo tunnisteen
 * ja hasOverlappingBooking() estää saman auton päällekkäiset varaukset.
 *
 * Palvelin validoi varauspyynnön ja laskee lopullisen hinnan auton
 * päivähinnan perusteella. CORS sallii rajat ylittävät selainpyynnöt,
 * express.json() käsittelee JSON-pyynnöt ja tuntemattomat endpointit
 * palauttavat 404-virheen. Tiedot säilyvät JSON-tiedostoissa palvelimen
 * uudelleenkäynnistysten yli, mutta tallennus ei ole tietokantapohjainen.
 */

import express from "express";
import cors from "cors";
import { writeFile } from "node:fs/promises";
import vehicleData from "./data/all.json" with { type: "json" };
import carsData from "./data/cars.json" with { type: "json" };
import bookingsData from "./data/bookings.json" with { type: "json" };
import usersData from "./data/users.json" with { type: "json" };

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const carsFile = "./data/cars.json";
const bookingsFile = "./data/bookings.json";

let cars = Array.isArray(carsData.cars) ? [...carsData.cars] : [...carsData];
let bookings = Array.isArray(bookingsData.bookings)
  ? [...bookingsData.bookings]
  : [];
let users = Array.isArray(usersData.users)
  ? [...usersData.users]
  : [...usersData];

const makes = vehicleData.flatMap((group) => group.makes);

const writeJson = async (filePath, data) => {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};

const generateId = () => String(Date.now());

const getMake = (name) =>
  makes.find((item) => item.name.toLowerCase() === String(name).toLowerCase());

const getModel = (makeName, modelName) => {
  const make = getMake(makeName);
  return make?.models.find(
    (item) => item.name.toLowerCase() === String(modelName).toLowerCase(),
  );
};

const getDaysBetween = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return (end - start) / 86400000;
};

const hasOverlappingBooking = (carId, startDate, endDate) =>
  bookings.some(
    (booking) =>
      Number(booking.carId) === Number(carId) &&
      startDate < booking.endDate &&
      endDate > booking.startDate,
  );

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

const translateTransmission = (transmission) => {
  const value = String(transmission || "");

  if (/automatic|auto/i.test(value)) return `Automaatti (${value})`;
  if (/manual/i.test(value)) return `Manuaali (${value})`;

  return value || "Ei ilmoitettu";
};

app.get("/", (req, res) => {
  res.json({ message: "AirCrc API toimii!" });
});

// AUTOVALMISTAJAT JA MALLIT

app.get("/api/vehicle-makes", (req, res) => {
  res.json(makes.map((make) => make.name));
});

app.get("/api/vehicle-makes/:make/models", (req, res) => {
  const make = getMake(req.params.make);

  if (!make) {
    return res.status(404).json({ error: "Valmistajaa ei löytynyt." });
  }

  res.json(make.models.map((model) => model.name));
});

// Palauttaa mallin vuosirajat, sukupolvet ja moottorit.
app.get("/api/vehicle-makes/:make/models/:model", (req, res) => {
  const model = getModel(req.params.make, req.params.model);

  if (!model) {
    return res.status(404).json({ error: "Automallia ei löytynyt." });
  }

  res.json(model);
});

// KÄYTTÄJÄT

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find((item) => String(item.id) === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "Käyttäjää ei löytynyt." });
  }

  res.json(user);
});

// VARAUKSET

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

app.post("/api/bookings", async (req, res) => {
  const { carId, startDate, endDate, userId } = req.body;
  const numericCarId = Number(carId);

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

  const car = cars.find((item) => Number(item.id) === numericCarId);

  if (!car) {
    return res.status(404).json({ error: "Autoa ei löytynyt." });
  }

  const user = users.find(
    (item) =>
      String(item.id) === String(userId) ||
      String(item.auth) === String(userId),
  );

  if (!user) {
    return res.status(400).json({ error: "Varauksen käyttäjää ei löytynyt." });
  }

  if (hasOverlappingBooking(numericCarId, startDate, endDate)) {
    return res.status(409).json({
      error: "Auto on jo varattu valitulle ajanjaksolle.",
    });
  }

  const pricePerDay = Number(car.price);

  if (!Number.isFinite(pricePerDay) || pricePerDay < 0) {
    return res
      .status(500)
      .json({ error: "Auton hintatieto ei ole kelvollinen." });
  }

  const totalDays = getDaysBetween(startDate, endDate);

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

// AUTOT

app.get("/api/cars", (req, res) => {
  res.json(cars);
});

app.get("/api/cars/:id", (req, res) => {
  const car = cars.find((item) => String(item.id) === req.params.id);

  if (!car) {
    return res.status(404).json({ error: "Autoa ei löytynyt." });
  }

  res.json(car);
});

app.post("/api/cars", async (req, res) => {
  const body = req.body;
  const brand = body.brand || body.make;
  const modelName = body.model;

  if (!brand || !modelName) {
    return res.status(400).json({ error: "Merkki ja malli ovat pakollisia." });
  }

  // Haetaan tekniset tiedot aina lähdetiedostosta.
  const sourceModel = getModel(brand, modelName);

  if (!sourceModel) {
    return res
      .status(400)
      .json({ error: "Merkkiä tai mallia ei löydy all.json-tiedostosta." });
  }

  const generation = sourceModel.generations?.find(
    (item) => item.name === body.generation,
  );

  if (!generation) {
    return res
      .status(400)
      .json({ error: "Valitse kelvollinen automallin sukupolvi." });
  }

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

  const engine = generation.engines?.find(
    (item) => item.label === body.engineLabel,
  );

  if (!engine) {
    return res
      .status(400)
      .json({ error: "Valitse kelvollinen moottorivaihtoehto." });
  }

  const price = Number(body.price);
  const seats = Number(body.seats);

  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: "Anna kelvollinen päivähinta." });
  }

  if (!Number.isInteger(seats) || seats < 1) {
    return res.status(400).json({ error: "Anna paikkamäärä." });
  }

  const displacement =
    engine.displacementCc == null ? null : `${engine.displacementCc} cm³`;

  const consumption =
    engine.fuelEconomyCombinedL100 == null
      ? null
      : `${engine.fuelEconomyCombinedL100} l/100 km`;

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

app.use((req, res) => {
  res.status(404).json({ error: "Tuntematon endpoint." });
});

app.listen(PORT, () => {
  console.log(`Backend käynnissä: http://localhost:${PORT}`);
});
