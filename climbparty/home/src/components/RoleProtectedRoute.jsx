// src/components/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, user, userRole, allowRoles }) {
  if (!user || !userRole) {
    return <Navigate to="/login" />;
  }

  // 허용된 role이 아니라면 메인으로 리디렉션
  if (!allowRoles.includes(userRole)) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" />;
  }

  return children;
}
