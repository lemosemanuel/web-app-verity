import React, { useState, useEffect, useRef } from "react";
import ScannerModal from "./ScannerModal";
import VerifyCertificateModal from "./VerifyCertificateModal";
import "./AddProductModal.css";
import ErrorModal from "./ErrorModal";

export default function AddProductModal({ open, onClose, onProductCreated }) {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assetGroups, setAssetGroups] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    brand_id: "",
    category_id: "",
    images: []
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const fileInputs = useRef({});
  const dragImgRef = useRef(null);
  const [draggedOver, setDraggedOver] = useState("");

  useEffect(() => {
    if (open) {
      fetch("http://172.20.10.3:80/api/brands")
        .then(r => r.json())
        .then(setBrands);
      fetch("http://172.20.10.3:80/api/categories")
        .then(r => r.json())
        .then(setCategories);
      setAssetGroups([]);
      setForm(f => ({ ...f, images: [] }));
    }
  }, [open]);

  function handleCategoryChange(e) {
    const category_id = e.target.value;
    setForm(f => ({ ...f, category_id, images: [] }));
    if (!category_id) {
      setAssetGroups([]);
      return;
    }
    fetch(`http://172.20.10.3:80/api/category_asset_groups/${category_id}`)
      .then(r => r.json())
      .then(list => setAssetGroups(list));
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImageChange(asset_group, e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => {
        const images = [
          ...f.images.filter(img => img.asset_group !== asset_group),
          {
            asset_group,
            file_b64: reader.result.split(",")[1],
            filename: file.name,
            preview: reader.result
          }
        ];
        return { ...f, images };
      });
      if (fileInputs.current[asset_group]) fileInputs.current[asset_group].value = "";
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImg(asset_group) {
    setForm(f => ({
      ...f,
      images: f.images.filter(img => img.asset_group !== asset_group)
    }));
  }

  function onDragStart(asset_group) {
    dragImgRef.current = asset_group;
  }
  function onDragEnter(asset_group) {
    setDraggedOver(asset_group);
  }
  function onDragLeave(asset_group) {
    setDraggedOver(prev => (prev === asset_group ? "" : prev));
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
        setForm(f => {
          const images = [
            ...f.images.filter(img => img.asset_group !== asset_group),
            {
              asset_group,
              file_b64: reader.result.split(",")[1],
              filename: file.name,
              preview: reader.result
            }
          ];
          return { ...f, images };
        });
      };
      reader.readAsDataURL(file);
    } else if (dragImgRef.current && dragImgRef.current !== asset_group) {
      setForm(f => {
        const draggedImg = f.images.find(img => img.asset_group === dragImgRef.current);
        if (!draggedImg) return f;
        const filtered = f.images.filter(
          img => img.asset_group !== dragImgRef.current && img.asset_group !== asset_group
        );
        return {
          ...f,
          images: [
            ...filtered,
            { ...draggedImg, asset_group: asset_group }
          ]
        };
      });
    }
    dragImgRef.current = null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleanImages = form.images.map(img => ({
      asset_group: img.asset_group,
      file_b64: img.file_b64,
      filename: img.filename,
      preview: img.preview
    }));

    const minImgs = assetGroups.filter(g => g.is_required).length;
    const imgsPresent = assetGroups.filter(
      g => form.images.some(img => img.asset_group === g.name)
    ).length;
    if (!form.name || !form.brand_id || !form.category_id || imgsPresent < minImgs) {
      alert(`Please fill all fields and upload at least ${minImgs} required images.`);
      return;
    }

    setScannerOpen(true);

    const predictPayload = {
      brand: brands.find(b => b.id === form.brand_id)?.name || "",
      images: cleanImages.map(img => ({
        file_b64: img.file_b64,
        filename: img.filename,
        asset_group: img.asset_group
      })),
      user_id: "test-user-id",
      brand_id: form.brand_id,
      category_name: categories.find(c => c.id === form.category_id)?.title || "",
      category_id: form.category_id,
      buyer_seller: "buyer",
      platforms: [],
      custom_platform: ""
    };

    fetch("http://172.20.10.3:80/authentication/authentication", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(predictPayload)
    })
      .then(r => r.json())
      .then(res => {
        setScannerOpen(false);
        const status = res.status && res.status.toLowerCase();

        if (status === "approved") {
          setCertificateData(res); // 🔴 Solo muestro el certificado, NO cierro el modal principal!
        } else {
          setErrorModalOpen(true); // Error, no cierro nada más.
        }

        // Guardar el producto siempre (opcional)
        const formToSend = {
          name: form.name.trim(),
          description: form.description?.trim() || "",
          price: parseFloat(form.price) || 0,
          brand_id: form.brand_id,
          category_id: form.category_id,
          images: cleanImages,
          verification_metadata: res,
          verified_at: new Date().toISOString(),
          status: status === "approved" ? "VERIFIED" : "FAILED"
        };

        fetch("http://172.20.10.3:80/api/webapp_products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToSend)
        })
          .then(r => r.json())
          .then(createdRes => {
            onProductCreated && onProductCreated(createdRes);
            // NO reseteo ni cierro modal todavía!
          });
      })
      .catch(err => {
        setScannerOpen(false);
        setErrorModalOpen(true);
      });
  }

  // Solo reseteo/cerro TODO cuando el usuario cierra el certificado:
  function handleCertificateClose() {
    setCertificateData(null);
    setForm({
      name: "",
      description: "",
      price: "",
      brand_id: "",
      category_id: "",
      images: []
    });
    setAssetGroups([]);
    onClose();
  }

  function handleErrorClose() {
    setErrorModalOpen(false);
    // El modal principal sigue abierto para reintentar.
  }

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-card">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2 className="modal-title">Step 1: Upload Images</h2>
          <div style={{ fontSize: 18, marginBottom: 10 }}>
            Take clear photos as requested for this category
          </div>
          <form onSubmit={handleSubmit} autoComplete="off" style={{ marginTop: 12 }}>
            <div className="row-group" style={{ marginBottom: 14 }}>
              <label style={{ flex: 1 }}>
                Brand
                <select
                  name="brand_id"
                  value={form.brand_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map(b => (
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
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
            </div>
            {assetGroups.length > 0 && (
              <div className="img-group-grid">
                {assetGroups.map(ag => {
                  const imgObj = form.images.find(img => img.asset_group === ag.name);
                  return (
                    <div
                      className={
                        "img-card" +
                        (draggedOver === ag.name ? " img-card-highlight" : "")
                      }
                      key={ag.id}
                    >
                      <div className="img-label-asset">
                        {ag.name}
                        {ag.is_required && (
                          <span style={{ color: "#f66", fontWeight: 700 }}> *</span>
                        )}
                      </div>
                      <div
                        className="img-card-imgbox"
                        onDragOver={onDragOver}
                        onDragEnter={() => onDragEnter(ag.name)}
                        onDragLeave={() => onDragLeave(ag.name)}
                        onDrop={e => onDrop(ag.name, e)}
                      >
                        {imgObj ? (
                          <>
                            <img
                              src={imgObj.preview}
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
                              <span
                                style={{
                                  fontWeight: 900,
                                  fontSize: "1.1rem",
                                  color: "#ee3939",
                                  display: "inline-block",
                                  lineHeight: "18px"
                                }}
                              >
                                ×
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <label className="img-upload-btn">
                              +
                              <input
                                type="file"
                                accept="image/*"
                                ref={el => (fileInputs.current[ag.name] = el)}
                                style={{ display: "none" }}
                                onChange={e => handleImageChange(ag.name, e)}
                              />
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <label>
              Product name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Enter product name"
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={700}
                placeholder="Type a description (optional)"
              />
            </label>
            <label>
              Price
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                required
                style={{ maxWidth: 130 }}
                placeholder="0.00"
              />
            </label>
            <button
              className="submit-btn"
              disabled={scannerOpen}
              style={{ marginTop: 22, width: 320, fontSize: 18, background: "#C3FF5B" }}
              type="submit"
            >
              {scannerOpen ? "Creating..." : "Submit for authentication"}
            </button>
          </form>
        </div>
      </div>
      <ScannerModal open={scannerOpen} images={form.images} />
      <VerifyCertificateModal
        open={!!certificateData}
        onClose={handleCertificateClose}  // Ahora recién se cierra todo
        certificateData={certificateData}
      />
      <ErrorModal open={errorModalOpen} onClose={handleErrorClose} />
    </>
  );
}
