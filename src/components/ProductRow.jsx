import React from "react";
import StatusTag from "./StatusTag";
import downloadIcon from "./download.png";
import addPhotoIcon from "./image-upload.png";
import './ProductRow.css';

function getImageSrc(imgObj) {
  if (imgObj?.preview) return imgObj.preview;
  return imgObj?.url;
}

export default function ProductRow({
  product, checked, onCheck, onViewCertificate, onEditProduct // <--- añadimos el handler de edición
}) {
  const imagesArr = Array.isArray(product.images) ? product.images : [];
  const mainImageObj = imagesArr.length > 0 ? imagesArr[0] : null;
  const additionalImagesObjs = imagesArr.length > 1 ? imagesArr.slice(1, 3) : [];

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/48?text=No+Img";
  };

  let verifyLabel = "Not verified";
  let verifyStatus = "not_verified";
  if (product.verify_result) {
    const v = product.verify_result.toLowerCase();
    if (v === "approved") {
      verifyLabel = "Approved";
      verifyStatus = "approved";
    } else if (v === "rejected") {
      verifyLabel = "Rejected";
      verifyStatus = "rejected";
    } else if (v.includes("try again")) {
      verifyLabel = "Try again";
      verifyStatus = "try_again";
    } else {
      verifyLabel = product.verify_result;
      verifyStatus = v.replace(/\s/g, "_");
    }
  }

  // download icon visible only if approved and has certificate
  // const canDownloadCertificate = verifyStatus === "approved" && (product.certificate_url || product.qr_base64);

  return (
    <tr className="product-row">
      {/* Checkbox */}
      <td className="product-table-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onCheck(product.id)}
          aria-label="Select product"
        />
      </td>
      {/* Main Image */}
      <td className="product-table-image">
        {mainImageObj ? (
          <img
            src={getImageSrc(mainImageObj)}
            alt={product.name || "Product"}
            className="product-additional-img"
            loading="lazy"
            onError={handleImgError}
          />
        ) : (
          <div className="product-additional-img" style={{ background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#bbb", fontSize: "12px" }}>No Image</span>
          </div>
        )}
      </td>
      {/* ID */}
      <td className="product-table-id">{product.id || "-"}</td>
      {/* Brand */}
      <td className="product-table-brand">{product.brand_name || "-"}</td>
      {/* Additional Images + Add photo */}
      <td className="product-table-additional">
        <div style={{ display: "flex", alignItems: "center" }}>
          {additionalImagesObjs.map((imgObj, idx) => (
            <img
              key={idx}
              src={getImageSrc(imgObj)}
              alt={`additional ${idx}`}
              className="product-additional-img"
              loading="lazy"
              onError={handleImgError}
            />
          ))}
          {/* Botón Add photos para EDITAR producto */}
          <button
            className="add-photos-btn"
            title="Add photos"
            type="button"
            onClick={() => onEditProduct(product)} // <--- llamado a editar
          >
            <img
              src={addPhotoIcon}
              alt="Add photos"
              draggable="false"
            />
            {/* <span>Add photos</span> */}
          </button>
        </div>
      </td>
      {/* Verity Result */}
      <td className="product-table-status">
        <StatusTag status={verifyStatus}>{verifyLabel}</StatusTag>
      </td>
      {/* Certificate Download SOLO si approved */}
      <td className="product-table-certificate">
        {verifyStatus === "approved" && (
          <button
            className="download-btn"
            title="Show certificate"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            onClick={() => onViewCertificate(product)}
          >
            <img
              src={downloadIcon}
              alt="Download"
              style={{ width: 28, height: 28 }}
              draggable="false"
            />
          </button>
        )}
      </td>
    </tr>
  );
}
