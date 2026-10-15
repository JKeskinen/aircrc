/**
 * PALVELU: Käyttäjien käsittely (users)
 *
 * Tarkoitus:
 * Hakee kaikki käyttäjät Express-backendin API-rajapinnasta Axios-kirjastolla
 * osoitteesta http://localhost:3001/api/users.
 *
 * Tiedonsiirto:
 * userService -> GET /api/users
 *   Lähettää HTTP GET -pyynnön palvelimelle.
 * Palvelin -> userService -> kutsuva komponentti
 *   Palauttaa käyttäjälistan response.data-kentässä. Mahdolliset virheet
 *   välittyvät kutsuvalle komponentille.
 *
 * Parametrit: getAll() ei tarvitse parametreja.
 * Palvelu sisältää tällä hetkellä vain käyttäjien hakutoiminnon.
 */

import axios from "axios";

const baseUrl = "http://localhost:3001/api/users";

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

export default {
  getAll,
};
