import React from "react";
import StatusTag from "./StatusTag";

function getImageSrc(imgObj) {
  if (imgObj.preview) return imgObj.preview;
  return imgObj.url;
}

export default function ProductRow({ product, checked, onCheck, onViewCertificate }) {
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
    } else {
      verifyLabel = product.verify_result;
      verifyStatus = v.replace(/\s/g, "_");
    }
  }

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-3 py-3 text-center">
        <input type="checkbox" checked={checked} onChange={() => onCheck(product.id)} />
      </td>
      <td className="px-3 py-3">
        {mainImageObj ? (
          <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src={getImageSrc(mainImageObj)}
              alt={product.name || "Product"}
              className="w-12 h-12 object-cover"
              loading="lazy"
              onError={handleImgError}
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xl">No Image</span>
          </div>
        )}
      </td>
      <td className="px-3 py-3 font-medium">
        <div className="font-semibold">{product.brand_name || "-"}</div>
        <div className="text-xs text-gray-500">{product.description?.slice(0, 60) || ""}</div>
      </td>
      <td className="px-3 py-3">{product.category_title || "-"}</td>
      <td className="px-3 py-3">{product.brand_name || "-"}</td>
      <td className="px-3 py-3 flex items-center gap-2">
        <StatusTag status={verifyStatus}>{verifyLabel}</StatusTag>
        {verifyStatus === "approved" && (
          <button
            type="button"
            className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold border border-green-400 hover:bg-green-200"
            onClick={() => onViewCertificate(product)}
            title="Ver Certificado"
          >
            Ver certificado
          </button>
        )}
      </td>
      <td className="px-3 py-3 text-center">
        <div className="flex flex-wrap gap-1 justify-center">
          {additionalImagesObjs.map((imgObj, idx) => (
            <img
              key={idx}
              src={getImageSrc(imgObj)}
              alt={`additional ${idx}`}
              className="w-7 h-7 rounded object-cover border border-gray-200"
              loading="lazy"
              onError={handleImgError}
            />
          ))}
        </div>
      </td>
    </tr>
  );
}
