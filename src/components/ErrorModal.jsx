import React from "react";

export default function ErrorModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ textAlign: "center" }}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2 style={{ color: "#f33" }}>Verification failed</h2>
        <p>
          This product <b>could not be verified</b> as authentic.<br />
          Please check the images and try again.
        </p>
        <button
          onClick={onClose}
          style={{
            background: "#f33",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 6,
            padding: "10px 30px",
            marginTop: 20,
            fontSize: 16
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
