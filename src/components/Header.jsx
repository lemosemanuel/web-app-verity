import React from "react";
export default function Header() {
  return (
    <div className="header">
      <button className="button-main">Verify with Verity AI</button>
      <div className="filters">
        <button>Filter By</button>
        <select>
          <option>Vendor</option>
        </select>
        <select>
          <option>Verity Result</option>
        </select>
        <input type="text" placeholder="Search by product" />
        <button className="reset">Reset Filter</button>
      </div>
    </div>
  );
}
