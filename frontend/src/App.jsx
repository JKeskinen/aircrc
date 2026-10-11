import { Link, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CarDetails from "./pages/CarDetails";
import Cars from "./pages/Cars";
import Home from "./pages/Home";
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
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/cars/:id" element={<CarDetails />} />
      </Routes>
    </>
  );
}

export default App;
