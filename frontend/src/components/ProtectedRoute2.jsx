import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute2() {
  const token = localStorage.getItem("chat-app-token");

  return <>{token ? <Outlet /> : <Navigate to="/login" />}</>;
}

export default ProtectedRoute2;
