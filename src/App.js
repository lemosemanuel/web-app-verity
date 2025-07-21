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
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductTable />} />
            <Route path="/faqs" element={<div>FAQs page</div>} />
            <Route path="/support" element={<div>Support page</div>} />
            <Route path="/settings" element={<div>Settings page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
