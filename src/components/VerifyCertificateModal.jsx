import React, { useRef } from "react";
import html2canvas from "html2canvas";
import "./VerifyCertificateModal.css";

const NO_IMG =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2Y1ZjVmNScvPjx0ZXh0IHg9JzUwJScgeT0nNTAlJyBkeT0nLjMnIGZvbnQtc2l6ZT0nMjAnIGZpbGw9JyNiYmInPk5vIEltZzwvdGV4dD48L3N2Zz4=";

const getSrc = (img) => img?.preview || img?.url || "";

const toProxy = (url) => {
  if (!url || url.startsWith("data:")) return url || NO_IMG;
  // Solo el pathname para que coincida con pathRewrite
  try {
    const u = new URL(url);
    return `/img-proxy${u.pathname}`;
  } catch {
    // si falla el new URL (string raro), lo pasamos entero
    return `/img-proxy${url.replace(/^https?:\/\/[^/]+/, "")}`;
  }
};

export default function VerifyCertificateModal({
  open,
  onClose,
  certificateData,
  product,
  mainImageUrl: mainImgFromRow,
}) {
  const certificateRef = useRef(null);
  if (!open) return null;

  // Imagen final (sin base64)
  const fallback =
    getSrc(product?.images?.[0]) ||
    getSrc(certificateData?.images?.[0]) ||
    NO_IMG;

  const rawImg = mainImgFromRow || fallback;
  const proxiedImg = toProxy(rawImg);

  const {
    brand = product?.brand_name || "Brand name",
    authenticStickerUrl = "https://assets.highend.app/products/1753057243-authent.png",
    verityLogoUrl = "https://assets.highend.app/products/1753057075-Verity.png",
    date,
    date_of_authentication,
  } = certificateData || {};

  const rawDate = date || date_of_authentication;
  let formattedDate = "";
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      formattedDate =
        d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }) +
        " " +
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      formattedDate = rawDate;
    }
  }

  async function handleDownload() {
    if (!certificateRef.current) return;

    // aseguramos crossOrigin en todas las imgs
    certificateRef.current.querySelectorAll("img").forEach((img) => {
      img.setAttribute("crossorigin", "anonymous");
    });

    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#fff",
      scale: window.devicePixelRatio || 2,
      logging: false,
    });

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `certificate_${(brand || "brand").replace(/\s/g, "_")}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
                src={proxiedImg}
                alt="product"
                className="certificate-img-main"
                draggable={false}
                crossOrigin="anonymous"
                onError={(e) => (e.currentTarget.src = NO_IMG)}
              />
              <img
                src={toProxy(authenticStickerUrl)}
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
                  src={toProxy(verityLogoUrl)}
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
            VerityAI is not affiliated with any of the brands authenticated...
          </div>

          <button className="certificate-download-btn" onClick={handleDownload}>
            <span role="img" aria-label="download">⬇️</span> Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
