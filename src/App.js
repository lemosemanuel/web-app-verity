import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
// import Header from "./components/Header";
import ProductTable from "./components/ProductTable";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import BusinessBetaSignup from "./components/BusinessBetaSignup";
import "./App.css";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fa" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "40px" }}>
          <Routes>
            {/* HomePage */}
            <Route path="/home" element={<HomePage />} />

            {/* Dashboard sin Header */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Products con ProductTable */}
            <Route
              path="/products"
              element={
                <>
                  {/* <Header /> */}
                  <ProductTable />
                </>
              }
            />

           {/* Business Beta Sign‑up */}
           <Route
             path="/beta-signup"
             element={
               <>
                 {/* aquí podrías añadir <Header /> si lo necesitas */}
                 <BusinessBetaSignup />
               </>
             }
           />

            {/* …tus otras rutas (faqs, support, settings, etc.) */}

            {/* Redirección raíz a HomePage */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
