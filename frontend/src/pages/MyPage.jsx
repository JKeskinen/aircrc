import { useState } from "react";
import { Link } from "react-router-dom";

function MyPage() {
  return (
    <div
      className="grid text-center overflow-x-auto"
      style={{ "--bs-columns": 5 }}
    >
      <table>
        <Link to="/" className="text-decoration-none">
          ← Takaisin etusivulle
        </Link>
      </table>
      <div>
        <strong>Asiakastietosi</strong>
        <div className="grid">
          <div> Pertti Esimerkki </div>
          <div>Reaktinpolku 22</div>
          <div>60720 Seinäjoki</div>

          <p></p>
          <div></div>
        </div>
      </div>
      <div>
        <strong>Varaukseni</strong>

        <div className="grid" style={{ "--bs-columns": 12 }}>
          <div className="g-col-6">6 of 12</div>
          <div className="g-col-4">4 of 12</div>
          <div className="g-col-2">2 of 12</div>
        </div>
      </div>
      <div>Third auto-column</div>
    </div>
  );
}

export default MyPage;
