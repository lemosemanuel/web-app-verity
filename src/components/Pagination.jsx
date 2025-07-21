import React from "react";
export default function Pagination() {
  return (
    <>
      <button>&lt;</button>
      {[1,2,3,4,5,9,10].map((p) => (
        <button key={p} className={p === 1 ? "selected" : ""}>
          {p}
        </button>
      ))}
      <span>...</span>
      <button>&gt;</button>
    </>
  );
}
