import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:80";

export default function Login({ onAuthenticated }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/verity_auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || "Login failed");
      }
      const { token, user } = data || {};
      if (!token) {
        throw new Error("Unexpected response from server");
      }
      localStorage.setItem("verity_token", token);
      localStorage.setItem("verity_user", JSON.stringify(user));
      if (typeof onAuthenticated === "function") {
        onAuthenticated(token, user);
      }
      navigate("/test", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-card__hero">
          <div className="auth-hero__brand">
            <h1>Verity</h1>
            <p>Authenticate every asset you publish to keep brands and customers protected.</p>
          </div>
          <ul className="auth-hero__bullets">
            <li>Centralized product intelligence for your team.</li>
            <li>AI-powered asset verification in minutes.</li>
            <li>Instant visibility on credit usage and outcomes.</li>
          </ul>
          <div className="auth-hero__footer">
            <strong>Need onboarding help?</strong>
            <span>Speak with your Verity representative to invite more teammates.</span>
          </div>
        </aside>
        <section className="auth-card__form">
          <div>
            <h2>Welcome back</h2>
            <p>Sign in to continue verifying your brand assets.</p>
          </div>
          <form onSubmit={onSubmit} className="auth-form">
            {error && <div className="auth-form__error">{error}</div>}
            <div>
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-form__input"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-form__input"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <button disabled={loading} type="submit" className="auth-form__button">
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <div className="auth-form__meta">
              <span>Forgot your password?</span>
              <span>Contact support to reset your access.</span>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
