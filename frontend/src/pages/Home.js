// HOME PAGE COMPONENT
// This is the first page users see when they visit our website
// Simple and beginner-friendly React component

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      {/* Hero Section - Main banner */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Statybinės technikos nuoma
              </h1>
              <p className="lead mb-4">
                Raskite ir užsisakykite statybinės technikos nuomą lengvai ir greitai. 
                Turime platų asortimentą ekskavatorių, kranų, buldozerių ir kitos technikos.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/equipment" className="btn btn-light btn-lg">
                  <i className="bi bi-tools me-2"></i>
                  Žiūrėti įrangą
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-person-plus me-2"></i>
                  Registruotis
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <i className="bi bi-truck display-1 text-light opacity-50"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="fw-bold">Kodėl rinktis mus?</h2>
              <p className="text-muted">Mes siūlome geriausią technikos nuomos patirtį</p>
            </div>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{width: '60px', height: '60px'}}>
                    <i className="bi bi-lightning-charge text-white fs-4"></i>
                  </div>
                  <h5 className="fw-bold">Greitas užsakymas</h5>
                  <p className="text-muted">
                    Užsakykite technikos nuomą vos keliais paspaudimais. 
                    Paprastas ir intuityvus rezervacijos procesas.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{width: '60px', height: '60px'}}>
                    <i className="bi bi-shield-check text-white fs-4"></i>
                  </div>
                  <h5 className="fw-bold">Patikima technika</h5>
                  <p className="text-muted">
                    Visa mūsų technika reguliariai tikrinama ir prižiūrima. 
                    Garantuojame aukštą kokybę ir patikimumą.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{width: '60px', height: '60px'}}>
                    <i className="bi bi-headset text-white fs-4"></i>
                  </div>
                  <h5 className="fw-bold">24/7 palaikymas</h5>
                  <p className="text-muted">
                    Mūsų komanda visada pasirengusi padėti. 
                    Kreipkitės bet kada - atsakysime greitai.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Categories Preview */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="fw-bold">Technika kategorijoms</h2>
              <p className="text-muted">Raskite tinkamą technikos tipą savo projektui</p>
            </div>
          </div>

          <div className="row g-4">
            {/* Excavators */}
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm equipment-card h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-arrow-down-circle text-primary fs-1 mb-3"></i>
                  <h6 className="fw-bold">Ekskavatoriai</h6>
                  <p className="text-muted small mb-3">Kasimo ir žemės darbų technika</p>
                  <Link to="/equipment" className="btn btn-outline-primary btn-sm">
                    Žiūrėti
                  </Link>
                </div>
              </div>
            </div>

            {/* Cranes */}
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm equipment-card h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-arrows-move text-success fs-1 mb-3"></i>
                  <h6 className="fw-bold">Kranai</h6>
                  <p className="text-muted small mb-3">Kėlimo ir montažo darbams</p>
                  <Link to="/equipment" className="btn btn-outline-success btn-sm">
                    Žiūrėti
                  </Link>
                </div>
              </div>
            </div>

            {/* Bulldozers */}
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm equipment-card h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-truck text-warning fs-1 mb-3"></i>
                  <h6 className="fw-bold">Buldozeriai</h6>
                  <p className="text-muted small mb-3">Žemės lyginimo darbams</p>
                  <Link to="/equipment" className="btn btn-outline-warning btn-sm">
                    Žiūrėti
                  </Link>
                </div>
              </div>
            </div>

            {/* Loaders */}
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm equipment-card h-100">
                <div className="card-body text-center p-4">
                  <i className="bi bi-box text-info fs-1 mb-3"></i>
                  <h6 className="fw-bold">Krautuvai</h6>
                  <p className="text-muted small mb-3">Medžiagų krovimo darbams</p>
                  <Link to="/equipment" className="btn btn-outline-info btn-sm">
                    Žiūrėti
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h3 className="fw-bold mb-4">Pasiruošę pradėti savo projektą?</h3>
              <p className="text-muted mb-4">
                Registruokitės dabar ir gaukite prieigą prie visos mūsų technikos. 
                Greitas rezervacijos procesas ir konkurencingos kainos.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg me-3">
                Registruotis dabar
              </Link>
              <Link to="/equipment" className="btn btn-outline-primary btn-lg">
                Peržiūrėti įrangą
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
