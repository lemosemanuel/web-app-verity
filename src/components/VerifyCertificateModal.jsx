import React, { useRef } from "react";
import html2canvas from "html2canvas";
import "./VerifyCertificateModal.css";

export default function VerifyCertificateModal({ open, onClose, certificateData }) {
  const certificateRef = useRef(null);

  if (!open) return null;

  const {
    brand = "Brand name",
    imageUrl = "https://assets.highend.app/products/tu-producto.png",
    date,
    authenticStickerUrl = "https://assets.highend.app/products/1753057243-authent.png",
    verityLogoUrl = "https://assets.highend.app/products/1753057075-Verity.png"
  } = certificateData || {};

  let formattedDate = "";
  if (date) {
    try {
      const d = new Date(date);
      formattedDate =
        d.toLocaleDateString(undefined, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        " " +
        d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
    } catch {
      formattedDate = date;
    }
  }

  async function handleDownload() {
    if (certificateRef.current) {
      // Espera a que las imágenes estén cargadas
      const imgs = certificateRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map((img) =>
          img.complete && img.naturalHeight !== 0
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              })
        )
      );

      const canvas = await html2canvas(certificateRef.current, {
        useCORS: true,
        backgroundColor: "#fff",
        scale: window.devicePixelRatio || 2,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${brand.replace(/\s/g, "_")}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  return (
    <div className="certificate-modal-overlay">
      <div className="certificate-card" ref={certificateRef}>
        <button className="certificate-close-btn" onClick={onClose}>×</button>
        <div className="certificate-content">
          <h1 className="certificate-main-title">Certificate Of Authenticity</h1>
          <div className="certificate-row">
            <div className="certificate-img-box">
              <img
                src={imageUrl}
                alt="product"
                className="certificate-img-main"
                draggable={false}
                crossOrigin="anonymous"
              />
              <img
                src={authenticStickerUrl}
                alt="authentic"
                className="certificate-authentic-sticker"
                draggable={false}
                crossOrigin="anonymous"
              />
            </div>
            <div className="certificate-meta-box">
              <div className="certificate-meta-field">
                <span className="certificate-meta-label">Date:</span>
                <span className="certificate-meta-value">{formattedDate}</span>
              </div>
              <div className="certificate-meta-field">
                <span className="certificate-meta-label">Brand:</span>
                <span className="certificate-meta-value" style={{ fontStyle: "italic" }}>{brand}</span>
              </div>
              <div className="certificate-verity-logo-box">
                <img
                  src={verityLogoUrl}
                  alt="Verity AI"
                  className="certificate-verity-logo"
                  draggable={false}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          </div>
          <div className="certificate-description">
            <div className="certificate-desc-text">
              This item has been deemed<br />
              authentic by Verity AI.<br /><br />
              Verity AI provides a financial<br />
              guarantee for this certificate.
            </div>
          </div>
          <div className="certificate-fineprint">
            VerityAI is not affiliated with any of the brands authenticated. VerityAI's authentication service is based solely on VerityAI's authentication algorithm, and the data it relies upon is not provided by any of the brands Verity AI authenticates. The brands authenticated are not responsible or bound by any of VerityAI's findings.
          </div>
          <button className="certificate-download-btn" onClick={handleDownload}>
            <span role="img" aria-label="download">⬇️</span> Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
