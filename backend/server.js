import express from "express";
import cors from "cors";
import cars from "./data/cars.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Testireitti
app.get("/", (req, res) => {
  res.json({ message: "AirCrc API toimii!" });
});

// Testireitti
app.get("/api", (req, res) => {
  res.json({ message: "Katotaas ny" });
});

// Palautetaan kaikki autot
app.get("/api/cars", (req, res) => {
  res.json(cars);
});

app.get("/api/cars/:id", (req, res) => {
  const id = Number(req.params.id);
  const car = cars.find((car) => car.id === id);

  if (!car) {
    return res.status(404).json({ error: "Autoa ei löytynyt" });
  }

  res.json(car);
});

app.listen(PORT, () => {
  console.log(`Backend käynnissä: http://localhost:${PORT}`);
});
