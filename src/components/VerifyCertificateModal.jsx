// VerifyCertificateModal.jsx
import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toLocalBlobUrl } from "../utils/toLocalBlobUrl";
import "./VerifyCertificateModal.css";

const NO_IMG =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2Y1ZjVmNScvPjx0ZXh0IHg9JzUwJScgeT0nNTAlJyBkeT0nLjMnIGZvbnQtc2l6ZT0nMjAnIGZpbGw9JyNiYmInPk5vIEltZzwvdGV4dD48L3N2Zz4=";

// helper
const imgSrc = (img) =>
  img?.preview ||
  img?.url ||
  (img?.file_b64 ? `data:image/jpeg;base64,${img.file_b64}` : "") ||
  "";

export default function VerifyCertificateModal({
  open,
  onClose,
  certificateData,
  product,
  mainImageUrl: mainImgFromRow,   // opcional: viene desde ProductRow
  imagesOverride,                  // opcional: viene desde AddProductModal
}) {
  const ref = useRef(null);
  const [imgMain, setImgMain] = useState("");
  const [ready, setReady] = useState(false);

  // logos locales (mismo origin)
  const authenticStickerUrl = "/assets/authentic.png";
  const verityLogoUrl = "/assets/verity-logo.png";

  useEffect(() => {
    if (!open) return;

    // 1) prioridad: mainImageUrl prop
    // 2) primeras imágenes de imagesOverride
    // 3) imágenes del product
    // 4) imágenes de certificateData
    const imagesArr =
      (imagesOverride && imagesOverride.length && imagesOverride) ||
      product?.images ||
      certificateData?.images ||
      [];

    const fallback = imgSrc(imagesArr[0]);
    const raw = mainImgFromRow || fallback;

    (async () => {
      if (!raw) {
        setImgMain(NO_IMG);
        setReady(true);
        return;
      }
      // Intentamos blobUrl para evitar CORS
      const blobUrl = await toLocalBlobUrl(raw);
      setImgMain(blobUrl || raw);
      setReady(true);
    })();

    return () => setReady(false);
  }, [open, product, certificateData, mainImgFromRow, imagesOverride]);

  if (!open) return null;

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
        d.toLocaleDateString(undefined, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        " " +
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      formattedDate = rawDate;
    }
  }

  async function handleDownload() {
    if (!ref.current) return;

    ref.current.querySelectorAll("img").forEach((i) =>
      i.setAttribute("crossorigin", "anonymous")
    );

    const canvas = await html2canvas(ref.current, {
      useCORS: true,
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
        <button className="certificate-close-btn" onClick={onClose}>
          ×
        </button>

        <div className="certificate-content">
          <h1 className="certificate-main-title">Certificate Of Authenticity</h1>

          <div className="certificate-row">
            <div className="certificate-img-box">
              {ready ? (
                <img
                  src={imgMain || NO_IMG}
                  alt="product"
                  className="certificate-img-main"
                  draggable={false}
                  crossOrigin="anonymous"
                  onError={(e) => (e.currentTarget.src = NO_IMG)}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                  }}
                >
                  Loading...
                </div>
              )}

              <img
                src={authenticStickerUrl}
                alt="authentic"
                className="certificate-authentic-sticker"
                draggable={false}
                crossOrigin="anonymous"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            <div className="certificate-meta-box">
              <div className="certificate-meta-field">
                <span className="certificate-meta-label">Date:</span>
                <span className="certificate-meta-value">{formattedDate}</span>
              </div>
              <div className="certificate-meta-field">
                <span className="certificate-meta-label">Brand:</span>
                <span className="certificate-meta-value" style={{ fontStyle: "italic" }}>
                  {brand}
                </span>
              </div>
              <div className="certificate-verity-logo-box">
                <img
                  src={verityLogoUrl}
                  alt="Verity AI"
                  className="certificate-verity-logo"
                  draggable={false}
                  crossOrigin="anonymous"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            </div>
          </div>

          <div className="certificate-description">
            <div className="certificate-desc-text">
              This item has been deemed
              <br />
              authentic by Verity AI.
              <br />
              <br />
              Verity AI provides a financial
              <br />
              guarantee for this certificate.
            </div>
          </div>

          <div className="certificate-fineprint">
            VerityAI is not affiliated with any of the brands authenticated...
          </div>

          <button
          className="certificate-download-btn"
          onClick={handleDownload}
          disabled={!ready}
          >
            ⬇️ Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
