import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute1() {
  const token = localStorage.getItem("chat-app-token");

  return <>{token ? <Navigate to="/chat" /> : <Outlet />}</>;
}

export default ProtectedRoute1;
