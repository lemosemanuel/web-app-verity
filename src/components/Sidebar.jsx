import React from "react";
import { NavLink } from "react-router-dom";
// import "./Sidebar.css"; // Opcional

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="title">
        VERITY <span className="subtitle">AI</span>
      </div>
      <div className="subtitle">powered by HIGH END</div>
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "selected" : ""}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? "selected" : ""}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/faqs" className={({ isActive }) => isActive ? "selected" : ""}>
              FAQs
            </NavLink>
          </li>
          <li>
            <NavLink to="/support" className={({ isActive }) => isActive ? "selected" : ""}>
              Support
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? "selected" : ""}>
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
