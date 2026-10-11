const baseUrl = "http://localhost:3001/api/cars";

// cars.js hakee tiedot backendiltä. Luettelee kaikki autot.

const getAll = () => {
  return fetch(baseUrl).then((response) => {
    if (!response.ok) {
      throw new Error("Autojen haku epäonnistui");
    }

    return response.json();
  });
};

export default { getAll };
