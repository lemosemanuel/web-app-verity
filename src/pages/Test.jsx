import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Test.css";

const API = "https://python-services.stage.highend.app";
const CATALOG_API = "https://python-services.stage.highend.app";
const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export default function Test({ token, onLogout }) {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assetGroups, setAssetGroups] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [assetGroupsLoading, setAssetGroupsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [form, setForm] = useState({
    brandId: "",
    categoryId: "",
    notes: "",
    referenceUrl: "",
  });
  const [images, setImages] = useState({});
  const fileInputsRef = useRef({});

  const handleLogout = useCallback(() => {
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      localStorage.removeItem("verity_token");
      localStorage.removeItem("verity_user");
    }
    navigate("/login", { replace: true });
  }, [navigate, onLogout]);

  const fetchMe = useCallback(async () => {
    if (!token) {
      handleLogout();
      return;
    }
    try {
      const res = await fetch(`${API}/api/verity_auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) {
        throw new Error("Unable to fetch your profile.");
      }
      const j = await res.json();
      setMe(j);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "We could not refresh your profile information." });
    }
  }, [token, handleLogout]);

  const fetchCatalogs = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch(`${CATALOG_API}/api/brands`),
        fetch(`${CATALOG_API}/api/categories`),
      ]);
      if (!brandsRes.ok || !categoriesRes.ok) {
        throw new Error("Catalog request failed");
      }
      const [brandsJson, categoriesJson] = await Promise.all([brandsRes.json(), categoriesRes.json()]);
      setBrands(Array.isArray(brandsJson) ? brandsJson : []);
      setCategories(Array.isArray(categoriesJson) ? categoriesJson : []);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "We could not load brands and categories. Please reload the page.",
      });
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const fetchAssetGroups = useCallback(async (categoryId) => {
    if (!categoryId) {
      setAssetGroups([]);
      return;
    }
    setAssetGroupsLoading(true);
    try {
      const res = await fetch(`${CATALOG_API}/api/category_asset_groups/${categoryId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch asset groups");
      }
      const groups = await res.json();
      setAssetGroups(Array.isArray(groups) ? groups : []);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "We could not load the asset groups for this category.",
      });
    } finally {
      setAssetGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  useEffect(() => {
    if (form.categoryId) {
      fetchAssetGroups(form.categoryId);
    } else {
      setAssetGroups([]);
    }
  }, [form.categoryId, fetchAssetGroups]);

  const remaining = useMemo(
    () => (me ? Math.max(0, (me.credits_granted || 0) - (me.credits_spent || 0)) : 0),
    [me]
  );

  const formatGroupName = (group) => {
    const raw = group.display_name || group.name || group.asset_group || group.id || "Asset";
    return typeof raw === "string"
      ? raw
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : String(raw);
  };

  const groupKey = (group) => String(group.name || group.asset_group || group.id || "");

  const handleBrandChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      brandId: value,
      categoryId: value === prev.brandId ? prev.categoryId : "",
    }));
    setImages({});
    setAssetGroups([]);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, categoryId: value }));
    setImages({});
  };

  const handleNotesChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelection = (assetGroupKey, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatusMessage({ type: "error", text: "Please upload image files only." });
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setStatusMessage({ type: "error", text: "Each image must be smaller than 8 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result || "";
      const base64 = typeof result === "string" ? result.split(",")[1] : "";
      setImages((prev) => ({
        ...prev,
        [assetGroupKey]: {
          preview: result,
          filename: file.name,
          file_b64: base64,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleTileClick = (assetKey) => {
    const input = fileInputsRef.current[assetKey];
    if (input) {
      input.click();
    }
  };

  const handleTileKeyDown = (assetKey, e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTileClick(assetKey);
    }
  };

  const handleTileDrop = (assetKey, e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelection(assetKey, file);
    }
  };

  const removeImage = (assetKey) => {
    setImages((prev) => {
      const next = { ...prev };
      delete next[assetKey];
      return next;
    });
  };

  const requiredGroups = assetGroups.filter((group) => {
    if ("is_required" in group) return Boolean(group.is_required);
    if ("required" in group) return Boolean(group.required);
    return true;
  });

  const missingRequired = requiredGroups.some((group) => {
    const key = groupKey(group);
    return !images[key];
  });

  const canSubmit =
    !!token && !!form.brandId && !!form.categoryId && !missingRequired && (assetGroups.length === 0 || Object.keys(images).length > 0);

  const runTest = async () => {
    if (!canSubmit || loading) return;
    setStatusMessage(null);
    setLoading(true);
    setResult(null);
    try {
      if (!token) {
        handleLogout();
        return;
      }
      const payload = {
        brand_id: form.brandId,
        category_id: form.categoryId,
        notes: form.notes || undefined,
        reference_url: form.referenceUrl || undefined,
        brand_name: brands.find((b) => String(b.id) === String(form.brandId))?.name,
        category_name:
          categories.find((c) => String(c.id) === String(form.categoryId))?.title ||
          categories.find((c) => String(c.id) === String(form.categoryId))?.name,
        images: Object.entries(images).map(([asset_group, image]) => ({
          asset_group,
          filename: image.filename,
          file_b64: image.file_b64,
        })),
      };

      const res = await fetch(`${API}/api/verity/test-run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleLogout();
        throw new Error("Session expired, please sign in again.");
      }

      const responseJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(responseJson.error || "We could not run the verification.");
      }

      setResult(responseJson);
      setStatusMessage({
        type: "success",
        text: "Verification completed. Review the output below.",
      });
      await fetchMe();
    } catch (err) {
      console.error(err);
      let message = "We couldn't complete the verification right now. Please try again in a moment.";
      if (err instanceof Error && err.message) {
        const trimmed = err.message.trim();
        if (trimmed.length > 0 && trimmed.length <= 160 && !/^https?:\/\//i.test(trimmed)) {
          message = trimmed;
        }
      } else if (typeof err === "string" && err.trim()) {
        message = err.trim().slice(0, 160);
      }
      setStatusMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  const verification = result?.result;
  const verificationStatus = (verification?.status || "").toLowerCase();

  const statusLabel = verification?.status || "Pending";
  const statusTone =
    verificationStatus === "approved"
      ? "approved"
      : verificationStatus === "verified"
      ? "approved"
      : verificationStatus === "rejected"
      ? "rejected"
      : verificationStatus === "counterfeit"
      ? "rejected"
      : "pending";

  const assetGroupByUrl = useMemo(() => {
    const entries = (result?.assets_received || []).map((asset) => [asset.url, asset.asset_group]);
    return Object.fromEntries(entries);
  }, [result]);

  const imageInsights = verification?.images || [];

  return (
    <div className="test-page">
      <header className="test-page__header">
        <div className="test-header__title">
          <h1>Live Asset Test</h1>
          <p>Upload creative assets to validate brand authenticity in real time.</p>
        </div>
        <div className="test-header__user">
          <div className="test-header__user-info">
            <strong>{me?.email || "Loading…"}</strong>
            {me && <span>{me.role ? me.role.toUpperCase() : "Team member"}</span>}
          </div>
          <div className="test-header__credits">
            <span className="test-credits__pill">Credits: {remaining}</span>
            <button onClick={handleLogout} className="test-header__cta" type="button">
              Sign out
            </button>
          </div>
        </div>
      </header>
      {statusMessage && (
        <div className={`test-banner test-banner--${statusMessage.type}`}>
          <span>{statusMessage.text}</span>
          <button
            type="button"
            className="test-banner__close"
            onClick={() => setStatusMessage(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
      <div className="test-page__grid">
        <section className="test-card">
          <h2>Asset details</h2>
          <p>Choose the brand and category to tailor verification rules for your upload.</p>
          <div className="test-form__group">
            <label className="test-form__label" htmlFor="brand-select">
              Brand
            </label>
            <select
              id="brand-select"
              className="test-form__select"
              value={form.brandId}
              onChange={handleBrandChange}
              disabled={catalogLoading}
            >
              <option value="">{catalogLoading ? "Loading brands…" : "Select a brand"}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="test-form__group">
            <label className="test-form__label" htmlFor="category-select">
              Category
            </label>
            <select
              id="category-select"
              className="test-form__select"
              value={form.categoryId}
              onChange={handleCategoryChange}
              disabled={catalogLoading}
            >
              <option value="">{catalogLoading ? "Loading categories…" : "Select a category"}</option>
              {categories.map((category) => {
                const label = category?.title || category?.name || category?.slug || "Unnamed category";
                const value = category?.id ?? label;
                return (
                  <option key={value} value={category?.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="test-form__group">
            <label className="test-form__label" htmlFor="reference-url">
              Reference URL (optional)
            </label>
            <input
              id="reference-url"
              name="referenceUrl"
              type="url"
              placeholder="https://brand.com/product"
              className="test-form__select"
              value={form.referenceUrl}
              onChange={handleNotesChange}
            />
          </div>
          <div className="test-form__group">
            <label className="test-form__label" htmlFor="notes-field">
              Notes for the Verity team (optional)
            </label>
            <textarea
              id="notes-field"
              name="notes"
              className="test-form__textarea"
              placeholder="Add any context we should consider for this verification."
              value={form.notes}
              onChange={handleNotesChange}
            />
          </div>
          <div className="test-action-bar">
            <button
              type="button"
              className="test-action__button"
              onClick={runTest}
              disabled={!canSubmit || loading || remaining < 1}
            >
              {loading ? "Running verification…" : "Run verification (−1 credit)"}
            </button>
            <span className="test-hint">
              {remaining < 1
                ? "You do not have enough credits to run this test."
                : "You will spend one credit for each verification run."}
            </span>
          </div>
        </section>
        <div className="test-column">
          <section className="test-card">
            <h2>Upload creative assets</h2>
            <p>Drag & drop files or click any slot. Required slots are marked as mandatory.</p>
            {assetGroupsLoading ? (
              <div className="test-assets__loading">
                <span>Loading asset requirements…</span>
              </div>
            ) : assetGroups.length > 0 ? (
              <div className="test-assets__grid">
                {assetGroups.map((group) => {
                  const key = groupKey(group);
                  const image = images[key];
                  const isRequired = requiredGroups.some((g) => groupKey(g) === key);
                  const hintText = group.description || (isRequired ? "Required" : "Optional");
                  return (
                    <div
                      key={key}
                      className="test-asset-tile"
                      onClick={() => handleTileClick(key)}
                      onKeyDown={(event) => handleTileKeyDown(key, event)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleTileDrop(key, event)}
                      role="button"
                      tabIndex={0}
                    >
                      {image && (
                        <button
                          type="button"
                          className="test-asset__remove"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeImage(key);
                          }}
                          aria-label={`Remove ${formatGroupName(group)} image`}
                        >
                          ×
                        </button>
                      )}
                      <span className="test-asset__name">
                        {formatGroupName(group)}
                        {isRequired ? "*" : ""}
                      </span>
                      <span className="test-asset__hint">{hintText}</span>
                      {image ? (
                        <img src={image.preview} alt={formatGroupName(group)} className="test-asset__preview" />
                      ) : (
                        <span className="test-asset__hint">Click to upload</span>
                      )}
                      <input
                        ref={(el) => {
                          if (el) {
                            fileInputsRef.current[key] = el;
                          } else {
                            delete fileInputsRef.current[key];
                          }
                        }}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(event) => handleFileSelection(key, event.target.files?.[0])}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="test-assets__empty">
                Select a category to see required creative slots for verification.
              </div>
            )}
            {missingRequired && (
              <span className="test-hint">Please upload all required assets before running the verification.</span>
            )}
          </section>
          <section className={`test-result ${result ? "" : "test-result--empty"}`}>
            {result ? (
              <>
                <div className="test-result__header">
                  <div>
                    <h3>Verification summary</h3>
                    <p className="test-result__subtitle">
                      {verification?.date_of_authentication
                        ? `Processed on ${new Date(verification.date_of_authentication).toLocaleString()}`
                        : `Processed on ${new Date(result.run_at).toLocaleString()}`}
                    </p>
                  </div>
                  <span className={`status-pill status-pill--${statusTone}`}>{statusLabel}</span>
                </div>
                <div className="test-result__meta">
                  <div>
                    <span className="test-meta__label">Brand</span>
                    <span className="test-meta__value">{result.brand?.name || "—"}</span>
                  </div>
                  <div>
                    <span className="test-meta__label">Category</span>
                    <span className="test-meta__value">{result.category?.name || "—"}</span>
                  </div>
                  <div>
                    <span className="test-meta__label">Credits remaining</span>
                    <span className="test-meta__value">{result.credits?.remaining ?? "—"}</span>
                  </div>
                  <div>
                    <span className="test-meta__label">Spell check</span>
                    <span className="test-meta__value">
                      {verification?.spell_check_attempted ? "Performed" : "Not requested"}
                    </span>
                  </div>
                </div>
                {verification?.remarks && (
                  <div className="test-result__remarks">
                    <h4>Decision</h4>
                    <p>{verification.remarks}</p>
                  </div>
                )}
                {verification?.detailed_remarks && (
                  <div className="test-result__remarks">
                    <h4>Details</h4>
                    <p>{verification.detailed_remarks}</p>
                  </div>
                )}
                <div className="test-insight-grid">
                  {imageInsights.map((image) => {
                    const assetName = assetGroupByUrl[image.url] || "Asset";
                    const prediction = image.predictions || "Not evaluated";
                    const remark = image.remarks || "";
                    const detectionConfidence = image.detection_confidence || {};
                    const brandConfidence = detectionConfidence.brandlabel;
                    const careConfidence = detectionConfidence.carelabel;
                    return (
                      <article className="test-insight-card" key={image.url}>
                        <header className="test-insight-card__header">
                          <div>
                            <h5>{assetName}</h5>
                            <span className={`status-pill status-pill--${prediction.toLowerCase().includes("counterfeit") ? "rejected" : prediction.toLowerCase().includes("verified") ? "approved" : "pending"}`}>
                              {prediction}
                            </span>
                          </div>
                          <a href={image.url} target="_blank" rel="noreferrer" className="test-insight-card__link">
                            View asset
                          </a>
                        </header>
                        <div className="test-insight-card__body">
                          <p className="test-insight-card__remarks">{remark || "No remarks returned for this asset."}</p>
                          <div className="test-insight-card__metrics">
                            <div>
                              <span className="test-meta__label">Brand label</span>
                              <span className="test-meta__value">{brandConfidence || "—"}</span>
                            </div>
                            <div>
                              <span className="test-meta__label">Care label</span>
                              <span className="test-meta__value">{careConfidence || "—"}</span>
                            </div>
                          </div>
                          {image.spell_check_performed_carelabel && (
                            <span className="test-badge">Spell check performed</span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h3>Results will appear here</h3>
                <p>
                  Run a verification to review the AI insights, confidence score, and any flags before publishing your
                  assets.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
