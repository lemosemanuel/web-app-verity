import React, { useState, useEffect } from "react";
import ProductRow from "./ProductRow";
import Pagination from "./Pagination";
import AddProductModal from "./AddProductModal";
import VerifyCertificateModal from "./VerifyCertificateModal";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterVendor, setFilterVendor] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [filterText, setFilterText] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Certificado
  const [certModal, setCertModal] = useState({
    open: false,
    product: null,
    certificateData: null,
    mainImageUrl: null,
  });

  // const [verifyLoading, setVerifyLoading] = useState(false);

  // Helpers
  const getImageSrc = (imgObj) => imgObj?.preview || imgObj?.url || "";

  // Load products
  function loadProducts() {
    setLoading(true);
    fetch("https://python-services.stage.highend.app/api/webapp_products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }
  useEffect(() => {
    loadProducts();
  }, []);

  // Select options
  const allVendors = Array.from(new Set(products.map((p) => p.brand_name).filter(Boolean))).sort();

  const allResults = Array.from(
    new Set(
      products
        .map((p) => {
          const v =
            p.verify_result ||
            (typeof p.verification_metadata === "object" && p.verification_metadata?.status) ||
            (typeof p.verification_metadata === "string" &&
              JSON.parse(p.verification_metadata || "{}")?.status) ||
            "not_verified";
          return (v || "").toLowerCase();
        })
        .filter(Boolean)
    )
  ).sort();

  // Filtered list
  const filteredProducts = products.filter((product) => {
    if (filterVendor && product.brand_name !== filterVendor) return false;

    let result =
      product.verify_result ||
      (typeof product.verification_metadata === "object" && product.verification_metadata?.status) ||
      (typeof product.verification_metadata === "string" &&
        JSON.parse(product.verification_metadata || "{}")?.status) ||
      "not_verified";
    result = result?.toLowerCase() || "not_verified";
    if (filterResult && result !== filterResult) return false;

    if (filterText.trim()) {
      const txt = filterText.trim().toLowerCase();
      if (
        !(
          (product.name && product.name.toLowerCase().includes(txt)) ||
          (product.id && (product.id + "").toLowerCase().includes(txt)) ||
          (product.brand_name && product.brand_name.toLowerCase().includes(txt))
        )
      ) {
        return false;
      }
    }

    return true;
  });

  // Checkboxes
  function handleCheck(id) {
    setCheckedRows((prev) => (prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]));
  }
  function handleCheckAll(e) {
    setCheckedRows(e.target.checked ? filteredProducts.map((p) => p.id) : []);
  }
  const allChecked = filteredProducts.length > 0 && checkedRows.length === filteredProducts.length;

  // Create / Edit product
  function handleCreateProduct() {
    setEditingProduct(null);
    setModalOpen(true);
  }
  function handleEditProduct(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }
  function handleProductCreated() {
    loadProducts();
    setModalOpen(false);
    setEditingProduct(null);
  }

  // // Verify with Verity
  // async function handleVerifyProduct() {
  //   const selectedProduct = filteredProducts.find((p) => checkedRows.includes(p.id));
  //   if (!selectedProduct) {
  //     alert("Please select a product to verify.");
  //     return;
  //   }

  //   setVerifyLoading(true);

  //   const payload = {
  //     brand: selectedProduct.brand_name,
  //     brand_id: selectedProduct.brand_id,
  //     user_id: "USER-123456",
  //     images: (selectedProduct.images || []).map((img) => ({ url: img.url })),
  //     category_name: selectedProduct.category_title,
  //     category_id: selectedProduct.category_id,
  //   };

  //   try {
  //     const response = await fetch(
  //       "https://python-services.stage.highend.app/authentication/authentication",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       }
  //     );
  //     if (!response.ok) throw new Error("Authentication failed.");
  //     const result = await response.json();

  //     const certData = {
  //       ...result,
  //       brand: result.brand || selectedProduct.brand_name,
  //       images: result.images || selectedProduct.images || [],
  //       date_of_authentication: result.date_of_authentication,
  //       certificate_url: result.certificate_url,
  //       qr_base64: result.qr_base64,
  //     };

  //     setCertModal({
  //       open: true,
  //       product: selectedProduct,
  //       certificateData: certData,
  //       mainImageUrl: getImageSrc(selectedProduct.images?.[0]),
  //     });
  //   } catch (err) {
  //     alert("Failed to verify product: " + err.message);
  //   } finally {
  //     setVerifyLoading(false);
  //   }
  // }

  // View certificate (row icon)
  function handleViewCertificate(product, mainImageUrlFromRow) {
    let vMeta = product.verification_metadata;
    if (typeof vMeta === "string") {
      try {
        vMeta = JSON.parse(vMeta);
      } catch {
        vMeta = {};
      }
    }

    const certData = {
      ...vMeta,
      brand: product.brand_name,
      images: product.images || [],
      date_of_authentication: product.verified_at,
      certificate_url: product.certificate_url,
      qr_base64: product.qr_base64,
    };

    setCertModal({
      open: true,
      product,
      certificateData: certData,
      mainImageUrl: mainImageUrlFromRow || getImageSrc(product.images?.[0]),
    });
  }

  function handleCertificateClose() {
    setCertModal({ open: false, product: null, certificateData: null, mainImageUrl: null });
  }

  if (loading) return <div className="table-container">Loading products...</div>;

  return (
    <div className="table-container">
      {/* HEADER */}
      <div className="header header-inline">
        <button className="button-main" onClick={handleCreateProduct}>
          + Create product
        </button>

        <div className="filters-inline">
          <button className="button-ghost" tabIndex={-1}>Filter by</button>

          <select
            className="filter-select"
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
          >
            <option value="">Vendor</option>
            {allVendors.map((vendor) => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
          >
            <option value="">Verity Result</option>
            {allResults.map((res) => (
              <option key={res} value={res}>{res.charAt(0).toUpperCase() + res.slice(1)}</option>
            ))}
          </select>

          <input
            className="filter-input"
            type="text"
            placeholder="Search by product"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <button
            className="button-secondary"
            onClick={() => {
              setFilterVendor("");
              setFilterResult("");
              setFilterText("");
            }}
          >
            Reset filters
          </button>
        </div>
      </div>


      {/* Modals */}
      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onProductCreated={handleProductCreated}
        product={editingProduct}
      />

      <VerifyCertificateModal
        open={certModal.open}
        product={certModal.product}
        certificateData={certModal.certificateData}
        mainImageUrl={certModal.mainImageUrl}
        onClose={handleCertificateClose}
      />

      {/* Tabla */}
      <table className="product-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleCheckAll}
                aria-label="Select all"
              />
            </th>
            <th>Image</th>
            <th>ID</th>
            <th>Brand</th>
            <th>
              Additional images <span title="Add extra photos">ℹ️</span>
            </th>
            <th>Verity Result</th>
            <th>
              Verity Certificate <span title="Show certificate">ℹ️</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              checked={checkedRows.includes(product.id)}
              onCheck={handleCheck}
              onViewCertificate={handleViewCertificate}
              onEditProduct={handleEditProduct}
            />
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <Pagination />
      </div>
    </div>
  );
}
