/** AdminLoginPage */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import AdminLogin from "../../components/AdminLogin";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { handleAdminLogin } = useAppContext();

  return (
    <AdminLogin
      onLoginSuccess={handleAdminLogin}
      onBack={() => navigate("/")}
    />
  );
}
