import React, { useRef } from "react";
import html2canvas from "html2canvas";
import authenticSticker from "../assets/authentic.png";
import verityLogo from "../assets/verity-logo.png";
import "./VerifyCertificateModal.css";

const NO_IMG =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2Y1ZjVmNScvPjx0ZXh0IHg9JzUwJScgeT0nNTAlJyBkeT0nLjMnIGZvbnQtc2l6ZT0nMjAnIGZpbGw9JyNiYmInPk5vIEltZzwvdGV4dD48L3N2Zz4=";

const getSrc = (img) => img?.preview || img?.url || "";

/** Pasa URL externas por el proxy Nginx */
const toProxy = (url) => {
  if (!url || url.startsWith("data:")) return url || NO_IMG;
  try {
    const u = new URL(url);
    return `/img-proxy${u.pathname}${u.search || ""}`;
  } catch {
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
  const ref = useRef(null);
  if (!open) return null;

  // -------- Imagen principal --------
  const fallback =
    getSrc(product?.images?.[0]) ||
    getSrc(certificateData?.images?.[0]) ||
    "";
  const rawImg = mainImgFromRow || fallback;
  const proxiedImg = rawImg ? toProxy(rawImg) : NO_IMG;

  // -------- Datos --------
  const {
    brand = product?.brand_name || "Brand name",
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

  // -------- Descargar PNG --------
  async function handleDownload() {
    if (!ref.current) return;

    // asegurar CORS
    ref.current.querySelectorAll("img").forEach((i) =>
      i.setAttribute("crossorigin", "anonymous")
    );

    const canvas = await html2canvas(ref.current, {
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
      <div className="certificate-card" ref={ref}>
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
                src={authenticSticker}
                alt="authentic"
                className="certificate-authentic-sticker"
                draggable={false}
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
                  src={verityLogo}
                  alt="Verity AI"
                  className="certificate-verity-logo"
                  draggable={false}
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
