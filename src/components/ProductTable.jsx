import React, { useState, useEffect } from "react";
import ProductRow from "./ProductRow";
import Pagination from "./Pagination";
import AddProductModal from "./AddProductModal";
import VerifyCertificateModal from "./VerifyCertificateModal";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // --- Verity Modal State ---
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  function loadProducts() {
    setLoading(true);
    fetch("http://172.20.10.3:80/api/webapp_products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadProducts(); }, []);

  function handleCheck(id) {
    setCheckedRows((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }

  function handleProductCreated() { loadProducts(); }

  // --- VERITY AI: Autenticación y muestra del certificado desde botón general ---
  async function handleVerifyProduct() {
    const selectedProduct = products.find(p => checkedRows.includes(p.id));
    if (!selectedProduct) {
      alert("Please select a product to verify.");
      return;
    }
    setVerifyLoading(true);

    // Construye payload para /authentication (ajusta user_id si tienes auth real)
    const payload = {
      brand: selectedProduct.brand_name,
      brand_id: selectedProduct.brand_id,
      user_id: "USER-123456",
      images: (selectedProduct.images || []).map(img => ({
        url: img.url
      })),
      category_name: selectedProduct.category_title,
      category_id: selectedProduct.category_id
    };

    try {
      const response = await fetch("http://172.20.10.3:80/authentication/authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Authentication failed.");
      const result = await response.json();

      // Construye los datos para el modal
      setCertificateData({
        brand: result.brand || selectedProduct.brand_name,
        imageUrl: (result.images && result.images[0]?.url)
          || selectedProduct.images[0]?.url
          || "",
        date: result.date_of_authentication
          || new Date().toLocaleDateString(),
        certificateUrl: result.certificate_url || result.qr_base64 || "#"
      });
      setVerifyModalOpen(true);
    } catch (err) {
      alert("Failed to verify product: " + err.message);
    } finally {
      setVerifyLoading(false);
    }
  }

  // --- Mostrar certificado desde botón "Ver certificado" de cada fila ---
  function handleViewCertificate(product) {
    setCertificateData({
      brand: product.brand_name,
      imageUrl: (product.images && product.images[0]?.url) || "",
      date: product.verified_at || new Date().toLocaleDateString(),
      certificateUrl: product.certificate_url || product.qr_base64 || "#"
    });
    setVerifyModalOpen(true);
  }

  if (loading) return <div className="table-container">Loading products...</div>;

  return (
    <div className="table-container">
      {/* Crear producto */}
      <button
        className="button-main"
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 20, marginRight: 16 }}
      >
        + Crear producto
      </button>

      {/* Verificar producto (Verity) */}
      <button
        className="button-main"
        onClick={handleVerifyProduct}
        disabled={verifyLoading}
        style={{
          marginBottom: 20,
          background: "#C3FF5B",
          color: "#333",
          fontWeight: 700
        }}
      >
        {verifyLoading ? "Verifying..." : "Verify with Verity AI"}
      </button>

      {/* Modales */}
      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
      <VerifyCertificateModal
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        certificateData={certificateData}
      />

      <table className="product-table">
        <thead>
          <tr>
            <th></th>
            <th>Image</th>
            <th>Product</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Verity Result</th>
            <th>Additional Images</th>
            <th></th> {/* <-- Nueva columna para "Ver certificado" */}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              checked={checkedRows.includes(product.id)}
              onCheck={handleCheck}
              onViewCertificate={handleViewCertificate} // <-- ESTA ES LA CLAVE
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
