import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProductTable from "./components/ProductTable";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fa" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "40px" }}>
          <Routes>
            {/* No Header en Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Sí Header en estas páginas */}
            <Route
              path="/products"
              element={
                <>
                  {/* <Header /> */}
                  <ProductTable />
                </>
              }
            />
            <Route
              path="/faqs"
              element={
                <>
                  <Header />
                  <div>FAQs page</div>
                </>
              }
            />
            <Route
              path="/support"
              element={
                <>
                  <Header />
                  <div>Support page</div>
                </>
              }
            />
            <Route
              path="/settings"
              element={
                <>
                  <Header />
                  <div>Settings page</div>
                </>
              }
            />
            {/* Redirección raíz */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
