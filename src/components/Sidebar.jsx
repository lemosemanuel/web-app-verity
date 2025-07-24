import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-box">
        <img src="/assets/logoVerity.png" alt="Verity AI" className="logo" />
      </div>
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
        
        </ul>
      </nav>
    </aside>
  );
}
