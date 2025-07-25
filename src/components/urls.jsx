// src/components/nuevaUrl.jsx
export const API_BASE = 'https://python-services.stage.highend.app';
// export const API_BASE = 'http://172.20.10.3:80';

export const ENDPOINTS = {
  brands:       `${API_BASE}/api/brands`,
  categories:   `${API_BASE}/api/categories`,
  dashboard: {
    kpis:             `${API_BASE}/api/dashboard/kpis`,
    operationalUplift:`${API_BASE}/api/dashboard/operational_uplift`,
    hoursSaved:       `${API_BASE}/api/dashboard/hours_saved`,
    authentications:  `${API_BASE}/api/dashboard/authentications`,
  },
  products: {
    webapp:           `${API_BASE}/api/webapp_products`,
  },
  authentication: {
    authenticate:     `${API_BASE}/authentication/authentication`,
  },
  betaSignups:     `${API_BASE}/api/beta-signups`,
};