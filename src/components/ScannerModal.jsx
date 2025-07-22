import React from "react";
import "./ScannerModal.css";

/**
 * images: array de objetos { preview?: string, url?: string, asset_group?: string }
 */
export default function ScannerModal({ open, images = [] }) {
  if (!open) return null;

  // Mostrar solo las que tengan preview o url no vacíos
  const shownImages = images.filter(
    (img) =>
      img &&
      ((img.preview && img.preview.trim() !== "") ||
        (img.url && img.url.trim() !== "")) &&
      img.asset_group // quítalo si querés mostrar aunque no tenga asset_group
  );

  return (
    <div className="modal-overlay">
      <div className="scanner-modal-card">
        <button className="close-btn" disabled style={{ opacity: 0.5 }}>
          ×
        </button>

        <h2 className="scanner-title">Step 2: Verifying with Verity AI...</h2>
        <div className="scanner-desc">
          <span>17% higher conversion | 95%+ accuracy | 20s avg time</span>
        </div>

        <div className="scanner-images-row">
          {shownImages.map((img, i) => {
            const src = img.preview || img.url;
            return (
              <div key={i} className="scanner-img-wrap">
                <div className="scanner-img-border">
                  <img
                    src={src}
                    alt={img.asset_group || `img-${i}`}
                    className="scanner-img"
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  />
                  <div className="scanner-overlay" />
                </div>
                <div className="scanner-label">
                  {img.asset_group || "\u2014"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
