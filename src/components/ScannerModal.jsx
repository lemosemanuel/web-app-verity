import React from "react";
import "./ScannerModal.css";

// images: array de objetos con { preview, asset_group }
export default function ScannerModal({ open, images }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="scanner-modal-card">
        <button className="close-btn" disabled style={{opacity: 0.5}}>×</button>
        <h2 className="scanner-title">Step 2: Verifying with Verity AI...</h2>
        <div className="scanner-desc">
          <span>17% higher conversion | 95%+ accuracy | 20s avg time</span>
        </div>
        <div className="scanner-images-row">
          {images.map((img, i) => (
            <div key={i} className="scanner-img-wrap">
              <div className="scanner-img-border">
                <img src={img.preview} alt={img.asset_group} className="scanner-img" />
                {/* Efecto “scanner” animado */}
                <div className="scanner-overlay" />
              </div>
              <div className="scanner-label">{img.asset_group}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
