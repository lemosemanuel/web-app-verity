import React from "react";
import StatusTag from "./StatusTag";
import downloadIcon from "./download.png";
import addPhotoIcon from "./image-upload.png";
import "./ProductRow.css";

function getImageSrc(imgObj) {
  return imgObj?.preview || imgObj?.url || "";
}

function pickMainImage(imagesArr = []) {
  if (!Array.isArray(imagesArr) || !imagesArr.length) return null;
  return (
    imagesArr.find(img =>
      /(main|principal|cover|primary)/i.test(img.asset_group || img.type || "")
    ) || imagesArr[0]
  );
}

export default function ProductRow({
  product,
  checked,
  onCheck,
  onViewCertificate,
  onEditProduct,
}) {
  const imagesArr = Array.isArray(product.images) ? product.images : [];

  const mainImageObj = pickMainImage(imagesArr);
  const additionalImagesObjs = imagesArr.filter(img => img !== mainImageObj).slice(0, 2);

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
          <div
            className="product-additional-img"
            style={{ background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
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

          <button
            className="add-photos-btn"
            title="Add photos"
            type="button"
            onClick={() => onEditProduct(product)}
          >
            <img src={addPhotoIcon} alt="Add photos" draggable="false" />
          </button>
        </div>
      </td>

      {/* Verity Result */}
      <td className="product-table-status">
        <StatusTag status={verifyStatus}>{verifyLabel}</StatusTag>
      </td>

      {/* Certificate */}
      <td className="product-table-certificate">
        {verifyStatus === "approved" && (
          <button
            className="download-btn"
            title="Show certificate"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            onClick={() =>
              onViewCertificate(
                product,
                getImageSrc(mainImageObj) // misma URL que ves en la tabla
              )
            }
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
