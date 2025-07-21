import React from "react";

export default function StatusTag({ status, children }) {
  return (
    <span className={`status-tag status-${status}`}>
      {children}
    </span>
  );
}
