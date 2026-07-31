/** AdminDashboardPage */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import AdminDashboard from "../../components/AdminDashboard";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { adminToken, handleAdminLogout } = useAppContext();

  useEffect(() => {
    if (!adminToken) {
      navigate("/");
    }
  }, [adminToken, navigate]);

  if (!adminToken) return null;

  return (
    <AdminDashboard
      token={adminToken}
      onLogout={handleAdminLogout}
    />
  );
}
