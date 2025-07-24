// AddProductModal.jsx
import React, { useState, useEffect, useRef } from "react";
import ScannerModal from "./ScannerModal";
import VerifyCertificateModal from "./VerifyCertificateModal";
import ErrorModal from "./ErrorModal";
import "./AddProductModal.css";
import { ENDPOINTS } from './urls';

const FIXED_ASSET_GROUPS = [
  { id: 1, name: "Main photo",      is_required: true },
  { id: 2, name: "Back photo",      is_required: true },
  { id: 3, name: "Brand label",     is_required: true },
  { id: 4, name: "Care label tag",  is_required: true },
];

export default function AddProductModal({ open, onClose, onProductCreated, product }) {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    brand_id: "",
    category_id: "",
    images: [],
  });

  const [scannerOpen, setScannerOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  const fileInputs = useRef({});
  const dragImgRef = useRef(null);
  const [draggedOver, setDraggedOver] = useState("");

  // --- Catálogos (brands, categories) ---
  useEffect(() => {
    if (!open) return;

    fetch(ENDPOINTS.brands)
      .then(r => r.json())
      .then(setBrands);

    fetch(ENDPOINTS.categories)
      .then(r => r.json())
      .then(setCategories);
  }, [open]);

  // --- Inicializar formulario en modo edición/creación ---
  useEffect(() => {
    if (!open) return;

    if (product) {
      setForm({
        brand_id: product.brand_id || "",
        category_id: product.category_id || "",
        images: Array.isArray(product.images)
          ? product.images.map((img) => ({
              ...img,
              preview: img.preview || img.url,
              url: img.url,
              asset_group: img.asset_group,
              filename: img.filename,
            }))
          : [],
      });
    } else {
      setForm({ brand_id: "", category_id: "", images: [] });
    }
  }, [open, product]);

  function handleCategoryChange(e) {
    const category_id = e.target.value;
    setForm((f) => ({ ...f, category_id, images: [] }));
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImageChange(asset_group, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => {
        const images = [
          ...f.images.filter((img) => img.asset_group !== asset_group),
          {
            asset_group,
            file_b64: reader.result.split(",")[1],
            filename: file.name,
            preview: reader.result,
          },
        ];
        return { ...f, images };
      });
      if (fileInputs.current[asset_group]) fileInputs.current[asset_group].value = "";
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImg(asset_group) {
    setForm((f) => ({
      ...f,
      images: f.images.filter((img) => img.asset_group !== asset_group),
    }));
  }

  // Drag & drop (opcional mantener)
  function onDragStart(asset_group) {
    dragImgRef.current = asset_group;
  }
  function onDragEnter(asset_group) {
    setDraggedOver(asset_group);
  }
  function onDragLeave(asset_group) {
    setDraggedOver((prev) => (prev === asset_group ? "" : prev));
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect =
      e.dataTransfer.files && e.dataTransfer.files.length ? "copy" : "move";
  }
  function onDrop(asset_group, e) {
    e.preventDefault();
    setDraggedOver("");
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => {
          const images = [
            ...f.images.filter((img) => img.asset_group !== asset_group),
            {
              asset_group,
              file_b64: reader.result.split(",")[1],
              filename: file.name,
              preview: reader.result,
            },
          ];
          return { ...f, images };
        });
      };
      reader.readAsDataURL(file);
    } else if (dragImgRef.current && dragImgRef.current !== asset_group) {
      setForm((f) => {
        const draggedImg = f.images.find(
          (img) => img.asset_group === dragImgRef.current
        );
        if (!draggedImg) return f;
        const filtered = f.images.filter(
          (img) =>
            img.asset_group !== dragImgRef.current &&
            img.asset_group !== asset_group
        );
        return {
          ...f,
          images: [...filtered, { ...draggedImg, asset_group }],
        };
      });
    }
    dragImgRef.current = null;
  }

  // -----------------------------------------------------------------------
  // SUBMIT
  // -----------------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Merge imágenes nuevas + existentes
    const mergedImages = FIXED_ASSET_GROUPS.map((ag) => {
      // nuevas
      const imgNew = form.images.find(
        (img) => img.asset_group === ag.name && (img.file_b64 || img.url)
      );
      if (imgNew) {
        return {
          asset_group: ag.name,
          ...(imgNew.file_b64
            ? { file_b64: imgNew.file_b64, filename: imgNew.filename }
            : { url: imgNew.url, filename: imgNew.filename }),
          preview: imgNew.preview,
        };
      }
      // existentes del producto
      if (product?.images?.length) {
        const imgOld = product.images.find(
          (img) => img.asset_group === ag.name && img.url
        );
        if (imgOld) {
          return {
            asset_group: ag.name,
            url: imgOld.url,
            filename: imgOld.filename,
            preview: imgOld.url,
          };
        }
      }
      return null;
    }).filter(Boolean);

    const minImgs = FIXED_ASSET_GROUPS.length;
    const imgsPresent = mergedImages.length;

    if (!form.brand_id || !form.category_id || imgsPresent < minImgs) {
      alert(`Please select brand & category and upload all ${minImgs} required images.`);
      setSubmitting(false);
      return;
    }

    setScannerOpen(true);

    const predictPayload = {
      brand: brands.find((b) => b.id === form.brand_id)?.name || "",
      images: mergedImages,
      user_id: "test-user-id",
      brand_id: form.brand_id,
      category_name: categories.find((c) => c.id === form.category_id)?.title || "",
      category_id: form.category_id,
      buyer_seller: "buyer",
      platforms: [],
      custom_platform: "",
    };

    try {
      // 1) Autenticación
      const verityRes = await fetch(
        ENDPOINTS.authentication.authenticate,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(predictPayload),
        }
      ).then((r) => r.json());

      setScannerOpen(false);
      const status = verityRes.status?.toLowerCase();

      if (status === "approved") {
        setCertificateData(verityRes);
      } else {
        setErrorModalOpen(true);
      }

      // 2) Guardar producto
      const brandName = brands.find((b) => b.id === form.brand_id)?.name || "";
      const categoryName =
        categories.find((c) => c.id === form.category_id)?.title || "";

      const formToSend = {
        name: product?.name || `${brandName} ${categoryName}`.trim(),
        description: "", // oculto en UI
        price: 0,        // oculto en UI
        brand_id: form.brand_id,
        category_id: form.category_id,
        images: mergedImages,
        verification_metadata: verityRes,
        verified_at: new Date().toISOString(),
        status: "ACTIVE",
      };

      const fetchOptions = {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSend),
      };

      const url = product
        ? `https://python-services.stage.highend.app/api/webapp_products/${product.id}`
        : "https://python-services.stage.highend.app/api/webapp_products";

      const createdRes = await fetch(url, fetchOptions).then((r) => r.json());
      setCreatedProduct(createdRes);

    } catch (err) {
      console.error(err);
      setScannerOpen(false);
      setErrorModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------------------------------------------------
  // Cerrar certificado
  // -----------------------------------------------------------------------
  function handleCertificateClose() {
    if (createdProduct && onProductCreated) {
      onProductCreated(createdProduct);
    }
    setCertificateData(null);
    setCreatedProduct(null);

    setForm({ brand_id: "", category_id: "", images: [] });
    onClose?.();
  }

  function handleErrorClose() {
    setErrorModalOpen(false);
    setSubmitting(false);
  }

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-card">
          <button className="close-btn" onClick={onClose}>×</button>

          <h2 className="modal-title">
            Step 1: Upload your images to check authenticity in under 30 seconds
          </h2>
          <p className="subtitle">
            Brand is auto detected, please choose an alternate brand from the drop down if you disagree
          </p>

          <form onSubmit={handleSubmit} autoComplete="off" style={{ marginTop: 12 }}>
            <div className="row-group" style={{ marginBottom: 18 }}>
              <label style={{ flex: 1 }}>
                Brand
                <select name="brand_id" value={form.brand_id} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </label>

              <label style={{ flex: 1 }}>
                Category
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="img-group-grid big">
              {FIXED_ASSET_GROUPS.map((ag) => {
                const imgObj = form.images.find((img) => img.asset_group === ag.name);
                return (
                  <div
                    className={"img-card" + (draggedOver === ag.name ? " img-card-highlight" : "")}
                    key={ag.id}
                  >
                    <div
                      className="img-card-imgbox big"
                      onDragOver={onDragOver}
                      onDragEnter={() => onDragEnter(ag.name)}
                      onDragLeave={() => onDragLeave(ag.name)}
                      onDrop={(e) => onDrop(ag.name, e)}
                    >
                      {imgObj && (imgObj.preview || imgObj.url) ? (
                        <>
                          <img
                            src={imgObj.preview || imgObj.url}
                            alt={ag.name}
                            className="img-main-preview"
                            draggable
                            onDragStart={() => onDragStart(ag.name)}
                          />
                          <button
                            className="img-delete-btn"
                            type="button"
                            title="Remove image"
                            onClick={() => handleRemoveImg(ag.name)}
                          >
                            <span style={{ fontWeight: 900, fontSize: "1.1rem", lineHeight: "18px" }}>×</span>
                          </button>
                        </>
                      ) : (
                        <label className="img-upload-btn big">
                          +
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => (fileInputs.current[ag.name] = el)}
                            style={{ display: "none" }}
                            onChange={(e) => handleImageChange(ag.name, e)}
                          />
                        </label>
                      )}
                    </div>
                    <div className="img-label-asset caption">
                      {ag.name}{ag.is_required && <span style={{ color: "#f66", fontWeight: 700 }}> *</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="submit-btn"
              disabled={scannerOpen || submitting}
              style={{ marginTop: 30, width: 320, fontSize: 18, background: "#C3FF5B" }}
              type="submit"
            >
              {scannerOpen || submitting ? "Verifying..." : "Submit for authentication"}
            </button>
          </form>
        </div>
      </div>

      {/* Scanner */}
      <ScannerModal
        open={scannerOpen}
        images={FIXED_ASSET_GROUPS.map((ag) => {
          const img = form.images.find((img) => img.asset_group === ag.name);
          if (img?.preview) return { ...img, asset_group: ag.name };
          if (product?.images) {
            const oldImg = product.images.find((img2) => img2.asset_group === ag.name);
            if (oldImg?.url) return { ...oldImg, asset_group: ag.name, preview: oldImg.url };
          }
          return { asset_group: ag.name };
        })}
      />

      {/* Certificado */}
      <VerifyCertificateModal
        open={!!certificateData}
        certificateData={certificateData}
        product={createdProduct || product}
        onClose={handleCertificateClose}
        onFinish={handleCertificateClose}
      />

      {/* Error */}
      <ErrorModal open={errorModalOpen} onClose={handleErrorClose} />
    </>
  );
}
