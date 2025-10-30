import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProductTable from "./components/ProductTable";
import Dashboard from "./components/Dashboard";
import "./App.css";
import Login from "./pages/Login";
import Test from "./pages/Test";

function App() {
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("verity_token") : null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncToken = () => {
      setToken(localStorage.getItem("verity_token"));
    };
    window.addEventListener("storage", syncToken);
    return () => {
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("verity_token");
      localStorage.removeItem("verity_user");
    }
    setToken(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <Router>
      <AppLayout
        isAuthenticated={isAuthenticated}
        token={token}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </Router>
  );
}

function AppLayout({ isAuthenticated, token, onLogin, onLogout }) {
  const location = useLocation();
  const hideChrome = location.pathname === "/login" || location.pathname === "/test";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fa" }}>
      {!hideChrome && <Sidebar />}
      <main style={{ flex: 1, padding: hideChrome ? "0" : "40px" }}>
        <Routes>
          <Route
            path="/test"
            element={
              isAuthenticated ? (
                <Test token={token} onLogout={onLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<Login onAuthenticated={onLogin} />} />
          {/* No Header en Dashboard */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
          />

          {/* Sí Header en estas páginas */}
          <Route
            path="/products"
            element={
              isAuthenticated ? (
                <>
                  {/* <Header /> */}
                  <ProductTable />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/faqs"
            element={
              isAuthenticated ? (
                <>
                  <Header />
                  <div>FAQs page</div>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/support"
            element={
              isAuthenticated ? (
                <>
                  <Header />
                  <div>Support page</div>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isAuthenticated ? (
                <>
                  <Header />
                  <div>Settings page</div>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Redirección raíz */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/test" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/test" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
