import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import "./Dashboard.css";
import { ENDPOINTS } from './urls';


const GREEN = "#D1FF5C";
const BLUE = "#90B6F2";
const PURPLE = "#B6A7F5";
const BLACK = "#111";

// Si usás variables de entorno (.env), poné REACT_APP_API_URL=http://localhost:5000/api
// const API = "https://python-services.stage.highend.app/api";

export default function Dashboard() {
  const [kpis, setKpis] = useState({});
  const [uplift, setUplift] = useState([]);
  const [hours, setHours] = useState([]);
  const [auths, setAuths] = useState([]);

    useEffect(() => {
    fetch(ENDPOINTS.dashboard.kpis)
      .then(r => r.json()).then(setKpis);

    fetch(ENDPOINTS.dashboard.operationalUplift)
      .then(r => r.json()).then(setUplift);

    fetch(ENDPOINTS.dashboard.hoursSaved)
      .then(r => r.json()).then(setHours);

    fetch(ENDPOINTS.dashboard.authentications)
      .then(r => r.json()).then(setAuths);
  }, []);

  return (
    <div className="dashboard-content">
      <h2 style={{ color: "#888", fontWeight: 400, fontSize: 20, marginBottom: 0, marginTop: 28, marginLeft: 5 }}>
        Analytics
      </h2>
      <p className="dashboard-lead">
        Detect counterfeits at scale and boost your conversion rate with Verity AI by automating authentication.
      </p>
      <div className="dashboard-kpis">
        <KpiCard
          title="Total Unverified"
          value={kpis.total_unverified}
          percent={kpis.total_unverified_change}
          up={!!(kpis.total_unverified_change > 0)}
          color="#33dd87"
        />
        <KpiCard
          title="Total Authenticated"
          value={`$${Number(kpis.total_authenticated || 0).toLocaleString()}`}
          percent={kpis.total_authenticated_change}
          up={!!(kpis.total_authenticated_change > 0)}
          color="#66c3ff"
        />
        <KpiCard
          title="Approval Rate"
          value={kpis.approval_rate ? kpis.approval_rate + "%" : "--"}
          percent={kpis.approval_rate_change}
          up={!!(kpis.approval_rate_change > 0)}
          color="#b3b3ff"
        />
        <KpiCard
          title="Total Time Saved"
          value={kpis.total_time_saved ? kpis.total_time_saved + " Hours" : "--"}
          percent={kpis.total_time_saved_change}
          up={!!(kpis.total_time_saved_change > 0)}
          color="#c3ff5b"
        />
      </div>
      <div className="dashboard-charts-row">
        <div className="dashboard-chart-box">
          <h4>Operational Uplift</h4>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={uplift}>
              <CartesianGrid strokeDasharray="2" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Zimmermann" fill={BLUE} />
              <Bar dataKey="Alemais" fill={PURPLE} />
              <Bar dataKey="Aje" fill={BLACK} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-chart-box">
          <h4>Hours Saved</h4>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={hours}>
              <CartesianGrid strokeDasharray="2" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill={GREEN} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="dashboard-charts-row">
        <div className="dashboard-chart-box">
          <h4>Sales uplift from Verity AI</h4>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={auths}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b6a7f5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#b6a7f5" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#b6a7f5" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-chart-box">
          <h4>Sales uplift from Verity AI</h4>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={auths}>
              <defs>
                <linearGradient id="colorUv2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#90B6F2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#90B6F2" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#90B6F2" fillOpacity={1} fill="url(#colorUv2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, percent, up, color }) {
  return (
    <div className="dashboard-kpi-card">
      <div className="dashboard-kpi-title">{title}</div>
      <div className="dashboard-kpi-value">{value ?? "--"}</div>
      <div className="dashboard-kpi-footer" style={{ color: up ? "#29b273" : "#e14d4d" }}>
        {percent !== undefined && (
          <>
            {up ? "▲" : "▼"} {Math.abs(percent)}%{" "}
            <span style={{ color: "#999", fontWeight: 400, fontSize: 13 }}>
              {up ? "Up" : "Down"} from last {title === "Approval Rate" ? "month" : "yesterday"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
